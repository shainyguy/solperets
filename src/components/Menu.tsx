import React, { useState } from 'react';
import { menuItems, categories } from '../data/menuData';
import { useCart } from '../context/CartContext';
import { MenuCategory } from '../types';
import { useInView } from '../hooks/useInView';

const Menu: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('shashlik');
  const { ref, isInView } = useInView(0.1);
  const { addItem } = useCart();

  const filteredItems = menuItems.filter((item) => item.category === activeCategory);

  return (
    <section id="menu" className="py-20 bg-gray-50">
      <div ref={ref as React.RefObject<HTMLDivElement>} className="container mx-auto px-4">
        {/* Section Header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="text-orange-500 font-medium tracking-wider uppercase">
            Наше меню
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-4">
            Выберите любимое блюдо
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Готовим с любовью на живом огне. Только свежее мясо и овощи от местных фермеров.
          </p>
        </div>

        {/* Category Tabs */}
        <div
          className={`flex flex-wrap justify-center gap-2 md:gap-4 mb-8 transition-all duration-700 delay-100 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id as MenuCategory)}
              className={`px-4 md:px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-orange-500 to-terracotta text-white shadow-lg shadow-orange-500/30 scale-105'
                  : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 shadow'
              }`}
            >
              <span>{category.emoji}</span>
              <span className="hidden sm:inline">{category.name}</span>
              {category.id === 'bar' && <span className="text-xs">(18+)</span>}
            </button>
          ))}
        </div>

        {/* Alcohol Warning for Bar */}
        {activeCategory === 'bar' && (
          <div className={`mb-8 p-4 bg-red-50 border border-red-200 rounded-xl transition-all duration-500 ${
            isInView ? 'opacity-100' : 'opacity-0'
          }`}>
            <p className="text-red-700 text-sm text-center flex items-center justify-center gap-2">
              <span className="text-lg">⚠️</span>
              <span>
                <strong>Внимание:</strong> Продажа алкоголя лицам до 18 лет запрещена. 
                Доставка алкогольной продукции не осуществляется (ФЗ №171-ФЗ). 
                Алкогольные напитки доступны только в кафе.
              </span>
            </p>
          </div>
        )}

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className={`group bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {item.isHit && (
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                      🔥 ХИТ
                    </span>
                  )}
                  {item.isNew && (
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                      ✨ NEW
                    </span>
                  )}
                  {item.isSpicy && (
                    <span className="px-3 py-1 bg-orange-600 text-white text-xs font-bold rounded-full">
                      🌶️ Острое
                    </span>
                  )}
                  {item.isAlcohol && (
                    <span className="px-3 py-1 bg-red-700 text-white text-xs font-bold rounded-full">
                      🍷 18+
                    </span>
                  )}
                </div>

                {/* Old Price Badge */}
                {item.oldPrice && (
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full">
                      -{Math.round((1 - item.price / item.oldPrice) * 100)}%
                    </span>
                  </div>
                )}

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button
                    onClick={() => addItem(item)}
                    className="transform -translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    В корзину
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                    {item.name}
                  </h3>
                  {item.weight && (
                    <span className="text-sm text-gray-400 whitespace-nowrap ml-2">
                      {item.weight}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-orange-500">
                      {item.price} ₽
                    </span>
                    {item.oldPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {item.oldPrice} ₽
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => addItem(item)}
                    className="p-3 bg-orange-100 hover:bg-orange-500 text-orange-500 hover:text-white rounded-full transition-all duration-300 transform hover:scale-110"
                    title="Добавить в корзину"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-500 mb-4">
            Не нашли любимое блюдо? Позвоните нам — приготовим на заказ!
          </p>
          <a
            href="tel:+74951234567"
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            +7 (495) 123-45-67
          </a>
        </div>
      </div>
    </section>
  );
};

export default Menu;
