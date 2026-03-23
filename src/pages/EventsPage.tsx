import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Calendar, Music, Sparkles, Check, Star, Users } from 'lucide-react';

interface BanquetService {
  id: number;
  name: string;
  description: string;
  price: number;
  price_type: string;
  category: string;
  icon: string;
}

// Пакеты банкета
const PACKAGES = [
  {
    key: 'econom',
    name: 'Эконом',
    price: 3000,
    color: '#10b981',
    colorDim: 'rgba(16,185,129,0.1)',
    border: 'border-emerald-500/30',
    includes: [
      'Холодные закуски: Чобан салат, Оливье, Мимоза',
      'Горячее на выбор: Отбивная (свинина / говядина / курица)',
      'Садж на выбор: Цыплёнок / Баранина / Говядина / Свинина',
      'Шашлык на выбор: Курица / Свинина',
      'Напитки: Морс / Лимонад / Вода (газ. или без)',
      'Хлебная корзинка',
      '🎵 Живая музыка и DJ',
    ],
  },
  {
    key: 'standard',
    name: 'Стандарт',
    price: 4000,
    color: '#f97316',
    colorDim: 'rgba(249,115,22,0.1)',
    border: 'border-orange-500/40',
    popular: true,
    includes: [
      'Всё из пакета Эконом',
      'Сельдь под шубой',
      'Бакинский букет',
      'Гнездо глухаря',
      'Сырная и мясная тарелка',
      'Ассорти из солений',
      'Жульен',
      '🎵 Живая музыка и DJ',
    ],
  },
  {
    key: 'premium',
    name: 'Премиум',
    price: 5000,
    color: '#a855f7',
    colorDim: 'rgba(168,85,247,0.1)',
    border: 'border-purple-500/40',
    includes: [
      'Всё из пакета Стандарт',
      'Шах-плов',
      'Шашлык из баранины на выбор',
      'Натуральный сок',
      '🎵 Живая музыка и DJ',
    ],
  },
];

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className={className}>
      {children}
    </motion.div>
  );
}

