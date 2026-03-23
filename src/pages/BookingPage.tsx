import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, Phone, User, MessageSquare, CheckCircle, ChevronLeft } from 'lucide-react';

// ─── Конфигурация столов ────────────────────────────────────────────────────
const TABLES = [
  // Зона A (левая, 6 столов)
  { id: 1,  zone: 'A', seats: 4,  label: '1',  x: 150, y: 445 },
  { id: 2,  zone: 'A', seats: 4,  label: '2',  x: 195, y: 395 },
  { id: 3,  zone: 'A', seats: 4,  label: '3',  x: 228, y: 350 },
  { id: 4,  zone: 'A', seats: 6,  label: '4',  x: 240, y: 430 },
  { id: 5,  zone: 'A', seats: 4,  label: '5',  x: 280, y: 365 },
  { id: 6,  zone: 'A', seats: 4,  label: '6',  x: 305, y: 290 },
  // Зона B (центр-лево, 7 столов)
  { id: 7,  zone: 'B', seats: 4,  label: '7',  x: 365, y: 310 },
  { id: 8,  zone: 'B', seats: 4,  label: '8',  x: 400, y: 250 },
  { id: 9,  zone: 'B', seats: 4,  label: '9',  x: 450, y: 330 },
  { id: 10, zone: 'B', seats: 4,  label: '10', x: 485, y: 260 },
  { id: 11, zone: 'B', seats: 6,  label: '11', x: 425, y: 420 },
  { id: 15, zone: 'B', seats: 6,  label: '15', x: 475, y: 420 },
  // Зона C (правая, 3 стола)
  { id: 12, zone: 'C', seats: 4,  label: '12', x: 590, y: 270 },
  { id: 13, zone: 'C', seats: 4,  label: '13', x: 700, y: 265 },
  { id: 14, zone: 'C', seats: 4,  label: '14', x: 830, y: 270 },
  // Зона D (нижняя, 2 стола)
  { id: 16, zone: 'D', seats: 8,  label: '16', x: 505, y: 502 },
  { id: 17, zone: 'D', seats: 12, label: '17', x: 650, y: 502 },
];

const ZONE_COLORS: Record<string, string> = {
  A: '#f97316',
  B: '#3b82f6',
  C: '#10b981',
  D: '#a855f7',
};

const STATUS_COLORS: Record<string, string> = {
  free:    '#22c55e',
  booked:  '#ef4444',
  selected:'#f97316',
};

type TableStatus = 'free' | 'booked' | 'selected';

interface Reservation { table_number: number; reservation_date: string; reservation_time: string; }

