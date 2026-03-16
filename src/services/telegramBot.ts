// ============================================
// TELEGRAM BOT ИНТЕГРАЦИЯ
// ============================================
// 
// Этот модуль управляет всей интеграцией с Telegram:
// - Отправка уведомлений о заказах
// - Воронки продаж
// - Автоматические сообщения
// - Модерация отзывов
//

import { TELEGRAM_CONFIG } from '../data/menuData';

// ============================================
// НАСТРОЙКИ БОТА
// ============================================

export const BOT_SETTINGS = {
  // Основной бот для уведомлений
  ...TELEGRAM_CONFIG,
  
  // Админы, которые могут управлять через бота
  ADMIN_IDS: [
    'YOUR_ADMIN_CHAT_ID_1',
    'YOUR_ADMIN_CHAT_ID_2',
  ],
  
  // Группа для уведомлений о заказах
  ORDERS_GROUP_ID: 'YOUR_ORDERS_GROUP_ID',
  
  // Группа для отзывов на модерацию
  REVIEWS_GROUP_ID: 'YOUR_REVIEWS_GROUP_ID',
  
  // Webhook URL (для бэкенда)
  WEBHOOK_URL: 'https://your-domain.ru/api/telegram/webhook',
};

// ============================================
// ТИПЫ
// ============================================

export interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
  reply_markup?: any;
}

export interface FunnelStep {
  id: string;
  name: string;
  delay: number; // минуты
  message: string;
  condition?: 'no_order' | 'cart_abandoned' | 'after_order' | 'review_request';
}

export interface AutoMessage {
  id: string;
  trigger: 'new_user' | 'first_order' | 'repeat_order' | 'birthday' | 'inactive_7d' | 'inactive_30d';
  message: string;
  enabled: boolean;
}

// ============================================
// ВОРОНКИ ПРОДАЖ
// ============================================

export const SALES_FUNNELS: FunnelStep[][] = [
  // Воронка 1: Брошенная корзина
  [
    {
      id: 'cart-1',
      name: 'Напоминание о корзине',
      delay: 30, // 30 минут
      message: `🛒 Вы забыли завершить заказ!

Ваши аппетитные блюда ждут в корзине. 

🔥 Оформите заказ в течение часа и получите скидку 5%!

Промокод: CART5`,
      condition: 'cart_abandoned',
    },
    {
      id: 'cart-2',
      name: 'Второе напоминание',
      delay: 180, // 3 часа
      message: `😋 Ваш шашлык скучает!

Корзина всё ещё ждёт. Может, пора перекусить?

🎁 Закажите сейчас — доставка бесплатно!

Промокод: FREESHIP`,
      condition: 'cart_abandoned',
    },
  ],
  
  // Воронка 2: После заказа
  [
    {
      id: 'order-1',
      name: 'Благодарность',
      delay: 60, // 1 час после доставки
      message: `🙏 Спасибо за заказ в «Соль и Перец»!

Надеемся, вам понравилось! 

⭐ Оставьте отзыв на нашем сайте и получите 100 бонусных баллов!`,
      condition: 'after_order',
    },
    {
      id: 'order-2',
      name: 'Запрос отзыва',
      delay: 1440, // 24 часа
      message: `📝 Как вам наши блюда?

Ваше мнение очень важно для нас! Поделитесь впечатлениями:

⭐⭐⭐⭐⭐ — было вкусно!
💬 Напишите отзыв на сайте

🎁 За каждый отзыв — 100 баллов на счёт!`,
      condition: 'review_request',
    },
    {
      id: 'order-3',
      name: 'Повторное предложение',
      delay: 10080, // 7 дней
      message: `👋 Давно не виделись!

Соскучились по нашему фирменному шашлыку?

🔥 Специально для вас — скидка 15% на любой заказ!

Промокод: COMEBACK15
Действует 3 дня`,
      condition: 'no_order',
    },
  ],
];

// ============================================
// АВТОМАТИЧЕСКИЕ СООБЩЕНИЯ
// ============================================

export const AUTO_MESSAGES: AutoMessage[] = [
  {
    id: 'welcome',
    trigger: 'new_user',
    message: `🎉 Добро пожаловать в «Соль и Перец»!

Мы рады, что вы с нами! 

🎁 Ваш приветственный бонус: скидка 10% на первый заказ!

Промокод: HELLO10

📍 Ждём вас: Сходня, рядом с МЦД`,
    enabled: true,
  },
  {
    id: 'first_order',
    trigger: 'first_order',
    message: `🎊 Поздравляем с первым заказом!

Спасибо, что выбрали нас! Надеемся, будет вкусно!

💎 Вы автоматически участвуете в программе лояльности!

Накапливайте баллы с каждого заказа и обменивайте на бонусы!`,
    enabled: true,
  },
  {
    id: 'birthday',
    trigger: 'birthday',
    message: `🎂 С Днём Рождения!

Кафе «Соль и Перец» поздравляет вас!

🎁 Ваш подарок: скидка 25% на любой заказ!

Промокод: BIRTHDAY25
Действует 7 дней

Отметьте праздник с нашим шашлыком! 🎉`,
    enabled: true,
  },
  {
    id: 'inactive_week',
    trigger: 'inactive_7d',
    message: `😢 Мы соскучились!

Прошла неделя с вашего последнего заказа...

🔥 Вернитесь — получите бесплатный напиток к заказу!

Промокод: MISSYOU`,
    enabled: true,
  },
  {
    id: 'inactive_month',
    trigger: 'inactive_30d',
    message: `💔 Вы нас забыли?

Месяц без вкусного шашлыка — это слишком долго!

🎁 Специальное предложение: скидка 20% + бесплатная доставка!

Промокод: RETURNVIP

Действует 5 дней`,
    enabled: true,
  },
];

