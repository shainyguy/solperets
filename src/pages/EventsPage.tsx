import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Check, Plus, Minus, Calendar, Users, Music, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface BanquetService {
  id: number;
  name: string;
  description: string;
  price: number;
  price_type: string;
  category: string;
  icon: string;
}

const PACKAGES = [
  {
    key: 'econom',
    name: 'Эконом',
    price: 3000,
    color: 'from-zinc-800 to-zinc-900',
    accent: '#6b7280',
    badge: '',
    includes: [
      'Холодные закуски: чобан салат, оливье, мимоза',
      'Горячее на выбор: отбивная (свинина / говядина / курица)',
      'Садж на выбор: цыплёнок / баранина / говядина / свинина',
      'Шашлык на выбор: курица или свинина',
      'Напитки: морс, лимонад, вода (газ/негаз)',
      'Хлебная корзинка',
      'Живая музыка и DJ',
    ],
  },
  {
    key: 'standart',
    name: 'Стандарт',
    price: 4000,
    color: 'from-orange-950 to-zinc-900',
    accent: '#E8631A',
    badge: '🔥 Популярный',
    includes: [
      'Всё из пакета Эконом',
      'Сельдь под шубой',
      'Бакинский букет',
      'Гнездо глухаря',
      'Сырная и мясная тарелка',
      'Ассорти из солений',
      'Жульен',
      'Живая музыка и DJ',
    ],
  },
  {
    key: 'premium',
    name: 'Премиум',
    price: 5000,
    color: 'from-yellow-950 to-zinc-900',
    accent: '#f59e0b',
    badge: '⭐ Премиум',
    includes: [
      'Всё из пакета Стандарт',
      'Шах-плов',
      'Шашлык из баранины на выбор',
      'Натуральный сок',
      'Живая музыка и DJ',
    ],
  },
];

function AnimSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className={className}>
      {children}
    </motion.div>
  );
}

