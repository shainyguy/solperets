import { MenuItem, Review } from '../types';

// ============================================
// ДАННЫЕ МЕНЮ - РЕДАКТИРУЙТЕ ЗДЕСЬ
// ============================================
// Для добавления блюд: скопируйте блок и измените данные
// Для изображений: замените URL на реальные ссылки

export const menuItems: MenuItem[] = [
  // ШАШЛЫК
  {
    id: 'sh-1',
    name: 'Шашлык из свинины',
    description: 'Нежная свиная шейка, маринованная по фирменному рецепту',
    price: 450,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    category: 'shashlik',
  },
  {
    id: 'sh-2',
    name: 'Шашлык из баранины',
    description: 'Сочная баранина на косточке с восточными специями',
    price: 590,
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=300&fit=crop',
    category: 'shashlik',
  },
  {
    id: 'sh-3',
    name: 'Люля-кебаб',
    description: 'Рубленый бараний фарш с луком и зеленью',
    price: 380,
    image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop',
    category: 'shashlik',
  },
  {
    id: 'sh-4',
    name: 'Шашлык из курицы',
    description: 'Куриное бедро в пряном маринаде',
    price: 320,
    image: 'https://images.unsplash.com/photo-1532636875304-0c89f5123745?w=400&h=300&fit=crop',
    category: 'shashlik',
  },

  // ГРИЛЬ
  {
    id: 'gr-1',
    name: 'Стейк Рибай',
    description: 'Мраморная говядина, 300г, прожарка на выбор',
    price: 1290,
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop',
    category: 'grill',
  },
  {
    id: 'gr-2',
    name: 'Овощи на гриле',
    description: 'Баклажаны, перцы, кабачки, томаты',
    price: 290,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop',
    category: 'grill',
  },
  {
    id: 'gr-3',
    name: 'Сёмга на гриле',
    description: 'Стейк из свежей сёмги с лимоном и травами',
    price: 890,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
    category: 'grill',
  },

  // САЛАТЫ
  {
    id: 'sa-1',
    name: 'Салат Цезарь',
    description: 'Романо, курица гриль, пармезан, соус Цезарь',
    price: 390,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
    category: 'salads',
  },
  {
    id: 'sa-2',
    name: 'Греческий салат',
    description: 'Свежие овощи, маслины, фета, оливковое масло',
    price: 320,
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
    category: 'salads',
  },
  {
    id: 'sa-3',
    name: 'Овощной микс',
    description: 'Свежие сезонные овощи и зелень',
    price: 250,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    category: 'salads',
  },

  // НАПИТКИ
  {
    id: 'dr-1',
    name: 'Домашний лимонад',
    description: 'Лимон, мята, тростниковый сахар, 500мл',
    price: 190,
    image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop',
    category: 'drinks',
  },
  {
    id: 'dr-2',
    name: 'Морс клюквенный',
    description: 'Из свежей клюквы, 500мл',
    price: 150,
    image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&h=300&fit=crop',
    category: 'drinks',
  },
  {
    id: 'dr-3',
    name: 'Чай с чабрецом',
    description: 'Ароматный травяной чай, 400мл',
    price: 120,
    image: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400&h=300&fit=crop',
    category: 'drinks',
  },

  // ДЕСЕРТЫ
  {
    id: 'de-1',
    name: 'Чизкейк Нью-Йорк',
    description: 'Классический сливочный чизкейк',
    price: 290,
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
    category: 'desserts',
  },
  {
    id: 'de-2',
    name: 'Тирамису',
    description: 'Итальянский десерт с маскарпоне и кофе',
    price: 320,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
    category: 'desserts',
  },

  // БАР
  {
    id: 'ba-1',
    name: 'Пиво светлое (0.5л)',
    description: 'Разливное светлое пиво',
    price: 220,
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&h=300&fit=crop',
    category: 'bar',
  },
  {
    id: 'ba-2',
    name: 'Вино красное (бокал)',
    description: 'Красное сухое вино, 150мл',
    price: 350,
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop',
    category: 'bar',
  },
  {
    id: 'ba-3',
    name: 'Виски Jack Daniels',
    description: 'Классический Tennessee Whiskey, 50мл',
    price: 450,
    image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=300&fit=crop',
    category: 'bar',
  },
  {
    id: 'ba-4',
    name: 'Коктейль Мохито',
    description: 'Ром, лайм, мята, содовая',
    price: 390,
    image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop',
    category: 'bar',
  },
  {
    id: 'ba-5',
    name: 'Водка (50мл)',
    description: 'Премиальная водка',
    price: 180,
    image: 'https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?w=400&h=300&fit=crop',
    category: 'bar',
  },
];

// ============================================
// НАЧАЛЬНЫЕ ОТЗЫВЫ - РЕДАКТИРУЙТЕ ЗДЕСЬ
// ============================================

export const initialReviews: Review[] = [
  {
    id: 'r-1',
    name: 'Александр',
    text: 'Отличное место! Шашлык просто тает во рту. Обязательно приду ещё!',
    rating: 5,
    date: '2024-01-15',
  },
  {
    id: 'r-2',
    name: 'Мария',
    text: 'Уютная атмосфера, вкусная еда. Праздновали день рождения — всё прошло идеально!',
    rating: 5,
    date: '2024-01-10',
  },
  {
    id: 'r-3',
    name: 'Дмитрий',
    text: 'Приехал после работы, поужинал стейком. Качество мяса отменное, персонал вежливый.',
    rating: 4,
    date: '2024-01-08',
  },
];

// ============================================
// КАТЕГОРИИ МЕНЮ
// ============================================

export const categories = [
  { id: 'shashlik', name: 'Шашлык', emoji: '🍖' },
  { id: 'grill', name: 'Гриль', emoji: '🥩' },
  { id: 'salads', name: 'Салаты', emoji: '🥗' },
  { id: 'drinks', name: 'Напитки', emoji: '🍹' },
  { id: 'desserts', name: 'Десерты', emoji: '🍰' },
  { id: 'bar', name: 'Бар', emoji: '🍺' },
] as const;

// ============================================
// НАСТРОЙКИ TELEGRAM БОТА
// ============================================
// Создайте бота через @BotFather и получите токен
// Узнайте ваш chat_id через @userinfobot

export const TELEGRAM_CONFIG = {
  // Замените на ваш токен бота
  BOT_TOKEN: 'YOUR_BOT_TOKEN_HERE',
  // Замените на ваш chat_id
  CHAT_ID: 'YOUR_CHAT_ID_HERE',
};

// ============================================
// КОНТАКТНАЯ ИНФОРМАЦИЯ
// ============================================

export const CONTACT_INFO = {
  phone: '+7 (999) 123-45-67',
  address: 'Московская область, г. Химки, мкр. Сходня, ул. Примерная, д. 1',
  workHours: 'Ежедневно с 11:00 до 23:00',
  // Координаты для Яндекс Карт (замените на реальные)
  coordinates: [55.9444, 37.3067] as [number, number],
};