export default function EventsPage() {
  const [services, setServices] = useState<BanquetService[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('standard');
  const [guests, setGuests] = useState(30);
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', time: '18:00', comment: '' });
  const [step, setStep] = useState<'calc' | 'form' | 'success'>('calc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/banquet-services')
      .then(r => r.json())
      .then(d => setServices(Array.isArray(d) ? d : []))
      .catch(() => setServices([]));
  }, []);

  const pkg = PACKAGES.find(p => p.key === selectedPackage) || PACKAGES[1];
  const pkgTotal = pkg.price * guests;
  const servicesTotal = services
    .filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + (s.price_type === 'per_person' ? s.price * guests : s.price), 0);
  const total = pkgTotal + servicesTotal;

  const toggleService = (id: number) =>
    setSelectedServices(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const submitBooking = async (e: React.FormEvent) => {
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
          event_type: `Банкет · Пакет ${pkg.name}`,
          event_date: form.date,
          event_time: form.time,
          guests_count: guests,
          extra_services: selectedServiceNames,
          total_estimate: total,
          comment: form.comment,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Ошибка'); }
      setStep('success');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const servicesByCategory = services.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, BanquetService[]>);

  return (
    <div className="bg-zinc-950 min-h-screen text-white pt-20">
      {/* Hero */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/banquet.jpg" alt="Мероприятия" className="w-full h-full object-cover opacity-15"/>
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 to-zinc-950"/>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-orange-400 text-sm font-medium tracking-[0.3em] uppercase mb-4">Банкеты и мероприятия</p>
            <h1 className="text-5xl md:text-6xl font-black mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Ваш праздник<br/>в наших руках
            </h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Выберите пакет, укажите пожелания — мы организуем незабываемое мероприятие
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-20">

        {step === 'success' ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 rounded-3xl p-12 text-center border border-green-500/30 max-w-lg mx-auto">
            <div className="text-6xl mb-6">🎉</div>
            <h3 className="text-3xl font-black mb-4">Заявка принята!</h3>
            <p className="text-white/60 mb-8">Мы свяжемся с вами в ближайшее время для уточнения деталей</p>
            <button onClick={() => { setStep('calc'); setForm({ name:'',phone:'',email:'',date:'',time:'18:00',comment:'' }); }}
              className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
              Новая заявка
            </button>
          </motion.div>
        ) : (
          <>
            {/* ── ПАКЕТЫ ── */}
            <AnimatedSection>
              <h2 className="text-3xl font-black text-center mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>Выберите пакет</h2>
              <div className="grid md:grid-cols-3 gap-5 mb-12">
                {PACKAGES.map((p, i) => (
                  <motion.button key={p.key}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                    onClick={() => setSelectedPackage(p.key)}
                    className={`relative text-left rounded-2xl border-2 transition-all p-5 ${
                      selectedPackage === p.key
                        ? `${p.border} scale-[1.02]`
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    style={{ background: selectedPackage === p.key ? p.colorDim : 'rgba(255,255,255,0.03)' }}
                  >
                    {p.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1">
                        <Star size={10}/> Популярный
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-black text-xl" style={{ color: p.color }}>{p.name}</span>
                      {selectedPackage === p.key && <Check size={20} style={{ color: p.color }}/>}
                    </div>
                    <p className="text-3xl font-black text-white mb-1">{p.price.toLocaleString('ru-RU')}₽</p>
                    <p className="text-white/40 text-xs mb-4">с человека</p>
                    <ul className="space-y-1.5">
                      {p.includes.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs text-white/60">
                          <span style={{ color: p.color }} className="mt-0.5 shrink-0">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.button>
                ))}
              </div>
            </AnimatedSection>

            {/* ── ПОЛЗУНОК ГОСТЕЙ ── */}
            <AnimatedSection>
              <div className="bg-zinc-900 rounded-2xl border border-white/10 p-6 mb-8">
                <div className="flex items-center gap-3 mb-5">
                  <Users className="text-orange-400" size={22}/>
                  <h3 className="text-lg font-bold">Количество гостей</h3>
                  <span className="ml-auto text-4xl font-black text-orange-400">{guests}</span>
                </div>
                <input type="range" min={10} max={100} step={5} value={guests}
                  onChange={e => setGuests(Number(e.target.value))}
                  className="w-full accent-orange-500 mb-2"/>
                <div className="flex justify-between text-xs text-white/30">
                  <span>10 гостей</span>
                  <span>100 гостей (макс.)</span>
                </div>
                <div className="flex gap-2 mt-4 flex-wrap">
                  {[10, 20, 30, 50, 75, 100].map(n => (
                    <button key={n} onClick={() => setGuests(n)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        guests === n ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}>{n}</button>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* ── ДОП. УСЛУГИ ── */}
            {Object.keys(servicesByCategory).length > 0 && (
              <AnimatedSection>
                <div className="bg-zinc-900 rounded-2xl border border-white/10 p-6 mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="text-orange-400" size={22}/>
                    <h3 className="text-lg font-bold">Дополнительные услуги</h3>
                  </div>
                  {Object.entries(servicesByCategory).map(([cat, catServices]) => (
                    <div key={cat} className="mb-6">
                      <p className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">{cat}</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {catServices.map(service => (
                          <button key={service.id} onClick={() => toggleService(service.id)}
                            className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                              selectedServices.includes(service.id)
                                ? 'bg-orange-600/20 border-orange-500 text-white'
                                : 'bg-white/5 border-white/10 text-white/70 hover:border-orange-500/30'
                            }`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                              selectedServices.includes(service.id) ? 'bg-orange-500 border-orange-500' : 'border-white/30'
                            }`}>
                              {selectedServices.includes(service.id) && <Check size={11} className="text-white"/>}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{service.icon} {service.name}</p>
                              <p className="text-xs text-white/40 mt-0.5">{service.description}</p>
                              <p className="text-orange-400 text-sm font-bold mt-1">
                                {service.price.toLocaleString('ru-RU')}₽{service.price_type === 'per_person' ? '/чел' : ''}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            )}

            {/* ── ИТОГО + ФОРМА ── */}
            <AnimatedSection>
              <div className="bg-gradient-to-r from-orange-900/20 to-zinc-900 rounded-2xl border border-orange-500/20 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-white/50 text-sm mb-1">Пакет «{pkg.name}» × {guests} гостей</p>
                      {selectedServices.length > 0 && (
                        <p className="text-white/40 text-xs mb-2">+ {selectedServices.length} доп. услуги</p>
                      )}
                      <p className="text-4xl font-black text-orange-400">от {total.toLocaleString('ru-RU')}₽</p>
                    </div>
                    {step === 'calc' && (
                      <button onClick={() => setStep('form')}
                        className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all hover:scale-105 flex items-center gap-2">
                        <Calendar size={20}/> Оставить заявку
                      </button>
                    )}
                  </div>
                </div>

                {step === 'form' && (
                  <form onSubmit={submitBooking} className="p-6 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-white/60 text-sm">Имя *</span>
                        <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                          className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                          placeholder="Ваше имя" required/>
                      </label>
                      <label className="block">
                        <span className="text-white/60 text-sm">Телефон *</span>
                        <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                          className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                          placeholder="+7 (___) ___-__-__" type="tel" required/>
                      </label>
                      <label className="block">
                        <span className="text-white/60 text-sm">Email</span>
                        <input value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                          className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                          placeholder="email@example.com" type="email"/>
                      </label>
                      <label className="block">
                        <span className="text-white/60 text-sm">Дата мероприятия *</span>
                        <input value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                          className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                          type="date" required min={new Date().toISOString().split('T')[0]}/>
                      </label>
                      <label className="block">
                        <span className="text-white/60 text-sm">Время начала</span>
                        <input value={form.time} onChange={e => setForm({...form, time: e.target.value})}
                          className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                          type="time"/>
                      </label>
                    </div>
                    <textarea value={form.comment} onChange={e => setForm({...form, comment: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 resize-none"
                      rows={3} placeholder="Повод, пожелания, вопросы..."/>
                    {error && <p className="text-red-400 text-sm">❌ {error}</p>}
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setStep('calc')}
                        className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">Назад</button>
                      <button type="submit" disabled={loading}
                        className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
                        {loading ? 'Отправка...' : 'Отправить заявку'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </AnimatedSection>

            {/* ── ДИСКОТЕКА ── */}
            <AnimatedSection className="mt-10">
              <div className="relative rounded-3xl overflow-hidden">
                <img src="/images/disco.jpg" alt="Дискотека" className="w-full h-48 object-cover"/>
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/30 flex items-center">
                  <div className="p-8">
                    <div className="flex items-center gap-2 text-orange-400 mb-2">
                      <Music size={20}/>
                      <span className="text-sm font-medium tracking-widest uppercase">Каждую пятницу и субботу</span>
                    </div>
                    <h3 className="text-2xl font-black">Дискотека & DJ</h3>
                    <p className="text-white/60 text-sm mt-1">Живая музыка, танцпол, атмосфера праздника</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </>
        )}
      </div>
    </div>
  );
}
