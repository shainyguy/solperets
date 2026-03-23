import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Music, Sparkles, Plus, Minus, Check, ChevronRight, X, Clock, Users, Info } from 'lucide-react';

// ─── Пакеты банкета ───────────────────────────────────────────────────────────
const PACKAGES = [
  {
    key: 'econom', name: 'Эконом', price: 3000,
    color: 'from-zinc-800 to-zinc-900', accent: 'border-zinc-500', badge: '',
    includes: [
      'Чобан салат, Оливье, Мимоза',
      'Горячее: отбивная (свинина / говядина / курица)',
      'Садж на выбор: цыплёнок / баранина / говядина / свинина',
      'Шашлык на выбор: курица / свинина',
      'Напитки: морс / лимонад / вода',
      'Хлебная корзинка',
      '🎵 Живая музыка и DJ',
    ],
  },
  {
    key: 'standard', name: 'Стандарт', price: 4000,
    color: 'from-orange-900/40 to-zinc-900', accent: 'border-orange-500', badge: '⭐ Популярный',
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
    key: 'premium', name: 'Премиум', price: 5000,
    color: 'from-yellow-900/30 to-zinc-900', accent: 'border-yellow-500', badge: '👑 Лучший выбор',
    includes: [
      'Всё из пакета Стандарт',
      'Шах-плов',
      'Шашлык из баранины на выбор',
      'Натуральный сок',
      '🎵 Живая музыка и DJ',
    ],
  },
];

// ─── Схема зала ───────────────────────────────────────────────────────────────
const TABLES = [
  // Левая сторона — 5 столов у окна
  { id: 1,  label: '1',   zone: 'left',   seats: 4,  x: 6,  y: 20 },
  { id: 2,  label: '2',   zone: 'left',   seats: 4,  x: 6,  y: 33 },
  { id: 3,  label: '3',   zone: 'left',   seats: 4,  x: 6,  y: 46 },
  { id: 4,  label: '4',   zone: 'left',   seats: 4,  x: 6,  y: 59 },
  { id: 5,  label: '5',   zone: 'left',   seats: 4,  x: 6,  y: 72 },
  // Верхняя сторона — 2 стола у сцены
  { id: 6,  label: '6',   zone: 'top',    seats: 6,  x: 30, y: 6  },
  { id: 7,  label: '7',   zone: 'top',    seats: 6,  x: 50, y: 6  },
  // Правая сторона — бар + большой стол
  { id: 8,  label: 'Бар', zone: 'bar',    seats: 8,  x: 86, y: 20 },
  { id: 9,  label: '9',   zone: 'right',  seats: 12, x: 86, y: 52 },
  // Нижняя сторона — 3 стола
  { id: 10, label: '10',  zone: 'bottom', seats: 6,  x: 22, y: 88 },
  { id: 11, label: '11',  zone: 'bottom', seats: 6,  x: 42, y: 88 },
  { id: 12, label: '12',  zone: 'bottom', seats: 6,  x: 62, y: 88 },
  // Центр — 5 столов
  { id: 13, label: '13',  zone: 'center', seats: 4,  x: 28, y: 30 },
  { id: 14, label: '14',  zone: 'center', seats: 4,  x: 44, y: 30 },
  { id: 15, label: '15',  zone: 'center', seats: 4,  x: 60, y: 30 },
  { id: 16, label: '16',  zone: 'center', seats: 4,  x: 36, y: 56 },
  { id: 17, label: '17',  zone: 'center', seats: 4,  x: 52, y: 56 },
];

const ZONE_LABELS: Record<string, string> = {
  left: 'У окна', top: 'У сцены', bar: 'Барная зона',
  right: 'Большой стол', bottom: 'У выхода', center: 'Центр зала',
};

interface TableBooking {
  id: number;
  table_number: number;
  event_date: string;
  event_time: string;
  status: string;
  customer_name: string;
  guests_count: number;
}
interface BanquetService { id: number; name: string; description: string; price: number; price_type: string; category: string; icon: string; }