export default function EventsPage() {
  const [services, setServices] = useState<BanquetService[]>([]);
  const [selectedPkg, setSelectedPkg] = useState('standart');
  const [guests, setGuests] = useState(30);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [expandedCats, setExpandedCats] = useState<string[]>([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', time: '18:00', occasion: '', comment: '' });
  const [step, setStep] = useState<'calc' | 'form' | 'success'>('calc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/banquet-services').then(r => r.json()).then(d => {
      if (Array.isArray(d)) {
        setServices(d);
        // Открываем первую категорию по умолчанию
        const cats = [...new Set(d.map((s: BanquetService) => s.category))];
        if (cats.length) setExpandedCats([cats[0]]);
      }
    });
  }, []);

  const pkg = PACKAGES.find(p => p.key === selectedPkg)!;
  const baseTotal = guests * pkg.price;
  const servicesTotal = services
    .filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + (s.price_type === 'per_person' ? s.price * guests : s.price), 0);
  const total = baseTotal + servicesTotal;

  const toggleService = (id: number) =>
    setSelectedServices(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleCat = (cat: string) =>
    setExpandedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

  const servicesByCategory = services.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, BanquetService[]>);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date) { setError('Заполните обязательные поля'); return; }
    setLoading(true); setError('');
    try {
      const selectedServiceNames = services.filter(s => selectedServices.includes(s.id)).map(s => s.name);
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          customer_phone: form.phone,
          customer_email: form.email,
          event_type: `${pkg.name}${form.occasion ? ` — ${form.occasion}` : ''}`,
          event_date: form.date,
          event_time: form.time,
          guests_count: guests,
          extra_services: selectedServiceNames,
          total_estimate: total,
          comment: form.comment
        })
      });
      if (!res.ok) throw new Error('Ошибка');
      setStep('success');
    } catch { setError('Ошибка отправки. Попробуйте ещё раз.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-white pt-20">
      {/* Hero */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/banquet.jpg" alt="Банкеты" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 to-zinc-950" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-orange-400 text-xs font-semibold tracking-[0.3em] uppercase mb-4">Банкеты и мероприятия</p>
            <h1 className="text-5xl md:text-6xl font-black mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Ваш праздник<br />в наших руках
            </h1>
            <p className="text-white/50 max-w-xl mx-auto">
              Три готовых пакета, живая музыка, DJ — и любые дополнительные услуги на ваш вкус
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-24">

        {step === 'success' ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 rounded-3xl p-14 text-center border border-green-500/30 max-w-lg mx-auto">
            <div className="text-6xl mb-6">🎉</div>
            <h3 className="text-3xl font-black mb-4">Заявка принята!</h3>
            <p className="text-white/50 mb-8">Мы свяжемся с вами в ближайшее время для уточнения деталей</p>
            <button onClick={() => { setStep('calc'); setForm({ name:'',phone:'',email:'',date:'',time:'18:00',occasion:'',comment:'' }); }}
              className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
              Новая заявка
            </button>
          </motion.div>
        ) : (
          <>
            {/* ─── Пакеты ─── */}
            <AnimSection>
              <div className="mb-10">
                <h2 className="text-3xl font-black text-center mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Выберите пакет
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {PACKAGES.map((p, i) => (
                    <motion.div key={p.key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                      onClick={() => setSelectedPkg(p.key)}
                      className={`relative rounded-2xl border-2 cursor-pointer transition-all overflow-hidden
                        ${selectedPkg === p.key ? 'border-orange-500 scale-[1.02]' : 'border-white/10 hover:border-white/20'}`}>
                      <div className={`bg-gradient-to-b ${p.color} p-6`}>
                        {p.badge && (
                          <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-white/10 mb-3">{p.badge}</span>
                        )}
                        <h3 className="text-xl font-black mb-1" style={{ color: p.accent }}>{p.name}</h3>
                        <div className="flex items-baseline gap-1 mb-5">
                          <span className="text-3xl font-black text-white">{p.price.toLocaleString('ru-RU')}</span>
                          <span className="text-white/40 text-sm">₽ / чел.</span>
                        </div>
                        <ul className="space-y-2">
                          {p.includes.map((item, j) => (
                            <li key={j} className="flex items-start gap-2 text-xs text-white/70">
                              <Check size={12} className="mt-0.5 shrink-0" style={{ color: p.accent }} />
                              {item}
                            </li>
                          ))}
                        </ul>
                        {selectedPkg === p.key && (
                          <div className="absolute top-3 right-3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </AnimSection>

            {/* ─── Ползунок гостей ─── */}
            <AnimSection>
              <div className="bg-zinc-900 rounded-2xl border border-white/10 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2"><Users size={18} className="text-orange-400" /> Количество гостей</h3>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setGuests(Math.max(5, guests - 5))}
                      className="w-9 h-9 rounded-full bg-white/10 hover:bg-orange-600 flex items-center justify-center transition-colors">
                      <Minus size={16} />
                    </button>
                    <span className="text-3xl font-black text-orange-400 w-16 text-center">{guests}</span>
                    <button onClick={() => setGuests(Math.min(300, guests + 5))}
                      className="w-9 h-9 rounded-full bg-white/10 hover:bg-orange-600 flex items-center justify-center transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <input type="range" min={5} max={300} step={5} value={guests}
                  onChange={e => setGuests(Number(e.target.value))}
                  className="w-full accent-orange-500" />
                <div className="flex justify-between text-xs text-white/30 mt-1">
                  <span>5</span><span>50</span><span>100</span><span>150</span><span>200</span><span>300</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {[10, 20, 30, 50, 80, 100, 150, 200].map(n => (
                    <button key={n} onClick={() => setGuests(n)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${guests === n ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </AnimSection>

            {/* ─── Доп. услуги ─── */}
            <AnimSection>
              <div className="bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden mb-8">
                <div className="p-5 border-b border-white/10">
                  <h3 className="font-bold flex items-center gap-2">
                    <Sparkles size={18} className="text-orange-400" /> Дополнительные услуги
                  </h3>
                  <p className="text-white/40 text-xs mt-1">Выберите всё что нужно для вашего праздника</p>
                </div>
                <div className="divide-y divide-white/5">
                  {Object.entries(servicesByCategory).map(([cat, catServices]) => (
                    <div key={cat}>
                      <button onClick={() => toggleCat(cat)}
                        className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors">
                        <span className="text-sm font-semibold text-orange-400 uppercase tracking-wider">{cat}</span>
                        {expandedCats.includes(cat) ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
                      </button>
                      <AnimatePresence>
                        {expandedCats.includes(cat) && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="grid sm:grid-cols-2 gap-3 px-5 pb-4">
                              {catServices.map(service => {
                                const selected = selectedServices.includes(service.id);
                                return (
                                  <button key={service.id} onClick={() => toggleService(service.id)}
                                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${selected ? 'bg-orange-600/15 border-orange-500/50' : 'bg-white/5 border-white/10 hover:border-orange-500/30'}`}>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${selected ? 'bg-orange-500 border-orange-500' : 'border-white/30'}`}>
                                      {selected && <Check size={11} className="text-white" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-white">{service.icon} {service.name}</p>
                                      <p className="text-xs text-white/40 mt-0.5 line-clamp-2">{service.description}</p>
                                      <p className="text-orange-400 text-sm font-bold mt-1">
                                        {service.price.toLocaleString('ru-RU')}₽{service.price_type === 'per_person' ? '/чел' : ''}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </AnimSection>

            {/* ─── Итог + форма ─── */}
            <AnimSection>
              <div className="bg-gradient-to-br from-orange-950/30 to-zinc-900 rounded-3xl border border-orange-500/20 overflow-hidden">
                {/* Итог */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-white/50 text-sm mb-1">Примерная стоимость</p>
                      <p className="text-4xl font-black text-orange-400">от {total.toLocaleString('ru-RU')}₽</p>
                      <p className="text-white/30 text-xs mt-1">
                        Пакет «{pkg.name}»: {pkg.price.toLocaleString('ru-RU')}₽ × {guests} = {baseTotal.toLocaleString('ru-RU')}₽
                        {servicesTotal > 0 && ` + доп. услуги: ${servicesTotal.toLocaleString('ru-RU')}₽`}
                      </p>
                    </div>
                    {step === 'calc' && (
                      <button onClick={() => setStep('form')}
                        className="flex items-center gap-2 px-7 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all hover:scale-105 shrink-0">
                        <Calendar size={18} /> Оставить заявку
                      </button>
                    )}
                  </div>

                  {/* Выбранные услуги */}
                  {selectedServices.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {services.filter(s => selectedServices.includes(s.id)).map(s => (
                        <span key={s.id} className="flex items-center gap-1 text-xs bg-orange-600/20 text-orange-300 px-3 py-1 rounded-full">
                          {s.icon} {s.name}
                          <button onClick={() => toggleService(s.id)} className="ml-1 hover:text-white">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Форма */}
                <AnimatePresence>
                  {step === 'form' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6">
                      <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                        <Music size={18} className="text-orange-400" /> Ваши данные
                      </h3>
                      <form onSubmit={submit} className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <label className="block">
                            <span className="text-white/50 text-xs mb-1 block">Имя *</span>
                            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-orange-500 text-sm"
                              placeholder="Ваше имя" required />
                          </label>
                          <label className="block">
                            <span className="text-white/50 text-xs mb-1 block">Телефон *</span>
                            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-orange-500 text-sm"
                              placeholder="+7 (___) ___-__-__" type="tel" required />
                          </label>
                          <label className="block">
                            <span className="text-white/50 text-xs mb-1 block">Email</span>
                            <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-orange-500 text-sm"
                              placeholder="email@example.com" type="email" />
                          </label>
                          <label className="block">
                            <span className="text-white/50 text-xs mb-1 block">Повод (необязательно)</span>
                            <input value={form.occasion} onChange={e => setForm({...form, occasion: e.target.value})}
                              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-orange-500 text-sm"
                              placeholder="День рождения, свадьба..." />
                          </label>
                          <label className="block">
                            <span className="text-white/50 text-xs mb-1 block">Дата *</span>
                            <input value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-sm"
                              type="date" required min={new Date().toISOString().split('T')[0]} />
                          </label>
                          <label className="block">
                            <span className="text-white/50 text-xs mb-1 block">Время начала</span>
                            <input value={form.time} onChange={e => setForm({...form, time: e.target.value})}
                              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 text-sm"
                              type="time" />
                          </label>
                        </div>
                        <textarea value={form.comment} onChange={e => setForm({...form, comment: e.target.value})}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-orange-500 resize-none text-sm"
                          rows={3} placeholder="Дополнительные пожелания..." />
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                        <div className="flex gap-3">
                          <button type="button" onClick={() => setStep('calc')}
                            className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm">
                            Назад
                          </button>
                          <button type="submit" disabled={loading}
                            className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-sm">
                            {loading ? 'Отправка...' : 'Отправить заявку'}
                          </button>
                        </div>
                        <p className="text-white/20 text-xs text-center">
                          Нажимая кнопку, вы соглашаетесь с <a href="/privacy" className="underline">политикой конфиденциальности</a>
                        </p>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </AnimSection>
          </>
        )}
      </div>
    </div>
  );
}
