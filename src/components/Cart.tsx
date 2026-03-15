import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { TELEGRAM_CONFIG } from '../data/menuData';

const Cart: React.FC = () => {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    total,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveryPrice = deliveryType === 'delivery' ? 200 : 0;
  const finalTotal = total + deliveryPrice;

  const sendToTelegram = async () => {
    const orderItems = items
      .map((item) => `• ${item.name} x${item.quantity} — ${item.price * item.quantity}₽`)
      .join('\n');

    const message = `
🔥 *НОВЫЙ ЗАКАЗ* 🔥

📋 *Состав заказа:*
${orderItems}

💰 *Сумма заказа:* ${total}₽
🚚 *Доставка:* ${deliveryType === 'delivery' ? `${deliveryPrice}₽` : 'Самовывоз'}
💵 *ИТОГО:* ${finalTotal}₽

👤 *Клиент:* ${formData.name}
📞 *Телефон:* ${formData.phone}
${deliveryType === 'delivery' ? `📍 *Адрес:* ${formData.address}` : '🏪 *Самовывоз из кафе*'}
${formData.comment ? `💬 *Комментарий:* ${formData.comment}` : ''}

⏰ ${new Date().toLocaleString('ru-RU')}
    `.trim();

    // Отправка в Telegram
    // ВАЖНО: Замените BOT_TOKEN и CHAT_ID в файле data/menuData.ts
    const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CONFIG.CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      });

      if (!response.ok) {
        console.error('Telegram API error:', await response.text());
        // Даже если Telegram не работает, показываем успех пользователю
        // В реальном проекте добавьте fallback (email, SMS и т.д.)
      }
    } catch (error) {
      console.error('Failed to send to Telegram:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await sendToTelegram();

    setIsSubmitting(false);
    setStep('success');
    clearCart();
  };

  const handleClose = () => {
    setIsCartOpen(false);
    if (step === 'success') {
      setStep('cart');
      setFormData({ name: '', phone: '', address: '', comment: '' });
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
      <div
        className="absolute inset-0"
        onClick={handleClose}
      />
      <div className="relative bg-white w-full max-w-md h-full shadow-2xl animate-slideIn flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-display text-xl font-bold text-gray-900">
            {step === 'cart' && '🛒 Корзина'}
            {step === 'checkout' && '📝 Оформление'}
            {step === 'success' && '✅ Готово'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-6xl mb-4 block">🍽️</span>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Корзина пуста
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Добавьте вкусные блюда из нашего меню
                  </p>
                  <button
                    onClick={handleClose}
                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-colors"
                  >
                    Перейти к меню
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 bg-gray-50 rounded-xl p-3"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-orange-500 font-medium">
                          {item.price} ₽
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-gray-100 transition-colors"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-gray-100 transition-colors"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-auto p-2 text-gray-400 hover:text-red-500 transition-colors"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <form onSubmit={handleSubmit} className="space-y-4" id="checkout-form">
              {/* Delivery Type */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    deliveryType === 'delivery'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl mb-1 block">🚚</span>
                  <span className="font-medium">Доставка</span>
                  <span className="text-sm text-gray-500 block">+200 ₽</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    deliveryType === 'pickup'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl mb-1 block">🏪</span>
                  <span className="font-medium">Самовывоз</span>
                  <span className="text-sm text-gray-500 block">Бесплатно</span>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ваше имя *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Как к вам обращаться?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Телефон *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="+7 (999) 123-45-67"
                />
              </div>

              {deliveryType === 'delivery' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Адрес доставки *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Улица, дом, квартира"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Комментарий к заказу
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, comment: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="Дополнительные пожелания..."
                />
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Сумма заказа:</span>
                  <span>{total} ₽</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Доставка:</span>
                  <span>{deliveryType === 'delivery' ? `${deliveryPrice} ₽` : 'Бесплатно'}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Итого:</span>
                  <span className="text-orange-500">{finalTotal} ₽</span>
                </div>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block animate-bounce">🎉</span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Заказ оформлен!
              </h3>
              <p className="text-gray-600 mb-6">
                Мы скоро свяжемся с вами для подтверждения заказа
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-colors"
              >
                Отлично!
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'cart' && items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Итого:</span>
              <span className="text-2xl font-bold text-orange-500">
                {total} ₽
              </span>
            </div>
            <button
              onClick={() => setStep('checkout')}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
            >
              Оформить заказ
            </button>
          </div>
        )}

        {step === 'checkout' && (
          <div className="border-t p-4 space-y-3">
            <button
              type="button"
              onClick={() => setStep('cart')}
              className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              ← Назад к корзине
            </button>
            <button
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors"
            >
              {isSubmitting ? 'Отправка...' : `Заказать за ${finalTotal} ₽`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
