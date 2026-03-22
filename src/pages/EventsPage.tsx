import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Calendar, Music, Sparkles, Plus, Minus, Check, ChevronDown, ChevronUp, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    border: 'border-zinc-600',
    badge: '',
    includes: [
      'Холодные закуски: Чобан салат, Оливье, Мимоза',
      'Горячее на выбор: отбивная (свинина / говядина / курица)',
      'Садж на выбор: цыплёнок / баранина / говядина / свинина',
      'Шашлык на выбор: курица или свинина',
      'Напитки: морс / лимонад / вода газ. или без',
      'Хлебная корзинка',
      '🎵 Живая музыка и DJ',
    ],
  },
  {
    key: 'standard',
    name: 'Стандарт',
    price: 4000,
    color: 'from-orange-900/40 to-zinc-900',
    border: 'border-orange-500/50',
    badge: 'Популярный',
    includes: [
      'Всё из пакета «Эконом»',
      '+ Сельдь под шубой',
      '+ Бакинский букет',
      '+ Гнездо глухаря',
      '+ Сырная и мясная тарелка',
      '+ Ассорти из солений',
      '+ Жульен',
      '🎵 Живая музыка и DJ',
    ],
  },
  {
    key: 'premium',
    name: 'Премиум',
    price: 5000,
    color: 'from-yellow-900/30 to-zinc-900',
    border: 'border-yellow-500/50',
    badge: '⭐ Лучший выбор',
    includes: [
      'Всё из пакета «Стандарт»',
      '+ Шах-плов',
      '+ Шашлык из баранины на выбор',
      '+ Натуральный сок',
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
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', time: '18:00', occasion: '', comment: '' });
  const [step, setStep] = useState<'calc' | 'form' | 'success'>('calc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    fetch('/api/banquet-services')
      .then(r => r.json())
      .then(d => setServices(Array.isArray(d) ? d : []));
  }, []);

  const pkg = PACKAGES.find(p => p.key === selectedPackage)!;
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
          event_type: `Банкет «${pkg.name}»${form.occasion ? ' · ' + form.occasion : ''}`,
          event_date: form.date,
          event_time: form.time,
          guests_count: guests,
          extra_services: [`Пакет: ${pkg.name} (${pkg.price}₽/чел)`, ...selectedServiceNames],
          total_estimate: total,
          comment: form.comment,
        }),
      });
      if (!res.ok) throw new Error('Ошибка отправки');
      setStep('success');
    } catch (e: any) { setError(e.message); }
    setLoading(false);
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
          <img src="/images/banquet.jpg" alt="Мероприятия" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 to-zinc-950" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-orange-400 text-sm font-medium tracking-[0.3em] uppercase mb-4">Банкеты и мероприятия</p>
            <h1 className="text-5xl md:text-6xl font-black mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Ваш праздник<br />в наших руках
            </h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Дни рождения, свадьбы, корпоративы, юбилеи — организуем любое мероприятие
            </p>
          </motion.div>
        </div>
      </div>

      {/* Пятница/суббота — дискотека */}
      <AnimatedSection>
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative rounded-3xl overflow-hidden">
              <img src="/images/disco.jpg" alt="Дискотека" className="w-full h-56 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                <div>
                  <div className="flex items-center gap-2 text-orange-400 mb-2">
                    <Music size={18} />
                    <span className="text-sm font-medium tracking-widest uppercase">Каждую пятницу и субботу</span>
                  </div>
                  <h3 className="text-2xl font-black">Дискотека & DJ</h3>
                  <p className="text-white/60 text-sm mt-1">Живая музыка, танцпол, атмосфера праздника</p>
                </div>
              </div>
            </div>
            <div className="bg-zinc-900 rounded-3xl p-7 border border-white/10 flex flex-col justify-center">
              <Sparkles className="text-orange-400 mb-3" size={28} />
              <h3 className="text-xl font-black mb-3">Дополнительные развлечения</h3>
              <ul className="space-y-2">
                {['🤡 Ростовые куклы и аниматоры', '🎆 Профессиональный салют', '💐 Свадебный декор', '🎵 Живая музыка и DJ', '🎂 Торты на заказ', '🫕 Шах-плов на большие компании', '🍽️ Кавказская кухня', '🎤 Ведущий церемонии'].map((item, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} viewport={{ once: true }}
                    className="text-white/70 text-sm flex items-center gap-2">
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* КАЛЬКУЛЯТОР */}
      <AnimatedSection>
        <div className="max-w-4xl mx-auto px-4 pb-20">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Калькулятор банкета</h2>
            <p className="text-white/50">Выберите пакет, укажите количество гостей и доп. услуги</p>
          </div>

          {step === 'success' ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 rounded-3xl p-12 text-center border border-green-500/30">
              <div className="text-6xl mb-5">🎉</div>
              <h3 className="text-3xl font-black mb-3">Заявка принята!</h3>
              <p className="text-white/60 mb-8">Мы свяжемся с вами в ближайшее время для уточнения деталей</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => { setStep('calc'); setForm({ name: '', phone: '', email: '', date: '', time: '18:00', occasion: '', comment: '' }); setSelectedServices([]); }}
                  className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
                  Новая заявка
                </button>
                <a href="tel:+79257677778" className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Phone size={18} /> Позвонить нам
                </a>
              </div>
            </motion.div>
          ) : (
            <div className="bg-zinc-900 rounded-3xl border border-white/10 overflow-hidden">

              {/* Шаг 1 — Выбор пакета */}
              <div className="p-6 md:p-8 border-b border-white/10">
                <h3 className="text-lg font-bold mb-5">1. Выберите пакет</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {PACKAGES.map(p => (
                    <button key={p.key} onClick={() => setSelectedPackage(p.key)}
                      className={`relative p-5 rounded-2xl border text-left transition-all ${selectedPackage === p.key ? p.border + ' bg-gradient-to-b ' + p.color + ' ring-2 ring-orange-500/40' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                      {p.badge && (
                        <span className="absolute -top-2.5 left-4 bg-orange-600 text-white text-xs px-3 py-0.5 rounded-full font-bold">
                          {p.badge}
                        </span>
                      )}
                      <p className="text-white font-black text-lg mb-1">{p.name}</p>
                      <p className="text-orange-400 font-black text-2xl">{p.price.toLocaleString('ru-RU')}₽</p>
                      <p className="text-white/40 text-xs">с человека</p>
                      <div className="mt-3 space-y-1">
                        {p.includes.slice(0, 4).map((item, i) => (
                          <p key={i} className="text-white/50 text-xs flex items-start gap-1">
                            <Check size={10} className="text-green-400 mt-0.5 shrink-0" /> {item}
                          </p>
                        ))}
                        {p.includes.length > 4 && (
                          <p className="text-orange-400/70 text-xs">+ ещё {p.includes.length - 4} позиции</p>
                        )}
                      </div>
                      {selectedPackage === p.key && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Что входит в выбранный пакет */}
                <div className="mt-5 p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">Что входит в «{pkg.name}»:</p>
                  <div className="grid sm:grid-cols-2 gap-1">
                    {pkg.includes.map((item, i) => (
                      <p key={i} className="text-white/70 text-sm flex items-start gap-2">
                        <Check size={13} className="text-green-400 mt-0.5 shrink-0" /> {item}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Шаг 2 — Количество гостей */}
              <div className="p-6 md:p-8 border-b border-white/10">
                <h3 className="text-lg font-bold mb-5">2. Количество гостей</h3>
                <div className="flex items-center gap-6">
                  <button onClick={() => setGuests(Math.max(10, guests - 5))} className="w-12 h-12 rounded-full bg-white/10 hover:bg-orange-600 flex items-center justify-center transition-colors">
                    <Minus size={20} />
                  </button>
                  <div className="text-center">
                    <span className="text-5xl font-black text-orange-400">{guests}</span>
                    <p className="text-white/40 text-sm">человек</p>
                  </div>
                  <button onClick={() => setGuests(Math.min(300, guests + 5))} className="w-12 h-12 rounded-full bg-white/10 hover:bg-orange-600 flex items-center justify-center transition-colors">
                    <Plus size={20} />
                  </button>
                </div>
                <div className="mt-4 flex gap-2 flex-wrap">
                  {[10, 20, 30, 50, 75, 100, 150, 200].map(n => (
                    <button key={n} onClick={() => setGuests(n)} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${guests === n ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>{n}</button>
                  ))}
                </div>
              </div>

              {/* Шаг 3 — Доп. услуги */}
              <div className="p-6 md:p-8 border-b border-white/10">
                <button onClick={() => setServicesOpen(!servicesOpen)}
                  className="w-full flex items-center justify-between text-lg font-bold mb-1">
                  <span>3. Дополнительные услуги {selectedServices.length > 0 && <span className="text-orange-400 text-sm font-normal ml-2">({selectedServices.length} выбрано)</span>}</span>
                  {servicesOpen ? <ChevronUp size={20} className="text-white/40" /> : <ChevronDown size={20} className="text-white/40" />}
                </button>
                <p className="text-white/40 text-sm mb-4">Нажмите чтобы развернуть</p>

                <AnimatePresence>
                  {servicesOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      {Object.entries(servicesByCategory).map(([cat, catServices]) => (
                        <div key={cat} className="mb-5">
                          <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-3">{cat}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {catServices.map(service => (
                              <button key={service.id} onClick={() => toggleService(service.id)}
                                className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${selectedServices.includes(service.id) ? 'bg-orange-600/20 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-white/70 hover:border-orange-500/30'}`}>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${selectedServices.includes(service.id) ? 'bg-orange-500 border-orange-500' : 'border-white/30'}`}>
                                  {selectedServices.includes(service.id) && <Check size={11} className="text-white" />}
                                </div>
                                <div className="flex-1 min-w-0">
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Итог и форма */}
              <div className="p-6 md:p-8 bg-gradient-to-r from-orange-900/10 to-zinc-900">
                {/* Разбивка стоимости */}
                <div className="mb-6 space-y-2">
                  <div className="flex justify-between text-sm text-white/50">
                    <span>Пакет «{pkg.name}» × {guests} чел.</span>
                    <span>{pkgTotal.toLocaleString('ru-RU')}₽</span>
                  </div>
                  {services.filter(s => selectedServices.includes(s.id)).map(s => (
                    <div key={s.id} className="flex justify-between text-sm text-white/50">
                      <span>{s.icon} {s.name}</span>
                      <span>{(s.price_type === 'per_person' ? s.price * guests : s.price).toLocaleString('ru-RU')}₽</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <p className="text-white/60">Примерная стоимость:</p>
                    <p className="text-3xl font-black text-orange-400">от {total.toLocaleString('ru-RU')}₽</p>
                  </div>
                </div>

                {step === 'calc' && (
                  <button onClick={() => setStep('form')} className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all hover:scale-[1.01] flex items-center justify-center gap-2 text-lg">
                    <Calendar size={20} /> Оставить заявку
                  </button>
                )}

                {step === 'form' && (
                  <form onSubmit={submitBooking} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-white/60 text-sm">Имя *</span>
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                          className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                          placeholder="Ваше имя" required />
                      </label>
                      <label className="block">
                        <span className="text-white/60 text-sm">Телефон *</span>
                        <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                          className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                          placeholder="+7 (___) ___-__-__" type="tel" required />
                      </label>
                      <label className="block">
                        <span className="text-white/60 text-sm">Дата мероприятия *</span>
                        <input value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                          className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                          type="date" required min={new Date().toISOString().split('T')[0]} />
                      </label>
                      <label className="block">
                        <span className="text-white/60 text-sm">Время начала</span>
                        <input value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
                          className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                          type="time" />
                      </label>
                      <label className="block sm:col-span-2">
                        <span className="text-white/60 text-sm">Повод (необязательно)</span>
                        <input value={form.occasion} onChange={e => setForm({ ...form, occasion: e.target.value })}
                          className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                          placeholder="День рождения, свадьба, юбилей..." />
                      </label>
                    </div>
                    <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 resize-none"
                      rows={3} placeholder="Дополнительные пожелания..." />
                    {error && <p className="text-red-400 text-sm">❌ {error}</p>}
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setStep('calc')} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
                        ← Назад
                      </button>
                      <button type="submit" disabled={loading} className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
                        {loading ? 'Отправка...' : 'Отправить заявку'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* CTA — бронь стола */}
      <AnimatedSection>
        <div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="bg-gradient-to-r from-orange-900/30 to-zinc-900 rounded-3xl p-8 md:p-12 border border-orange-500/20 text-center">
            <h3 className="text-3xl font-black mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Хотите просто забронировать стол?</h3>
            <p className="text-white/50 mb-8">Выберите стол на схеме зала, укажите дату и время</p>
            <Link to="/booking" className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all hover:scale-105 text-lg">
              🪑 Забронировать стол
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
