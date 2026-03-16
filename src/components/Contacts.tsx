import React, { useState } from 'react';
import { CONTACT_INFO, TELEGRAM_CONFIG } from '../data/menuData';
import { useInView } from '../hooks/useInView';

const Contacts: React.FC = () => {
  const { ref, isInView } = useInView(0.1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Отправка в Telegram
    const message = `
📨 *СООБЩЕНИЕ С САЙТА*

👤 *Имя:* ${formData.name}
📞 *Телефон:* ${formData.phone}
💬 *Сообщение:* ${formData.message}

⏰ ${new Date().toLocaleString('ru-RU')}
    `.trim();

    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CONFIG.CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
    } catch (error) {
      console.error('Telegram error:', error);
    }

    setIsSubmitting(false);
    setIsSuccess(true);
    setFormData({ name: '', phone: '', message: '' });
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <section id="contacts" className="py-20 bg-white">
      <div ref={ref} className="container mx-auto px-4">
        {/* Section Header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="text-orange-500 font-medium tracking-wider uppercase">
            Контакты
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-4">
            Ждём вас в гости!
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Мы находимся в 5 минутах ходьбы от МЦД Сходня. Приезжайте — покажем настоящее гостеприимство!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map */}
          <div
            className={`rounded-2xl overflow-hidden shadow-lg transition-all duration-700 delay-100 ${
              isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
            }`}
          >
            {/* Яндекс Карты с карточкой организации */}
            <iframe
              src={`https://yandex.ru/map-widget/v1/?ll=${CONTACT_INFO.coordinates.lng}%2C${CONTACT_INFO.coordinates.lat}&mode=search&ol=geo&ouri=ymapsbm1%3A%2F%2Fgeo%3Fdata%3DCgozNTM4MjA5MDcxEkDQoNC%2B0YHRgdC40Y8sINCc0L7RgdC60L7QstGB0LrQsNGPINC%2B0LHQu9Cw0YHRgtGMLCDQndCw0YDQvi3QpNC%2B0LzQuNC90YHQuiwgMTAiCg30qF5CEeKOMUI&z=16`}
              width="100%"
              height="400"
              frameBorder="0"
              allowFullScreen
              className="w-full"
              title="Карта"
            />
          </div>

          {/* Contact Info & Form */}
          <div
            className={`space-y-6 transition-all duration-700 delay-200 ${
              isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-orange-50 rounded-xl p-5 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-2">📍</div>
                <h4 className="font-semibold text-gray-900 mb-1">Адрес</h4>
                <p className="text-gray-600 text-sm">{CONTACT_INFO.address}</p>
                <p className="text-orange-500 text-sm mt-1">5 минут от МЦД Сходня</p>
              </div>

              <div className="bg-orange-50 rounded-xl p-5 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-2">🕐</div>
                <h4 className="font-semibold text-gray-900 mb-1">Часы работы</h4>
                <p className="text-gray-600 text-sm">Пн-Пт: {CONTACT_INFO.workHours.weekdays}</p>
                <p className="text-gray-600 text-sm">Сб-Вс: {CONTACT_INFO.workHours.weekends}</p>
              </div>

              <a
                href={CONTACT_INFO.phoneLink}
                className="bg-gradient-to-r from-orange-500 to-terracotta rounded-xl p-5 text-white hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <div className="text-3xl mb-2">📞</div>
                <h4 className="font-semibold mb-1">Позвонить</h4>
                <p className="text-xl font-bold">{CONTACT_INFO.phone}</p>
              </a>

              <div className="bg-orange-50 rounded-xl p-5 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-2">🚗</div>
                <h4 className="font-semibold text-gray-900 mb-1">Парковка</h4>
                <p className="text-gray-600 text-sm">Бесплатная на 30 мест</p>
                <p className="text-green-600 text-sm mt-1">Свободно сейчас!</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center justify-center gap-4">
              <a
                href={CONTACT_INFO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href={CONTACT_INFO.vk}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.626 4 8.14c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.847 2.455 2.267 4.607 2.847 4.607.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.27-1.422 2.18-3.61 2.18-3.61.119-.254.322-.491.762-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
                </svg>
              </a>
              <a
                href={CONTACT_INFO.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-sky-500 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-display text-xl font-bold text-gray-900 mb-4">
                Напишите нам
              </h3>
              {isSuccess ? (
                <div className="text-center py-8">
                  <span className="text-5xl mb-4 block">✅</span>
                  <p className="text-green-600 font-semibold">Сообщение отправлено!</p>
                  <p className="text-gray-600 text-sm">Мы скоро свяжемся с вами</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Ваше имя"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <input
                      type="tel"
                      placeholder="Телефон"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <textarea
                    placeholder="Ваше сообщение..."
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-terracotta text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Отправка...' : '📨 Отправить сообщение'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacts;