// ============================================
// ШАБЛОНЫ СООБЩЕНИЙ
// ============================================

export const MESSAGE_TEMPLATES = {
  // Уведомление о новом заказе (для админов)
  newOrder: (order: any) => `
🆕 НОВЫЙ ЗАКАЗ #${order.id}

👤 Клиент: ${order.customerName}
📱 Телефон: ${order.customerPhone}
${order.deliveryType === 'delivery' ? `📍 Адрес: ${order.address}` : '🏠 Самовывоз'}

🛒 Заказ:
${order.items.map((item: any) => `• ${item.name} x${item.quantity} — ${item.price * item.quantity}₽`).join('\n')}

💰 Итого: ${order.total}₽
💳 Оплата: ${order.paymentMethod}

${order.comment ? `💬 Комментарий: ${order.comment}` : ''}
`,

  // Уведомление о новом отзыве (на модерацию)
  newReview: (review: any) => `
📝 НОВЫЙ ОТЗЫВ

👤 Автор: ${review.name}
⭐ Оценка: ${'⭐'.repeat(review.rating)}

💬 Текст:
${review.text}

📅 Дата: ${new Date().toLocaleDateString('ru-RU')}
`,

  // Уведомление о бронировании банкета
  newBanquet: (banquet: any) => `
🎉 ЗАЯВКА НА БАНКЕТ

👤 Клиент: ${banquet.name}
📱 Телефон: ${banquet.phone}
📧 Email: ${banquet.email}

📦 Пакет: ${banquet.package}
👥 Гостей: ${banquet.guests}
📅 Дата: ${banquet.date}

${banquet.extras?.length ? `✨ Доп. услуги: ${banquet.extras.join(', ')}` : ''}

💰 Расчётная сумма: ${banquet.total}₽

${banquet.comment ? `💬 Пожелания: ${banquet.comment}` : ''}
`,

  // Уведомление о сообщении с сайта
  newContact: (contact: any) => `
📩 СООБЩЕНИЕ С САЙТА

👤 Имя: ${contact.name}
📱 Телефон: ${contact.phone}
📧 Email: ${contact.email}

💬 Сообщение:
${contact.message}
`,
};

// ============================================
// INLINE КЛАВИАТУРЫ ДЛЯ БОТА
// ============================================

export const KEYBOARDS = {
  // Клавиатура для модерации отзыва
  reviewModeration: (reviewId: string) => ({
    inline_keyboard: [
      [
        { text: '✅ Одобрить', callback_data: `review_approve_${reviewId}` },
        { text: '❌ Отклонить', callback_data: `review_reject_${reviewId}` },
      ],
      [
        { text: '✏️ Редактировать', callback_data: `review_edit_${reviewId}` },
      ],
    ],
  }),

  // Клавиатура для управления заказом
  orderManagement: (orderId: string) => ({
    inline_keyboard: [
      [
        { text: '✅ Подтвердить', callback_data: `order_confirm_${orderId}` },
        { text: '❌ Отменить', callback_data: `order_cancel_${orderId}` },
      ],
      [
        { text: '👨‍🍳 Готовится', callback_data: `order_cooking_${orderId}` },
        { text: '🚗 В пути', callback_data: `order_delivery_${orderId}` },
      ],
      [
        { text: '✅ Выполнен', callback_data: `order_done_${orderId}` },
      ],
    ],
  }),

  // Главное меню админа
  adminMenu: {
    inline_keyboard: [
      [
        { text: '📊 Статистика', callback_data: 'admin_stats' },
        { text: '📋 Заказы', callback_data: 'admin_orders' },
      ],
      [
        { text: '⭐ Отзывы', callback_data: 'admin_reviews' },
        { text: '🍽️ Меню', callback_data: 'admin_menu' },
      ],
      [
        { text: '📢 Рассылка', callback_data: 'admin_broadcast' },
        { text: '🎁 Акции', callback_data: 'admin_promos' },
      ],
      [
        { text: '⚙️ Настройки', callback_data: 'admin_settings' },
      ],
    ],
  },
};

