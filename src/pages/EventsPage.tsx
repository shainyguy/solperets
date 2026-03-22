import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Calendar, Music, Sparkles, Plus, Minus, Check, ChevronRight, Users, MapPin } from 'lucide-react';
import TableMap from '../components/TableMap';

interface BanquetService {
  id: number;
  name: string;
  description: string;
  price: number;
  price_type: string;
  category: string;
  icon: string;
}

const BANQUET_PACKAGES = [
  {
    key: 'econom',
    name: 'Эконом',
    price: 3000,
    color: 'from-zinc-800 to-zinc-900',
    accent: '#6b7280',
    badge: null,
    includes: [
      'Холодные закуски: Чабан салат, Оливье, Мимоза',
      'Горячее на выбор: Отбивная (свинина, говядина, курица)',
      'Садж на выбор: Цыплёнок, Баранина, Говядина, Свинина',
      'Шашлык на выбор: Курица или Свинина',
      'Напитки на выбор: Морс, Лимонад, Вода газ/без газа',
      'Хлебная корзинка',
      '🎵 Живая музыка и DJ',
    ],
  },
  {
    key: 'standard',
    name: 'Стандарт',
    price: 4000,
    color: 'from-orange-950 to-zinc-900',
    accent: '#E8631A',
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
    color: 'from-amber-950 to-zinc-900',
    accent: '#f59e0b',
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
  const [guests, setGuests] = useState(30);
  const [selectedPackage, setSelectedPackage] = useState('standard');
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', time: '18:00', comment: '', occasion: '' });
  const [step, setStep] = useState<'main' | 'form' | 'success'>('main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Table booking
  const [showTableMap, setShowTableMap] = useState(false);
  const [tableForm, setTableForm] = useState({ name: '', phone: '', guests: 2, date: '', time: '19:00', comment: '' });
  const [tableStep, setTableStep] = useState<'datetime' | 'map' | 'form' | 'success'>('datetime');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState('');

  useEffect(() => {
    fetch('/api/banquet-services').then(r => r.json()).then(d => setServices(Array.isArray(d) ? d : []));
  }, []);

  const pkg = BANQUET_PACKAGES.find(p => p.key === selectedPackage)!;
  const baseTotal = guests * pkg.price;
  const servicesTotal = services.filter(s => selectedServices.includes(s.id)).reduce((sum, s) => {
    return sum + (s.price_type === 'per_person' ? s.price * guests : s.price);
  }, 0);
  const total = baseTotal + servicesTotal;

  const toggleService = (id: number) =>
    setSelectedServices(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const submitBanquet = async (e: React.FormEvent) => {
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
          event_type: form.occasion || `Банкет — пакет «${pkg.name}»`,
          event_date: form.date,
          event_time: form.time,
          guests_count: guests,
          extra_services: [`Пакет: ${pkg.name} (${pkg.price}₽/чел)`, ...selectedServiceNames],
          total_estimate: total,
          comment: form.comment
        })
      });
      if (!res.ok) throw new Error('Ошибка отправки');
      setStep('success');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const submitTableBooking = async () => {
    if (!tableForm.name || !tableForm.phone || !selectedTable) { setTableError('Заполните все поля'); return; }
    setTableLoading(true); setTableError('');
    try {
      const res = await fetch('/api/table-reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_number: selectedTable,
          customer_name: tableForm.name,
          customer_phone: tableForm.phone,
          guests_count: tableForm.guests,
          reserve_date: tableForm.date,
          reserve_time: tableForm.time,
          comment: tableForm.comment
        })
      });
      const data = await res.json();
      if (!res.ok) { setTableError(data.error || 'Ошибка бронирования'); return; }
      setTableStep('success');
    } catch (e: any) { setTableError(e.message); }
    finally { setTableLoading(false); }
  };

  const servicesByCategory = services.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, BanquetService[]>);

  return (
    <div className="bg-zinc-950 min-h-screen text-white pt-20">
      {/* Hero */}
      <div className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/banquet.jpg" alt="Мероприятия" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 to-zinc-950" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-orange-400 text-sm font-medium tracking-[0.3em] uppercase mb-4">Банкеты и мероприятия</p>
            <h1 className="text-5xl md:text-6xl font-black mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Ваш праздник<br />в наших руках
            </h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto mb-10">
              Три пакета на выбор · Живая музыка и DJ · До 200 гостей
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => setShowTableMap(true)}
                className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2">
                <MapPin size={20} /> Забронировать стол
              </button>
              <a href="#banquet"
                className="px-8 py-4 border border-white/20 hover:border-orange-500 text-white font-medium rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2">
                <Calendar size={20} /> Заказать банкет
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* DISCO INFO */}
      <AnimatedSection>
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative rounded-3xl overflow-hidden">
              <img src="/images/disco.jpg" alt="Дискотека" className="w-full h-56 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                <div>
                  <div className="flex items-center gap-2 text-orange-400 mb-2">
                    <Music size={20} />
                    <span className="text-sm font-medium tracking-widest uppercase">Каждую пятницу и субботу</span>
                  </div>
                  <h3 className="text-2xl font-black">Дискотека & DJ</h3>
                  <p className="text-white/60 text-sm mt-1">Живая музыка, танцпол, атмосфера праздника</p>
                </div>
              </div>
            </div>
            <div className="bg-zinc-900 rounded-3xl p-8 border border-white/10">
              <Sparkles className="text-orange-400 mb-4" size={32} />
              <h3 className="text-2xl font-black mb-3">Дополнительные услуги</h3>
              <ul className="space-y-2 text-white/70 text-sm">
                {['🎊 Ростовые куклы и аниматоры', '🎆 Профессиональный салют', '💐 Свадебный декор', '🎵 Живая музыка и DJ', '🎂 Торты на заказ', '🫕 Шах-плов на большие компании', '🍽️ Кавказская кухня и традиции', '🎉 Ведущий церемонии', '🧸 Детская анимация', '🤡 Ростовые куклы', '🎁 Вендинговый аппарат'].map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* BANQUET PACKAGES */}
      <AnimatedSection>
        <div id="banquet" className="max-w-7xl mx-auto px-4 pb-16 scroll-mt-20">
          <div className="text-center mb-12">
            <p className="text-orange-400 text-sm font-medium tracking-widest uppercase mb-3">Банкетные пакеты</p>
            <h2 className="text-4xl font-black mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Выберите пакет</h2>
            <p className="text-white/50">Цена указана за одного гостя · В каждый пакет включены живая музыка и DJ</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {BANQUET_PACKAGES.map((p, i) => (
              <motion.button key={p.key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                onClick={() => setSelectedPackage(p.key)}
                className={`relative text-left rounded-3xl bg-gradient-to-b ${p.color} border-2 transition-all hover:scale-105 p-6 ${selectedPackage === p.key ? 'border-orange-500 shadow-lg shadow-orange-900/30' : 'border-white/10'}`}>
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap">
                    {p.badge}
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-2xl font-black text-white mb-1">{p.name}</h3>
                  <p className="text-3xl font-black" style={{ color: p.accent }}>{p.price.toLocaleString('ru-RU')}₽</p>
                  <p className="text-white/40 text-sm">с человека</p>
                </div>
                <ul className="space-y-2">
                  {p.includes.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-white/70">
                      <Check size={14} className="mt-0.5 shrink-0 text-green-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                {selectedPackage === p.key && (
                  <div className="mt-4 text-center text-orange-400 text-sm font-bold">✓ Выбран</div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Calculator */}
          {step === 'success' ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 rounded-3xl p-12 text-center border border-green-500/30">
              <div className="text-6xl mb-6">🎉</div>
              <h3 className="text-3xl font-black mb-4">Заявка принята!</h3>
              <p className="text-white/60 mb-8">Мы свяжемся с вами в ближайшее время</p>
              <button onClick={() => { setStep('main'); setForm({ name: '', phone: '', email: '', date: '', time: '18:00', comment: '', occasion: '' }); }}
                className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
                Новая заявка
              </button>
            </motion.div>
          ) : (
            <div className="bg-zinc-900 rounded-3xl border border-white/10 overflow-hidden">
              {/* Guests */}
              <div className="p-6 md:p-8 border-b border-white/10">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Users size={20} className="text-orange-400" /> Количество гостей</h3>
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
                  {[10, 20, 30, 50, 80, 100, 150, 200].map(n => (
                    <button key={n} onClick={() => setGuests(n)} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${guests === n ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>{n}</button>
                  ))}
                </div>
              </div>

              {/* Extra services */}
              {Object.keys(servicesByCategory).length > 0 && (
                <div className="p-6 md:p-8 border-b border-white/10">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Sparkles size={20} className="text-orange-400" /> Дополнительные услуги</h3>
                  {Object.entries(servicesByCategory).map(([cat, catServices]) => (
                    <div key={cat} className="mb-6">
                      <p className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">{cat}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {catServices.map(service => (
                          <button key={service.id} onClick={() => toggleService(service.id)}
                            className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${selectedServices.includes(service.id) ? 'bg-orange-600/20 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-white/70 hover:border-orange-500/30'}`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${selectedServices.includes(service.id) ? 'bg-orange-500 border-orange-500' : 'border-white/30'}`}>
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
              )}

              {/* Total & Form */}
              <div className="p-6 md:p-8 bg-gradient-to-r from-orange-900/10 to-zinc-900">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-white/50 text-sm mb-1">Примерная стоимость</p>
                    <p className="text-4xl font-black text-orange-400">от {total.toLocaleString('ru-RU')}₽</p>
                    <p className="text-white/30 text-xs mt-1">Пакет «{pkg.name}»: {pkg.price}₽ × {guests} = {baseTotal.toLocaleString('ru-RU')}₽</p>
                  </div>
                  {step === 'main' && (
                    <button onClick={() => setStep('form')}
                      className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all hover:scale-105 flex items-center gap-2">
                      <Calendar size={20} /> Оставить заявку
                    </button>
                  )}
                </div>

                {step === 'form' && (
                  <form onSubmit={submitBanquet} className="space-y-4">
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
                        <span className="text-white/60 text-sm">Повод (необязательно)</span>
                        <input value={form.occasion} onChange={e => setForm({ ...form, occasion: e.target.value })}
                          className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                          placeholder="День рождения, свадьба, корпоратив..." />
                      </label>
                      <label className="block">
                        <span className="text-white/60 text-sm">Email</span>
                        <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                          className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                          placeholder="email@example.com" type="email" />
                      </label>
                      <label className="block">
                        <span className="text-white/60 text-sm">Дата *</span>
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
                    </div>
                    <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 resize-none"
                      rows={3} placeholder="Пожелания, особые требования..." />
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setStep('main')} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">Назад</button>
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

      {/* TABLE BOOKING MODAL */}
      <AnimatePresence>
        {showTableMap && (
          <>
            {tableStep === 'datetime' && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" onClick={() => setShowTableMap(false)} />
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-zinc-900 rounded-3xl border border-white/10 z-50 p-6 overflow-y-auto">
                  <h2 className="text-2xl font-black mb-6">📅 Выберите дату и время</h2>
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-white/60 text-sm">Дата посещения *</span>
                      <input value={tableForm.date} onChange={e => setTableForm({ ...tableForm, date: e.target.value })}
                        className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                        type="date" min={new Date().toISOString().split('T')[0]} required />
                    </label>
                    <label className="block">
                      <span className="text-white/60 text-sm">Время *</span>
                      <input value={tableForm.time} onChange={e => setTableForm({ ...tableForm, time: e.target.value })}
                        className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                        type="time" />
                    </label>
                    <label className="block">
                      <span className="text-white/60 text-sm">Количество гостей</span>
                      <input value={tableForm.guests} onChange={e => setTableForm({ ...tableForm, guests: Number(e.target.value) })}
                        className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                        type="number" min={1} max={20} />
                    </label>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowTableMap(false)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">Отмена</button>
                    <button onClick={() => { if (!tableForm.date) return; setTableStep('map'); }}
                      disabled={!tableForm.date}
                      className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                      Выбрать стол <ChevronRight size={18} />
                    </button>
                  </div>
                </motion.div>
              </>
            )}

            {tableStep === 'map' && (
              <TableMap
                selectedDate={tableForm.date}
                selectedTime={tableForm.time}
                onClose={() => { setTableStep('datetime'); setSelectedTable(null); }}
                onBook={(num) => { setSelectedTable(num); setTableStep('form'); }}
              />
            )}

            {tableStep === 'form' && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" />
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-zinc-900 rounded-3xl border border-white/10 z-50 p-6 overflow-y-auto max-h-[90vh]">
                  <h2 className="text-2xl font-black mb-2">🪑 Бронирование стола</h2>
                  <div className="bg-orange-600/20 border border-orange-500/30 rounded-xl p-3 mb-6 text-sm text-orange-300">
                    Стол №{selectedTable} · {tableForm.date && new Date(tableForm.date).toLocaleDateString('ru-RU')} · {tableForm.time} · {tableForm.guests} гостей
                  </div>
                  <div className="space-y-4">
                    <label className="block">
                      <span className="text-white/60 text-sm">Ваше имя *</span>
                      <input value={tableForm.name} onChange={e => setTableForm({ ...tableForm, name: e.target.value })}
                        className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                        placeholder="Имя" required />
                    </label>
                    <label className="block">
                      <span className="text-white/60 text-sm">Телефон *</span>
                      <input value={tableForm.phone} onChange={e => setTableForm({ ...tableForm, phone: e.target.value })}
                        className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                        placeholder="+7 (___) ___-__-__" type="tel" required />
                    </label>
                    <label className="block">
                      <span className="text-white/60 text-sm">Пожелания</span>
                      <textarea value={tableForm.comment} onChange={e => setTableForm({ ...tableForm, comment: e.target.value })}
                        className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 resize-none"
                        rows={2} placeholder="Особые пожелания..." />
                    </label>
                  </div>
                  {tableError && <p className="text-red-400 text-sm mt-3">{tableError}</p>}
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setTableStep('map')} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">← Назад</button>
                    <button onClick={submitTableBooking} disabled={tableLoading}
                      className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
                      {tableLoading ? 'Бронируем...' : 'Подтвердить'}
                    </button>
                  </div>
                </motion.div>
              </>
            )}

            {tableStep === 'success' && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" />
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-sm bg-zinc-900 rounded-3xl border border-green-500/30 z-50 p-8 text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-black mb-2 text-white">Стол забронирован!</h3>
                  <p className="text-white/60 mb-2">Стол №{selectedTable} · {tableForm.date && new Date(tableForm.date).toLocaleDateString('ru-RU')} в {tableForm.time}</p>
                  <p className="text-white/40 text-sm mb-6">Мы позвоним вам для подтверждения</p>
                  <button onClick={() => { setShowTableMap(false); setTableStep('datetime'); setSelectedTable(null); setTableForm({ name: '', phone: '', guests: 2, date: '', time: '19:00', comment: '' }); }}
                    className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
                    Закрыть
                  </button>
                </motion.div>
              </>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
