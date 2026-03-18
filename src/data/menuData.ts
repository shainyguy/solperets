// ========================================
// НАСТРОЙКИ САЙТА - РЕДАКТИРУЙТЕ ЗДЕСЬ
// ========================================

// Telegram бот для уведомлений
export const TELEGRAM_CONFIG = {
  BOT_TOKEN: '5191951105:AAESbK_-oU4DNWn195_w9uYy6Y_XUSmQiaI', // Получить у @BotFather
  CHAT_ID: '574947799',       // Узнать у @userinfobot
};

// Контактная информация
export const CONTACT_INFO = {
  phone: '+7 (925) 767-77-78',
  address: '​Улица Некрасова, 15, Химки, Московская область',
  workHours: 'Ежедневно с 11:00 до 23:00',
  coordinates: [55.944047, 37.282959] as [number, number],
  instagram: 'https://instagram.com/sol_perec_shodnya',
  telegram: 'https://t.me/sol_perec_shodnya',
  whatsapp: 'https://wa.me/79991234567',
};

// Настройки доставки
export const DELIVERY_CONFIG = {
  freeDeliveryZone: 'Сходня',
  freeDeliveryMinOrder: 0, // Бесплатно без минимальной суммы
  deliveryTime: '45-60 минут',
};

// Юридическая информация
export const LEGAL_INFO = {
  companyName: 'ООО "Соль и Перец"',
  inn: '5047XXXXXX',
  ogrn: '11750470XXXXX',
  legalAddress: 'Московская область, г. Химки, мкр. Сходня',
};

// Акция дня (enabled: false - отключить)
export const DAILY_PROMO = {
  enabled: false,
  title: 'Шашлык + Лимонад',
  description: 'При заказе от 1500₽',
  discount: 15,
  promoCode: 'MANGAL15',
};

// ========================================
// КАТЕГОРИИ МЕНЮ
// ========================================

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  weight: string;
  image: string;
  category: string;
  isHit?: boolean;
  isNew?: boolean;
  isAlcohol?: boolean;
  isSpicy?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const menuCategories: MenuCategory[] = [
  { id: 'mangal', name: 'Блюда с мангала', icon: '🔥', description: 'Ароматные блюда на открытом огне' },
  { id: 'shashlik-bones', name: 'Шашлык на костях', icon: '🍖', description: 'Сочное мясо на кости' },
  { id: 'vegetables', name: 'Овощи на мангале', icon: '🥬', description: 'Свежие овощи с дымком' },
  { id: 'fish', name: 'Рыба на мангале', icon: '🐟', description: 'Свежая рыба на углях' },
  { id: 'saj', name: 'Садж', icon: '🍳', description: 'Традиционное кавказское блюдо' },
  { id: 'soups', name: 'Супы', icon: '🍲', description: 'Наваристые домашние супы' },
  { id: 'hot', name: 'Горячие блюда', icon: '🍽️', description: 'Сытные горячие блюда' },
  { id: 'plov', name: 'Шах плов', icon: '🍚', description: 'Традиционный плов в тесте' },
  { id: 'garnish', name: 'Гарниры', icon: '🥔', description: 'К любому основному блюду' },
  { id: 'beer-snacks', name: 'Закуски к пиву', icon: '🍺', description: 'Идеально к пенному' },
  { id: 'sauces', name: 'Соусы', icon: '🫙', description: 'Дополнение к блюдам' },
  { id: 'cold', name: 'Холодные закуски', icon: '🥗', description: 'Лёгкие закуски' },
  { id: 'salads', name: 'Салаты', icon: '🥒', description: 'Свежие салаты' },
  { id: 'drinks', name: 'Напитки', icon: '🥤', description: 'Освежающие напитки' },
  { id: 'ice-cream', name: 'Мороженое', icon: '🍨', description: 'Сладкое лакомство' },
  { id: 'desserts', name: 'Десерты', icon: '🍰', description: 'Сладкое завершение' },
];

// Категории бара
export const barCategories: MenuCategory[] = [
  { id: 'beer', name: 'Пиво', icon: '🍺', description: 'Разливное и бутылочное' },
  { id: 'wine', name: 'Вино', icon: '🍷', description: 'Красное и белое' },
  { id: 'strong', name: 'Крепкие напитки', icon: '🥃', description: 'Скоро в меню!' },
];

// ========================================
// БЛЮДА МЕНЮ
// ========================================

