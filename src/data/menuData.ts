import { MenuItem, Review, Stats, DailyPromo, BanquetPackage, BanquetExtra, LoyaltyProgram } from '../types';

// ============================================
// КОНФИГУРАЦИЯ - РЕДАКТИРУЙТЕ ЗДЕСЬ
// ============================================

// Telegram бот для уведомлений о заказах
export const TELEGRAM_CONFIG = {
  BOT_TOKEN: '5191951105:AAESbK_-oU4DNWn195_w9uYy6Y_XUSmQiaI', // Получите у @BotFather
  CHAT_ID: '574947799', // Узнайте через @userinfobot
  WEBHOOK_URL: 'salt-pepper-bot-production.up.railway.app',
  WEBHOOK_SECRET: 'your-secret-key-123'
};

// ЮKassa конфигурация
export const YOOKASSA_CONFIG = {
  SHOP_ID: 'YOUR_SHOP_ID',
  SECRET_KEY: 'YOUR_SECRET_KEY',
  RETURN_URL: 'https://your-domain.ru/payment-success',
  WIDGET_MODE: true,
};

// ============================================
// ЮРИДИЧЕСКАЯ ИНФОРМАЦИЯ (ОБЯЗАТЕЛЬНО!)
// ============================================
export const LEGAL_INFO = {
  companyName: 'ООО "Соль и Перец"',
  companyNameShort: 'ООО "СиП"',
  inn: '5047XXXXXX', // Укажите ваш ИНН
  ogrn: '11750470XXXXX', // Укажите ваш ОГРН
  kpp: '504701001', // Укажите ваш КПП
  legalAddress: '141420, Московская область, г.о. Химки, мкр. Сходня, ул. Первомайская, д. 10',
  actualAddress: '141420, Московская область, г.о. Химки, мкр. Сходня, ул. Первомайская, д. 10',
  ceo: 'Иванов Иван Иванович', // Укажите ФИО директора
  email: 'info@sol-perec.ru',
  phone: '+7 (495) 123-45-67',
  licenseAlcohol: 'Лицензия на розничную продажу алкогольной продукции №XXXXX от XX.XX.20XX', // Укажите данные лицензии
};

// Категории с алкоголем (нельзя доставлять по закону РФ)
export const ALCOHOL_CATEGORIES = ['bar'];

// Проверка, содержит ли товар алкоголь
export const isAlcoholItem = (item: MenuItem): boolean => {
  // Безалкогольные напитки из бара можно доставлять
  const nonAlcoholBarItems = ['ba-5']; // Мохито безалкогольный
  if (nonAlcoholBarItems.includes(item.id)) return false;
  return ALCOHOL_CATEGORIES.includes(item.category);
};

// Контактная информация
export const CONTACT_INFO = {
  phone: '+7 (495) 123-45-67',
  phoneLink: 'tel:+74951234567',
  address: 'Московская область, г. Химки, ул. Сходненская, д. 15',
  workHours: {
    weekdays: '11:00 - 23:00',
    weekends: '11:00 - 00:00',
  },
  email: 'info@solpepper.ru',
  instagram: 'https://instagram.com/solpepper_cafe',
  vk: 'https://vk.com/solpepper_cafe',
  telegram: 'https://t.me/solpepper_cafe',
  coordinates: {
    lat: 55.9483,
    lng: 37.3081,
  },
};

// Статистика
export const STATS: Stats = {
  ordersToday: 47,
  happyClients: 15420,
  yearsWorking: 8,
  avgRating: 4.9,
};

// ============================================
// АКЦИЯ ДНЯ - НАСТРОЙКА
// ============================================
export const DAILY_PROMO: DailyPromo = {
  id: 'promo-1',
  enabled: true, // ← ВЫКЛЮЧИТЕ ЗДЕСЬ: false
  title: 'Шашлык + Лимонад',
  description: 'Закажи комбо и получи скидку 20%',
  discount: 20,
  schedule: {
    type: 'daily', // 'always' | 'daily' | 'custom'
    startTime: '11:00',
    endTime: '23:00',
    // Для type: 'custom' укажите даты:
    // startDate: '2024-06-01',
    // endDate: '2024-06-30',
    // daysOfWeek: [1, 2, 3, 4, 5], // Пн-Пт
  },
  itemIds: ['sh-1', 'dr-1'],
  promoCode: 'COMBO20',
  bannerImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop',
};

