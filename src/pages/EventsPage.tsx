import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Calendar, Music, Plus, Minus, Check, ChevronRight } from 'lucide-react';

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
    color: 'from-zinc-700 to-zinc-800',
    border: 'border-zinc-600',
    badge: '',
    includes: [
      'Холодные закуски: Чобан салат, Оливье, Мимоза',
      'Горячее на выбор: отбивная (свинина / говядина / курица)',
      'Садж на выбор: цыплёнок / баранина / говядина / свинина',
      'Шашлык на выбор: курица или свинина',
      'Напитки: морс, лимонад, вода (газ/негаз)',
      'Хлебная корзинка',
      '🎵 Живая музыка и DJ',
    ],
  },
  {
    key: 'standart',
    name: 'Стандарт',
    price: 4000,
    color: 'from-orange-900 to-zinc-800',
    border: 'border-orange-600',
    badge: 'Популярный',
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
    color: 'from-yellow-900 to-zinc-800',
    border: 'border-yellow-500',
    badge: '✨ Лучший выбор',
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
  const [selectedPackage, setSelectedPackage] = useState<string>('standart');
  const [guests, setGuests] = useState(30);
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', time: '18:00', comment: '' });
  const [step, setStep] = useState<'info' | 'form' | 'success'>('info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/banquet-services').then(r => r.json()).then(d => setServices(Array.isArray(d) ? d : []));
  }, []);

  const pkg = PACKAGES.find(p => p.key === selectedPackage) || PACKAGES[1];
  const baseTotal = guests * pkg.price;
  const servicesTotal = services
    .filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + (s.price_type === 'per_person' ? s.price * guests : s.price), 0);
  const total = baseTotal + servicesTotal;

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
          event_type: `Банкет — пакет «${pkg.name}»`,
          event_date: form.date,
          event_time: form.time,
          guests_count: guests,
          extra_services: selectedServiceNames,
          total_estimate: total,
          comment: form.comment,
        })
      });
      if (!res.ok) throw new Error('Ошибка отправки');
      setStep('success');
    } catch (e: any) { setError(e.message); }
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
          <img src="/images/banquet.jpg" alt="Банкеты" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 to-zinc-950" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-orange-400 text-sm font-medium tracking-[0.3em] uppercase mb-4">Банкеты и мероприятия</p>
            <h1 className="text-5xl md:text-6xl font-black mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Ваш праздник<br />в наших руках
            </h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Организуем любые мероприятия — от камерного ужина до масштабного торжества на 100 человек
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-24">

        {step === 'success' ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 rounded-3xl p-12 text-center border border-green-500/30 max-w-lg mx-auto">
            <div className="text-6xl mb-6">🎉</div>
            <h3 className="text-3xl font-black mb-4">Заявка принята!</h3>
            <p className="text-white/60 mb-8">Мы свяжемся с вами для уточнения деталей</p>
            <button onClick={() => { setStep('info'); setForm({ name:'',phone:'',email:'',date:'',time:'18:00',comment:'' }); }}
              className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
              Новая заявка
            </button>
          </motion.div>
        ) : step === 'form' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
            <button onClick={() => setStep('info')} className="flex items-center gap-2 text-white/50 hover:text-orange-400 mb-6 transition-colors">
              ← Назад
            </button>
            <div className="bg-zinc-900 rounded-3xl p-8 border border-white/10">
              {/* Summary */}
              <div className="bg-orange-600/10 border border-orange-500/20 rounded-2xl p-4 mb-6">
                <p className="text-orange-400 font-bold">Пакет «{pkg.name}» · {pkg.price.toLocaleString('ru-RU')}₽/чел</p>
                <p className="text-white/60 text-sm">Гостей: {guests} · Итого: ~{total.toLocaleString('ru-RU')}₽</p>
              </div>
              <form onSubmit={submitBooking} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-white/60 text-sm">Имя *</span>
                    <input value={form.name} onChange={e => setForm({...form,name:e.target.value})}
                      className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                      placeholder="Ваше имя" required />
                  </label>
                  <label className="block">
                    <span className="text-white/60 text-sm">Телефон *</span>
                    <input value={form.phone} onChange={e => setForm({...form,phone:e.target.value})}
                      className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                      placeholder="+7 (___) ___-__-__" type="tel" required />
                  </label>
                  <label className="block">
                    <span className="text-white/60 text-sm">Email</span>
                    <input value={form.email} onChange={e => setForm({...form,email:e.target.value})}
                      className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                      placeholder="email@mail.ru" type="email" />
                  </label>
                  <label className="block">
                    <span className="text-white/60 text-sm">Дата *</span>
                    <input value={form.date} onChange={e => setForm({...form,date:e.target.value})}
                      className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                      type="date" required min={new Date().toISOString().split('T')[0]} />
                  </label>
                  <label className="block">
                    <span className="text-white/60 text-sm">Время начала</span>
                    <input value={form.time} onChange={e => setForm({...form,time:e.target.value})}
                      className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                      type="time" />
                  </label>
                </div>
                <textarea value={form.comment} onChange={e => setForm({...form,comment:e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 resize-none"
                  rows={3} placeholder="Дополнительные пожелания..." />
                {error && <p className="text-red-400 text-sm">❌ {error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-lg">
                  {loading ? 'Отправка...' : 'Отправить заявку'}
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Packages */}
            <AnimatedSection>
              <h2 className="text-3xl font-black text-center mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>Пакеты банкета</h2>
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {PACKAGES.map((p, i) => (
                  <motion.button key={p.key}
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                    onClick={() => setSelectedPackage(p.key)}
                    className={`relative text-left rounded-3xl p-6 border-2 transition-all bg-gradient-to-b ${p.color} ${
                      selectedPackage === p.key ? p.border + ' scale-105 shadow-xl shadow-orange-900/30' : 'border-white/10 hover:border-white/30'
                    }`}>
                    {p.badge && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap">
                        {p.badge}
                      </span>
                    )}
                    <p className="text-white font-black text-xl mb-1">{p.name}</p>
                    <p className="text-orange-400 font-black text-3xl mb-4">{p.price.toLocaleString('ru-RU')}₽<span className="text-sm text-white/50">/чел</span></p>
                    <ul className="space-y-2">
                      {p.includes.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-white/70">
                          <Check size={14} className="text-green-400 mt-0.5 shrink-0" />{item}
                        </li>
                      ))}
                    </ul>
                    {selectedPackage === p.key && (
                      <div className="mt-4 flex items-center gap-2 text-orange-400 font-bold text-sm">
                        <Check size={16} /> Выбран
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </AnimatedSection>

            {/* Guests slider */}
            <AnimatedSection>
              <div className="bg-zinc-900 rounded-3xl p-8 border border-white/10 mb-8">
                <h3 className="text-xl font-bold mb-6">Количество гостей</h3>
                <div className="flex items-center gap-6">
                  <button onClick={() => setGuests(g => Math.max(10, g - 5))}
                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-orange-600 flex items-center justify-center transition-colors">
                    <Minus size={20} />
                  </button>
                  <div className="flex-1">
                    <input type="range" min={10} max={100} step={5} value={guests}
                      onChange={e => setGuests(Number(e.target.value))}
                      className="w-full accent-orange-500" />
                    <div className="flex justify-between text-white/30 text-xs mt-1">
                      <span>10</span><span>50</span><span>100</span>
                    </div>
                  </div>
                  <button onClick={() => setGuests(g => Math.min(100, g + 5))}
                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-orange-600 flex items-center justify-center transition-colors">
                    <Plus size={20} />
                  </button>
                  <div className="text-center min-w-16">
                    <span className="text-5xl font-black text-orange-400">{guests}</span>
                    <p className="text-white/40 text-xs">человек</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {[10,20,30,50,70,100].map(n => (
                    <button key={n} onClick={() => setGuests(n)}
                      className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                        guests === n ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}>{n}</button>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Extra services */}
            {Object.keys(servicesByCategory).length > 0 && (
              <AnimatedSection>
                <div className="bg-zinc-900 rounded-3xl p-8 border border-white/10 mb-8">
                  <h3 className="text-xl font-bold mb-6">Дополнительные услуги</h3>
                  {Object.entries(servicesByCategory).map(([cat, catServices]) => (
                    <div key={cat} className="mb-6">
                      <p className="text-orange-400 text-sm font-medium uppercase tracking-wider mb-3">{cat}</p>
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
                              {selectedServices.includes(service.id) && <Check size={12} className="text-white" />}
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

            {/* Total + CTA */}
            <AnimatedSection>
              <div className="bg-gradient-to-r from-orange-900/30 to-zinc-900 rounded-3xl p-8 border border-orange-500/20">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <p className="text-white/50 text-sm mb-1">Пакет «{pkg.name}» · {guests} гостей</p>
                    <p className="text-5xl font-black text-orange-400">~{total.toLocaleString('ru-RU')}₽</p>
                    <p className="text-white/30 text-xs mt-1">{pkg.price.toLocaleString('ru-RU')}₽/чел × {guests} = {baseTotal.toLocaleString('ru-RU')}₽ + доп. услуги</p>
                  </div>
                  <button onClick={() => setStep('form')}
                    className="flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl transition-all hover:scale-105 text-lg">
                    <Calendar size={20} /> Забронировать <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </AnimatedSection>

            {/* Disco */}
            <AnimatedSection className="mt-12">
              <div className="relative rounded-3xl overflow-hidden">
                <img src="/images/disco.jpg" alt="Дискотека" className="w-full h-56 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex items-center">
                  <div className="p-8">
                    <div className="flex items-center gap-2 text-orange-400 mb-2">
                      <Music size={20} />
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