export const menuItems: MenuItem[] = [
  // ========== БЛЮДА С МАНГАЛА ==========
  { id: 'mangal-1', category: 'mangal', name: 'Бейденже карфяк', description: 'Нежное мясо с пряностями на мангале', price: 800, weight: '200 гр', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', isHit: true },
  { id: 'mangal-2', category: 'mangal', name: 'Бейденже чебреке', description: 'Ароматное мясо с травами', price: 800, weight: '200 гр', image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400' },
  { id: 'mangal-3', category: 'mangal', name: 'Курдюмба чебреке', description: 'Сочная курдюмба на углях', price: 700, weight: '200 гр', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400' },
  { id: 'mangal-4', category: 'mangal', name: 'Курдюмба чебреке с кабачками', description: 'С овощами гриль', price: 650, weight: '200 гр', image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400' },
  { id: 'mangal-5', category: 'mangal', name: 'Лаваш по-узбекски', description: 'Тонкий хрустящий лаваш', price: 650, weight: '200 гр', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' },
  { id: 'mangal-6', category: 'mangal', name: 'Говяжий гостри с сыром', description: 'Говядина с расплавленным сыром', price: 800, weight: '250 гр', image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400', isNew: true },
  { id: 'mangal-7', category: 'mangal', name: 'Говяжий карфяк с сыром', description: 'Нежная говядина с сырной корочкой', price: 800, weight: '200 гр', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400' },
  { id: 'mangal-8', category: 'mangal', name: 'Говяжий чебреке с острым соусом', description: 'Пикантная говядина', price: 800, weight: '200 гр', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', isSpicy: true },
  { id: 'mangal-9', category: 'mangal', name: 'Свинина чебреке', description: 'Сочная свинина на углях', price: 600, weight: '200 гр', image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400' },
  { id: 'mangal-10', category: 'mangal', name: 'Свинина карфяк', description: 'Мягкая свинина с дымком', price: 600, weight: '200 гр', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400' },
  { id: 'mangal-11', category: 'mangal', name: 'Куриное карфяк', description: 'Нежное куриное филе', price: 500, weight: '200 гр', image: 'https://images.unsplash.com/photo-1532636875304-0c89f5290a84?w=400' },
  { id: 'mangal-12', category: 'mangal', name: 'Куриное чебреке', description: 'Курица с пряностями', price: 500, weight: '200 гр', image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400' },
  { id: 'mangal-13', category: 'mangal', name: 'Куриное кебаб', description: 'Классический куриный кебаб', price: 500, weight: '200 гр', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400', isHit: true },
  { id: 'mangal-14', category: 'mangal', name: 'Шашлык на кебаб-шеле', description: 'Традиционный шашлык', price: 600, weight: '200 гр', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400' },
  { id: 'mangal-15', category: 'mangal', name: 'Шашлык на курице', description: 'Куриный шашлык', price: 600, weight: '200 гр', image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400' },
  { id: 'mangal-16', category: 'mangal', name: 'Шашлык из утиной грудки', description: 'Изысканная утиная грудка', price: 600, weight: '200 гр', image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400', isNew: true },
  { id: 'mangal-17', category: 'mangal', name: 'Шашлык из утки', description: 'Сочная утка на мангале', price: 600, weight: '200 гр', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400' },

  // ========== ШАШЛЫК НА КОСТЯХ ==========
  { id: 'bones-1', category: 'shashlik-bones', name: 'Бейденже', description: 'Мясо на кости', price: 900, weight: '1 кг', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', isHit: true },
  { id: 'bones-2', category: 'shashlik-bones', name: 'Дана из бижлиска', description: 'Нежное мясо на кости', price: 900, weight: '1 кг', image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400' },
  { id: 'bones-3', category: 'shashlik-bones', name: 'Бейденже из баранины', description: 'Баранина на кости', price: 900, weight: '1 кг', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400' },
  { id: 'bones-4', category: 'shashlik-bones', name: 'Кусочки баранина и свинина', description: 'Микс из двух видов мяса', price: 800, weight: '1 кг', image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400' },
  { id: 'bones-5', category: 'shashlik-bones', name: 'Кусочки баранина и говядина', description: 'Сочетание баранины и говядины', price: 800, weight: '1 кг', image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400' },
  { id: 'bones-6', category: 'shashlik-bones', name: 'Кусочки свинина и говядина', description: 'Классический микс', price: 800, weight: '1 кг', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400' },
  { id: 'bones-7', category: 'shashlik-bones', name: 'Кусочки свинина и индейка', description: 'Нежный микс', price: 700, weight: '1 кг', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400' },
  { id: 'bones-8', category: 'shashlik-bones', name: 'Кусочки индейки и курицы', description: 'Птица на углях', price: 600, weight: '1 кг', image: 'https://images.unsplash.com/photo-1532636875304-0c89f5290a84?w=400' },
  { id: 'bones-9', category: 'shashlik-bones', name: 'Курица на костях', description: 'Целая курица на мангале', price: 4500, weight: '1 кг', image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400' },
  { id: 'bones-10', category: 'shashlik-bones', name: 'Бейденже на углях', description: 'Порционное мясо', price: 450, weight: '200 гр', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400' },
  { id: 'bones-11', category: 'shashlik-bones', name: 'Бейденже на угле', description: 'Порционное мясо', price: 400, weight: '200 гр', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400' },
  { id: 'bones-12', category: 'shashlik-bones', name: 'Дана на углях', description: 'Порционная дана', price: 400, weight: '200 гр', image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400' },
  { id: 'bones-13', category: 'shashlik-bones', name: 'Дана на угле', description: 'Порционная дана', price: 350, weight: '200 гр', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400' },

  // ========== ОВОЩИ НА МАНГАЛЕ ==========
  { id: 'veg-1', category: 'vegetables', name: 'Капуста квашенная', description: 'Домашняя квашенная капуста', price: 250, weight: '200 гр', image: 'https://images.unsplash.com/photo-1598030343246-eec71cb44231?w=400' },
  { id: 'veg-2', category: 'vegetables', name: 'Баклажан', description: 'Баклажан на углях', price: 200, weight: '1 шт', image: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=400' },
  { id: 'veg-3', category: 'vegetables', name: 'Перец', description: 'Сладкий перец гриль', price: 150, weight: '1 шт', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400' },
  { id: 'veg-4', category: 'vegetables', name: 'Помидор', description: 'Сочный томат на мангале', price: 150, weight: '1 шт', image: 'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=400' },
  { id: 'veg-5', category: 'vegetables', name: 'Грибы', description: 'Шампиньоны на углях', price: 300, weight: '200 гр', image: 'https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=400', isHit: true },

  // ========== РЫБА НА МАНГАЛЕ ==========
  { id: 'fish-1', category: 'fish', name: 'Филе судака', description: 'Нежное филе судака', price: 900, weight: '1 шт', image: 'https://images.unsplash.com/photo-1534766438357-2b270dbd1b40?w=400', isHit: true },
  { id: 'fish-2', category: 'fish', name: 'Сомак', description: 'Рыба на углях', price: 700, weight: '1 шт', image: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=400' },
  { id: 'fish-3', category: 'fish', name: 'Сом', description: 'Сом на мангале', price: 700, weight: '1 шт', image: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=400' },
  { id: 'fish-4', category: 'fish', name: 'Окунь', description: 'Окунь на углях', price: 700, weight: '1 шт', image: 'https://images.unsplash.com/photo-1534766438357-2b270dbd1b40?w=400' },
  { id: 'fish-5', category: 'fish', name: 'Карась', description: 'Карась на мангале', price: 500, weight: '1 шт', image: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=400' },

  // ========== САДЖ ==========
  { id: 'saj-1', category: 'saj', name: 'Садж баранина', description: 'Баранина с овощами на садже', price: 900, weight: '1 кг', image: 'https://images.unsplash.com/photo-1547424850-9b0a95e05cf1?w=400', isHit: true },
  { id: 'saj-2', category: 'saj', name: 'Садж говядина', description: 'Говядина с овощами на садже', price: 900, weight: '1 кг', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400' },
  { id: 'saj-3', category: 'saj', name: 'Садж свинина', description: 'Свинина с овощами на садже', price: 800, weight: '1 кг', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400' },
  { id: 'saj-4', category: 'saj', name: 'Садж курица', description: 'Курица с овощами на садже', price: 700, weight: '1 кг', image: 'https://images.unsplash.com/photo-1532636875304-0c89f5290a84?w=400' },

  // ========== СУПЫ ==========
  { id: 'soup-1', category: 'soups', name: 'Борщ', description: 'Наваристый домашний борщ', price: 450, weight: '350 гр', image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400', isHit: true },
  { id: 'soup-2', category: 'soups', name: 'Щи', description: 'Русские щи из капусты', price: 450, weight: '350 гр', image: 'https://images.unsplash.com/photo-1583953471470-c9a72c3a57fc?w=400' },
  { id: 'soup-3', category: 'soups', name: 'Хаш из курицы', description: 'Традиционный куриный хаш', price: 400, weight: '350 гр', image: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?w=400' },
  { id: 'soup-4', category: 'soups', name: 'Хаш из говядины', description: 'Наваристый говяжий хаш', price: 400, weight: '350 гр', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400' },
  { id: 'soup-5', category: 'soups', name: 'Лагман', description: 'Густой лагман с лапшой', price: 550, weight: '350 гр', image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400', isNew: true },

  // ========== ГОРЯЧИЕ БЛЮДА ==========
  { id: 'hot-1', category: 'hot', name: 'Бейденже из бижлиска', description: 'Нежное мясо в горячем исполнении', price: 1000, weight: '400 гр', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', isHit: true },
  { id: 'hot-2', category: 'hot', name: 'Бейденже из баранины', description: 'Горячая баранина', price: 650, weight: '400 гр', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400' },
  { id: 'hot-3', category: 'hot', name: 'Цыплёнок табауль', description: 'Хрустящий цыплёнок', price: 650, weight: '300 гр', image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400' },
  { id: 'hot-4', category: 'hot', name: 'Цыплёнок табауль с рисом', description: 'С гарниром из риса', price: 650, weight: '300 гр', image: 'https://images.unsplash.com/photo-1532636875304-0c89f5290a84?w=400' },
  { id: 'hot-5', category: 'hot', name: 'Бейденже на углях', description: 'Порция на углях', price: 550, weight: '300 гр', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400' },
  { id: 'hot-6', category: 'hot', name: 'Бейденже на угле', description: 'Порция на угле', price: 550, weight: '300 гр', image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400' },
  { id: 'hot-7', category: 'hot', name: 'Курдюмба на сковородке', description: 'В горячей сковородке', price: 550, weight: '200 гр', image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400' },
  { id: 'hot-8', category: 'hot', name: 'Лаваш', description: 'Свежий горячий лаваш', price: 250, weight: '2 шт', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' },
  { id: 'hot-9', category: 'hot', name: 'Бейденже с ножом', description: 'Порционная нарезка', price: 250, weight: '2 шт', image: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400' },

  // ========== ШАХ ПЛОВ ==========
  { id: 'plov-1', category: 'plov', name: 'Шах плов с бейденже', description: 'Традиционный плов в тесте', price: 300, weight: '300 гр', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400', isHit: true },
  { id: 'plov-2', category: 'plov', name: 'Шах плов с говядиной', description: 'Плов с говядиной в тесте', price: 300, weight: '300 гр', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400' },
  { id: 'plov-3', category: 'plov', name: 'Шах плов со свининой', description: 'Плов со свининой в тесте', price: 300, weight: '300 гр', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400' },
  { id: 'plov-4', category: 'plov', name: 'Шах плов с курицей', description: 'Плов с курицей в тесте', price: 300, weight: '300 гр', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400' },

  // ========== ГАРНИРЫ ==========
  { id: 'garnish-1', category: 'garnish', name: 'Картофель по-домашнему', description: 'Жареный картофель', price: 200, weight: '200 гр', image: 'https://images.unsplash.com/photo-1568907035219-648e47c4a9a6?w=400', isHit: true },
  { id: 'garnish-2', category: 'garnish', name: 'Картофель по-грилю', description: 'Картофель на гриле', price: 300, weight: '200 гр', image: 'https://images.unsplash.com/photo-1552895638-f7fe08d2f7d5?w=400' },
  { id: 'garnish-3', category: 'garnish', name: 'Картофель фри', description: 'Хрустящий картофель фри', price: 300, weight: '200 гр', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400' },
  { id: 'garnish-4', category: 'garnish', name: 'Рис отварной', description: 'Рассыпчатый рис', price: 200, weight: '200 гр', image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400' },
  { id: 'garnish-5', category: 'garnish', name: 'Гречка', description: 'Гречневая каша', price: 200, weight: '200 гр', image: 'https://images.unsplash.com/photo-1585996094903-57a74f921dc2?w=400' },
  { id: 'garnish-6', category: 'garnish', name: 'Макароны', description: 'Отварные макароны', price: 200, weight: '200 гр', image: 'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400' },
  { id: 'garnish-7', category: 'garnish', name: 'Чечевица', description: 'Чечевичная каша', price: 200, weight: '200 гр', image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400' },

  // ========== ЗАКУСКИ К ПИВУ ==========
  { id: 'beer-snack-1', category: 'beer-snacks', name: 'Кусочки солёной рыбы', description: 'Солёная рыбка', price: 400, weight: '100 гр', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400' },
  { id: 'beer-snack-2', category: 'beer-snacks', name: 'Кусочки копчёной рыбы', description: 'Копчёная рыбка', price: 400, weight: '100 гр', image: 'https://images.unsplash.com/photo-1534766438357-2b270dbd1b40?w=400', isHit: true },
  { id: 'beer-snack-3', category: 'beer-snacks', name: 'Кусочки жареной рыбы', description: 'Жареная рыбка', price: 400, weight: '100 гр', image: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=400' },
  { id: 'beer-snack-4', category: 'beer-snacks', name: 'Хлебцы по-казахстански', description: 'Хрустящие хлебцы', price: 350, weight: '100 гр', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
  { id: 'beer-snack-5', category: 'beer-snacks', name: 'Хлебцы по-узбекски', description: 'Традиционные хлебцы', price: 350, weight: '100 гр', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
  { id: 'beer-snack-6', category: 'beer-snacks', name: 'Батончик', description: 'Снек-батончик', price: 100, weight: '1 шт', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400' },
  { id: 'beer-snack-7', category: 'beer-snacks', name: 'Лаваш тонкий', description: 'Тонкий хрустящий лаваш', price: 100, weight: '1 шт', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' },
  { id: 'beer-snack-8', category: 'beer-snacks', name: 'Чипсы картофельные', description: 'Хрустящие чипсы', price: 120, weight: '300 гр', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400' },
  { id: 'beer-snack-9', category: 'beer-snacks', name: 'Чипсы овощные', description: 'Микс овощных чипсов', price: 120, weight: '300 гр', image: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400' },

  // ========== СОУСЫ ==========
  { id: 'sauce-1', category: 'sauces', name: 'Аджика', description: 'Острая аджика', price: 100, weight: '80 гр', image: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400', isSpicy: true },
  { id: 'sauce-2', category: 'sauces', name: 'Нутелла', description: 'Шоколадная паста', price: 100, weight: '80 гр', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400' },
  { id: 'sauce-3', category: 'sauces', name: 'Сметана', description: 'Домашняя сметана', price: 100, weight: '80 гр', image: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400' },
  { id: 'sauce-4', category: 'sauces', name: 'Тартар', description: 'Соус тартар', price: 100, weight: '80 гр', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400' },
  { id: 'sauce-5', category: 'sauces', name: 'Чесночный', description: 'Чесночный соус', price: 100, weight: '80 гр', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', isHit: true },

  // ========== ХОЛОДНЫЕ ЗАКУСКИ ==========
  { id: 'cold-1', category: 'cold', name: 'Бийский букет', description: 'Ассорти закусок', price: 950, weight: '500 гр', image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=400', isHit: true },
  { id: 'cold-2', category: 'cold', name: 'Зелень в ассортименте', description: 'Свежая зелень', price: 450, weight: '100 гр', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400' },
  { id: 'cold-3', category: 'cold', name: 'Овшаяна карехака', description: 'Традиционная закуска', price: 450, weight: '250 гр', image: 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=400' },
  { id: 'cold-4', category: 'cold', name: 'Мясное ассорти', description: 'Нарезка мясных деликатесов', price: 1250, weight: '300 гр', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400' },
  { id: 'cold-5', category: 'cold', name: 'Рыбное ассорти', description: 'Нарезка рыбных деликатесов', price: 1950, weight: '250 гр', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400' },
  { id: 'cold-6', category: 'cold', name: 'Русский равиолосол', description: 'Классическая закуска', price: 480, weight: '300 гр', image: 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=400' },
  { id: 'cold-7', category: 'cold', name: 'Ассорти Кавказ', description: 'Кавказские закуски', price: 720, weight: '250 гр', image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=400' },
  { id: 'cold-8', category: 'cold', name: 'Еврейская сала', description: 'Нежное сало с приправами', price: 875, weight: '250 гр', image: 'https://images.unsplash.com/photo-1607116668548-8e66e68b4c9e?w=400' },
  { id: 'cold-9', category: 'cold', name: 'Фод-дек с сырами', description: 'Сырная тарелка', price: 450, weight: '150 гр', image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400' },
  { id: 'cold-10', category: 'cold', name: 'Рулетики из баклажанов с орехами', description: 'Баклажаны с ореховой начинкой', price: 520, weight: '150 гр', image: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=400' },
  { id: 'cold-11', category: 'cold', name: 'Икра в тарталетках', description: 'Тарталетки с икрой', price: 410, weight: '200 гр', image: 'https://images.unsplash.com/photo-1558680037-0fd3b1e7ffc2?w=400', isNew: true },
  { id: 'cold-12', category: 'cold', name: 'Сельдь слабосолёная', description: 'Нежная сельдь', price: 655, weight: '100 гр', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400' },
  { id: 'cold-13', category: 'cold', name: 'Рыжка атлантическая', description: 'Атлантическая рыба', price: 275, weight: '150 гр', image: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=400' },
  { id: 'cold-14', category: 'cold', name: 'Маслины/Оливки', description: 'Отборные оливки', price: 120, weight: '80 гр', image: 'https://images.unsplash.com/photo-1563065607-1e15c94e7d3e?w=400' },
  { id: 'cold-15', category: 'cold', name: 'Лимон', description: 'Нарезанный лимон', price: 680, weight: '200 гр', image: 'https://images.unsplash.com/photo-1582087463261-ddea03f80e5d?w=400' },
  { id: 'cold-16', category: 'cold', name: 'Рулетики Philadelphia', description: 'Рулетики с сыром Филадельфия', price: 385, weight: '100 гр', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400' },
  { id: 'cold-17', category: 'cold', name: 'Сыр Чечил', description: 'Копчёный сыр косичкой', price: 345, weight: '100 гр', image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400' },
  { id: 'cold-18', category: 'cold', name: 'Сыр Азербайджан', description: 'Традиционный сыр', price: 385, weight: '100 гр', image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400' },

  // ========== САЛАТЫ ==========
  { id: 'salad-1', category: 'salads', name: 'Оливье', description: 'Классический салат оливье', price: 450, weight: '200 гр', image: 'https://images.unsplash.com/photo-1600335895229-6e75511892c8?w=400', isHit: true },
  { id: 'salad-2', category: 'salads', name: 'Пледо Плухары', description: 'Фирменный салат', price: 480, weight: '200 гр', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' },
  { id: 'salad-3', category: 'salads', name: 'Салат из говядины', description: 'Салат с говядиной', price: 550, weight: '200 гр', image: 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=400' },
  { id: 'salad-4', category: 'salads', name: 'Мангальский салат', description: 'Салат с мангала', price: 425, weight: '200 гр', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400' },
  { id: 'salad-5', category: 'salads', name: 'Чобан салат', description: 'Пастуший салат', price: 480, weight: '250 гр', image: 'https://images.unsplash.com/photo-1529059997568-3d847b1154f0?w=400' },
  { id: 'salad-6', category: 'salads', name: 'Цезарь с сёмгой', description: 'Классический Цезарь с рыбой', price: 550, weight: '230 гр', image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400' },
  { id: 'salad-7', category: 'salads', name: 'Цезарь с креветками', description: 'Цезарь с морепродуктами', price: 670, weight: '230 гр', image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400', isNew: true },
  { id: 'salad-8', category: 'salads', name: 'Греческий салат', description: 'Салат с фетой и оливками', price: 630, weight: '230 гр', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400' },
  { id: 'salad-9', category: 'salads', name: 'Руккола с креветками/сёмгой', description: 'Лёгкий салат с рукколой', price: 490, weight: '200 гр', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' },
  { id: 'salad-10', category: 'salads', name: 'Черри, пармезан, соус классический', description: 'Помидоры с сыром', price: 590, weight: '200 гр', image: 'https://images.unsplash.com/photo-1529059997568-3d847b1154f0?w=400' },

  // ========== НАПИТКИ ==========
  { id: 'drink-1', category: 'drinks', name: 'Чай ассорти', description: 'Чайник ассорти', price: 1000, weight: '1 чайник', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400' },
  { id: 'drink-2', category: 'drinks', name: 'Кофе эспрессо', description: 'Крепкий эспрессо', price: 170, weight: '1 порция', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400' },
  { id: 'drink-3', category: 'drinks', name: 'Американо', description: 'Классический американо', price: 170, weight: '1 порция', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400' },
  { id: 'drink-4', category: 'drinks', name: 'Вода без газа', description: 'Чистая вода', price: 200, weight: '250 мл', image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400' },
  { id: 'drink-5', category: 'drinks', name: 'Вода с газом', description: 'Газированная вода', price: 200, weight: '250 мл', image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400' },
  { id: 'drink-6', category: 'drinks', name: 'Кока-Кола', description: 'Классическая кола', price: 250, weight: '0.33 л', image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400' },
  { id: 'drink-7', category: 'drinks', name: 'Фанта', description: 'Апельсиновая газировка', price: 250, weight: '0.33 л', image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400' },
  { id: 'drink-8', category: 'drinks', name: 'Тархун', description: 'Грузинский тархун', price: 280, weight: '0.5 л', image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400', isHit: true },
  { id: 'drink-9', category: 'drinks', name: 'Лимонад', description: 'Домашний лимонад', price: 280, weight: '0.5 л', image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400' },
  { id: 'drink-10', category: 'drinks', name: 'Нагазири', description: 'Грузинский напиток', price: 320, weight: '0.5 л', image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400' },
  { id: 'drink-11', category: 'drinks', name: 'Вогатлі', description: 'Традиционный напиток', price: 300, weight: '0.5 л', image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400' },
  { id: 'drink-12', category: 'drinks', name: 'Морс домашний', description: 'Ягодный морс', price: 600, weight: '1 л', image: 'https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=400' },
  { id: 'drink-13', category: 'drinks', name: 'Компот айва', description: 'Компот из айвы', price: 500, weight: '1 л', image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400' },
  { id: 'drink-14', category: 'drinks', name: 'Компот фейхоа', description: 'Экзотический компот', price: 500, weight: '1 л', image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400' },
  { id: 'drink-15', category: 'drinks', name: 'Компот кизил', description: 'Компот из кизила', price: 500, weight: '1 л', image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400' },
  { id: 'drink-16', category: 'drinks', name: 'Компот вишня', description: 'Вишнёвый компот', price: 500, weight: '1 л', image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400' },
  { id: 'drink-17', category: 'drinks', name: 'Сок яблочный', description: 'Натуральный сок', price: 500, weight: '1 л', image: 'https://images.unsplash.com/photo-1576673442511-7e39b6545c87?w=400' },
  { id: 'drink-18', category: 'drinks', name: 'Сок мультифрукт', description: 'Микс фруктов', price: 500, weight: '1 л', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400' },
  { id: 'drink-19', category: 'drinks', name: 'Сок персиковый', description: 'Персиковый сок', price: 500, weight: '1 л', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400' },
  { id: 'drink-20', category: 'drinks', name: 'Сок томатный', description: 'Томатный сок', price: 500, weight: '1 л', image: 'https://images.unsplash.com/photo-1578676656248-3cbb17e6bc8a?w=400' },
  { id: 'drink-21', category: 'drinks', name: 'Сок Сады Придонья', description: 'Натуральный сок', price: 500, weight: '1 л', image: 'https://images.unsplash.com/photo-1576673442511-7e39b6545c87?w=400' },

  // ========== МОРОЖЕНОЕ ==========
  { id: 'ice-1', category: 'ice-cream', name: 'Ванильное', description: 'Классическое ванильное', price: 80, weight: '1 шарик', image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400' },
  { id: 'ice-2', category: 'ice-cream', name: 'Шоколадное', description: 'Шоколадное мороженое', price: 80, weight: '1 шарик', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', isHit: true },
  { id: 'ice-3', category: 'ice-cream', name: 'Клубничное', description: 'Клубничное мороженое', price: 80, weight: '1 шарик', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400' },

  // ========== ДЕСЕРТЫ ==========
  { id: 'dessert-1', category: 'desserts', name: 'Чизкейк три шоколада', description: 'Три вида шоколада', price: 285, weight: '1 шт', image: 'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?w=400', isHit: true },
  { id: 'dessert-2', category: 'desserts', name: 'Чизкейк Нью-Йорк классический', description: 'Классический рецепт', price: 285, weight: '1 шт', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400' },
  { id: 'dessert-3', category: 'desserts', name: 'Чизкейк карамельный', description: 'С карамельным соусом', price: 285, weight: '1 шт', image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=400' },
  { id: 'dessert-4', category: 'desserts', name: 'Тирамису', description: 'Итальянский десерт', price: 285, weight: '1 шт', image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400' },
  { id: 'dessert-5', category: 'desserts', name: 'Фруктовая ваза', description: 'Ассорти свежих фруктов', price: 2000, weight: '1.5 кг', image: 'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=400' },
  { id: 'dessert-6', category: 'desserts', name: 'Нарезка фруктовая', description: 'Нарезанные фрукты', price: 1000, weight: '700 гр', image: 'https://images.unsplash.com/photo-1568702846914-96b305d2ebb7?w=400' },
];

// ========================================
// БАРНАЯ КАРТА (18+)
// ========================================

export const barItems: MenuItem[] = [
  // ========== ПИВО ==========
  { id: 'beer-1', category: 'beer', name: 'Балтика 7', description: 'Светлое разливное', price: 250, weight: '0.5 л', image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', isAlcohol: true },
  { id: 'beer-2', category: 'beer', name: 'Жигулёвское', description: 'Классическое светлое', price: 200, weight: '0.5 л', image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400', isAlcohol: true },
  { id: 'beer-3', category: 'beer', name: 'Guinness', description: 'Тёмный стаут', price: 400, weight: '0.5 л', image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', isAlcohol: true },
  { id: 'beer-4', category: 'beer', name: 'Heineken', description: 'Импортное светлое', price: 350, weight: '0.33 л', image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400', isAlcohol: true },
  { id: 'beer-5', category: 'beer', name: 'Stella Artois', description: 'Бельгийское светлое', price: 350, weight: '0.33 л', image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', isAlcohol: true },

  // ========== ВИНО ==========
  { id: 'wine-1', category: 'wine', name: 'Саперави', description: 'Красное грузинское сухое', price: 350, weight: '150 мл', image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400', isAlcohol: true, isHit: true },
  { id: 'wine-2', category: 'wine', name: 'Киндзмараули', description: 'Красное грузинское полусладкое', price: 400, weight: '150 мл', image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400', isAlcohol: true },
  { id: 'wine-3', category: 'wine', name: 'Мукузани', description: 'Красное сухое выдержанное', price: 380, weight: '150 мл', image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400', isAlcohol: true },
  { id: 'wine-4', category: 'wine', name: 'Цинандали', description: 'Белое грузинское сухое', price: 350, weight: '150 мл', image: 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=400', isAlcohol: true },
  { id: 'wine-5', category: 'wine', name: 'Алазанская долина', description: 'Белое полусладкое', price: 320, weight: '150 мл', image: 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=400', isAlcohol: true },
  { id: 'wine-6', category: 'wine', name: 'Бутылка красного (домашнее)', description: 'Домашнее грузинское', price: 1500, weight: '0.75 л', image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400', isAlcohol: true },
  { id: 'wine-7', category: 'wine', name: 'Бутылка белого (домашнее)', description: 'Домашнее грузинское', price: 1500, weight: '0.75 л', image: 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=400', isAlcohol: true },
];

// ========================================
// УСЛУГИ И МЕРОПРИЯТИЯ
// ========================================

export interface EventService {
  id: string;
  name: string;
  description: string;
  icon: string;
  price?: string;
}

export const eventServices: EventService[] = [
  { id: 'birthday', name: 'Дни рождения', description: 'Праздничное оформление, торт, программа', icon: '🎂', price: 'от 3 000 ₽' },
  { id: 'corporate', name: 'Корпоративы', description: 'Банкетное меню, музыка, развлечения', icon: '🏢', price: 'от 2 500 ₽/чел' },
  { id: 'wedding', name: 'Свадьбы', description: 'Полное оформление, декор, координатор', icon: '💒', price: 'от 50 000 ₽' },
  { id: 'funeral', name: 'Поминки', description: 'Традиционное меню, зал, деликатное обслуживание', icon: '🕯️', price: 'от 1 500 ₽/чел' },
  { id: 'fireworks', name: 'Салют', description: 'Профессиональный фейерверк для праздника', icon: '🎆', price: 'от 15 000 ₽' },
  { id: 'mascots', name: 'Ростовые куклы', description: 'Аниматоры в костюмах для детей и взрослых', icon: '🧸', price: 'от 5 000 ₽' },
  { id: 'decor', name: 'Декор и оформление', description: 'Шары, цветы, тематическое оформление', icon: '🎈', price: 'от 8 000 ₽' },
  { id: 'shah-plov', name: 'Шах плов на мероприятие', description: 'Приготовление традиционного шах плова', icon: '🍚', price: 'от 4 000 ₽' },
  { id: 'caucasian', name: 'Кавказские традиции', description: 'Живая музыка, танцы, национальные обычаи', icon: '🎵', price: 'от 10 000 ₽' },
  { id: 'disco', name: 'Дискотеки ПТ-СБ', description: 'DJ, танцпол, световое шоу', icon: '🪩', price: 'Вход свободный' },
];

// ========================================
// НОВОСТИ И АНОНСЫ
// ========================================

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  isNew?: boolean;
}

export const newsItems: NewsItem[] = [
  { id: 'veranda', title: 'Скоро открытие летней веранды!', description: 'Уютная веранда с видом на природу', icon: '🌿', isNew: true },
];

// ========================================
// СТАТИСТИКА
// ========================================

export const STATS = {
  years: 5,
  clients: 15000,
  rating: 4.9,
  dishes: 170,
};

// ========================================
// ПРЕИМУЩЕСТВА
// ========================================

export const advantages = [
  { icon: '🔥', title: 'Живой огонь', description: 'Готовим на настоящем мангале' },
  { icon: '🥩', title: 'Свежее мясо', description: 'Закупаем у проверенных фермеров' },
  { icon: '👨‍🍳', title: 'Опытные повара', description: 'Мастера кавказской кухни' },
  { icon: '🚚', title: 'Бесплатная доставка', description: 'По Сходне — 0 рублей' },
];

// ========================================
// ГАЛЕРЕЯ
// ========================================

export const galleryImages = [
  { url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600', alt: 'Шашлык на мангале' },
  { url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600', alt: 'Мясо на углях' },
  { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600', alt: 'Интерьер кафе' },
  { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600', alt: 'Сервировка стола' },
];

// ========================================
// НАЧАЛЬНЫЕ ОТЗЫВЫ
// ========================================

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
  avatar?: string;
}

export const initialReviews: Review[] = [
  { id: '1', name: 'Александр', rating: 5, text: 'Лучший шашлык в Сходне! Мясо тает во рту, обслуживание на высоте.', date: '2024-01-15' },
  { id: '2', name: 'Мария', rating: 5, text: 'Отмечали день рождения — всё было идеально! Спасибо за праздник!', date: '2024-01-10' },
  { id: '3', name: 'Дмитрий', rating: 4, text: 'Очень вкусно, большие порции. Цены адекватные. Рекомендую!', date: '2024-01-05' },
];

// ========================================
// ПАКЕТЫ БАНКЕТОВ
// ========================================

export interface BanquetPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  includes: string[];
  color: string;
}

export const BANQUET_PACKAGES: BanquetPackage[] = [
  {
    id: 'economy',
    name: 'Эконом',
    price: 1500,
    description: 'Базовый набор для небольшого мероприятия',
    includes: ['Салаты', 'Горячее на выбор', 'Гарнир', 'Напитки', 'Хлеб'],
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'standard',
    name: 'Стандарт',
    price: 2500,
    description: 'Оптимальный вариант для праздника',
    includes: ['2 салата', 'Холодные закуски', 'Шашлык ассорти', 'Овощи гриль', 'Гарнир', 'Десерт', 'Напитки'],
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'premium',
    name: 'Премиум',
    price: 4000,
    description: 'Всё включено для VIP-мероприятия',
    includes: ['3 салата', 'Ассорти закусок', 'Садж', 'Шашлык премиум', 'Рыба', 'Овощи', 'Шах плов', 'Десерты', 'Фрукты', 'Напитки'],
    color: 'from-purple-500 to-purple-600',
  },
];

// ========================================
// ДОПОЛНИТЕЛЬНЫЕ УСЛУГИ БАНКЕТА
// ========================================

export interface BanquetExtra {
  id: string;
  name: string;
  price: number;
  unit: string;
}

export const BANQUET_EXTRAS: BanquetExtra[] = [
  { id: 'dj', name: 'DJ', price: 10000, unit: 'за вечер' },
  { id: 'photo', name: 'Фотограф', price: 8000, unit: 'за 2 часа' },
  { id: 'karaoke', name: 'Караоке-зал', price: 3000, unit: 'за вечер' },
  { id: 'decor', name: 'Оформление зала', price: 5000, unit: 'базовое' },
  { id: 'fireworks', name: 'Салют', price: 15000, unit: 'за шоу' },
  { id: 'mascot', name: 'Ростовая кукла', price: 5000, unit: 'за 1 час' },
];

// ========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ========================================

export function isPromoActive(): boolean {
  if (!DAILY_PROMO.enabled) return false;
  
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;
  
  // Парсинг времени из строки "HH:MM"
  const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };
  
  const startTime = parseTime('11:00');
  const endTime = parseTime('23:00');
  
  return currentTime >= startTime && currentTime <= endTime;
}

export function getPromoTimeLeft(): string {
  if (!isPromoActive()) return '';
  
  const now = new Date();
  const endHour = 23;
  const endMinute = 0;
  
  const endTime = new Date(now);
  endTime.setHours(endHour, endMinute, 0, 0);
  
  const diff = endTime.getTime() - now.getTime();
  if (diff <= 0) return '';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}ч ${minutes}м`;
}

// Алиас для совместимости
export const categories = menuCategories;
