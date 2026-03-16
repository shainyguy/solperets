import React, { useState, useEffect } from 'react';
import { DAILY_PROMO, STATS, isPromoActive, getPromoTimeLeft } from '../data/menuData';

const Hero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getPromoTimeLeft(DAILY_PROMO));
  const [promoActive, setPromoActive] = useState(isPromoActive(DAILY_PROMO));

  useEffect(() => {
    setIsVisible(true);
    
    if (DAILY_PROMO.enabled) {
      const timer = setInterval(() => {
        setTimeLeft(getPromoTimeLeft(DAILY_PROMO));
        setPromoActive(isPromoActive(DAILY_PROMO));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center">
      {/* Фон */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&h=1080&fit=crop"
          alt="Шашлык на гриле"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Контент */}
      <div className={`relative z-10 text-center px-4 max-w-3xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        
        {/* Компактная акция - только если включена */}
        {DAILY_PROMO.enabled && promoActive && (
          <div className="inline-flex items-center gap-2 bg-orange-500/90 backdrop-blur px-4 py-2 rounded-full mb-6 text-sm">
            <span>🔥</span>
            <span className="text-white font-medium">{DAILY_PROMO.title} −{DAILY_PROMO.discount}%</span>
            <span className="text-orange-200 font-mono text-xs">{formatTime(timeLeft)}</span>
          </div>
        )}

        {/* Название */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-4">
          <span className="text-orange-500">Соль</span> <span className="text-terracotta">Перец</span>
        </h1>

        {/* Слоган */}
        <p className="text-lg md:text-xl text-gray-300 mb-6">
          Настоящий шашлык и гриль рядом с МЦД Сходня
        </p>

        {/* Мини-статистика - одной строкой */}
        <div className="flex justify-center gap-6 mb-8 text-sm text-gray-400">
          <span>⭐ {STATS.avgRating}</span>
          <span>💬 {STATS.happyClients}+ гостей</span>
          <span>🏆 {STATS.yearsWorking} лет</span>
        </div>

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={scrollToMenu}
            className="px-6 py-3 bg-orange-500 text-white font-medium rounded-full hover:bg-orange-600 transition-colors"
          >
            Смотреть меню
          </button>
          <a 
            href="tel:+79991234567"
            className="px-6 py-3 bg-white/10 backdrop-blur text-white font-medium rounded-full border border-white/20 hover:bg-white/20 transition-colors"
          >
            Позвонить
          </a>
        </div>
      </div>

      {/* Скролл индикатор */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