// Функция проверки активности акции
export const isPromoActive = (promo: DailyPromo): boolean => {
  if (!promo.enabled) return false;
  
  const now = new Date();
  const { schedule } = promo;
  
  if (schedule.type === 'always') return true;
  
  if (schedule.type === 'daily') {
    if (schedule.startTime && schedule.endTime) {
      const [startH, startM] = schedule.startTime.split(':').map(Number);
      const [endH, endM] = schedule.endTime.split(':').map(Number);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }
    return true;
  }
  
  if (schedule.type === 'custom') {
    if (schedule.startDate && schedule.endDate) {
      const start = new Date(schedule.startDate);
      const end = new Date(schedule.endDate);
      if (now < start || now > end) return false;
    }
    if (schedule.daysOfWeek) {
      const day = now.getDay();
      if (!schedule.daysOfWeek.includes(day === 0 ? 7 : day)) return false;
    }
    return true;
  }
  
  return true;
};

// Время до конца акции (в секундах)
export const getPromoTimeLeft = (promo: DailyPromo): number => {
  if (!promo.enabled) return 0;
  
  const now = new Date();
  const { schedule } = promo;
  
  if (schedule.type === 'daily' && schedule.endTime) {
    const [endH, endM] = schedule.endTime.split(':').map(Number);
    const end = new Date(now);
    end.setHours(endH, endM, 0, 0);
    return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
  }
  
  if (schedule.type === 'custom' && schedule.endDate) {
    const end = new Date(schedule.endDate);
    end.setHours(23, 59, 59, 999);
    return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
  }
  
  // По умолчанию до конца дня
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  return Math.floor((endOfDay.getTime() - now.getTime()) / 1000);
};

// ============================================
// ПРОГРАММА ЛОЯЛЬНОСТИ
// ============================================
export const LOYALTY_PROGRAM: LoyaltyProgram = {
  enabled: true,
  pointsPerRuble: 1, // 1 балл за каждый рубль
  rublePerPoint: 1, // 1 балл = 1 рубль при списании
  levels: [
    { name: 'Гость', minPoints: 0, cashbackPercent: 5, icon: '🌱' },
    { name: 'Друг', minPoints: 1000, cashbackPercent: 7, icon: '⭐' },
    { name: 'VIP', minPoints: 5000, cashbackPercent: 10, icon: '💎' },
    { name: 'Золотой', minPoints: 15000, cashbackPercent: 15, icon: '👑' },
  ],
  bonuses: [
    { id: 'b1', title: 'Бесплатный лимонад', description: 'При любом заказе', pointsCost: 200, type: 'freeItem', value: 'dr-1' },
    { id: 'b2', title: 'Скидка 300₽', description: 'На любой заказ от 1500₽', pointsCost: 500, type: 'discount', value: 300 },
    { id: 'b3', title: 'Двойная порция', description: 'Любой шашлык x2', pointsCost: 800, type: 'upgrade', value: 'double' },
    { id: 'b4', title: 'Десерт в подарок', description: 'Чизкейк или Тирамису', pointsCost: 600, type: 'freeItem', value: 'de-1' },
  ],
};

