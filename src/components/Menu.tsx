import React, { useState } from 'react';
import { useInView } from '../hooks/useInView';
import { useCart } from '../context/CartContext';
import { menuItems, categories } from '../data/menuData';
import { MenuCategory } from '../types';

const Menu: React.FC = () => {
  const { ref, isInView } = useInView(0.1);
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('shashlik');
  const { addItem } = useCart();

  const filteredItems = menuItems.filter(
    (item) => item.category === activeCategory
  );

  return (
    <section id="menu" className="py-20 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Наше <span className="text-orange-500">меню</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Блюда, приготовленные с душой на открытом огне
          </p>
        </div>

        {/* Category Tabs */}
        <div
          className={`flex flex-wrap justify-center gap-2 md:gap-4 mb-12 transition-all duration-700 delay-100 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id as MenuCategory)}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-full font-medium transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-600'
              }`}
            >
              <span className="mr-2">{category.emoji}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className={`group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden ${
                isInView
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
              style={{
                transitionDelay: `${150 + index * 100}ms`,
              }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Quick Add Button */}
                <button
                  onClick={() => addItem(item)}
                  className="absolute bottom-4 right-4 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-orange-600 transition-colors">
                    {item.name}
                  </h3>
                  <span className="font-bold text-orange-500 text-lg whitespace-nowrap ml-2">
                    {item.price} ₽
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>
                <button
                  onClick={() => addItem(item)}
                  className="w-full py-2.5 bg-gray-100 hover:bg-orange-500 text-gray-700 hover:text-white font-medium rounded-lg transition-all duration-300"
                >
                  В корзину
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Menu;
