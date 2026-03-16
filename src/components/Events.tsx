import React, { useState } from 'react';
import { useInView } from '../hooks/useInView';
import { TELEGRAM_CONFIG } from '../data/menuData';
import { Booking } from '../types';

const eventTypes = [
  { id: 'birthday', name: 'День рождения', emoji: '🎂', description: 'Отметим ваш праздник!' },
  { id: 'corporate', name: 'Корпоратив', emoji: '🎉', description: 'Тимбилдинг и вечеринки' },
  { id: 'wedding', name: 'Свадьба', emoji: '💒', description: 'Незабываемое торжество' },
  { id: 'other', name: 'Другое', emoji: '🎊', description: 'Любой повод!' },
] as const;

const Events: React.FC = () => {
  const { ref, isInView } = useInView(0.1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string>('birthday');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<Booking>({
    name: '',
    phone: '',
    date: '',
    time: '',
    guests: 10,
    comment: '',
    eventType: 'birthday',
  });

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const eventName = eventTypes.find((t) => t.id === formData.eventType)?.name || 'Мероприятие';

    const message = `
🎉 *ЗАЯВКА НА БАНКЕТ*

📋 *Тип мероприятия:* ${eventName}
📅 *Дата:* ${formData.date}
🕐 *Время:* ${formData.time}
👥 *Количество гостей:* ${formData.guests}

👤 *Контактное лицо:* ${formData.name}
📞 *Телефон:* ${formData.phone}
${formData.comment ? `💬 *Пожелания:* ${formData.comment}` : ''}

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
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsSuccess(false);
    setFormData({
      name: '',
      phone: '',
      date: '',
      time: '',
      guests: 10,
      comment: '',
      eventType: 'birthday',
    });
  };

  return (
    <section id="events" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div ref={ref} className="container mx-auto px-4">
        {/* Section Header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="text-orange-500 font-medium tracking-wider uppercase">
            Банкеты и события
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-4">
            Отмечайте с нами! 🎉
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Организуем незабываемые праздники на 10-80 человек. Отдельный банкетный зал, 
            индивидуальное меню и внимание к каждой детали.
          </p>
        </div>

        {/* Event Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {eventTypes.map((event, index) => (
            <div
              key={event.id}
              onClick={() => {
                setSelectedEvent(event.id);
                setFormData({ ...formData, eventType: event.id });
                setIsModalOpen(true);
              }}
              className={`group cursor-pointer bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-orange-500 transition-all duration-300 transform hover:-translate-y-2 ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="text-5xl mb-4 transform group-hover:scale-125 transition-transform duration-300">
                {event.emoji}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-500 transition-colors">
                {event.name}
              </h3>
              <p className="text-gray-500 text-sm mb-4">{event.description}</p>
              <span className="text-orange-500 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Забронировать
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          ))}
        </div>

        {/* Features */}
        <div
          className={`bg-gradient-to-r from-orange-500 to-terracotta rounded-3xl p-8 md:p-12 text-white transition-all duration-700 delay-300 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center md:text-left">
              <div className="text-4xl mb-3">🎪</div>
              <h4 className="text-xl font-bold mb-2">Отдельный зал</h4>
              <p className="text-white/80">
                Уютный банкетный зал на 80 человек с собственной звуковой системой
              </p>
            </div>
            <div className="text-center md:text-left">
              <div className="text-4xl mb-3">👨‍🍳</div>
              <h4 className="text-xl font-bold mb-2">Своё меню</h4>
              <p className="text-white/80">
                Составим индивидуальное меню под ваш бюджет и предпочтения
              </p>
            </div>
            <div className="text-center md:text-left">
              <div className="text-4xl mb-3">🎁</div>
              <h4 className="text-xl font-bold mb-2">Бонусы</h4>
              <p className="text-white/80">
                При заказе от 50 000₽ — торт в подарок и скидка 10% на бар
              </p>
            </div>
          </div>

          <div className="text-center mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-orange-600 font-bold rounded-full hover:bg-gray-100 hover:scale-105 transition-all shadow-lg"
            >
              📞 Быстрая заявка
            </button>
            <a
              href="#banquet-calculator"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-black/20 text-white font-bold rounded-full hover:bg-black/30 hover:scale-105 transition-all border-2 border-white/30"
            >
              🧮 Рассчитать стоимость
            </a>
          </div>
        </div>

        {/* Pricing Hint */}
        <div
          className={`mt-12 text-center transition-all duration-700 delay-400 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-gray-500 mb-4">Примерная стоимость банкета:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white px-6 py-3 rounded-full shadow">
              <span className="text-gray-600">10 человек:</span>
              <span className="font-bold text-orange-500 ml-2">от 15 000₽</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-full shadow">
              <span className="text-gray-600">30 человек:</span>
              <span className="font-bold text-orange-500 ml-2">от 40 000₽</span>
            </div>
            <div className="bg-white px-6 py-3 rounded-full shadow">
              <span className="text-gray-600">50+ человек:</span>
              <span className="font-bold text-orange-500 ml-2">от 60 000₽</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slideIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="font-display text-xl font-bold text-gray-900">
                {isSuccess ? '✅ Заявка отправлена!' : `🎉 Бронирование: ${eventTypes.find((t) => t.id === selectedEvent)?.name}`}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {isSuccess ? (
                <div className="text-center py-8">
                  <span className="text-6xl block mb-4">🎊</span>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Спасибо за заявку!</h4>
                  <p className="text-gray-600 mb-6">
                    Наш менеджер свяжется с вами в течение 30 минут для обсуждения деталей.
                  </p>
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-terracotta text-white font-semibold rounded-full"
                  >
                    Отлично!
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-4">
                  {/* Event Type Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Тип мероприятия</label>
                    <div className="grid grid-cols-2 gap-2">
                      {eventTypes.map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => {
                            setSelectedEvent(event.id);
                            setFormData({ ...formData, eventType: event.id });
                          }}
                          className={`p-3 rounded-xl border-2 transition-all text-left ${
                            selectedEvent === event.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-xl">{event.emoji}</span>
                          <span className="block text-sm font-medium mt-1">{event.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Дата *</label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Время *</label>
                      <input
                        type="time"
                        required
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Количество гостей: <span className="text-orange-500 font-bold">{formData.guests}</span>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="80"
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                      className="w-full accent-orange-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>5 чел.</span>
                      <span>80 чел.</span>
                    </div>
                  </div>

                  {/* Contact */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ваше имя *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                      placeholder="Как к вам обращаться?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Телефон *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                      placeholder="+7 (___) ___-__-__"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Пожелания</label>
                    <textarea
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 resize-none"
                      rows={2}
                      placeholder="Особые пожелания к меню, оформлению..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-terracotta text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Отправка...' : '🎉 Отправить заявку'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Events;
