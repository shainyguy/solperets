import React, { useState } from 'react';
import { useInView } from '../hooks/useInView';
import { advantages, galleryImages, STATS } from '../data/menuData';

const About: React.FC = () => {
  const { ref, isInView } = useInView(0.1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section id="about" className="py-20 bg-gray-900 text-white overflow-hidden">
      <div ref={ref} className="container mx-auto px-4">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="text-orange-500 font-medium tracking-wider uppercase">
            О нас
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-2 mb-4">
            Почему выбирают нас?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {STATS.yearsWorking} лет мы готовим настоящий шашлык на углях. Более {STATS.happyClients.toLocaleString()} довольных гостей уже оценили наше качество!
          </p>
        </div>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {advantages.map((item, index) => (
            <div
              key={index}
              className={`group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 hover:bg-gradient-to-br hover:from-orange-500/10 hover:to-terracotta/10 border border-gray-700 hover:border-orange-500/50 transition-all duration-500 hover:-translate-y-2 ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl mb-4 transform group-hover:scale-125 transition-transform duration-300">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-orange-500 transition-colors">
                {item.title}
              </h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div
            className={`transition-all duration-700 delay-300 ${
              isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            <h3 className="font-display text-3xl font-bold mb-6">
              История нашего кафе 🔥
            </h3>
            <div className="space-y-4 text-gray-300">
              <p>
                <span className="text-orange-500 font-semibold">Соль и Перец</span> — это семейное кафе, 
                которое открыли в 2016 году два друга, влюблённых в настоящий кавказский шашлык.
              </p>
              <p>
                Мы верим, что хороший шашлык — это искусство. Поэтому используем только свежее 
                мясо от проверенных фермеров, маринуем по секретным рецептам и готовим исключительно 
                на берёзовых углях.
              </p>
              <p>
                Сегодня нас выбирают не только жители Сходни, но и гости из Москвы и всего 
                Подмосковья. Присоединяйтесь к нашей дружной семье!
              </p>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 mt-8">
              <div className="bg-green-500/20 border border-green-500/30 px-4 py-2 rounded-full flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span className="text-sm">Сертифицированное мясо</span>
              </div>
              <div className="bg-blue-500/20 border border-blue-500/30 px-4 py-2 rounded-full flex items-center gap-2">
                <span className="text-blue-400">✓</span>
                <span className="text-sm">Безопасная оплата</span>
              </div>
              <div className="bg-orange-500/20 border border-orange-500/30 px-4 py-2 rounded-full flex items-center gap-2">
                <span className="text-orange-400">✓</span>
                <span className="text-sm">Гарантия качества</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div
            className={`grid grid-cols-2 gap-4 transition-all duration-700 delay-400 ${
              isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <div className="bg-gradient-to-br from-orange-500 to-terracotta p-6 rounded-2xl text-center transform hover:scale-105 transition-transform">
              <div className="text-4xl font-bold">{STATS.yearsWorking}+</div>
              <div className="text-white/80 text-sm">лет работы</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-2xl text-center transform hover:scale-105 transition-transform">
              <div className="text-4xl font-bold text-orange-500">{STATS.happyClients.toLocaleString()}+</div>
              <div className="text-gray-400 text-sm">довольных гостей</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-2xl text-center transform hover:scale-105 transition-transform">
              <div className="text-4xl font-bold text-orange-500">★ {STATS.avgRating}</div>
              <div className="text-gray-400 text-sm">рейтинг на Яндекс</div>
            </div>
            <div className="bg-gradient-to-br from-terracotta to-orange-600 p-6 rounded-2xl text-center transform hover:scale-105 transition-transform">
              <div className="text-4xl font-bold">{STATS.ordersToday}</div>
              <div className="text-white/80 text-sm">заказов сегодня</div>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div
          className={`transition-all duration-700 delay-500 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h3 className="font-display text-2xl font-bold mb-6 text-center">
            Фотогалерея 📸
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((img, index) => (
              <div
                key={index}
                className="relative group cursor-pointer overflow-hidden rounded-xl aspect-video"
                onClick={() => setSelectedImage(img.url)}
              >
                <img
                  src={img.url}
                  alt={img.caption}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-medium">{img.caption}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl hover:text-orange-500 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
          <img
            src={selectedImage.replace('w=600&h=400', 'w=1200&h=800')}
            alt="Фото"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </section>
  );
};

export default About;
