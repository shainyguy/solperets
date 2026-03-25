import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Send, CheckCircle } from 'lucide-react';

// ── Пакеты ────────────────────────────────────────────────────────────────────
const PACKAGES = [
  {
    id: 'econom',
    name: 'Эконом',
    price: 3000,
    color: '#6b7280',
    accent: '#9ca3af',
    includes: [
      'Холодные закуски: Чабан салат, Оливье, Мимоза',
      'Горячее на выбор: отбивная (свинина / говядина / курица)',
      'Садж на выбор: цыплёнок / баранина / говядина / свинина',
      'Шашлык на выбор: курица / свинина',
      'Напитки: морс / лимонад / вода газ. или б/г',
      'Хлебная корзинка',
      'Живая музыка и DJ',
    ],
  },
  {
    id: 'standard',
    name: 'Стандарт',
    price: 4000,
    color: '#E8631A',
    accent: '#fb923c',
    popular: true,
    includes: [
      'Всё из пакета Эконом',
      '+ Сельдь под шубой',
      '+ Бакинский букет',
      '+ Гнездо глухаря',
      '+ Сырная тарелка',
      '+ Мясная тарелка',
      '+ Ассорти из солений',
      '+ Жульен',
      'Живая музыка и DJ',
    ],
  },
  {
    id: 'premium',
    name: 'Премиум',
    price: 5000,
    color: '#9333ea',
    accent: '#c084fc',
    includes: [
      'Всё из пакета Стандарт',
      '+ Шах-плов',
      '+ Шашлык из баранины на выбор',
      '+ Натуральный сок',
      'Живая музыка и DJ',
    ],
  },
];

// ── Доп. услуги ───────────────────────────────────────────────────────────────
const EXTRA_SERVICES = [
  { id: 'photo',     name: 'Фотограф',            price: 12000, icon: '📸', desc: '3 часа съёмки, обработка фото' },
  { id: 'video',     name: 'Видеограф',            price: 15000, icon: '🎬', desc: 'Монтаж видео, highlight-ролик' },
  { id: 'decor',     name: 'Декор зала',           price: 8000,  icon: '🌸', desc: 'Цветы, шары, ткани, свечи' },
  { id: 'cake',      name: 'Торт на заказ',        price: 4000,  icon: '🎂', desc: 'Индивидуальный дизайн' },
  { id: 'firework',  name: 'Салют',                price: 18000, icon: '🎆', desc: 'Профессиональный фейерверк' },
  { id: 'mascot',    name: 'Ростовые куклы',       price: 6000,  icon: '🤡', desc: '2 персонажа на 2 часа' },
  { id: 'host',      name: 'Ведущий',              price: 10000, icon: '🎙️', desc: 'Тамада, конкурсы, сценарий' },
  { id: 'kids',      name: 'Детская анимация',     price: 7000,  icon: '🎠', desc: 'Аниматор + игры для детей' },
  { id: 'vending',   name: 'Вендинговый аппарат',  price: 5000,  icon: '🍬', desc: 'Снеки и напитки на мероприятии' },
  { id: 'hookah',    name: 'Кальян-мастер',        price: 4000,  icon: '💨', desc: 'Кальянщик на весь вечер' },
  { id: 'balloons',  name: 'Шары с гелием',        price: 3000,  icon: '🎈', desc: '50 шаров с оформлением' },
  { id: 'transport', name: 'Трансфер гостей',      price: 8000,  icon: '🚐', desc: 'Микроавтобус до 15 чел.' },
];

