import React, { useState, useMemo } from 'react';
import { BANQUET_PACKAGES, BANQUET_EXTRAS, TELEGRAM_CONFIG, CONTACT_INFO } from '../data/menuData';
import { BanquetExtra } from '../types';

const BanquetCalculator: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState(BANQUET_PACKAGES[1]); // Standard по умолчанию
  const [guests, setGuests] = useState(selectedPackage.minGuests);
  const [duration, setDuration] = useState(4); // часов
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    eventType: 'birthday',
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Расчёт стоимости
  const calculation = useMemo(() => {
    const basePrice = selectedPackage.pricePerPerson * guests;
    
    let extrasPrice = 0;
    BANQUET_EXTRAS.forEach((extra) => {
      if (selectedExtras.includes(extra.id)) {
        switch (extra.priceType) {
          case 'fixed':
            extrasPrice += extra.price;
            break;
          case 'perPerson':
            extrasPrice += extra.price * guests;
            break;
          case 'perHour':
            extrasPrice += extra.price * duration;
            break;
        }
      }
    });

    const subtotal = basePrice + extrasPrice;
    const discount = guests >= 30 ? 0.1 : guests >= 20 ? 0.05 : 0;
    const discountAmount = subtotal * discount;
    const total = subtotal - discountAmount;

    return {
      basePrice,
      extrasPrice,
      subtotal,
      discount,
      discountAmount,
      total,
    };
  }, [selectedPackage, guests, duration, selectedExtras]);

  const toggleExtra = (extraId: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extraId)
        ? prev.filter((id) => id !== extraId)
        : [...prev, extraId]
    );
  };

  const getExtraPrice = (extra: BanquetExtra): string => {
    switch (extra.priceType) {
      case 'fixed':
        return `${extra.price.toLocaleString()}₽`;
      case 'perPerson':
        return `${extra.price}₽/чел`;
      case 'perHour':
        return `${extra.price.toLocaleString()}₽/час`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const selectedExtrasNames = BANQUET_EXTRAS
      .filter((e) => selectedExtras.includes(e.id))
      .map((e) => e.name)
      .join(', ');

    const eventTypes: Record<string, string> = {
      birthday: 'День рождения',
      corporate: 'Корпоратив',
      wedding: 'Свадьба',
      other: 'Другое',
    };

    const message = `
🎉 *ЗАЯВКА НА БАНКЕТ*

👤 *Имя:* ${formData.name}
📞 *Телефон:* ${formData.phone}
📅 *Дата:* ${formData.date}
🎊 *Тип события:* ${eventTypes[formData.eventType]}

📦 *Пакет:* ${selectedPackage.name}
👥 *Гостей:* ${guests} чел.
⏱️ *Длительность:* ${duration} ч.

${selectedExtrasNames ? `✨ *Доп. услуги:* ${selectedExtrasNames}` : ''}

💰 *Расчёт:*
• Базовая стоимость: ${calculation.basePrice.toLocaleString()}₽
• Доп. услуги: ${calculation.extrasPrice.toLocaleString()}₽
${calculation.discount > 0 ? `• Скидка ${calculation.discount * 100}%: -${calculation.discountAmount.toLocaleString()}₽` : ''}
*ИТОГО: ${calculation.total.toLocaleString()}₽*

${formData.comment ? `💬 *Комментарий:* ${formData.comment}` : ''}
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
      console.log('Telegram notification skipped');
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <section id="banquet-calculator" className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-4">Заявка отправлена!</h2>
            <p className="text-gray-400 mb-8">
              Мы свяжемся с вами в ближайшее время для подтверждения бронирования.
            </p>
            <div className="bg-white/10 rounded-2xl p-6 mb-8">
              <p className="text-2xl font-bold text-orange-400 mb-2">
                Итого: {calculation.total.toLocaleString()}₽
              </p>
              <p className="text-gray-400">
                {selectedPackage.name} • {guests} гостей • {duration} часов
              </p>
            </div>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setShowForm(false);
                setFormData({ name: '', phone: '', date: '', eventType: 'birthday', comment: '' });
              }}
              className="px-6 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-colors"
            >
              Создать новый расчёт
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="banquet-calculator" className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-orange-400 text-sm font-semibold tracking-wider uppercase">
            Рассчитайте стоимость
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-4">
            Калькулятор банкета
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Выберите пакет, укажите количество гостей и дополнительные услуги —
            мы рассчитаем стоимость вашего праздника
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Packages */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4">1. Выберите пакет</h3>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {BANQUET_PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => {
                    setSelectedPackage(pkg);
                    if (guests < pkg.minGuests) setGuests(pkg.minGuests);
                  }}
                  className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                    selectedPackage.id === pkg.id
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                  }`}
                >
                  {pkg.isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs px-3 py-1 rounded-full">
                      Популярный
                    </span>
                  )}
                  <img
                    src={pkg.image}
                    alt={pkg.name}
                    className="w-full h-24 object-cover rounded-lg mb-3"
                  />
                  <h4 className="text-white font-bold">{pkg.name}</h4>
                  <p className="text-gray-400 text-sm mb-2">{pkg.description}</p>
                  <p className="text-orange-400 font-bold">
                    {pkg.pricePerPerson.toLocaleString()}₽<span className="text-gray-500 text-sm">/чел</span>
                  </p>
                  <p className="text-gray-500 text-xs">от {pkg.minGuests} гостей</p>
                </button>
              ))}
            </div>

            {/* Package details */}
            <div className="bg-white/5 rounded-2xl p-6 mb-8">
              <h4 className="text-white font-bold mb-3">В пакет «{selectedPackage.name}» входит:</h4>
              <ul className="grid md:grid-cols-2 gap-2">
                {selectedPackage.includes.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                    <span className="text-green-400 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Guests & Duration */}
            <h3 className="text-xl font-bold text-white mb-4">2. Гости и время</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Количество гостей</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setGuests(Math.max(selectedPackage.minGuests, guests - 5))}
                    className="w-12 h-12 bg-white/10 rounded-full text-white text-2xl hover:bg-white/20 transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={guests}
                    onChange={(e) => setGuests(Math.max(selectedPackage.minGuests, parseInt(e.target.value) || 0))}
                    className="w-24 text-center text-2xl font-bold text-white bg-transparent border-b-2 border-orange-500 focus:outline-none"
                  />
                  <button
                    onClick={() => setGuests(Math.min(80, guests + 5))}
                    className="w-12 h-12 bg-white/10 rounded-full text-white text-2xl hover:bg-white/20 transition-colors"
                  >
                    +
                  </button>
                </div>
                {guests >= 30 && (
                  <p className="text-green-400 text-sm mt-2">🎁 Скидка 10% от 30 гостей!</p>
                )}
                {guests >= 20 && guests < 30 && (
                  <p className="text-green-400 text-sm mt-2">🎁 Скидка 5% от 20 гостей!</p>
                )}
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Длительность (часов)</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setDuration(Math.max(2, duration - 1))}
                    className="w-12 h-12 bg-white/10 rounded-full text-white text-2xl hover:bg-white/20 transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Math.max(2, parseInt(e.target.value) || 2))}
                    className="w-24 text-center text-2xl font-bold text-white bg-transparent border-b-2 border-orange-500 focus:outline-none"
                  />
                  <button
                    onClick={() => setDuration(Math.min(12, duration + 1))}
                    className="w-12 h-12 bg-white/10 rounded-full text-white text-2xl hover:bg-white/20 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Extras */}
            <h3 className="text-xl font-bold text-white mb-4">3. Дополнительные услуги</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {BANQUET_EXTRAS.map((extra) => (
                <button
                  key={extra.id}
                  onClick={() => toggleExtra(extra.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    selectedExtras.includes(extra.id)
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                  }`}
                >
                  <span className="text-white">{extra.name}</span>
                  <span className={`text-sm ${selectedExtras.includes(extra.id) ? 'text-orange-400' : 'text-gray-400'}`}>
                    {getExtraPrice(extra)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-gradient-to-br from-orange-600 to-terracotta rounded-3xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6">Ваш расчёт</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-white/80">
                  <span>Пакет «{selectedPackage.name}»</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>{guests} гостей × {selectedPackage.pricePerPerson}₽</span>
                  <span>{calculation.basePrice.toLocaleString()}₽</span>
                </div>
                {calculation.extrasPrice > 0 && (
                  <div className="flex justify-between text-white/80">
                    <span>Доп. услуги</span>
                    <span>{calculation.extrasPrice.toLocaleString()}₽</span>
                  </div>
                )}
                {calculation.discount > 0 && (
                  <div className="flex justify-between text-green-300">
                    <span>Скидка {calculation.discount * 100}%</span>
                    <span>−{calculation.discountAmount.toLocaleString()}₽</span>
                  </div>
                )}
                <div className="border-t border-white/20 pt-4">
                  <div className="flex justify-between text-white font-bold text-2xl">
                    <span>Итого:</span>
                    <span>{calculation.total.toLocaleString()}₽</span>
                  </div>
                  <p className="text-white/60 text-sm mt-1">
                    {Math.round(calculation.total / guests).toLocaleString()}₽ на человека
                  </p>
                </div>
              </div>

              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Забронировать
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Ваше имя"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white"
                  />
                  <input
                    type="tel"
                    placeholder="Телефон"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white"
                  />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white"
                  />
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white"
                  >
                    <option value="birthday" className="text-black">День рождения</option>
                    <option value="corporate" className="text-black">Корпоратив</option>
                    <option value="wedding" className="text-black">Свадьба</option>
                    <option value="other" className="text-black">Другое</option>
                  </select>
                  <textarea
                    placeholder="Комментарий (необязательно)"
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white resize-none"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Отправляем...' : 'Отправить заявку'}
                  </button>
                </form>
              )}

              <p className="text-white/60 text-xs mt-4 text-center">
                Или позвоните: <a href={CONTACT_INFO.phoneLink} className="text-white underline">{CONTACT_INFO.phone}</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BanquetCalculator;