// ============================================
// ФУНКЦИИ ОТПРАВКИ СООБЩЕНИЙ
// ============================================

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}`;

// Отправить сообщение
export const sendTelegramMessage = async (
  chatId: string,
  text: string,
  replyMarkup?: any
): Promise<boolean> => {
  try {
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Telegram send error:', error);
    return false;
  }
};

// Отправить уведомление о заказе
export const notifyNewOrder = async (order: any): Promise<boolean> => {
  const message = MESSAGE_TEMPLATES.newOrder(order);
  const keyboard = KEYBOARDS.orderManagement(order.id);
  
  // Отправляем всем админам
  const results = await Promise.all(
    BOT_SETTINGS.ADMIN_IDS.map(adminId =>
      sendTelegramMessage(adminId, message, keyboard)
    )
  );
  
  // Также в группу заказов
  if (BOT_SETTINGS.ORDERS_GROUP_ID) {
    await sendTelegramMessage(BOT_SETTINGS.ORDERS_GROUP_ID, message, keyboard);
  }
  
  return results.some(r => r);
};

// Отправить отзыв на модерацию
export const sendReviewForModeration = async (review: any): Promise<boolean> => {
  const message = MESSAGE_TEMPLATES.newReview(review);
  const keyboard = KEYBOARDS.reviewModeration(review.id);
  
  if (BOT_SETTINGS.REVIEWS_GROUP_ID) {
    return sendTelegramMessage(BOT_SETTINGS.REVIEWS_GROUP_ID, message, keyboard);
  }
  
  // Или первому админу
  return sendTelegramMessage(BOT_SETTINGS.ADMIN_IDS[0], message, keyboard);
};

// Отправить уведомление о банкете
export const notifyNewBanquet = async (banquet: any): Promise<boolean> => {
  const message = MESSAGE_TEMPLATES.newBanquet(banquet);
  return sendTelegramMessage(TELEGRAM_CONFIG.CHAT_ID, message);
};

// Отправить сообщение с формы контактов
export const notifyNewContact = async (contact: any): Promise<boolean> => {
  const message = MESSAGE_TEMPLATES.newContact(contact);
  return sendTelegramMessage(TELEGRAM_CONFIG.CHAT_ID, message);
};

// ============================================
// ХРАНЕНИЕ ДАННЫХ (localStorage для демо)
// ============================================

const STORAGE_KEYS = {
  PENDING_REVIEWS: 'sol_perec_pending_reviews',
  APPROVED_REVIEWS: 'sol_perec_approved_reviews',
  USERS: 'sol_perec_users',
  FUNNEL_QUEUE: 'sol_perec_funnel_queue',
};

// Сохранить отзыв на модерацию
export const saveReviewForModeration = (review: any) => {
  const pending = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_REVIEWS) || '[]');
  pending.push({ ...review, status: 'pending', createdAt: Date.now() });
  localStorage.setItem(STORAGE_KEYS.PENDING_REVIEWS, JSON.stringify(pending));
  
  // Отправляем в Telegram на модерацию
  sendReviewForModeration(review);
};

// Получить отзывы на модерацию
export const getPendingReviews = (): any[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_REVIEWS) || '[]');
};

// Одобрить отзыв
export const approveReview = (reviewId: string) => {
  const pending = getPendingReviews();
  const review = pending.find((r: any) => r.id === reviewId);
  
  if (review) {
    // Удаляем из pending
    const newPending = pending.filter((r: any) => r.id !== reviewId);
    localStorage.setItem(STORAGE_KEYS.PENDING_REVIEWS, JSON.stringify(newPending));
    
    // Добавляем в approved
    const approved = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPROVED_REVIEWS) || '[]');
    approved.push({ ...review, status: 'approved', approvedAt: Date.now() });
    localStorage.setItem(STORAGE_KEYS.APPROVED_REVIEWS, JSON.stringify(approved));
  }
};

// Отклонить отзыв
export const rejectReview = (reviewId: string) => {
  const pending = getPendingReviews();
  const newPending = pending.filter((r: any) => r.id !== reviewId);
  localStorage.setItem(STORAGE_KEYS.PENDING_REVIEWS, JSON.stringify(newPending));
};

// Получить одобренные отзывы
export const getApprovedReviews = (): any[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.APPROVED_REVIEWS) || '[]');
};

// ============================================
// ЭКСПОРТ ДЛЯ ИСПОЛЬЗОВАНИЯ
// ============================================

export default {
  sendTelegramMessage,
  notifyNewOrder,
  notifyNewBanquet,
  notifyNewContact,
  sendReviewForModeration,
  saveReviewForModeration,
  getPendingReviews,
  approveReview,
  rejectReview,
  getApprovedReviews,
  SALES_FUNNELS,
  AUTO_MESSAGES,
  MESSAGE_TEMPLATES,
  KEYBOARDS,
  BOT_SETTINGS,
};