export default function EventsPage() {
  const [guests, setGuests] = useState(30);
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [extras, setExtras] = useState<string[]>([]);
  const [step, setStep] = useState<'calc' | 'form' | 'success'>('calc');
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', time: '18:00', comment: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pkg = PACKAGES.find(p => p.id === selectedPkg);
  const extrasTotal = EXTRA_SERVICES.filter(s => extras.includes(s.id)).reduce((s, e) => s + e.price, 0);
  const pkgTotal = pkg ? pkg.price * guests : 0;
  const total = pkgTotal + extrasTotal;

  const toggleExtra = (id: string) =>
    setExtras(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date) { setError('Заполните обязательные поля'); return; }
    setLoading(true); setError('');
    try {
      const extraNames = EXTRA_SERVICES.filter(s => extras.includes(s.id)).map(s => s.name);
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          customer_phone: form.phone,
          customer_email: form.email,
          event_type: pkg ? `Пакет «${pkg.name}»` : 'Без пакета',
          event_date: form.date,
          event_time: form.time,
          guests_count: guests,
          extra_services: extraNames,
          total_estimate: total,
          comment: form.comment
        })
      });
      if (!res.ok) throw new Error('Ошибка отправки');
      setStep('success');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const TIMES = ['12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-20">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/banquet.jpg" alt="" className="w-full h-full object-cover opacity-15"/>
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 to-zinc-950"/>
        </div>
        <div className="relative text-center py-16 px-4">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-orange-400 text-xs font-semibold tracking-[0.3em] uppercase mb-3">Банкеты и мероприятия</p>
            <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              Ваш праздник
            </h1>
            <p className="text-white/40 text-base max-w-md mx-auto">
              Выберите пакет, добавьте услуги и отправьте заявку — мы всё организуем
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-24">
        <AnimatePresence mode="wait">

          {/* ── CALCULATOR ── */}
          {step === 'calc' && (
            <motion.div key="calc" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

              {/* Guests slider */}
              <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Количество гостей</h2>
                  <span className="text-4xl font-black text-orange-400">{guests}</span>
                </div>
                <input type="range" min={10} max={100} step={5} value={guests}
                  onChange={e => setGuests(Number(e.target.value))}
                  className="w-full accent-orange-500 h-2 rounded-full cursor-pointer"/>
                <div className="flex justify-between text-xs text-white/30 mt-2">
                  <span>10</span><span>25</span><span>50</span><span>75</span><span>100</span>
                </div>
                <div className="flex gap-2 mt-4 flex-wrap">
                  {[10,20,30,40,50,60,80,100].map(n => (
                    <button key={n} onClick={() => setGuests(n)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${guests===n ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Packages */}
              <h2 className="text-xl font-bold mb-4">Выберите пакет</h2>
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                {PACKAGES.map((p, i) => {
                  const active = selectedPkg === p.id;
                  return (
                    <motion.button key={p.id} initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      onClick={() => setSelectedPkg(active ? null : p.id)}
                      className={`relative text-left rounded-2xl p-5 border transition-all ${active ? 'border-2' : 'border border-white/10 hover:border-white/20'}`}
                      style={{ borderColor: active ? p.color : undefined, background: active ? p.color + '15' : '#18181b' }}>
                      {p.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                          Популярный
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-black text-white">{p.name}</h3>
                        {active && (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: p.color }}>
                            <Check size={14} className="text-white"/>
                          </div>
                        )}
                      </div>
                      <p className="text-2xl font-black mb-1" style={{ color: p.accent }}>
                        {p.price.toLocaleString('ru')}₽
                      </p>
                      <p className="text-white/40 text-xs mb-4">с человека</p>
                      <ul className="space-y-1.5">
                        {p.includes.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-xs text-white/60">
                            <span style={{ color: p.accent }} className="mt-0.5 shrink-0">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                      {guests > 0 && (
                        <div className="mt-4 pt-3 border-t border-white/10">
                          <p className="text-white/40 text-xs">На {guests} чел.</p>
                          <p className="text-white font-bold">{(p.price * guests).toLocaleString('ru')}₽</p>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Extra services */}
              <h2 className="text-xl font-bold mb-4">Дополнительные услуги</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
                {EXTRA_SERVICES.map((s, i) => {
                  const on = extras.includes(s.id);
                  return (
                    <motion.button key={s.id} initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      onClick={() => toggleExtra(s.id)}
                      className={`text-left p-4 rounded-xl border transition-all ${on ? 'bg-orange-600/20 border-orange-500' : 'bg-zinc-900 border-white/10 hover:border-white/20'}`}>
                      <div className="text-2xl mb-2">{s.icon}</div>
                      <p className="text-white text-sm font-semibold leading-tight">{s.name}</p>
                      <p className="text-white/40 text-xs mt-1">{s.desc}</p>
                      <p className={`text-sm font-bold mt-2 ${on ? 'text-orange-400' : 'text-white/60'}`}>
                        {s.price.toLocaleString('ru')}₽
                      </p>
                    </motion.button>
                  );
                })}
              </div>

              {/* Total + CTA */}
              <div className="bg-gradient-to-r from-zinc-900 to-zinc-900 rounded-2xl p-6 border border-white/10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-white/40 text-sm mb-1">Итоговая стоимость</p>
                    {pkg ? (
                      <>
                        <p className="text-4xl font-black text-orange-400">{total.toLocaleString('ru')}₽</p>
                        <p className="text-white/30 text-xs mt-1">
                          {pkg.price.toLocaleString('ru')}₽ × {guests} чел.
                          {extrasTotal > 0 && ` + ${extrasTotal.toLocaleString('ru')}₽ доп. услуги`}
                        </p>
                      </>
                    ) : (
                      <p className="text-white/40">Выберите пакет для расчёта</p>
                    )}
                  </div>
                  <button onClick={() => setStep('form')} disabled={!selectedPkg}
                    className="flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all hover:scale-105">
                    Оставить заявку <ChevronRight size={18}/>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── FORM ── */}
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              className="max-w-lg mx-auto">
              <button onClick={() => setStep('calc')}
                className="flex items-center gap-2 text-white/40 hover:text-white mb-6 transition-colors text-sm">
                ← Назад к калькулятору
              </button>

              {/* Summary */}
              {pkg && (
                <div className="bg-zinc-900 rounded-2xl p-4 border border-orange-500/30 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-bold">Пакет «{pkg.name}»</span>
                    <span className="text-orange-400 font-black">{total.toLocaleString('ru')}₽</span>
                  </div>
                  <p className="text-white/40 text-sm">{guests} гостей · {extras.length > 0 ? `${extras.length} доп. услуги` : 'без доп. услуг'}</p>
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                <label className="block">
                  <span className="text-white/40 text-xs uppercase tracking-wider">Имя *</span>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="mt-1 w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="Ваше имя" required/>
                </label>
                <label className="block">
                  <span className="text-white/40 text-xs uppercase tracking-wider">Телефон *</span>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="mt-1 w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="+7 (___) ___-__-__" type="tel" required/>
                </label>
                <label className="block">
                  <span className="text-white/40 text-xs uppercase tracking-wider">Email</span>
                  <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="mt-1 w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="email@example.com" type="email"/>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-white/40 text-xs uppercase tracking-wider">Дата *</span>
                    <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1 w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors" required/>
                  </label>
                  <label className="block">
                    <span className="text-white/40 text-xs uppercase tracking-wider">Время</span>
                    <select value={form.time} onChange={e => setForm({...form, time: e.target.value})}
                      className="mt-1 w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none">
                      {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </label>
                </div>
                <label className="block">
                  <span className="text-white/40 text-xs uppercase tracking-wider">Пожелания</span>
                  <textarea value={form.comment} onChange={e => setForm({...form, comment: e.target.value})}
                    className="mt-1 w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                    rows={3} placeholder="Тематика, особые пожелания, аллергии..."/>
                </label>
                {error && <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3"><p className="text-red-400 text-sm">⚠️ {error}</p></div>}
                <button type="submit" disabled={loading}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Send size={18}/> {loading ? 'Отправка...' : 'Отправить заявку'}
                </button>
                <p className="text-white/20 text-xs text-center">
                  Мы свяжемся с вами в течение 30 минут для уточнения деталей
                </p>
              </form>
            </motion.div>
          )}

          {/* ── SUCCESS ── */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="max-w-sm mx-auto text-center py-16">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-400"/>
              </motion.div>
              <h2 className="text-3xl font-black mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Заявка принята!</h2>
              <p className="text-white/50 mb-8">Мы свяжемся с вами для подтверждения деталей мероприятия</p>
              <button onClick={() => { setStep('calc'); setSelectedPkg(null); setExtras([]); setForm({ name:'', phone:'', email:'', date:'', time:'18:00', comment:'' }); }}
                className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
                Новая заявка
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