export default function BookingPage() {
  const [step, setStep] = useState<'map' | 'form' | 'success'>('map');
  const [selectedTable, setSelectedTable] = useState<typeof TABLES[0] | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filterDate, setFilterDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [form, setForm] = useState({ name: '', phone: '', guests: 2, time: '18:00', comment: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tooltip, setTooltip] = useState<{ table: typeof TABLES[0]; x: number; y: number } | null>(null);

  useEffect(() => {
    fetch(`/api/table-reservations?date=${filterDate}`)
      .then(r => r.json())
      .then(d => setReservations(Array.isArray(d) ? d : []))
      .catch(() => setReservations([]));
  }, [filterDate]);

  const getStatus = (tableId: number): TableStatus => {
    if (selectedTable?.id === tableId) return 'selected';
    if (reservations.some(r => r.table_number === tableId)) return 'booked';
    return 'free';
  };

  const handleTableClick = (table: typeof TABLES[0]) => {
    const status = getStatus(table.id);
    if (status === 'booked') return;
    setSelectedTable(table);
    setTooltip(null);
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;
    if (!form.name || !form.phone) { setError('Заполните имя и телефон'); return; }
    if (form.guests < 1 || form.guests > selectedTable.seats) {
      setError(`Для этого стола максимум ${selectedTable.seats} гостей`); return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/table-reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_number: selectedTable.id,
          zone: selectedTable.zone,
          customer_name: form.name,
          customer_phone: form.phone,
          guests_count: form.guests,
          reservation_date: filterDate,
          reservation_time: form.time,
          comment: form.comment,
        }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Ошибка'); }
      setStep('success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('map');
    setSelectedTable(null);
    setForm({ name: '', phone: '', guests: 2, time: '18:00', comment: '' });
    setError('');
    fetch(`/api/table-reservations?date=${filterDate}`)
      .then(r => r.json()).then(d => setReservations(Array.isArray(d) ? d : []));
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-white pt-20">
      {/* Hero */}
      <div className="py-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-orange-400 text-sm font-medium tracking-[0.3em] uppercase mb-3">Онлайн-бронирование</p>
          <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Забронировать стол</h1>
          <p className="text-white/50">Выберите стол на схеме зала и заполните форму</p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">

          {/* ── ШАГ 1: СХЕМА ЗАЛА ── */}
          {step === 'map' && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Фильтр по дате */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3">
                  <Calendar size={18} className="text-orange-400" />
                  <span className="text-white/60 text-sm">Дата:</span>
                  <input
                    type="date"
                    value={filterDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setFilterDate(e.target.value)}
                    className="bg-transparent text-white text-sm focus:outline-none"
                  />
                </div>
                {/* Легенда */}
                <div className="flex items-center gap-4 flex-wrap">
                  {[['#22c55e','Свободен'],['#ef4444','Занят'],['#f97316','Выбран']].map(([c,l])=>(
                    <div key={l} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: c }} />
                      <span className="text-white/50 text-xs">{l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SVG Схема */}
              <div className="relative bg-zinc-900 rounded-3xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <svg
                    viewBox="0 0 1050 620"
                    className="w-full min-w-[600px]"
                    style={{ maxHeight: '65vh' }}
                    onClick={() => setTooltip(null)}
                  >
                    <defs>
                      <pattern id="floor" width="40" height="40" patternUnits="userSpaceOnUse">
                        <rect width="40" height="40" fill="#1c1c1e"/>
                        <rect width="20" height="20" fill="#222" opacity="0.5"/>
                        <rect x="20" y="20" width="20" height="20" fill="#222" opacity="0.5"/>
                      </pattern>
                      <pattern id="dfloor" width="25" height="25" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <rect width="25" height="25" fill="rgba(168,85,247,0.05)"/>
                        <rect width="12.5" height="12.5" fill="rgba(168,85,247,0.1)"/>
                        <rect x="12.5" y="12.5" width="12.5" height="12.5" fill="rgba(168,85,247,0.1)"/>
                      </pattern>
                      <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                      <clipPath id="venueClip">
                        <path d="M 100,490 L 310,225 L 890,225 L 890,560 L 435,560 L 435,490 Z"/>
                      </clipPath>
                    </defs>

                    {/* Фон */}
                    <rect width="1050" height="620" fill="#111"/>

                    {/* Контур зала */}
                    <path d="M 100,490 L 310,225 L 890,225 L 890,560 L 435,560 L 435,490 Z"
                      fill="url(#floor)" stroke="#333" stroke-width="2.5" stroke-linejoin="round"/>

                    {/* Подсветка зон */}
                    <g clipPath="url(#venueClip)">
                      <path d="M 100,490 L 310,225 L 400,225 L 400,490 Z" fill="#f97316" opacity="0.04"/>
                      <rect x="400" y="225" width="160" height="265" fill="#3b82f6" opacity="0.04"/>
                      <rect x="560" y="225" width="330" height="265" fill="#10b981" opacity="0.04"/>
                      <rect x="435" y="490" width="455" height="70" fill="#a855f7" opacity="0.06"/>
                    </g>

                    {/* Разделители */}
                    <line x1="400" y1="228" x2="400" y2="487" stroke="#333" stroke-width="1" strokeDasharray="6,4"/>
                    <line x1="560" y1="228" x2="560" y2="487" stroke="#333" stroke-width="1" strokeDasharray="6,4"/>
                    <line x1="438" y1="490" x2="887" y2="490" stroke="#333" stroke-width="1" strokeDasharray="6,4"/>

                    {/* Названия зон */}
                    <text x="340" y="243" textAnchor="middle" fontSize="9" fill="#f97316" letterSpacing="2" fontWeight="700" opacity="0.7">ЗОНА A</text>
                    <text x="480" y="243" textAnchor="middle" fontSize="9" fill="#3b82f6" letterSpacing="2" fontWeight="700" opacity="0.7">ЗОНА B</text>
                    <text x="725" y="243" textAnchor="middle" fontSize="9" fill="#10b981" letterSpacing="2" fontWeight="700" opacity="0.7">ЗОНА C</text>
                    <text x="660" y="553" textAnchor="middle" fontSize="9" fill="#a855f7" letterSpacing="2" fontWeight="700" opacity="0.7">ЗОНА D</text>

                    {/* ВХОД */}
                    <rect x="55" y="473" width="52" height="36" rx="8" fill="#E53935"/>
                    <text x="81" y="496" textAnchor="middle" fontSize="10" fill="#FFF" fontWeight="700" letterSpacing="1">ВХОД</text>
                    <polygon points="107,491 120,484 120,498" fill="#E53935"/>

                    {/* WC */}
                    <rect x="500" y="150" width="158" height="68" rx="10" fill="#1a3a1a"/>
                    <rect x="500" y="150" width="158" height="68" rx="10" fill="none" stroke="#388E3C" strokeWidth="1.5"/>
                    <text x="579" y="180" textAnchor="middle" fontSize="11" fill="#4ade80" fontWeight="700">WC / КУРИЛКА</text>
                    <text x="579" y="198" textAnchor="middle" fontSize="9" fill="#4ade80" opacity="0.5">Туалет · Зона для курения</text>
                    <rect x="540" y="216" width="78" height="4" rx="2" fill="#388E3C" opacity="0.4"/>

                    {/* БАР */}
                    <rect x="890" y="268" width="78" height="172" rx="10" fill="#0d2a5e"/>
                    <rect x="890" y="268" width="78" height="172" rx="10" fill="none" stroke="#1d4ed8" strokeWidth="1.5"/>
                    <text transform="rotate(-90,929,354)" x="929" y="358" textAnchor="middle" fontSize="14" fill="#60a5fa" fontWeight="700" letterSpacing="3">БАР</text>
                    {[298,318,338,358,378,398,418].map(y => (
                      <circle key={y} cx="897" cy={y} r="3" fill="rgba(96,165,250,0.3)"/>
                    ))}

                    {/* DJ */}
                    <g transform="rotate(-8,885,570)">
                      <rect x="855" y="548" width="60" height="44" rx="10" fill="#7c2d12"/>
                      <rect x="855" y="548" width="60" height="44" rx="10" fill="none" stroke="#f97316" strokeWidth="1.5"/>
                      <text x="885" y="575" textAnchor="middle" fontSize="13" fill="#fb923c" fontWeight="700">DJ</text>
                    </g>

                    {/* ТАНЦПОЛ */}
                    <rect x="660" y="345" width="148" height="103" rx="12" fill="url(#dfloor)" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="8,4"/>
                    <text x="734" y="393" textAnchor="middle" fontSize="11" fill="#a78bfa" fontWeight="700" letterSpacing="1">ТАНЦПОЛ</text>

                    {/* СТОЛЫ */}
                    {TABLES.map(table => {
                      const status = getStatus(table.id);
                      const color = STATUS_COLORS[status];
                      const zoneColor = ZONE_COLORS[table.zone];
                      const isBooked = status === 'booked';
                      const isSelected = status === 'selected';
                      return (
                        <g
                          key={table.id}
                          style={{ cursor: isBooked ? 'not-allowed' : 'pointer' }}
                          onClick={e => { e.stopPropagation(); handleTableClick(table); }}
                          onMouseEnter={() => setTooltip({ table, x: table.x + 50, y: table.y - 10 })}
                          onMouseLeave={() => setTooltip(null)}
                        >
                          {/* Свечение при выборе */}
                          {isSelected && (
                            <rect x={table.x - 4} y={table.y - 4} width="50" height="50" rx="12"
                              fill="#f97316" opacity="0.25" filter="url(#glow)"/>
                          )}
                          <rect
                            x={table.x} y={table.y} width="42" height="42" rx="8"
                            fill={isBooked ? '#3f1f1f' : isSelected ? '#7c2d12' : '#1f2937'}
                            stroke={color} strokeWidth={isSelected ? 2.5 : 1.5}
                          />
                          <text x={table.x + 21} y={table.y + 27}
                            textAnchor="middle" fontSize={table.id >= 10 ? 13 : 15}
                            fill={isBooked ? '#6b2e2e' : '#fff'} fontWeight="600">
                            {table.label}
                          </text>
                          {/* Индикатор зоны */}
                          <circle cx={table.x + 36} cy={table.y + 6} r="4" fill={zoneColor} opacity="0.8"/>
                          {/* Статус точка */}
                          <circle cx={table.x + 6} cy={table.y + 36} r="3.5" fill={color}/>
                        </g>
                      );
                    })}

                    {/* Тултип */}
                    {tooltip && (
                      <g>
                        <rect x={Math.min(tooltip.x, 900)} y={tooltip.y - 45} width="140" height="52" rx="8"
                          fill="#18181b" stroke="#3f3f46" strokeWidth="1"/>
                        <text x={Math.min(tooltip.x, 900) + 70} y={tooltip.y - 25}
                          textAnchor="middle" fontSize="12" fill="#fff" fontWeight="600">
                          Стол №{tooltip.table.id} · Зона {tooltip.table.zone}
                        </text>
                        <text x={Math.min(tooltip.x, 900) + 70} y={tooltip.y - 8}
                          textAnchor="middle" fontSize="10" fill="#9ca3af">
                          До {tooltip.table.seats} гостей
                        </text>
                      </g>
                    )}
                  </svg>
                </div>
              </div>

              {/* Выбранный стол */}
              {selectedTable ? (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-orange-600/10 border border-orange-500/30 rounded-2xl p-5">
                  <div>
                    <p className="text-orange-400 font-bold text-lg">Стол №{selectedTable.id} — Зона {selectedTable.zone}</p>
                    <p className="text-white/60 text-sm">До {selectedTable.seats} гостей · {filterDate}</p>
                  </div>
                  <button
                    onClick={() => setStep('form')}
                    className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all hover:scale-105">
                    Оформить бронь →
                  </button>
                </motion.div>
              ) : (
                <p className="mt-6 text-center text-white/40 text-sm">👆 Нажмите на свободный стол чтобы выбрать его</p>
              )}

              {/* Зоны */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(ZONE_COLORS).map(([zone, color]) => {
                  const zoneTables = TABLES.filter(t => t.zone === zone);
                  return (
                    <div key={zone} className="bg-zinc-900 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 rounded-full" style={{ background: color }}/>
                        <span className="text-white font-bold text-sm">Зона {zone}</span>
                      </div>
                      <p className="text-white/40 text-xs">{zoneTables.length} столов</p>
                      <p className="text-white/40 text-xs">{zoneTables.map(t => `№${t.id}`).join(', ')}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── ШАГ 2: ФОРМА ── */}
          {step === 'form' && selectedTable && (
            <motion.div key="form" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="max-w-xl mx-auto">
              <button onClick={() => setStep('map')}
                className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors">
                <ChevronLeft size={18}/> Назад к схеме
              </button>

              <div className="bg-zinc-900 rounded-3xl border border-white/10 overflow-hidden">
                {/* Шапка */}
                <div className="p-6 border-b border-white/10 bg-orange-600/10">
                  <p className="text-orange-400 text-sm font-medium uppercase tracking-wider mb-1">Бронирование</p>
                  <h2 className="text-2xl font-black">Стол №{selectedTable.id} · Зона {selectedTable.zone}</h2>
                  <p className="text-white/50 text-sm mt-1">До {selectedTable.seats} гостей · {filterDate}</p>
                </div>

                <form onSubmit={handleBook} className="p-6 space-y-4">
                  {/* Имя */}
                  <label className="block">
                    <span className="text-white/60 text-sm flex items-center gap-2 mb-1"><User size={14}/> Ваше имя *</span>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                      placeholder="Иван Иванов" required/>
                  </label>

                  {/* Телефон */}
                  <label className="block">
                    <span className="text-white/60 text-sm flex items-center gap-2 mb-1"><Phone size={14}/> Телефон *</span>
                    <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                      placeholder="+7 (___) ___-__-__" type="tel" required/>
                  </label>

                  {/* Кол-во гостей */}
                  <label className="block">
                    <span className="text-white/60 text-sm flex items-center gap-2 mb-2">
                      <Users size={14}/> Количество гостей: <span className="text-orange-400 font-bold">{form.guests}</span>
                    </span>
                    <input type="range" min={1} max={selectedTable.seats}
                      value={form.guests} onChange={e => setForm({...form, guests: Number(e.target.value)})}
                      className="w-full accent-orange-500"/>
                    <div className="flex justify-between text-xs text-white/30 mt-1">
                      <span>1</span><span>{selectedTable.seats} (макс.)</span>
                    </div>
                  </label>

                  {/* Время */}
                  <label className="block">
                    <span className="text-white/60 text-sm flex items-center gap-2 mb-1"><Clock size={14}/> Время *</span>
                    <select value={form.time} onChange={e => setForm({...form, time: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500">
                      {['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'].map(t=>(
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </label>

                  {/* Комментарий */}
                  <label className="block">
                    <span className="text-white/60 text-sm flex items-center gap-2 mb-1"><MessageSquare size={14}/> Пожелания</span>
                    <textarea value={form.comment} onChange={e => setForm({...form, comment: e.target.value})}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 resize-none"
                      rows={3} placeholder="Особые пожелания, повод..."/>
                  </label>

                  {error && (
                    <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3">
                      <p className="text-red-400 text-sm">❌ {error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all hover:scale-[1.02] text-lg">
                    {loading ? 'Отправка...' : '✓ Подтвердить бронь'}
                  </button>

                  <p className="text-white/30 text-xs text-center">
                    Нажимая кнопку, вы соглашаетесь с <a href="/privacy" className="underline">политикой конфиденциальности</a>.
                    Мы перезвоним для подтверждения.
                  </p>
                </form>
              </div>
            </motion.div>
          )}

          {/* ── ШАГ 3: УСПЕХ ── */}
          {step === 'success' && selectedTable && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center py-12">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-green-400" size={48}/>
              </motion.div>
              <h2 className="text-3xl font-black mb-3">Стол забронирован!</h2>
              <div className="bg-zinc-900 rounded-2xl p-5 border border-white/10 mb-6 text-left space-y-2">
                <div className="flex justify-between"><span className="text-white/50">Стол</span><span className="text-white font-bold">№{selectedTable.id} · Зона {selectedTable.zone}</span></div>
                <div className="flex justify-between"><span className="text-white/50">Дата</span><span className="text-white">{filterDate}</span></div>
                <div className="flex justify-between"><span className="text-white/50">Время</span><span className="text-white">{form.time}</span></div>
                <div className="flex justify-between"><span className="text-white/50">Гостей</span><span className="text-white">{form.guests}</span></div>
              </div>
              <p className="text-white/50 mb-8">Мы свяжемся с вами по номеру <span className="text-white">{form.phone}</span> для подтверждения</p>
              <button onClick={reset}
                className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
                Забронировать ещё
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
