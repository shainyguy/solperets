import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Calendar, Music, Sparkles, Plus, Minus, Check } from 'lucide-react';

interface BanquetService {
  id: number;
  name: string;
  description: string;
  price: number;
  price_type: string;
  category: string;
  icon: string;
}

const EVENT_TYPES = [
  { key: 'birthday', label: 'День рождения', icon: '🎂' },
  { key: 'corporate', label: 'Корпоратив', icon: '💼' },
  { key: 'wedding', label: 'Свадьба', icon: '💍' },
  { key: 'memorial', label: 'Поминки', icon: '🕯️' },
  { key: 'graduation', label: 'Выпускной', icon: '🎓' },
  { key: 'anniversary', label: 'Юбилей', icon: '🥂' },
  { key: 'other', label: 'Другое', icon: '🎉' },
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
  const [eventType, setEventType] = useState('birthday');
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', time: '18:00', comment: '' });
  const [step, setStep] = useState<'calc' | 'form' | 'success'>('calc');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/banquet-services').then(r => r.json()).then(d => setServices(Array.isArray(d) ? d : []));
  }, []);

  const BASE_PRICE_PER_PERSON = 1500;
  const baseTotal = guests * BASE_PRICE_PER_PERSON;
  const servicesTotal = services.filter(s => selectedServices.includes(s.id)).reduce((sum, s) => {
    if (s.price_type === 'per_person') return sum + s.price * guests;
    return sum + s.price;
  }, 0);
  const total = baseTotal + servicesTotal;

  const toggleService = (id: number) => {
    setSelectedServices(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date) { setError('Заполните обязательные поля'); return; }
    setLoading(true);
    setError('');
    try {
      const selectedServiceNames = services.filter(s => selectedServices.includes(s.id)).map(s => s.name);
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          customer_phone: form.phone,
          customer_email: form.email,
          event_type: EVENT_TYPES.find(e => e.key === eventType)?.label || eventType,
          event_date: form.date,
          event_time: form.time,
          guests_count: guests,
          extra_services: selectedServiceNames,
          total_estimate: total,
          comment: form.comment
        })
      });
      if (!res.ok) throw new Error('Ошибка отправки');
      setStep('success');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
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
              Организуем любые мероприятия — от интимных ужинов до масштабных торжеств
            </p>
          </motion.div>
        </div>
      </div>

      {/* Event types */}
      <AnimatedSection>
        <div className="max-w-7xl mx-auto px-4 pb-16">
          <h2 className="text-3xl font-black text-center mb-10" style={{ fontFamily: 'Playfair Display, serif' }}>Типы мероприятий</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {EVENT_TYPES.map((type, i) => (
              <motion.button key={type.key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                onClick={() => setEventType(type.key)}
                className={`p-4 rounded-2xl border text-center transition-all hover:scale-105 ${eventType === type.key ? 'bg-orange-600/20 border-orange-500 text-orange-400' : 'bg-zinc-900 border-white/10 text-white/70 hover:border-orange-500/30'}`}>
                <div className="text-3xl mb-2">{type.icon}</div>
                <p className="text-xs font-medium">{type.label}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* DISCO */}
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
              <h3 className="text-2xl font-black mb-3">Развлекательные программы</h3>
              <ul className="space-y-3">
                {['🎊 Ростовые куклы и аниматоры', '🎆 Профессиональный салют', '💐 Свадебный декор', '🎵 Живая музыка и DJ', '🎂 Торты на заказ', '🫕 Шах-плов на большие компании', '🍽️ Кавказская кухня и традиции'].map((item, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                    className="flex items-center gap-3 text-white/70 text-sm">
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* CALCULATOR */}
      <AnimatedSection>
        <div className="max-w-4xl mx-auto px-4 pb-20">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Калькулятор банкета</h2>
            <p className="text-white/50">Рассчитайте стоимость вашего мероприятия</p>
          </div>

          {step === 'success' ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 rounded-3xl p-12 text-center border border-green-500/30">
              <div className="text-6xl mb-6">🎉</div>
              <h3 className="text-3xl font-black mb-4">Заявка принята!</h3>
              <p className="text-white/60 mb-8">Мы свяжемся с вами в ближайшее время для уточнения деталей</p>
              <button onClick={() => { setStep('calc'); setForm({ name: '', phone: '', email: '', date: '', time: '18:00', comment: '' }); }}
                className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
                Новая заявка
              </button>
            </motion.div>
          ) : (
            <div className="bg-zinc-900 rounded-3xl border border-white/10 overflow-hidden">
              {/* Guests */}
              <div className="p-6 md:p-8 border-b border-white/10">
                <h3 className="text-lg font-bold mb-4">Количество гостей</h3>
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
                  {[10, 20, 30, 50, 100, 150, 200].map(n => (
                    <button key={n} onClick={() => setGuests(n)} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${guests === n ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>{n}</button>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div className="p-6 md:p-8 border-b border-white/10">
                <h3 className="text-lg font-bold mb-6">Дополнительные услуги</h3>
                {Object.entries(servicesByCategory).map(([cat, catServices]) => (
                  <div key={cat} className="mb-6">
                    <p className="text-orange-400 text-sm font-medium uppercase tracking-wider mb-3">{cat}</p>
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
                              {service.price}₽{service.price_type === 'per_person' ? '/чел' : ''}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="p-6 md:p-8 bg-gradient-to-r from-orange-900/20 to-zinc-900">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-white/50 text-sm mb-1">Примерная стоимость</p>
                    <p className="text-4xl font-black text-orange-400">от {total.toLocaleString('ru-RU')}₽</p>
                    <p className="text-white/30 text-xs mt-1">Базовая стоимость: {BASE_PRICE_PER_PERSON}₽/чел × {guests} = {baseTotal.toLocaleString('ru-RU')}₽</p>
                  </div>
                  {step === 'calc' && (
                    <button onClick={() => setStep('form')} className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all hover:scale-105 flex items-center gap-2">
                      <Calendar size={20} /> Забронировать
                    </button>
                  )}
                </div>

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
                        <span className="text-white/60 text-sm">Email</span>
                        <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                          className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                          placeholder="email@example.com" type="email" />
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
                    </div>
                    <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 resize-none"
                      rows={3} placeholder="Дополнительные пожелания..." />
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setStep('calc')} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
                        Назад
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
    </div>
  );
}