export default function EventsPage() {
  const [services, setServices] = useState<BanquetService[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [guests, setGuests] = useState(20);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [showTableModal, setShowTableModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [tableBookings, setTableBookings] = useState<TableBooking[]>([]);
  const [hoveredTable, setHoveredTable] = useState<number | null>(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [step, setStep] = useState<'packages' | 'form' | 'success'>('packages');
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: filterDate, time: '18:00', comment: '', occasion: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/banquet-services').then(r => r.json()).then(d => setServices(Array.isArray(d) ? d : []));
  }, []);

  const loadTableBookings = useCallback((date: string) => {
    fetch(`/api/table-bookings?date=${date}`)
      .then(r => r.json())
      .then(d => setTableBookings(Array.isArray(d) ? d : []))
      .catch(() => setTableBookings([]));
  }, []);

  useEffect(() => { loadTableBookings(filterDate); }, [filterDate, loadTableBookings]);

  // Получить бронь для конкретного стола
  const getTableBooking = (tableId: number) =>
    tableBookings.find(b => b.table_number === tableId);

  const pkg = PACKAGES.find(p => p.key === selectedPkg);
  const servicesTotal = services.filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + (s.price_type === 'per_person' ? s.price * guests : s.price), 0);
  const pkgTotal = pkg ? pkg.price * guests : 0;
  const total = pkgTotal + servicesTotal;

  const toggleService = (id: number) =>
    setSelectedServices(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date || !selectedPkg) { setError('Заполните все обязательные поля'); return; }
    setLoading(true); setError('');
    try {
      const selectedServiceNames = services.filter(s => selectedServices.includes(s.id)).map(s => s.name);
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_number:   selectedTable,
          customer_name:  form.name,
          customer_phone: form.phone,
          customer_email: form.email,
          event_type:     pkg?.name,
          occasion:       form.occasion,
          package_key:    selectedPkg,
          event_date:     form.date,
          event_time:     form.time,
          guests_count:   guests,
          extra_services: selectedServiceNames,
          total_estimate: total,
          comment:        form.comment,
        }),
      });
      if (!res.ok) throw new Error('Ошибка отправки');
      // Обновляем карту
      loadTableBookings(form.date);
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
              Выберите пакет, рассчитайте стоимость и забронируйте стол прямо сейчас
            </p>
          </motion.div>
        </div>
      </div>

      {/* Дискотека */}
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative rounded-2xl overflow-hidden">
            <img src="/images/disco.jpg" alt="Дискотека" className="w-full h-44 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-5">
              <div>
                <div className="flex items-center gap-2 text-orange-400 mb-1">
                  <Music size={18} />
                  <span className="text-sm font-medium uppercase tracking-wider">Каждую пятницу и субботу</span>
                </div>
                <h3 className="text-xl font-black">Дискотека & DJ</h3>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 flex flex-col justify-center">
            <Sparkles className="text-orange-400 mb-3" size={28} />
            <h3 className="text-lg font-bold mb-2">Развлечения на ваш праздник</h3>
            <ul className="space-y-1 text-white/60 text-sm">
              {['🎊 Ростовые куклы и аниматоры','🎆 Профессиональный салют','💐 Свадебный декор','🎵 Живая музыка и DJ — в каждом пакете','🎂 Торты на заказ','🫕 Шах-плов на большие компании','🍽️ Кавказская кухня'].map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {step === 'success' ? (
        <div className="max-w-xl mx-auto px-4 pb-20">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 rounded-3xl p-12 text-center border border-green-500/30">
            <div className="text-6xl mb-6">🎉</div>
            <h3 className="text-3xl font-black mb-4">Заявка принята!</h3>
            <p className="text-white/60 mb-2">Мы свяжемся с вами для подтверждения</p>
            {selectedTable && <p className="text-orange-400 mb-8">Стол №{selectedTable} забронирован на {form.date} в {form.time}</p>}
            <button onClick={() => {
              setStep('packages'); setSelectedPkg(null); setSelectedTable(null);
              setForm({ name:'', phone:'', email:'', date: filterDate, time:'18:00', comment:'', occasion:'' });
            }} className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
              Новая заявка
            </button>
          </motion.div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 pb-20 space-y-10">

          {/* Пакеты */}
          <div>
            <h2 className="text-3xl font-black text-center mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>Выберите пакет</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {PACKAGES.map((p, i) => (
                <motion.button key={p.key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                  onClick={() => setSelectedPkg(p.key === selectedPkg ? null : p.key)}
                  className={`relative text-left rounded-3xl border-2 overflow-hidden transition-all ${selectedPkg === p.key ? p.accent + ' scale-[1.02] shadow-2xl shadow-orange-900/30' : 'border-white/10 hover:border-white/30'}`}>
                  <div className={`bg-gradient-to-b ${p.color} p-6 h-full`}>
                    {p.badge && <span className="inline-block bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">{p.badge}</span>}
                    <h3 className="text-2xl font-black mb-1">{p.name}</h3>
                    <p className="text-3xl font-black text-orange-400 mb-4">{p.price.toLocaleString('ru-RU')}₽<span className="text-base text-white/40 font-normal">/чел</span></p>
                    <ul className="space-y-2">
                      {p.includes.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-white/70">
                          <Check size={14} className="text-green-400 mt-0.5 shrink-0" /><span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    {selectedPkg === p.key && (
                      <div className="absolute top-4 right-4 w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                        <Check size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Количество гостей */}
          <div className="bg-zinc-900 rounded-3xl p-6 md:p-8 border border-white/10">
            <h3 className="text-xl font-bold mb-6">Количество гостей</h3>
            <div className="flex items-center gap-6 mb-4">
              <button onClick={() => setGuests(Math.max(5, guests - 5))} className="w-12 h-12 rounded-full bg-white/10 hover:bg-orange-600 flex items-center justify-center transition-colors"><Minus size={20} /></button>
              <div className="text-center">
                <span className="text-5xl font-black text-orange-400">{guests}</span>
                <p className="text-white/40 text-sm">человек</p>
              </div>
              <button onClick={() => setGuests(Math.min(300, guests + 5))} className="w-12 h-12 rounded-full bg-white/10 hover:bg-orange-600 flex items-center justify-center transition-colors"><Plus size={20} /></button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[10,20,30,50,80,100,150,200].map(n => (
                <button key={n} onClick={() => setGuests(n)} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${guests===n?'bg-orange-600 text-white':'bg-white/10 text-white/60 hover:bg-white/20'}`}>{n}</button>
              ))}
            </div>
          </div>

          {/* Доп. услуги */}
          {Object.keys(servicesByCategory).length > 0 && (
            <div className="bg-zinc-900 rounded-3xl p-6 md:p-8 border border-white/10">
              <h3 className="text-xl font-bold mb-6">Дополнительные услуги</h3>
              {Object.entries(servicesByCategory).map(([cat, catServices]) => (
                <div key={cat} className="mb-6">
                  <p className="text-orange-400 text-xs font-semibold uppercase tracking-wider mb-3">{cat}</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {catServices.map(s => (
                      <button key={s.id} onClick={() => toggleService(s.id)}
                        className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${selectedServices.includes(s.id)?'bg-orange-600/20 border-orange-500 text-white':'bg-white/5 border-white/10 text-white/70 hover:border-orange-500/30'}`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${selectedServices.includes(s.id)?'bg-orange-500 border-orange-500':'border-white/30'}`}>
                          {selectedServices.includes(s.id) && <Check size={10} className="text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{s.icon} {s.name}</p>
                          <p className="text-xs text-white/40 mt-0.5">{s.description}</p>
                          <p className="text-orange-400 text-sm font-bold mt-1">{s.price.toLocaleString('ru-RU')}₽{s.price_type==='per_person'?'/чел':''}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Итого + форма */}
          <div className="bg-gradient-to-r from-orange-900/20 to-zinc-900 rounded-3xl p-6 md:p-8 border border-orange-500/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-white/50 text-sm mb-1">Примерная стоимость</p>
                <p className="text-4xl font-black text-orange-400">от {total.toLocaleString('ru-RU')}₽</p>
                {pkg && <p className="text-white/30 text-xs mt-1">{pkg.price.toLocaleString('ru-RU')}₽ × {guests} чел = {pkgTotal.toLocaleString('ru-RU')}₽ + доп. {servicesTotal.toLocaleString('ru-RU')}₽</p>}
              </div>
              {step === 'packages' && (
                <button onClick={() => { if (!selectedPkg) { setError('Выберите пакет'); return; } setError(''); setShowTableModal(true); }}
                  className="flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all hover:scale-105">
                  <Calendar size={20} /> Забронировать <ChevronRight size={18} />
                </button>
              )}
            </div>
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            {step === 'form' && (
              <form onSubmit={submitBooking} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-white/60 text-sm">Имя *</span>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500" placeholder="Ваше имя" required />
                  </label>
                  <label className="block">
                    <span className="text-white/60 text-sm">Телефон *</span>
                    <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500" placeholder="+7 (___) ___-__-__" type="tel" required />
                  </label>
                  <label className="block">
                    <span className="text-white/60 text-sm">Email</span>
                    <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500" placeholder="email@example.com" type="email" />
                  </label>
                  <label className="block">
                    <span className="text-white/60 text-sm">Повод</span>
                    <input value={form.occasion} onChange={e => setForm({...form, occasion: e.target.value})} className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500" placeholder="День рождения, свадьба..." />
                  </label>
                  <label className="block">
                    <span className="text-white/60 text-sm">Дата *</span>
                    <input value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500" type="date" required min={new Date().toISOString().split('T')[0]} />
                  </label>
                  <label className="block">
                    <span className="text-white/60 text-sm">Время</span>
                    <input value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500" type="time" />
                  </label>
                </div>
                {selectedTable ? (
                  <div className="flex items-center gap-3 p-3 bg-orange-600/20 rounded-xl border border-orange-500/30">
                    <Check size={18} className="text-orange-400" />
                    <span className="text-white text-sm font-medium">Стол №{selectedTable} · {TABLES.find(t=>t.id===selectedTable)?.seats} мест · {ZONE_LABELS[TABLES.find(t=>t.id===selectedTable)?.zone||'']}</span>
                    <button type="button" onClick={() => setShowTableModal(true)} className="ml-auto text-orange-400 text-xs underline">Изменить</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowTableModal(true)} className="w-full py-3 border border-dashed border-white/20 hover:border-orange-500 text-white/50 hover:text-white rounded-xl transition-colors text-sm">
                    + Выбрать стол на схеме
                  </button>
                )}
                <textarea value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 resize-none" rows={3} placeholder="Дополнительные пожелания..." />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep('packages')} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">Назад</button>
                  <button type="submit" disabled={loading} className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
                    {loading ? 'Отправка...' : 'Отправить заявку'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Модальное окно схемы столов ── */}
      <AnimatePresence>
        {showTableModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm" onClick={() => setShowTableModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-2 md:inset-6 lg:inset-12 bg-zinc-900 rounded-3xl z-50 flex flex-col overflow-hidden border border-white/10">

              {/* Шапка */}
              <div className="flex items-center justify-between p-4 md:p-5 border-b border-white/10 shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-white">Схема зала</h2>
                  <p className="text-white/40 text-sm">Выберите свободный стол</p>
                </div>
                {/* Фильтр по дате */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                    <Calendar size={16} className="text-orange-400" />
                    <input type="date" value={filterDate}
                      onChange={e => { setFilterDate(e.target.value); loadTableBookings(e.target.value); }}
                      className="bg-transparent text-white text-sm focus:outline-none w-32" />
                  </div>
                  <button onClick={() => setShowTableModal(false)} className="text-white/40 hover:text-white p-2"><X size={24} /></button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 md:p-6">
                {/* Схема зала */}
                <div className="relative w-full max-w-2xl mx-auto" style={{ paddingBottom: '70%' }}>
                  <div className="absolute inset-0 rounded-2xl border-2 border-white/10 bg-zinc-800/30 overflow-hidden">

                    {/* Зоны-подписи */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white/25 text-[10px] font-medium tracking-widest uppercase">🎤 Сцена / Вход</div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/25 text-[10px] font-medium tracking-widest uppercase">Выход</div>
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 text-white/20 text-[9px]" style={{ writingMode: 'vertical-rl', transform: 'translateY(-50%) rotate(180deg)' }}>🪟 Окна</div>
                    <div className="absolute right-1 top-1/4 text-white/20 text-[9px]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>🍸 Бар</div>

                    {/* Столы */}
                    {TABLES.map(table => {
                      const booking = getTableBooking(table.id);
                      const isBooked = !!booking;
                      const isSelected = selectedTable === table.id;
                      const isBar = table.zone === 'bar';
                      const isBig = table.seats >= 10;
                      const isHovered = hoveredTable === table.id;

                      return (
                        <div key={table.id} style={{ left: `${table.x}%`, top: `${table.y}%`, transform: 'translate(-50%, -50%)', position: 'absolute' }}>
                          <button
                            disabled={isBooked}
                            onClick={() => setSelectedTable(table.id)}
                            onMouseEnter={() => setHoveredTable(table.id)}
                            onMouseLeave={() => setHoveredTable(null)}
                            className={`flex flex-col items-center justify-center rounded-xl border-2 transition-all font-bold
                              ${isBig ? 'w-14 h-10 md:w-18 md:h-11' : 'w-10 h-10 md:w-12 md:h-12'}
                              ${isBooked
                                ? 'bg-red-900/50 border-red-600 text-red-400 cursor-not-allowed opacity-90'
                                : isSelected
                                  ? 'bg-orange-600 border-orange-300 text-white shadow-lg shadow-orange-900/60 scale-110'
                                  : isBar
                                    ? 'bg-purple-900/40 border-purple-500 text-purple-300 hover:bg-purple-700/50'
                                    : 'bg-zinc-700/80 border-zinc-500 text-white hover:bg-orange-600/50 hover:border-orange-400 hover:scale-105'
                              }`}
                          >
                            <span className="text-[11px] leading-none font-bold">{table.label}</span>
                            <span className="text-[9px] opacity-60 leading-none mt-0.5">{table.seats}м</span>
                            {isBooked && <span className="text-[8px] leading-none mt-0.5 text-red-400">🔒</span>}
                          </button>

                          {/* Тултип при наведении */}
                          {isHovered && (
                            <div className="absolute z-10 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-800 border border-white/20 rounded-xl p-3 text-xs whitespace-nowrap shadow-xl pointer-events-none">
                              <p className="text-white font-bold mb-1">
                                {isBar ? 'Барная стойка' : `Стол №${table.label}`}
                              </p>
                              <p className="text-white/50">{ZONE_LABELS[table.zone]} · {table.seats} мест</p>
                              {isBooked && booking && (
                                <div className="mt-2 pt-2 border-t border-white/10">
                                  <p className="text-red-400 font-semibold">🔒 Забронирован</p>
                                  <p className="text-white/60 mt-0.5 flex items-center gap-1"><Clock size={10} /> {booking.event_time}</p>
                                  <p className="text-white/60 flex items-center gap-1"><Users size={10} /> {booking.guests_count} гостей</p>
                                  <p className="text-white/40">{booking.customer_name}</p>
                                </div>
                              )}
                              {!isBooked && (
                                <p className="text-green-400 mt-1">✓ Свободен {filterDate}</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Легенда */}
                <div className="flex flex-wrap gap-3 justify-center mt-5">
                  {[
                    { cls: 'bg-zinc-700/80 border-zinc-500', label: 'Свободен' },
                    { cls: 'bg-orange-600 border-orange-300', label: 'Выбран' },
                    { cls: 'bg-red-900/50 border-red-600', label: 'Занят' },
                    { cls: 'bg-purple-900/40 border-purple-500', label: 'Бар' },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded border-2 ${l.cls}`} />
                      <span className="text-white/50 text-xs">{l.label}</span>
                    </div>
                  ))}
                </div>

                {/* Список занятых столов */}
                {tableBookings.length > 0 && (
                  <div className="mt-5 max-w-2xl mx-auto">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-3 flex items-center gap-2"><Info size={12} /> Брони на {filterDate}</p>
                    <div className="space-y-2">
                      {tableBookings.map(b => (
                        <div key={b.id} className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-800/30 rounded-xl text-sm">
                          <span className="text-red-400 font-bold w-16 shrink-0">Стол №{b.table_number}</span>
                          <span className="text-white/70 flex items-center gap-1"><Clock size={12} /> {b.event_time}</span>
                          <span className="text-white/70 flex items-center gap-1"><Users size={12} /> {b.guests_count} гостей</span>
                          <span className="text-white/50 truncate">{b.customer_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Инфо о выбранном столе */}
                {selectedTable && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-5 max-w-2xl mx-auto p-4 bg-orange-600/20 rounded-2xl border border-orange-500/30 text-center">
                    <p className="text-white font-bold text-lg">Стол №{selectedTable}</p>
                    <p className="text-white/60 text-sm">
                      {TABLES.find(t=>t.id===selectedTable)?.seats} посадочных мест · {ZONE_LABELS[TABLES.find(t=>t.id===selectedTable)?.zone||'']}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Кнопки */}
              <div className="p-4 md:p-5 border-t border-white/10 flex gap-3 shrink-0">
                <button onClick={() => setShowTableModal(false)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
                  Пропустить
                </button>
                <button onClick={() => { setShowTableModal(false); setStep('form'); }}
                  className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
                  {selectedTable ? `Выбрать стол №${selectedTable}` : 'Продолжить без стола'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