// ============================================
// КАЛЬКУЛЯТОР БАНКЕТОВ
// ============================================
export const BANQUET_PACKAGES: BanquetPackage[] = [
  {
    id: 'economy',
    name: 'Эконом',
    description: 'Оптимальный вариант для небольших праздников',
    pricePerPerson: 1500,
    minGuests: 10,
    includes: [
      'Салат Цезарь или Греческий',
      'Шашлык из свинины (200г)',
      'Овощи гриль',
      'Хлебная корзинка',
      'Лимонад 1л на 2 гостей',
    ],
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
  },
  {
    id: 'standard',
    name: 'Стандарт',
    description: 'Самый популярный выбор для корпоративов',
    pricePerPerson: 2500,
    minGuests: 15,
    includes: [
      '2 салата на выбор',
      'Ассорти мясное (свинина + курица)',
      'Люля-кебаб',
      'Овощи гриль',
      'Хлебная корзинка',
      'Напитки безлимитные',
      'Торт именинника (для ДР)',
    ],
    image: 'https://images.unsplash.com/photo-1530062845289-9109b2c9c868?w=400&h=300&fit=crop',
    isPopular: true,
  },
  {
    id: 'premium',
    name: 'Премиум',
    description: 'Всё лучшее для особенного праздника',
    pricePerPerson: 4000,
    minGuests: 20,
    includes: [
      '3 салата на выбор',
      'Ассорти из 4 видов мяса',
      'Стейк Рибай (150г)',
      'Сёмга на гриле',
      'Овощное ассорти',
      'Сырная тарелка',
      'Напитки премиум безлимитные',
      'Десертный стол',
      'Живая музыка (2 часа)',
    ],
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&h=300&fit=crop',
  },
];

export const BANQUET_EXTRAS: BanquetExtra[] = [
  { id: 'e1', name: 'Фотограф', price: 5000, priceType: 'perHour' },
  { id: 'e2', name: 'DJ / Ведущий', price: 8000, priceType: 'fixed' },
  { id: 'e3', name: 'Оформление шарами', price: 300, priceType: 'perPerson' },
  { id: 'e4', name: 'Торт на заказ (1кг)', price: 1500, priceType: 'fixed' },
  { id: 'e5', name: 'Аренда проектора', price: 3000, priceType: 'fixed' },
  { id: 'e6', name: 'Караоке', price: 2000, priceType: 'perHour' },
  { id: 'e7', name: 'Детский аниматор', price: 4000, priceType: 'perHour' },
  { id: 'e8', name: 'Кальян', price: 1500, priceType: 'fixed' },
];

