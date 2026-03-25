import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plus, Minus, Check, Phone, Send, Users } from 'lucide-react';

interface BanquetService {
  id: number;
  name: string;
  description: string;
  price: number;
  price_type: string;
  category: string;
  icon: string;
}

// ─── Пакеты банкета ─────────────────────────────────────────────────────────

const PACKAGES = [
  {
    key: 'econom',
    name: 'Эконом',
    price: 3000,
    color: 'from-zinc-800 to-zinc-900',
    border: 'border-white/10',
    badge: '',
    includes: [
      'Холодные закуски: чабан салат, оливье, мимоза',
      'Горячее на выбор: отбивная (свинина / говядина / курица)',
      'Садж на выбор: цыплёнок / баранина / говядина / свинина',
      'Шашлык на выбор: курица / свинина',
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
    border: 'border-orange-500/30',
    badge: '⭐ Популярный',
    includes: [
      'Всё из пакета Эконом',
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
    border: 'border-yellow-500/30',
    badge: '👑 Премиум',
    includes: [
      'Всё из пакета Стандарт',
      '+ Шах-плов',
      '+ Шашлык из баранины на выбор',
      '+ Натуральный сок',
      '🎵 Живая музыка и DJ',
    ],
  },
];

// ─── Схема зала ──────────────────────────────────────────────────────────────

const TABLES = [
  // Левая сторона (5 столов)
  { id: 1,  x: 4,  y: 15, w: 14, h: 9, seats: 4, zone: 'left' },
  { id: 2,  x: 4,  y: 27, w: 14, h: 9, seats: 4, zone: 'left' },
  { id: 3,  x: 4,  y: 39, w: 14, h: 9, seats: 4, zone: 'left' },
  { id: 4,  x: 4,  y: 51, w: 14, h: 9, seats: 4, zone: 'left' },
  { id: 5,  x: 4,  y: 63, w: 14, h: 9, seats: 4, zone: 'left' },
  // Верхние (2 стола)
  { id: 6,  x: 30, y: 4,  w: 14, h: 8, seats: 6, zone: 'top' },
  { id: 7,  x: 52, y: 4,  w: 14, h: 8, seats: 6, zone: 'top' },
  // Правая сторона — бар + большой стол
  { id: 8,  x: 82, y: 4,  w: 14, h: 30, seats: 0, zone: 'bar', label: 'БАР' },
  { id: 9,  x: 82, y: 40, w: 14, h: 20, seats: 10, zone: 'right' },
  // Нижние (3 стола)
  { id: 10, x: 22, y: 83, w: 14, h: 9, seats: 4, zone: 'bottom' },
  { id: 11, x: 40, y: 83, w: 14, h: 9, seats: 4, zone: 'bottom' },
  { id: 12, x: 58, y: 83, w: 14, h: 9, seats: 4, zone: 'bottom' },
  // Центр (5 столов)
  { id: 13, x: 26, y: 22, w: 12, h: 8, seats: 4, zone: 'center' },
  { id: 14, x: 42, y: 22, w: 12, h: 8, seats: 4, zone: 'center' },
  { id: 15, x: 58, y: 22, w: 12, h: 8, seats: 4, zone: 'center' },
  { id: 16, x: 34, y: 55, w: 12, h: 8, seats: 4, zone: 'center' },
  { id: 17, x: 50, y: 55, w: 12, h: 8, seats: 4, zone: 'center' },
];

const ZONE_COLORS: Record<string, string> = {
  left:   '#d97706',
  top:    '#7c3aed',
  right:  '#dc2626',
  bottom: '#059669',
  center: '#0891b2',
  bar:    '#374151',
};

export default function EventsPage() {
  const [services, setServices] = useState<BanquetService[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>('standard');
  const [guests, setGuests] = useState(30);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [step, setStep] = useState<'packages' | 'calc' | 'table' | 'form' | 'success'>('packages');
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', time: '18:00', occasion: '', comment: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/banquet-services').then(r => r.json()).then(d => setServices(Array.isArray(d) ? d : []));
  }, []);

  const pkg = PACKAGES.find(p => p.key === selectedPackage)!;
  const pkgTotal = pkg.price * guests;
  const servicesTotal = services.filter(s => selectedServices.includes(s.id)).reduce((sum, s) => {
    return sum + (s.price_type === 'per_person' ? s.price * guests : s.price);
  }, 0);
  const total = pkgTotal + servicesTotal;

  const toggleService = (id: number) => setSelectedServices(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date) { setError('Заполните обязательные поля'); return; }
    setLoading(true); setError('');
    try {
      const selectedServiceNames = services.filter(s => selectedServices.includes(s.id)).map(s => s.name);
      const tableInfo = selectedTable ? `Стол №${selectedTable}` : 'Не выбран';
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          customer_phone: form.phone,
          customer_email: form.email,
          event_type: `${pkg.name} пакет${form.occasion ? ' — ' + form.occasion : ''}`,
          event_date: form.date,
          event_time: form.time,
          guests_count: guests,
          extra_services: [`Пакет: ${pkg.name} (${pkg.price}₽/чел)`, `Стол: ${tableInfo}`, ...selectedServiceNames],
          total_estimate: total,
          comment: form.comment
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
      <div className="relative py-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/banquet.jpg" alt="Банкеты" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 to-zinc-950" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-orange-400 text-sm font-medium tracking-[0.3em] uppercase mb-3">Банкеты и мероприятия</p>
            <h1 className="text-4xl md:text-6xl font-black mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Ваш праздник</h1>
            <p className="text-white/50 text-base max-w-xl mx-auto">Дни рождения, свадьбы, корпоративы, поминки — организуем любое мероприятие</p>
          </motion.div>
        </div>
      </div>

      {/* DISCO */}
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="bg-gradient-to-r from-purple-900/30 to-zinc-900 rounded-2xl p-5 border border-purple-500/20 flex flex-col sm:flex-row items-center gap-4">
          <div className="text-3xl">🎵</div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-white font-bold">Каждую пятницу и субботу — дискотека и DJ!</p>
            <p className="text-white/50 text-sm">Живая музыка, танцпол, атмосфера праздника. В каждый банкетный пакет входит DJ.</p>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="px-3 py-1.5 bg-purple-600/30 text-purple-300 rounded-full border border-purple-500/30">Пт</span>
            <span className="px-3 py-1.5 bg-purple-600/30 text-purple-300 rounded-full border border-purple-500/30">Сб</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-20">

        {/* SUCCESS */}
        {step === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 rounded-3xl p-12 text-center border border-green-500/30">
            <div className="text-6xl mb-6">🎉</div>
            <h3 className="text-3xl font-black mb-4">Заявка принята!</h3>
            <p className="text-white/60 mb-8">Мы свяжемся с вами в ближайшее время для уточнения деталей</p>
            <button onClick={() => { setStep('packages'); setForm({ name: '', phone: '', email: '', date: '', time: '18:00', occasion: '', comment: '' }); setSelectedTable(null); }}
              className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
              Новая заявка
            </button>
          </motion.div>
        )}

        {/* STEP 1: PACKAGES */}
        {step === 'packages' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-3xl font-black text-center mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>Выберите пакет банкета</h2>
            <div className="grid md:grid-cols-3 gap-5 mb-8">
              {PACKAGES.map((p, i) => (
                <motion.button key={p.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedPackage(p.key)}
                  className={`bg-gradient-to-b ${p.color} rounded-2xl p-6 border text-left transition-all hover:scale-105 ${selectedPackage === p.key ? p.border + ' ring-2 ring-orange-500/50' : p.border}`}>
                  {p.badge && <span className="text-xs font-bold text-orange-400 mb-3 block">{p.badge}</span>}
                  <h3 className="text-2xl font-black mb-1">{p.name}</h3>
                  <p className="text-3xl font-black text-orange-400 mb-4">{p.price.toLocaleString('ru-RU')}₽<span className="text-sm text-white/40 font-normal">/чел</span></p>
                  <ul className="space-y-1.5">
                    {p.includes.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-white/70">
                        <Check size={14} className="text-green-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.button>
              ))}
            </div>
            <div className="text-center">
              <button onClick={() => setStep('calc')} className="px-10 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all hover:scale-105 text-lg">
                Далее — Калькулятор →
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: CALC */}
        {step === 'calc' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep('packages')} className="text-white/40 hover:text-white transition-colors text-sm">← Назад</button>
              <h2 className="text-2xl font-black" style={{ fontFamily: 'Playfair Display, serif' }}>Калькулятор банкета</h2>
            </div>

            <div className="bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden mb-6">
              {/* Selected package */}
              <div className={`p-5 bg-gradient-to-r ${pkg.color} border-b border-white/10`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/50 text-sm">Выбранный пакет</p>
                    <p className="text-xl font-black">{pkg.name} — {pkg.price.toLocaleString('ru-RU')}₽/чел</p>
                  </div>
                  <button onClick={() => setStep('packages')} className="text-white/40 hover:text-orange-400 transition-colors text-sm">Изменить</button>
                </div>
              </div>

              {/* Guests */}
              <div className="p-5 border-b border-white/10">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Users size={18} className="text-orange-400" /> Количество гостей</h3>
                <div className="flex items-center gap-5">
                  <button onClick={() => setGuests(Math.max(10, guests - 5))} className="w-10 h-10 rounded-full bg-white/10 hover:bg-orange-600 flex items-center justify-center transition-colors"><Minus size={18} /></button>
                  <div className="text-center"><span className="text-4xl font-black text-orange-400">{guests}</span><p className="text-white/40 text-xs">человек</p></div>
                  <button onClick={() => setGuests(Math.min(300, guests + 5))} className="w-10 h-10 rounded-full bg-white/10 hover:bg-orange-600 flex items-center justify-center transition-colors"><Plus size={18} /></button>
                  <div className="flex gap-2 flex-wrap">
                    {[10, 20, 30, 50, 100, 150].map(n => (
                      <button key={n} onClick={() => setGuests(n)} className={`px-3 py-1 rounded-lg text-xs transition-colors ${guests === n ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Extra services */}
              {Object.keys(servicesByCategory).length > 0 && (
                <div className="p-5 border-b border-white/10">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><Sparkles size={18} className="text-orange-400" /> Дополнительные услуги</h3>
                  {Object.entries(servicesByCategory).map(([cat, catServices]) => (
                    <div key={cat} className="mb-4">
                      <p className="text-orange-400 text-xs font-medium uppercase tracking-wider mb-2">{cat}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {catServices.map(service => (
                          <button key={service.id} onClick={() => toggleService(service.id)}
                            className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${selectedServices.includes(service.id) ? 'bg-orange-600/20 border-orange-500' : 'bg-white/5 border-white/10 hover:border-orange-500/30'}`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${selectedServices.includes(service.id) ? 'bg-orange-500 border-orange-500' : 'border-white/30'}`}>
                              {selectedServices.includes(service.id) && <Check size={11} className="text-white" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{service.icon} {service.name}</p>
                              <p className="text-xs text-white/40">{service.description}</p>
                              <p className="text-orange-400 text-sm font-bold">{service.price}₽{service.price_type === 'per_person' ? '/чел' : ''}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="p-5 bg-gradient-to-r from-orange-900/20 to-zinc-900">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/50 text-sm">Пакет {pkg.name}: {pkg.price}₽ × {guests} чел</span>
                  <span className="text-white">{pkgTotal.toLocaleString('ru-RU')}₽</span>
                </div>
                {servicesTotal > 0 && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/50 text-sm">Доп. услуги</span>
                    <span className="text-white">{servicesTotal.toLocaleString('ru-RU')}₽</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-white font-bold">Итого (примерно)</span>
                  <span className="text-3xl font-black text-orange-400">~{total.toLocaleString('ru-RU')}₽</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button onClick={() => setStep('table')} className="px-10 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all hover:scale-105 text-lg">
                Выбрать стол →
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: TABLE */}
        {step === 'table' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep('calc')} className="text-white/40 hover:text-white transition-colors text-sm">← Назад</button>
              <h2 className="text-2xl font-black" style={{ fontFamily: 'Playfair Display, serif' }}>Выберите стол</h2>
            </div>

            <div className="bg-zinc-900 rounded-2xl border border-white/10 p-4 mb-6">
              <p className="text-white/50 text-sm mb-4 text-center">Нажмите на стол чтобы выбрать его. Нажмите снова чтобы отменить выбор.</p>

              {/* Схема зала */}
              <div className="relative w-full bg-zinc-800 rounded-xl overflow-hidden" style={{ paddingBottom: '65%' }}>
                <svg viewBox="0 0 100 65" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  {/* Walls */}
                  <rect x="1" y="1" width="98" height="63" rx="2" fill="none" stroke="#374151" strokeWidth="0.5" />
                  {/* Entrance */}
                  <rect x="44" y="62" width="12" height="2" fill="#1f2937" />
                  <text x="50" y="64.5" textAnchor="middle" fontSize="2" fill="#6b7280">ВХОД</text>

                  {TABLES.map(table => {
                    const isSelected = selectedTable === table.id;
                    const isBar = table.zone === 'bar';
                    const color = ZONE_COLORS[table.zone];
                    return (
                      <g key={table.id} onClick={() => !isBar && setSelectedTable(isSelected ? null : table.id)}
                        style={{ cursor: isBar ? 'default' : 'pointer' }}>
                        <rect x={table.x} y={table.y} width={table.w} height={table.h} rx="1.5"
                          fill={isSelected ? '#ea580c' : isBar ? '#1f2937' : color + '33'}
                          stroke={isSelected ? '#f97316' : color}
                          strokeWidth={isSelected ? '0.8' : '0.4'}
                          opacity={isBar ? 0.8 : 1}
                        />
                        {isBar ? (
                          <text x={table.x + table.w / 2} y={table.y + table.h / 2} textAnchor="middle" dominantBaseline="middle" fontSize="2.5" fill="#6b7280" fontWeight="bold">БАР</text>
                        ) : (
                          <>
                            <text x={table.x + table.w / 2} y={table.y + table.h / 2 - 1} textAnchor="middle" dominantBaseline="middle" fontSize="2.5" fill={isSelected ? 'white' : '#e5e7eb'} fontWeight="bold">
                              №{table.id}
                            </text>
                            <text x={table.x + table.w / 2} y={table.y + table.h / 2 + 2} textAnchor="middle" dominantBaseline="middle" fontSize="1.8" fill={isSelected ? '#fed7aa' : '#9ca3af'}>
                              {table.seats} мест
                            </text>
                          </>
                        )}
                        {isSelected && (
                          <text x={table.x + table.w - 1} y={table.y + 2} textAnchor="middle" fontSize="2.5" fill="white">✓</text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {Object.entries({ left: 'Левая сторона', top: 'Верхние', right: 'Правый стол', bottom: 'Нижние', center: 'Центр', bar: 'Бар' }).map(([zone, label]) => (
                  <div key={zone} className="flex items-center gap-1.5 text-xs text-white/50">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: ZONE_COLORS[zone] + '80', border: `1px solid ${ZONE_COLORS[zone]}` }} />
                    {label}
                  </div>
                ))}
              </div>

              {selectedTable && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-orange-600/20 border border-orange-500/30 rounded-xl text-center">
                  <p className="text-orange-400 font-bold">Выбран стол №{selectedTable}</p>
                  <p className="text-white/50 text-sm">Мест: {TABLES.find(t => t.id === selectedTable)?.seats}</p>
                </motion.div>
              )}
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep('form')} className="flex-1 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
                {selectedTable ? `Продолжить со столом №${selectedTable}` : 'Продолжить без выбора стола'}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: FORM */}
        {step === 'form' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep('table')} className="text-white/40 hover:text-white transition-colors text-sm">← Назад</button>
              <h2 className="text-2xl font-black" style={{ fontFamily: 'Playfair Display, serif' }}>Оформление заявки</h2>
            </div>

            {/* Summary */}
            <div className="bg-zinc-900 rounded-2xl border border-white/10 p-5 mb-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div><p className="text-white/40 text-xs">Пакет</p><p className="text-white font-bold">{pkg.name}</p></div>
                <div><p className="text-white/40 text-xs">Гостей</p><p className="text-white font-bold">{guests}</p></div>
                <div><p className="text-white/40 text-xs">Стол</p><p className="text-white font-bold">{selectedTable ? `№${selectedTable}` : 'Не выбран'}</p></div>
                <div><p className="text-white/40 text-xs">Сумма</p><p className="text-orange-400 font-black">~{total.toLocaleString('ru-RU')}₽</p></div>
              </div>
            </div>

            <form onSubmit={submitBooking} className="bg-zinc-900 rounded-2xl border border-white/10 p-6 space-y-4">
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
                  <span className="text-white/60 text-sm">Повод (необязательно)</span>
                  <input value={form.occasion} onChange={e => setForm({ ...form, occasion: e.target.value })}
                    className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                    placeholder="День рождения, свадьба, корпоратив..." />
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
                rows={3} placeholder="Дополнительные пожелания..." />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep('table')} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">Назад</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Send size={18} /> {loading ? 'Отправка...' : 'Отправить заявку'}
                </button>
              </div>
              <div className="flex gap-4 pt-2">
                <a href="tel:+79257677778" className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/10 hover:border-orange-500/50 text-white/60 hover:text-white rounded-xl transition-colors text-sm">
                  <Phone size={16} /> Позвонить нам
                </a>
              </div>
            </form>
          </motion.div>
        )}

      </div>
    </div>
  );
}
