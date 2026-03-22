import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { items, removeItem, updateQty, clearCart, total, isOpen, setIsOpen } = useCart();
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [form, setForm] = useState({ name: '', phone: '', address: '', comment: '', payment: 'cash', delivery_type: 'delivery' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hasBarItems = items.some(i => i.type === 'bar');
  const hasFood = items.some(i => i.type !== 'bar');

  const submitOrder = async () => {
    if (!form.name || !form.phone) { setError('Заполните имя и телефон'); return; }
    if (form.delivery_type === 'delivery' && !form.address) { setError('Укажите адрес доставки'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          customer_phone: form.phone,
          delivery_address: form.delivery_type === 'delivery' ? form.address : null,
          comment: form.comment,
          items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
          total_price: total,
          payment_method: form.payment,
          delivery_type: form.delivery_type
        })
      });
      if (!res.ok) throw new Error('Ошибка отправки');
      clearCart();
      setStep('success');
    } catch (e: any) {
      setError(e.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => { setStep('cart'); setForm({ name: '', phone: '', address: '', comment: '', payment: 'cash', delivery_type: 'delivery' }); }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={handleClose} />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-zinc-900 z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingBag className="text-orange-400" size={22} />
                {step === 'cart' ? 'Корзина' : step === 'checkout' ? 'Оформление' : 'Готово!'}
              </h2>
              <button onClick={handleClose} className="text-white/60 hover:text-white transition-colors"><X size={22} /></button>
            </div>

            {step === 'cart' && (
              <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-white/40">
                    <ShoppingBag size={64} />
                    <p className="text-lg">Корзина пуста</p>
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {hasBarItems && hasFood && (
                      <div className="bg-amber-900/30 border border-amber-600/30 rounded-lg p-3 text-amber-300 text-sm">
                        ⚠️ Алкогольные напитки не доставляются. Их нужно заказать в заведении.
                      </div>
                    )}
                    {items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                        {item.image_url && <img src={item.image_url} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{item.name}</p>
                          {item.type === 'bar' && <p className="text-amber-400 text-xs">Только в зале</p>}
                          <p className="text-orange-400 font-bold">{item.price}₽</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-orange-600 transition-colors flex items-center justify-center">
                            <Minus size={12} className="text-white" />
                          </button>
                          <span className="text-white w-5 text-center text-sm">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-orange-600 transition-colors flex items-center justify-center">
                            <Plus size={12} className="text-white" />
                          </button>
                          <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-red-600 transition-colors flex items-center justify-center ml-1">
                            <Trash2 size={12} className="text-white" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 'checkout' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-3">
                  <label className="block">
                    <span className="text-white/70 text-sm">Имя *</span>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                      placeholder="Ваше имя" />
                  </label>
                  <label className="block">
                    <span className="text-white/70 text-sm">Телефон *</span>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                      placeholder="+7 (___) ___-__-__" type="tel" />
                  </label>
                  <div className="flex gap-3">
                    <button onClick={() => setForm({ ...form, delivery_type: 'delivery' })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${ form.delivery_type === 'delivery' ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/60' }`}>
                      Доставка (бесплатно)
                    </button>
                    <button onClick={() => setForm({ ...form, delivery_type: 'pickup' })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${ form.delivery_type === 'pickup' ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/60' }`}>
                      Самовывоз
                    </button>
                  </div>
                  {form.delivery_type === 'delivery' && (
                    <label className="block">
                      <span className="text-white/70 text-sm">Адрес доставки *</span>
                      <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                        className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                        placeholder="Улица, дом, квартира (Сходня)" />
                      <p className="text-green-400 text-xs mt-1">🚗 Доставка по Сходне — бесплатно</p>
                    </label>
                  )}
                  <label className="block">
                    <span className="text-white/70 text-sm">Комментарий</span>
                    <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })}
                      className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 resize-none"
                      rows={2} placeholder="Пожелания к заказу..." />
                  </label>
                  <div>
                    <span className="text-white/70 text-sm block mb-2">Способ оплаты</span>
                    <div className="flex gap-3">
                      {['cash', 'card', 'online'].map(p => (
                        <button key={p} onClick={() => setForm({ ...form, payment: p })}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${ form.payment === p ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/60' }`}>
                          {p === 'cash' ? 'Наличные' : p === 'card' ? 'Карта' : 'Онлайн'}
                        </button>
                      ))}
                    </div>
                  </div>
                  {hasBarItems && (
                    <div className="bg-amber-900/30 border border-amber-600/30 rounded-lg p-3 text-amber-300 text-sm">
                      ⚠️ Алкогольные напитки из бара не доставляются по законодательству РФ. Они будут исключены из доставки.
                    </div>
                  )}
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                  className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-5xl">✅</span>
                </motion.div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Заказ принят!</h3>
                  <p className="text-white/60">Мы свяжемся с вами в ближайшее время для подтверждения.</p>
                </div>
                <button onClick={handleClose} className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-medium transition-colors">
                  Закрыть
                </button>
              </div>
            )}

            {step !== 'success' && items.length > 0 && (
              <div className="p-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Итого:</span>
                  <span className="text-2xl font-bold text-orange-400">{total}₽</span>
                </div>
                {step === 'cart' ? (
                  <button onClick={() => setStep('checkout')}
                    className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
                    Оформить заказ
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button onClick={() => setStep('cart')} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
                      Назад
                    </button>
                    <button onClick={submitOrder} disabled={loading}
                      className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
                      {loading ? 'Отправка...' : 'Подтвердить'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