// ============================================
// ДАННЫЕ МЕНЮ
// ============================================
export const menuItems: MenuItem[] = [
  // ШАШЛЫК
  {
    id: 'sh-1',
    name: 'Шашлык из свинины',
    description: 'Нежная свиная шейка, маринованная по фирменному рецепту 24 часа',
    price: 450,
    weight: '300г',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    category: 'shashlik',
    isHit: true,
  },
  {
    id: 'sh-2',
    name: 'Шашлык из баранины',
    description: 'Сочная баранина на косточке с восточными специями',
    price: 590,
    oldPrice: 690,
    weight: '350г',
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=300&fit=crop',
    category: 'shashlik',
  },
  {
    id: 'sh-3',
    name: 'Люля-кебаб',
    description: 'Рубленый бараний фарш с луком, кинзой и специями',
    price: 380,
    weight: '250г',
    image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop',
    category: 'shashlik',
    isSpicy: true,
  },
  {
    id: 'sh-4',
    name: 'Шашлык из курицы',
    description: 'Куриное бедро в пряном маринаде с чесноком',
    price: 320,
    weight: '280г',
    image: 'https://images.unsplash.com/photo-1532636875304-0c89f5123745?w=400&h=300&fit=crop',
    category: 'shashlik',
  },
  {
    id: 'sh-5',
    name: 'Шашлык ассорти',
    description: 'Свинина, баранина, курица - попробуйте всё!',
    price: 890,
    weight: '450г',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
    category: 'shashlik',
    isNew: true,
  },
  // ГРИЛЬ
  {
    id: 'gr-1',
    name: 'Стейк Рибай',
    description: 'Мраморная говядина Black Angus, прожарка на выбор',
    price: 1290,
    oldPrice: 1490,
    weight: '300г',
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop',
    category: 'grill',
    isHit: true,
  },
  {
    id: 'gr-2',
    name: 'Овощи на гриле',
    description: 'Баклажаны, болгарский перец, кабачки, томаты черри',
    price: 290,
    weight: '250г',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    category: 'grill',
  },
  {
    id: 'gr-3',
    name: 'Сёмга на гриле',
    description: 'Стейк из охлаждённой сёмги с лимоном и каперсами',
    price: 890,
    weight: '200г',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
    category: 'grill',
    isNew: true,
  },
  {
    id: 'gr-4',
    name: 'Куриные крылышки BBQ',
    description: 'Крылышки в фирменном соусе барбекю',
    price: 390,
    weight: '350г',
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&h=300&fit=crop',
    category: 'grill',
    isSpicy: true,
  },
  // САЛАТЫ
  {
    id: 'sa-1',
    name: 'Салат Цезарь',
    description: 'Романо, курица гриль, пармезан, гренки, соус Цезарь',
    price: 390,
    weight: '280г',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
    category: 'salads',
    isHit: true,
  },
  {
    id: 'sa-2',
    name: 'Греческий салат',
    description: 'Свежие овощи, маслины Каламата, фета, оливковое масло',
    price: 320,
    weight: '300г',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
    category: 'salads',
  },
  {
    id: 'sa-3',
    name: 'Тёплый салат с говядиной',
    description: 'Микс салатов, говядина на гриле, томаты, соус терияки',
    price: 490,
    weight: '320г',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    category: 'salads',
    isNew: true,
  },
  // НАПИТКИ
  {
    id: 'dr-1',
    name: 'Домашний лимонад',
    description: 'Лимон, мята, тростниковый сахар',
    price: 190,
    weight: '500мл',
    image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop',
    category: 'drinks',
  },
  {
    id: 'dr-2',
    name: 'Морс клюквенный',
    description: 'Натуральный морс из свежей клюквы',
    price: 150,
    weight: '400мл',
    image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&h=300&fit=crop',
    category: 'drinks',
  },
  {
    id: 'dr-3',
    name: 'Чай чёрный/зелёный',
    description: 'Листовой чай премиум класса',
    price: 150,
    weight: '400мл',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop',
    category: 'drinks',
  },
  // ДЕСЕРТЫ
  {
    id: 'de-1',
    name: 'Чизкейк Нью-Йорк',
    description: 'Классический сливочный чизкейк с ягодным соусом',
    price: 320,
    weight: '150г',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
    category: 'desserts',
    isHit: true,
  },
  {
    id: 'de-2',
    name: 'Тирамису',
    description: 'Итальянский десерт с маскарпоне и кофе',
    price: 350,
    weight: '180г',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
    category: 'desserts',
  },
  {
    id: 'de-3',
    name: 'Мороженое ассорти',
    description: 'Три шарика: ваниль, шоколад, клубника',
    price: 250,
    weight: '150г',
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&h=300&fit=crop',
    category: 'desserts',
  },
  // БАР (Алкоголь - только в кафе, по закону РФ доставка запрещена)
  {
    id: 'ba-1',
    name: 'Пиво Живое светлое',
    description: 'Крафтовое нефильтрованное. 18+',
    price: 250,
    weight: '500мл',
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop',
    category: 'bar',
    isAlcohol: true,
  },
  {
    id: 'ba-2',
    name: 'Вино красное домашнее',
    description: 'Грузинское, полусладкое. 18+',
    price: 350,
    weight: '200мл',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop',
    category: 'bar',
    isHit: true,
    isAlcohol: true,
  },
  {
    id: 'ba-3',
    name: 'Коньяк Арарат 5*',
    description: 'Армянский коньяк, 5 лет выдержки. 18+',
    price: 450,
    weight: '50мл',
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=300&fit=crop',
    category: 'bar',
    isAlcohol: true,
  },
  {
    id: 'ba-4',
    name: 'Водка Белуга',
    description: 'Премиальная российская водка. 18+',
    price: 350,
    weight: '50мл',
    image: 'https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?w=400&h=300&fit=crop',
    category: 'bar',
    isAlcohol: true,
  },
  {
    id: 'ba-5',
    name: 'Мохито безалкогольный',
    description: 'Лайм, мята, содовая, тростниковый сироп',
    price: 290,
    weight: '400мл',
    image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop',
    category: 'bar',
    isNew: true,
    isAlcohol: false,
  },
];

