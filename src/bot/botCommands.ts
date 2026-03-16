// ============================================
// TELEGRAM BOT - СЕРВЕРНАЯ ЧАСТЬ
// ============================================
//
// Этот файл — шаблон для создания полноценного
// Telegram-бота на Node.js
//
// Для запуска нужен отдельный сервер (Node.js)
//
// npm install telegraf
//

/*

import { Telegraf, Markup } from 'telegraf';

// Конфигурация
const BOT_TOKEN = 'YOUR_BOT_TOKEN';
const ADMIN_IDS = ['ADMIN_CHAT_ID_1', 'ADMIN_CHAT_ID_2'];

const bot = new Telegraf(BOT_TOKEN);

// Проверка админа
const isAdmin = (ctx: any) => ADMIN_IDS.includes(String(ctx.from?.id));

// ============================================
// КОМАНДЫ
// ============================================

// /start - Главное меню
bot.start((ctx) => {
  if (!isAdmin(ctx)) {
    return ctx.reply('⛔ Доступ запрещён');
  }
  
  ctx.reply('🍖 Админ-панель «Соль и Перец»\n\nВыберите действие:', 
    Markup.inlineKeyboard([
      [
        Markup.button.callback('📊 Статистика', 'stats'),
        Markup.button.callback('📋 Заказы', 'orders'),
      ],
      [
        Markup.button.callback('⭐ Отзывы', 'reviews'),
        Markup.button.callback('🍽️ Меню', 'menu'),
      ],
      [
        Markup.button.callback('📢 Рассылка', 'broadcast'),
        Markup.button.callback('🎁 Акции', 'promos'),
      ],
    ])
  );
});

// /orders - Список заказов
bot.command('orders', (ctx) => {
  if (!isAdmin(ctx)) return;
  
  // Здесь запрос к базе данных
  ctx.reply('📋 Последние заказы:\n\n...');
});

// /reviews - Отзывы на модерацию
bot.command('reviews', async (ctx) => {
  if (!isAdmin(ctx)) return;
  
  // Здесь запрос к базе данных
  const pendingReviews = []; // await db.getPendingReviews()
  
  if (pendingReviews.length === 0) {
    return ctx.reply('✅ Нет отзывов на модерации');
  }
  
  for (const review of pendingReviews) {
    await ctx.reply(
      `📝 Отзыв от ${review.name}\n⭐ ${review.rating}/5\n\n${review.text}`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback('✅ Одобрить', `review_approve_${review.id}`),
          Markup.button.callback('❌ Отклонить', `review_reject_${review.id}`),
        ],
        [
          Markup.button.callback('✏️ Редактировать', `review_edit_${review.id}`),
        ],
      ])
    );
  }
});

// /stats - Статистика
bot.command('stats', (ctx) => {
  if (!isAdmin(ctx)) return;
  
  ctx.reply(`📊 Статистика за сегодня:

📦 Заказов: 47
💰 Выручка: 156,000₽
👥 Новых клиентов: 12
⭐ Средний чек: 3,319₽
📈 Конверсия: 4.2%`);
});

// /broadcast - Рассылка
bot.command('broadcast', (ctx) => {
  if (!isAdmin(ctx)) return;
  
  ctx.reply(
    '📢 Создание рассылки\n\nВыберите аудиторию:',
    Markup.inlineKeyboard([
      [Markup.button.callback('👥 Все клиенты', 'broadcast_all')],
      [Markup.button.callback('🛒 С брошенной корзиной', 'broadcast_cart')],
      [Markup.button.callback('😴 Неактивные 7+ дней', 'broadcast_inactive')],
      [Markup.button.callback('💎 VIP клиенты', 'broadcast_vip')],
    ])
  );
});

// /promo - Управление акциями
bot.command('promo', (ctx) => {
  if (!isAdmin(ctx)) return;
  
  ctx.reply(
    '🎁 Управление акциями',
    Markup.inlineKeyboard([
      [Markup.button.callback('📋 Текущие акции', 'promo_list')],
      [Markup.button.callback('➕ Создать акцию', 'promo_create')],
      [Markup.button.callback('🎟️ Промокоды', 'promo_codes')],
    ])
  );
});

// ============================================
// ОБРАБОТКА CALLBACK
// ============================================

// Одобрить отзыв
bot.action(/review_approve_(.+)/, async (ctx) => {
  const reviewId = ctx.match[1];
  
  // await db.approveReview(reviewId);
  
  await ctx.answerCbQuery('✅ Отзыв одобрен!');
  await ctx.editMessageText(ctx.callbackQuery.message?.text + '\n\n✅ ОДОБРЕНО');
});

// Отклонить отзыв
bot.action(/review_reject_(.+)/, async (ctx) => {
  const reviewId = ctx.match[1];
  
  // await db.rejectReview(reviewId);
  
  await ctx.answerCbQuery('❌ Отзыв отклонён');
  await ctx.editMessageText(ctx.callbackQuery.message?.text + '\n\n❌ ОТКЛОНЕНО');
});

// Управление заказом
bot.action(/order_confirm_(.+)/, async (ctx) => {
  const orderId = ctx.match[1];
  // await db.updateOrderStatus(orderId, 'confirmed');
  await ctx.answerCbQuery('✅ Заказ подтверждён!');
});

bot.action(/order_cooking_(.+)/, async (ctx) => {
  const orderId = ctx.match[1];
  // await db.updateOrderStatus(orderId, 'cooking');
  await ctx.answerCbQuery('👨‍🍳 Статус: готовится');
});

bot.action(/order_delivery_(.+)/, async (ctx) => {
  const orderId = ctx.match[1];
  // await db.updateOrderStatus(orderId, 'delivery');
  await ctx.answerCbQuery('🚗 Статус: в пути');
});

bot.action(/order_done_(.+)/, async (ctx) => {
  const orderId = ctx.match[1];
  // await db.updateOrderStatus(orderId, 'done');
  await ctx.answerCbQuery('✅ Заказ выполнен!');
});

// Рассылка
bot.action('broadcast_all', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply('📝 Напишите текст рассылки:');
  // Установить состояние ожидания текста
});

// ============================================
// WEBHOOK ДЛЯ ПРИЁМА ДАННЫХ С САЙТА
// ============================================

// Express сервер для webhook'ов
import express from 'express';
const app = express();
app.use(express.json());

// Новый заказ с сайта
app.post('/api/order', async (req, res) => {
  const order = req.body;
  
  // Сохраняем в БД
  // await db.saveOrder(order);
  
  // Отправляем уведомление админам
  for (const adminId of ADMIN_IDS) {
    await bot.telegram.sendMessage(
      adminId,
      `🆕 НОВЫЙ ЗАКАЗ #${order.id}\n\n` +
      `👤 ${order.customerName}\n` +
      `📱 ${order.customerPhone}\n` +
      `💰 ${order.total}₽`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Подтвердить', callback_data: `order_confirm_${order.id}` },
              { text: '❌ Отменить', callback_data: `order_cancel_${order.id}` },
            ],
          ],
        },
      }
    );
  }
  
  res.json({ success: true });
});

// Новый отзыв с сайта
app.post('/api/review', async (req, res) => {
  const review = req.body;
  
  // Сохраняем на модерацию
  // await db.saveReviewForModeration(review);
  
  // Отправляем админам
  for (const adminId of ADMIN_IDS) {
    await bot.telegram.sendMessage(
      adminId,
      `📝 НОВЫЙ ОТЗЫВ\n\n` +
      `👤 ${review.name}\n` +
      `⭐ ${'⭐'.repeat(review.rating)}\n\n` +
      `${review.text}`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Одобрить', callback_data: `review_approve_${review.id}` },
              { text: '❌ Отклонить', callback_data: `review_reject_${review.id}` },
            ],
          ],
        },
      }
    );
  }
  
  res.json({ success: true });
});

// Заявка на банкет
app.post('/api/banquet', async (req, res) => {
  const banquet = req.body;
  
  for (const adminId of ADMIN_IDS) {
    await bot.telegram.sendMessage(
      adminId,
      `🎉 ЗАЯВКА НА БАНКЕТ\n\n` +
      `👤 ${banquet.name}\n` +
      `📱 ${banquet.phone}\n` +
      `📦 Пакет: ${banquet.package}\n` +
      `👥 Гостей: ${banquet.guests}\n` +
      `📅 Дата: ${banquet.date}\n` +
      `💰 ~${banquet.total}₽`
    );
  }
  
  res.json({ success: true });
});

// ============================================
// ВОРОНКИ ПРОДАЖ (CRON JOBS)
// ============================================

import cron from 'node-cron';

// Проверка брошенных корзин каждые 30 минут
cron.schedule('*\/30 * * * *', async () => {
  // const abandonedCarts = await db.getAbandonedCarts(30); // 30+ минут
  
  // for (const cart of abandonedCarts) {
  //   await bot.telegram.sendMessage(
  //     cart.userId,
  //     '🛒 Вы забыли завершить заказ!\n\n' +
  //     'Ваши блюда ждут в корзине. Оформите заказ и получите скидку 5%!\n\n' +
  //     'Промокод: CART5'
  //   );
  //   await db.markCartNotified(cart.id);
  // }
});

// Запрос отзыва через 24 часа после заказа
cron.schedule('0 * * * *', async () => {
  // const completedOrders = await db.getOrdersCompletedBefore(24 * 60); // 24 часа назад
  
  // for (const order of completedOrders) {
  //   if (!order.reviewRequested) {
  //     await bot.telegram.sendMessage(
  //       order.userId,
  //       '📝 Как вам наши блюда?\n\n' +
  //       'Оставьте отзыв и получите 100 бонусных баллов!'
  //     );
  //     await db.markReviewRequested(order.id);
  //   }
  // }
});

// Напоминание неактивным пользователям (раз в день)
cron.schedule('0 12 * * *', async () => {
  // const inactiveUsers = await db.getInactiveUsers(7); // 7+ дней без заказа
  
  // for (const user of inactiveUsers) {
  //   await bot.telegram.sendMessage(
  //     user.id,
  //     '😢 Мы соскучились!\n\n' +
  //     'Прошла неделя с вашего последнего заказа.\n\n' +
  //     '🔥 Вернитесь — скидка 15%!\n' +
  //     'Промокод: COMEBACK15'
  //   );
  // }
});

// ============================================
// ЗАПУСК
// ============================================

bot.launch();
app.listen(3000, () => console.log('Server running on port 3000'));

console.log('🤖 Бот запущен!');

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

*/

// ============================================
// ЭКСПОРТ ДЛЯ ДОКУМЕНТАЦИИ
// ============================================

export const BOT_COMMANDS = `
/start - Главное меню админки
/orders - Список активных заказов
/reviews - Отзывы на модерацию
/stats - Статистика за день/неделю/месяц
/broadcast - Создать рассылку
/promo - Управление акциями и промокодами
/menu - Редактировать меню
/settings - Настройки бота
`;

export const WEBHOOK_ENDPOINTS = {
  newOrder: 'POST /api/order',
  newReview: 'POST /api/review',
  newBanquet: 'POST /api/banquet',
  newContact: 'POST /api/contact',
};

export const CRON_JOBS = {
  abandonedCarts: 'Каждые 30 минут - напоминание о брошенной корзине',
  reviewRequest: 'Каждый час - запрос отзыва через 24ч после заказа',
  inactiveUsers: 'Каждый день в 12:00 - напоминание неактивным',
  birthdayGreetings: 'Каждый день в 10:00 - поздравления с ДР',
};

export default {
  BOT_COMMANDS,
  WEBHOOK_ENDPOINTS,
  CRON_JOBS,
};
