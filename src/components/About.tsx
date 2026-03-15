import React from 'react';
import { useInView } from '../hooks/useInView';

const About: React.FC = () => {
  const { ref, isInView } = useInView(0.2);

  const features = [
    {
      icon: '🔥',
      title: 'Живой огонь',
      description: 'Готовим на настоящем мангале и гриле',
    },
    {
      icon: '🥩',
      title: 'Свежее мясо',
      description: 'Только качественные продукты от проверенных поставщиков',
    },
    {
      icon: '👨‍🍳',
      title: 'Опытные повара',
      description: 'Мастера своего дела с многолетним стажем',
    },
    {
      icon: '🏡',
      title: 'Уют и комфорт',
      description: 'Тёплая атмосфера для семейных встреч и праздников',
    },
  ];

  return (
    <section
      id="about"
      className="py-20 bg-gradient-to-b from-gray-50 to-white"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Images */}
          <div
            className={`relative transition-all duration-700 ${
              isInView
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-10'
            }`}
          >
            <div className="relative">
              {/* Main Image - ЗАМЕНИТЕ URL */}
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop"
                alt="Интерьер кафе Соль и Перец"
                className="rounded-2xl shadow-2xl w-full"
              />
              
              {/* Floating Image - ЗАМЕНИТЕ URL */}
              <div className="absolute -bottom-8 -right-8 w-48 h-48 md:w-64 md:h-64">
                <img
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=300&fit=crop"
                  alt="Блюдо из кафе"
                  className="rounded-2xl shadow-xl w-full h-full object-cover border-4 border-white"
                />
              </div>

              {/* Decorative Element */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-orange-500 rounded-full opacity-20 blur-xl" />
            </div>
          </div>

          {/* Content */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isInView
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-10'
            }`}
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              О нашем <span className="text-orange-500">кафе</span>
            </h2>
            
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              «Соль и Перец» — это уютное кафе в самом сердце Сходни, где традиции
              кавказской кухни встречаются с современным гостеприимством. Мы готовим
              шашлык и блюда на гриле так, как делали это наши предки — на живом
              огне, с любовью и вниманием к каждой детали.
            </p>
            
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Уже более 10 лет мы радуем наших гостей вкуснейшими блюдами, уютной
              атмосферой и безупречным сервисом. Приходите к нам на семейный обед,
              романтический ужин или шумный праздник — мы сделаем всё, чтобы вы
              ушли довольными!
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${
                    isInView
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-5'
                  }`}
                  style={{ transitionDelay: `${300 + index * 100}ms` }}
                >
                  <span className="text-3xl mb-2 block">{feature.icon}</span>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
