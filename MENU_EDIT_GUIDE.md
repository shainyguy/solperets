# 📋 Инструкция по редактированию меню

## Файл для редактирования: `src/data/menuData.ts`

---

## 🍖 Как добавить новое блюдо

Найдите массив `menuItems` и добавьте новый объект:

```typescript
{ 
  id: 'unique-id-123',           // Уникальный ID
  category: 'mangal',             // ID категории (см. ниже)
  name: 'Название блюда',         // Название
  description: 'Описание блюда',  // Короткое описание
  price: 500,                     // Цена в рублях
  weight: '200 гр',               // Вес/объём
  image: 'https://...',           // URL фото
  isHit: true,                    // Хит продаж (опционально)
  isNew: true,                    // Новинка (опционально)
  isSpicy: true,                  // Острое (опционально)
},
```

---

## 📂 ID категорий меню

| ID | Название |
|----|----------|
| `mangal` | Блюда с мангала |
| `shashlik-bones` | Шашлык на костях |
| `vegetables` | Овощи на мангале |
| `fish` | Рыба на мангале |
| `saj` | Садж |
| `soups` | Супы |
| `hot` | Горячие блюда |
| `plov` | Шах плов |
| `garnish` | Гарниры |
| `beer-snacks` | Закуски к пиву |
| `sauces` | Соусы |
| `cold` | Холодные закуски |
| `salads` | Салаты |
| `drinks` | Напитки |
| `ice-cream` | Мороженое |
| `desserts` | Десерты |

---

## 🍺 ID категорий бара

| ID | Название |
|----|----------|
| `beer` | Пиво |
| `wine` | Вино |
| `strong` | Крепкие напитки |

**Важно:** Для алкоголя добавьте `isAlcohol: true`

---

## 🍷 Как добавить алкогольный напиток

Добавьте в массив `barItems`:

```typescript
{ 
  id: 'vodka-1',
  category: 'strong',
  name: 'Водка "Белуга"',
  description: 'Премиальная водка',
  price: 350,
  weight: '50 мл',
  image: 'https://...',
  isAlcohol: true,  // ← ОБЯЗАТЕЛЬНО для алкоголя
},
```

---

## ⚙️ Как изменить настройки

### Акция дня (включить/выключить)

```typescript
export const DAILY_PROMO = {
  enabled: false,  // ← false = выключено, true = включено
  title: 'Шашлык + Лимонад',
  discount: 15,
  promoCode: 'MANGAL15',
};
```

### Контакты

```typescript
export const CONTACT_INFO = {
  phone: '+7 (999) 123-45-67',
  address: 'г. Химки, мкр. Сходня...',
  workHours: 'Ежедневно с 11:00 до 23:00',
  coordinates: [55.9512, 37.3097],  // Широта, долгота
  instagram: 'https://instagram.com/...',
  telegram: 'https://t.me/...',
  whatsapp: 'https://wa.me/...',
};
```

### Telegram-бот

```typescript
export const TELEGRAM_CONFIG = {
  BOT_TOKEN: 'ВАШ_ТОКЕН',  // От @BotFather
  CHAT_ID: 'ВАШ_ID',       // От @userinfobot
};
```

### Бесплатная доставка

```typescript
export const DELIVERY_CONFIG = {
  freeDeliveryZone: 'Сходня',
  freeDeliveryMinOrder: 0,  // 0 = без минимальной суммы
  deliveryTime: '45-60 минут',
};
```

---

## 🖼️ Где брать фото блюд

1. **Unsplash** — https://unsplash.com (бесплатно)
2. **Pexels** — https://pexels.com (бесплатно)
3. **Собственные фото** — загрузите на хостинг

Рекомендуемый размер: 400x400 px или больше.

---

## ❓ После изменений

1. Сохраните файл
2. Выполните `npm run build`
3. Загрузите обновлённый `dist/index.html` на хостинг

---

## 📞 Поддержка

Если возникли вопросы — обратитесь к разработчику.
