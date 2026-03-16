import { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { TELEGRAM_CONFIG, CONTACT_INFO, LOYALTY_PROGRAM } from '../data/menuData';
import { CartItem } from '../types';
import { LegalDocType } from './Legal';
import { addOrder, addOrUpdateCustomer } from '../services/crmService';

type Tab = 'cart' | 'loyalty';
type DeliveryType = 'delivery' | 'pickup';
type PaymentMethod = 'cash' | 'card' | 'online';

interface OrderForm {
  name: string;
  phone: string;
  address: string;
  comment: string;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod;
  agreeTerms: boolean;
  agreePersonalData: boolean;
}

interface CartProps {
  onOpenLegal: (type: LegalDocType) => void;
}

const Cart = ({ onOpenLegal }: CartProps) => {
  const { items, updateQuantity, clearCart, total: cartTotal, itemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('cart');
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  const [form, setForm] = useState<OrderForm>({
    name: '',
    phone: '',
    address: '',
    comment: '',
    deliveryType: 'delivery',
    paymentMethod: 'cash',
    agreeTerms: false,
    agreePersonalData: false,
  });

  const [loyaltyPhone, setLoyaltyPhone] = useState('');
  const [loyaltyData, setLoyaltyData] = useState<{
    points: number;
    level: number;
    name: string;
  } | null>(null);

  // Проверка на алкоголь в корзине
  const alcoholItems = useMemo(() => 
    items.filter((item: CartItem) => item.isAlcohol), 
    [items]
  );

  const hasAlcohol = alcoholItems.length > 0;
  
  // Если выбрана доставка и есть алкоголь - показываем предупреждение
  const alcoholDeliveryWarning = form.deliveryType === 'delivery' && hasAlcohol;

  // Сумма без алкоголя (для доставки)
  const nonAlcoholItems = useMemo(() => 
    items.filter((item: CartItem) => !item.isAlcohol),
    [items]
  );

  const nonAlcoholTotal = useMemo(() => 
    nonAlcoholItems.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0),
    [nonAlcoholItems]
  );

  const deliveryFee = form.deliveryType === 'delivery' ? 200 : 0;
  
  // При доставке исключаем алкоголь
  const effectiveTotal = form.deliveryType === 'delivery' 
    ? nonAlcoholTotal + deliveryFee 
    : cartTotal + deliveryFee;

  const canOrder = form.agreeTerms && form.agreePersonalData && form.name && form.phone;
  const canDeliverOrder = form.deliveryType === 'pickup' || nonAlcoholItems.length > 0;

  const sendToTelegram = async (message: string) => {
    if (TELEGRAM_CONFIG.BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
      console.log('Telegram message:', message);
      return true;
    }
    
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CONFIG.CHAT_ID,
          text: message,
          parse_mode: 'HTML',
        }),
      });
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canOrder || !canDeliverOrder) return;
    
    setIsOrdering(true);

    // При доставке исключаем алкоголь
    const orderItems = form.deliveryType === 'delivery' ? nonAlcoholItems : items;
    const orderTotal = form.deliveryType === 'delivery' ? nonAlcoholTotal : cartTotal;

    const orderItemsText = orderItems.map((item: CartItem) => 
      `• ${item.name} x${item.quantity} — ${item.price * item.quantity}₽`
    ).join('\n');

    const message = `
🔔 <b>НОВЫЙ ЗАКАЗ!</b>

👤 <b>Клиент:</b> ${form.name}
📱 <b>Телефон:</b> ${form.phone}
${form.deliveryType === 'delivery' ? `📍 <b>Адрес:</b> ${form.address}` : '🏠 <b>Самовывоз</b>'}

📝 <b>Заказ:</b>
${orderItemsText}

${deliveryFee > 0 ? `🚚 Доставка: ${deliveryFee}₽\n` : ''}
💰 <b>Итого: ${orderTotal + deliveryFee}₽</b>

💳 <b>Оплата:</b> ${form.paymentMethod === 'cash' ? 'Наличные' : form.paymentMethod === 'card' ? 'Картой' : 'Онлайн'}

${form.comment ? `💬 <b>Комментарий:</b> ${form.comment}` : ''}

${alcoholItems.length > 0 && form.deliveryType === 'delivery' 
  ? '⚠️ Алкоголь исключён из заказа (доставка запрещена по ФЗ №171-ФЗ)' 
  : ''}
    `.trim();

    await sendToTelegram(message);

    // Сохраняем заказ в CRM
    const crmOrderItems = form.deliveryType === 'delivery' ? nonAlcoholItems : items;
    const finalTotal = form.deliveryType === 'delivery' ? nonAlcoholTotal + deliveryFee : cartTotal + deliveryFee;
    
    addOrder({
      customer: {
        name: form.name,
        phone: form.phone,
        address: form.deliveryType === 'delivery' ? form.address : undefined,
      },
      items: crmOrderItems.map((item: CartItem) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      deliveryType: form.deliveryType,
      paymentMethod: form.paymentMethod,
      total: finalTotal,
      notes: form.comment,
    });

    // Обновляем данные клиента
    addOrUpdateCustomer(
      form.phone,
      form.name,
      finalTotal,
      form.deliveryType === 'delivery' ? form.address : undefined
    );

    setIsOrdering(false);
    setOrderSuccess(true);
    clearCart();

    setTimeout(() => {
      setOrderSuccess(false);
      setIsOpen(false);
    }, 3000);
  };

  const checkLoyalty = () => {
    const savedData = localStorage.getItem(`loyalty_${loyaltyPhone}`);
    if (savedData) {
      setLoyaltyData(JSON.parse(savedData));
    } else {
      const newData = { points: 0, level: 0, name: '' };
      localStorage.setItem(`loyalty_${loyaltyPhone}`, JSON.stringify(newData));
      setLoyaltyData(newData);
    }
  };

  const currentLevel = loyaltyData ? LOYALTY_PROGRAM.levels[loyaltyData.level] : null;
  const nextLevel = loyaltyData && loyaltyData.level < LOYALTY_PROGRAM.levels.length - 1 
    ? LOYALTY_PROGRAM.levels[loyaltyData.level + 1] 
    : null;

  return (
    <>
      {/* Кнопка корзины */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition-all flex items-center justify-center"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      {/* Модальное окно */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-md bg-white h-full overflow-hidden flex flex-col">
            {/* Заголовок с табами */}
            <div className="bg-gray-900 text-white p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">
                  {activeTab === 'cart' && '🛒 Корзина'}
                  {activeTab === 'loyalty' && '🎁 Бонусы'}
                </h2>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Табы */}
              <div className="flex gap-1 bg-white/10 rounded-lg p-1">
                {(['cart', 'loyalty'] as Tab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-sm rounded-md transition-colors ${
                      activeTab === tab ? 'bg-orange-500 text-white' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {tab === 'cart' && `Корзина${itemCount ? ` (${itemCount})` : ''}`}
                    {tab === 'loyalty' && 'Бонусы'}
                  </button>
                ))}
              </div>
            </div>

            {/* Контент */}
            <div className="flex-1 overflow-y-auto">
              
              {/* Таб: Корзина */}
              {activeTab === 'cart' && (
                <div className="p-4">
                  {orderSuccess ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">✅</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Заказ принят!</h3>
                      <p className="text-gray-600">Мы скоро свяжемся с вами</p>
                    </div>
                  ) : items.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-5xl mb-4">🛒</div>
                      <p>Корзина пуста</p>
                    </div>
                  ) : (
                    <>
                      {/* Предупреждение об алкоголе */}
                      {alcoholDeliveryWarning && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-700 text-sm font-medium flex items-start gap-2">
                            <span>⚠️</span>
                            <span>
                              Доставка алкоголя запрещена по закону РФ (ФЗ №171-ФЗ). 
                              Алкогольные напитки ({alcoholItems.length} шт.) будут исключены из заказа. 
                              Вы можете забрать их самовывозом.
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Товары */}
                      <div className="space-y-3 mb-6">
                        {items.map((item: CartItem) => (
                          <div 
                            key={item.id} 
                            className={`flex items-center gap-3 p-3 rounded-lg ${
                              item.isAlcohol && form.deliveryType === 'delivery'
                                ? 'bg-red-50 border border-red-200 opacity-60'
                                : 'bg-gray-50'
                            }`}
                          >
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">
                                {item.name}
                                {item.isAlcohol && <span className="text-red-500 text-xs ml-1">18+</span>}
                              </h4>
                              <p className="text-orange-500 font-bold">{item.price}₽</p>
                              {item.isAlcohol && form.deliveryType === 'delivery' && (
                                <p className="text-red-500 text-xs">Недоступно для доставки</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                              >
                                −
                              </button>
                              <span className="w-6 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Форма заказа */}
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, deliveryType: 'delivery' }))}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                              form.deliveryType === 'delivery'
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            🚚 Доставка
                          </button>
                          <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, deliveryType: 'pickup' }))}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                              form.deliveryType === 'pickup'
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            🏠 Самовывоз
                          </button>
                        </div>

                        <input
                          type="text"
                          placeholder="Ваше имя *"
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          required
                        />

                        <input
                          type="tel"
                          placeholder="Телефон *"
                          value={form.phone}
                          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          required
                        />

                        {form.deliveryType === 'delivery' && (
                          <input
                            type="text"
                            placeholder="Адрес доставки *"
                            value={form.address}
                            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            required
                          />
                        )}

                        {form.deliveryType === 'pickup' && (
                          <div className="p-3 bg-gray-50 rounded-lg text-sm">
                            <p className="font-medium text-gray-900">📍 Адрес самовывоза:</p>
                            <p className="text-gray-600">{CONTACT_INFO.address}</p>
                          </div>
                        )}

                        <textarea
                          placeholder="Комментарий к заказу"
                          value={form.comment}
                          onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                          rows={2}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        />

                        {/* Способ оплаты */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Способ оплаты:</p>
                          <div className="grid grid-cols-3 gap-2">
                            {([
                              { id: 'cash', label: '💵 Наличные' },
                              { id: 'card', label: '💳 Картой' },
                              { id: 'online', label: '🌐 Онлайн' },
                            ] as const).map(method => (
                              <button
                                key={method.id}
                                type="button"
                                onClick={() => setForm(f => ({ ...f, paymentMethod: method.id }))}
                                className={`py-2 px-3 text-xs rounded-lg transition-colors ${
                                  form.paymentMethod === method.id
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {method.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Согласия */}
                        <div className="space-y-3 text-sm">
                          <label className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={form.agreeTerms}
                              onChange={e => setForm(f => ({ ...f, agreeTerms: e.target.checked }))}
                              className="mt-1 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-gray-600">
                              Согласен с{' '}
                              <button 
                                type="button"
                                onClick={() => onOpenLegal('offer')}
                                className="text-orange-500 underline"
                              >
                                публичной офертой
                              </button>
                              {' '}и{' '}
                              <button 
                                type="button"
                                onClick={() => onOpenLegal('terms')}
                                className="text-orange-500 underline"
                              >
                                пользовательским соглашением
                              </button>
                            </span>
                          </label>

                          <label className="flex items-start gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={form.agreePersonalData}
                              onChange={e => setForm(f => ({ ...f, agreePersonalData: e.target.checked }))}
                              className="mt-1 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-gray-600">
                              Согласен на{' '}
                              <button 
                                type="button"
                                onClick={() => onOpenLegal('privacy')}
                                className="text-orange-500 underline"
                              >
                                обработку персональных данных
                              </button>
                            </span>
                          </label>
                        </div>

                        {/* Итого */}
                        <div className="border-t border-gray-200 pt-4 space-y-2">
                          {form.deliveryType === 'delivery' && (
                            <>
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Товары:</span>
                                <span>{nonAlcoholTotal}₽</span>
                              </div>
                              <div className="flex justify-between text-sm text-gray-600">
                                <span>Доставка:</span>
                                <span>{deliveryFee}₽</span>
                              </div>
                              {hasAlcohol && (
                                <div className="flex justify-between text-sm text-red-500">
                                  <span>Алкоголь (исключён):</span>
                                  <span>−{cartTotal - nonAlcoholTotal}₽</span>
                                </div>
                              )}
                            </>
                          )}
                          <div className="flex justify-between text-lg font-bold">
                            <span>Итого:</span>
                            <span className="text-orange-500">{effectiveTotal}₽</span>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={!canOrder || !canDeliverOrder || isOrdering}
                          className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {isOrdering ? 'Оформляем...' : 'Оформить заказ'}
                        </button>

                        {!canDeliverOrder && (
                          <p className="text-center text-sm text-red-500">
                            В корзине только алкоголь. Выберите самовывоз или добавьте другие товары.
                          </p>
                        )}
                      </form>
                    </>
                  )}
                </div>
              )}

              {/* Таб: Программа лояльности */}
              {activeTab === 'loyalty' && (
                <div className="p-4">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">🎁 Программа лояльности</h3>
                    <p className="text-gray-600 text-sm">Копите баллы и получайте подарки!</p>
                  </div>

                  {!loyaltyData ? (
                    <div className="space-y-4">
                      <input
                        type="tel"
                        placeholder="Введите номер телефона"
                        value={loyaltyPhone}
                        onChange={e => setLoyaltyPhone(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        onClick={checkLoyalty}
                        disabled={!loyaltyPhone}
                        className="w-full py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:bg-gray-300"
                      >
                        Войти / Зарегистрироваться
                      </button>

                      {/* Уровни */}
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-900 mb-3">Уровни программы:</h4>
                        <div className="space-y-2">
                          {LOYALTY_PROGRAM.levels.map((level, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{level.icon}</span>
                                <span className="font-medium">{level.name}</span>
                              </div>
                              <div className="text-right text-sm">
                                <p className="text-orange-500 font-medium">{level.cashbackPercent}% кэшбэк</p>
                                <p className="text-gray-500">от {level.minPoints} баллов</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Текущий уровень */}
                      <div className="bg-gradient-to-br from-orange-500 to-terracotta p-6 rounded-2xl text-white text-center">
                        <div className="text-4xl mb-2">{currentLevel?.icon}</div>
                        <h4 className="text-xl font-bold">{currentLevel?.name}</h4>
                        <p className="text-white/80">Кэшбэк {currentLevel?.cashbackPercent}%</p>
                        <p className="text-3xl font-bold mt-4">{loyaltyData.points}</p>
                        <p className="text-white/80">баллов</p>
                      </div>

                      {/* Прогресс */}
                      {nextLevel && (
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">До уровня {nextLevel.name}</span>
                            <span className="text-orange-500 font-medium">
                              {nextLevel.minPoints - loyaltyData.points} баллов
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-orange-500 rounded-full"
                              style={{ 
                                width: `${(loyaltyData.points / nextLevel.minPoints) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Бонусы */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Доступные бонусы:</h4>
                        <div className="space-y-2">
                          {LOYALTY_PROGRAM.bonuses.map(bonus => (
                            <div 
                              key={bonus.id} 
                              className={`p-3 rounded-lg border ${
                                loyaltyData.points >= bonus.pointsCost
                                  ? 'border-orange-200 bg-orange-50'
                                  : 'border-gray-200 bg-gray-50 opacity-60'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-900">{bonus.title}</p>
                                  <p className="text-sm text-gray-500">{bonus.description}</p>
                                </div>
                                <span className={`text-sm font-bold ${
                                  loyaltyData.points >= bonus.pointsCost
                                    ? 'text-orange-500'
                                    : 'text-gray-400'
                                }`}>
                                  {bonus.pointsCost} б.
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => setLoyaltyData(null)}
                        className="w-full py-2 text-gray-500 text-sm hover:text-gray-700"
                      >
                        Выйти из программы
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Cart;