// Категории меню
export const categories = [
  { id: 'shashlik', name: 'Шашлык', emoji: '🍖' },
  { id: 'grill', name: 'Гриль', emoji: '🥩' },
  { id: 'salads', name: 'Салаты', emoji: '🥗' },
  { id: 'drinks', name: 'Напитки', emoji: '🍹' },
  { id: 'desserts', name: 'Десерты', emoji: '🍰' },
  { id: 'bar', name: 'Бар', emoji: '🍷' },
] as const;

// Начальные отзывы
export const initialReviews: Review[] = [
  {
    id: '1',
    name: 'Алексей К.',
    text: 'Лучший шашлык в Подмосковье! Приезжаем всей семьей каждые выходные.',
    rating: 5,
    date: '2024-01-15',
    avatar: '👨‍💼',
  },
  {
    id: '2',
    name: 'Мария С.',
    text: 'Отмечали день рождения мужа. Всё было идеально: вкусная еда, приятная атмосфера!',
    rating: 5,
    date: '2024-01-10',
    avatar: '👩',
  },
  {
    id: '3',
    name: 'Дмитрий П.',
    text: 'Заказывал доставку - привезли быстро, шашлык был горячим. Рекомендую!',
    rating: 5,
    date: '2024-01-08',
    avatar: '👨',
  },
  {
    id: '4',
    name: 'Елена В.',
    text: 'Очень уютное место! Вкусные стейки, отличное вино. Цены адекватные.',
    rating: 4,
    date: '2024-01-05',
    avatar: '👩‍🦰',
  },
];

// Преимущества
export const advantages = [
  { icon: '🔥', title: 'Готовим на углях', description: 'Только живой огонь и берёзовые угли' },
  { icon: '🥩', title: 'Свежее мясо', description: 'Ежедневная поставка от фермеров' },
  { icon: '⏱️', title: 'Быстрая подача', description: 'Горячие блюда за 15-20 минут' },
  { icon: '🚗', title: 'Своя парковка', description: 'Бесплатная парковка на 30 мест' },
  { icon: '🎉', title: 'Банкеты до 80 чел.', description: 'Отдельный зал для праздников' },
  { icon: '🛵', title: 'Быстрая доставка', description: 'Доставим за 40 минут' },
];

// Галерея
export const galleryImages = [
  { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop', caption: 'Уютный интерьер' },
  { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop', caption: 'Летняя веранда' },
  { url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop', caption: 'Наш шашлык' },
  { url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&h=400&fit=crop', caption: 'Стейки на гриле' },
  { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop', caption: 'Праздничная сервировка' },
  { url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&h=400&fit=crop', caption: 'Наша команда' },
];

// Статусы заказов
export const ORDER_STATUSES = {
  pending: { label: 'Ожидает подтверждения', color: 'bg-yellow-500', icon: '⏳' },
  confirmed: { label: 'Подтверждён', color: 'bg-blue-500', icon: '✅' },
  preparing: { label: 'Готовится', color: 'bg-orange-500', icon: '👨‍🍳' },
  ready: { label: 'Готов', color: 'bg-green-500', icon: '🍽️' },
  delivering: { label: 'В пути', color: 'bg-purple-500', icon: '🛵' },
  delivered: { label: 'Доставлен', color: 'bg-green-600', icon: '📦' },
  completed: { label: 'Завершён', color: 'bg-gray-500', icon: '🎉' },
  cancelled: { label: 'Отменён', color: 'bg-red-500', icon: '❌' },
};
