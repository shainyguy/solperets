import React from 'react';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Menu from './components/Menu';
import About from './components/About';
import Events from './components/Events';
import Reviews from './components/Reviews';
import Contacts from './components/Contacts';
import Cart from './components/Cart';
import Footer from './components/Footer';

/*
============================================
САЙТ КАФЕ "СОЛЬ И ПЕРЕЦ"
============================================

ИНСТРУКЦИЯ ПО НАСТРОЙКЕ:

1. ИЗОБРАЖЕНИЯ
   - Замените URL изображений в файле src/data/menuData.ts
   - Замените фоновое изображение Hero в src/components/Hero.tsx
   - Замените изображения в src/components/About.tsx
   - Замените изображения в src/components/Events.tsx

2. МЕНЮ
   - Редактируйте блюда в src/data/menuData.ts (массив menuItems)
   - Добавляйте новые блюда, копируя существующие объекты
   - Изменяйте категории в массиве categories

3. TELEGRAM УВЕДОМЛЕНИЯ
   - Создайте бота через @BotFather в Telegram
   - Получите BOT_TOKEN
   - Узнайте ваш CHAT_ID через @userinfobot
   - Вставьте данные в TELEGRAM_CONFIG в src/data/menuData.ts

4. КОНТАКТЫ
   - Измените телефон, адрес и часы работы в CONTACT_INFO
   - Обновите координаты для Яндекс Карт

5. ОТЗЫВЫ
   - Начальные отзывы в массиве initialReviews
   - Новые отзывы сохраняются в localStorage браузера

6. СОЦИАЛЬНЫЕ СЕТИ
   - Замените ссылки в src/components/Footer.tsx

============================================
*/

const App: React.FC = () => {
  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <Header />

        {/* Main Content */}
        <main>
          {/* Hero Section */}
          <Hero />

          {/* Menu Section */}
          <Menu />

          {/* About Section */}
          <About />

          {/* Events/Banquets Section */}
          <Events />

          {/* Reviews Section */}
          <Reviews />

          {/* Contacts Section */}
          <Contacts />
        </main>

        {/* Footer */}
        <Footer />

        {/* Cart Sidebar */}
        <Cart />
      </div>
    </CartProvider>
  );
};

export default App;
