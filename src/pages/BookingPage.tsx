import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Calendar, Clock, CheckCircle, Users, ArrowLeft, Info } from 'lucide-react';

interface TableConfig {
  id: number;
  label: string;
  zone: string;
  seats: number;
  x: number;
  y: number;
  w: number;
  h: number;
  shape?: 'round' | 'rect';
  isBar?: boolean;
}

// 17 столов: слева 5, сверху 2, справа бар + 1 большой (стол 17 у бара, 10 мест), снизу 3, центр 5
const TABLES: TableConfig[] = [
  // ЛЕВАЯ СТОРОНА — 5 столов по 6 мест
  { id: 1,  label: '1',  zone: 'Левая',   seats: 6,  x: 55,  y: 190, w: 58, h: 48, shape: 'rect' },
  { id: 2,  label: '2',  zone: 'Левая',   seats: 6,  x: 55,  y: 265, w: 58, h: 48, shape: 'rect' },
  { id: 3,  label: '3',  zone: 'Левая',   seats: 6,  x: 55,  y: 340, w: 58, h: 48, shape: 'rect' },
  { id: 4,  label: '4',  zone: 'Левая',   seats: 6,  x: 55,  y: 415, w: 58, h: 48, shape: 'rect' },
  { id: 5,  label: '5',  zone: 'Левая',   seats: 6,  x: 55,  y: 490, w: 58, h: 48, shape: 'rect' },
  // ВЕРХНЯЯ СТОРОНА — 2 стола по 6 мест
  { id: 6,  label: '6',  zone: 'Верхняя', seats: 6,  x: 260, y: 55,  w: 64, h: 52, shape: 'rect' },
  { id: 7,  label: '7',  zone: 'Верхняя', seats: 6,  x: 400, y: 55,  w: 64, h: 52, shape: 'rect' },
  // ЦЕНТР — 5 столов по 6 мест
  { id: 8,  label: '8',  zone: 'Центр',   seats: 6,  x: 235, y: 215, w: 58, h: 48, shape: 'round' },
  { id: 9,  label: '9',  zone: 'Центр',   seats: 6,  x: 325, y: 215, w: 58, h: 48, shape: 'round' },
  { id: 10, label: '10', zone: 'Центр',   seats: 6,  x: 415, y: 215, w: 58, h: 48, shape: 'round' },
  { id: 11, label: '11', zone: 'Центр',   seats: 6,  x: 280, y: 305, w: 58, h: 48, shape: 'round' },
  { id: 12, label: '12', zone: 'Центр',   seats: 6,  x: 370, y: 305, w: 58, h: 48, shape: 'round' },
  // НИЖНЯЯ СТОРОНА — 3 стола по 6 мест
  { id: 13, label: '13', zone: 'Нижняя',  seats: 6,  x: 195, y: 530, w: 64, h: 52, shape: 'rect' },
  { id: 14, label: '14', zone: 'Нижняя',  seats: 6,  x: 310, y: 530, w: 64, h: 52, shape: 'rect' },
  { id: 15, label: '15', zone: 'Нижняя',  seats: 6,  x: 425, y: 530, w: 64, h: 52, shape: 'rect' },
  // ПРАВАЯ СТОРОНА — 1 большой стол по 6 мест
  { id: 16, label: '16', zone: 'Правая',  seats: 6,  x: 565, y: 380, w: 84, h: 100, shape: 'rect' },
  // СТОЛ У БАРА — 10 мест
  { id: 17, label: '17', zone: 'У бара',  seats: 10, x: 565, y: 270, w: 84, h: 80,  shape: 'rect' },
];

// Бар — только отображение, не бронируется
const BAR = { x: 565, y: 50, w: 84, h: 190 };

const ZONE_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  'Левая':   { fill: '#1e3a5f', stroke: '#3b82f6', text: '#93c5fd' },
  'Верхняя': { fill: '#3b1f1f', stroke: '#f97316', text: '#fdba74' },
  'Центр':   { fill: '#1a3a2a', stroke: '#22c55e', text: '#86efac' },
  'Нижняя':  { fill: '#2d1f3a', stroke: '#a855f7', text: '#d8b4fe' },
  'Правая':  { fill: '#3a2a00', stroke: '#f59e0b', text: '#fde68a' },
  'У бара':  { fill: '#2a1a3a', stroke: '#ec4899', text: '#f9a8d4' },
};

type Step = 'map' | 'form' | 'success';

export default function BookingPage() {
  const [selectedTable, setSelectedTable] = useState<TableConfig | null>(null);
  const [bookedTableIds, setBookedTableIds] = useState<Set<number>>(new Set());
  const [step, setStep] = useState<Step>('map');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:00');
  const [form, setForm] = useState({ name: '', phone: '', guests: 2, occasion: '', comment: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!date || !time) return;
    fetch(`/api/table-bookings?date=${date}&time=${time}`)
      .then(r => r.ok ? r.json() : { busy: [] })
      .then(data => {
        const ids = new Set<number>(
          (data.busy || []).map((n: any) => Number(n))
        );
        setBookedTableIds(ids);
      })
      .catch(() => {});
  }, [date, time]);

  const handleTableClick = (table: TableConfig) => {
    if (bookedTableIds.has(table.id)) return;
    setSelectedTable(table);
    setError('');
    // Сбрасываем гостей до максимума стола если превышает
    if (form.guests > table.seats) setForm(f => ({ ...f, guests: table.seats }));
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable || !date || !time) { setError('Заполните все поля'); return; }
    if (!form.name || !form.phone) { setError('Введите имя и телефон'); return; }
    if (form.guests > selectedTable.seats) { setError(`За этим столом максимум ${selectedTable.seats} мест`); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/table-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_number: selectedTable.id,
          seats: selectedTable.seats,
          customer_name: form.name,
          customer_phone: form.phone,
          guests_count: form.guests,
          event_date: date,
          event_time: time,
          occasion: form.occasion,
          comment: form.comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка бронирования');
      setBookingResult(data);
      setStep('success');
      setBookedTableIds(prev => new Set([...prev, selectedTable.id]));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('map');
    setSelectedTable(null);
    setForm({ name: '', phone: '', guests: 2, occasion: '', comment: '' });
    setError('');
    setBookingResult(null);
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-white pt-20">
      <div className="py-12 text-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-orange-400 text-sm font-medium tracking-[0.3em] uppercase mb-3">Онлайн-бронирование</p>
          <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Забронировать стол</h1>
          <p className="text-white/50">Выберите дату, время и стол на интерактивной схеме зала</p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">

          {/* ШАГ 1 — КАРТА */}
          {step === 'map' && (
            <motion.div key="map" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Выбор даты и времени */}
              <div className="bg-zinc-900 rounded-2xl p-5 border border-white/10 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                  <label className="col-span-2 md:col-span-1 block">
                    <span className="text-white/60 text-sm flex items-center gap-1 mb-1"><Calendar size={14} /> Дата</span>
                    <input type="date" value={date} min={today}
                      onChange={e => { setDate(e.target.value); setSelectedTable(null); }}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500" />
                  </label>
                  <label className="col-span-2 md:col-span-1 block">
                    <span className="text-white/60 text-sm flex items-center gap-1 mb-1"><Clock size={14} /> Время</span>
                    <select value={time} onChange={e => { setTime(e.target.value); setSelectedTable(null); }}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500">
                      {['11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                  <div className="col-span-2 flex flex-wrap gap-3 text-xs text-white/50">
                    <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-zinc-700 border border-green-500 inline-block" />Свободен</span>
                    <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-red-900/60 border border-red-500 inline-block" />Занят</span>
                    <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-orange-600 border border-orange-400 inline-block" />Выбран</span>
                  </div>
                </div>
                {!date && <p className="text-orange-400 text-sm mt-3 flex items-center gap-2"><Info size={14} /> Выберите дату чтобы увидеть доступные столы</p>}
              </div>

              {/* Схема зала */}
              <div className="bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden mb-6">
                <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-bold text-white">Схема зала</h2>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ZONE_COLORS).map(([zone, c]) => (
                      <span key={zone} className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: c.stroke, color: c.text, backgroundColor: c.fill + '80' }}>{zone}</span>
                    ))}
                    <span className="text-xs px-2 py-1 rounded-full border border-gray-600 text-gray-400 bg-gray-900/80">Бар</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <svg viewBox="0 0 720 640" className="w-full min-w-[480px]" style={{ maxHeight: 520 }}>
                    {/* Фон */}
                    <rect x="30" y="30" width="660" height="590" rx="16" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
                    {/* Подписи зон */}
                    <text x="40" y="175" fill="#6b7280" fontSize="10" fontWeight="600">ЛЕВАЯ ЗОНА</text>
                    <text x="250" y="44" fill="#6b7280" fontSize="10" fontWeight="600">ВЕРХНЯЯ ЗОНА</text>
                    <text x="270" y="200" fill="#6b7280" fontSize="10" fontWeight="600">ЦЕНТР</text>
                    <text x="195" y="518" fill="#6b7280" fontSize="10" fontWeight="600">НИЖНЯЯ ЗОНА</text>
                    <text x="556" y="44" fill="#6b7280" fontSize="10" fontWeight="600">БАР / СТОЛ</text>
                    {/* Вход */}
                    <rect x="300" y="602" width="120" height="20" rx="4" fill="#292524" stroke="#78716c" strokeWidth="1" />
                    <text x="360" y="616" fill="#a8a29e" fontSize="10" textAnchor="middle">ВХОД</text>
                    {/* Стены */}
                    <line x1="30" y1="30" x2="690" y2="30" stroke="#52525b" strokeWidth="3" />
                    <line x1="30" y1="30" x2="30" y2="622" stroke="#52525b" strokeWidth="3" />
                    <line x1="690" y1="30" x2="690" y2="622" stroke="#52525b" strokeWidth="3" />

                    {/* БАР (не кликабельный) */}
                    <rect x={BAR.x} y={BAR.y} width={BAR.w} height={BAR.h} rx="8" fill="#1f2937" stroke="#6b7280" strokeWidth="1.5" />
                    <text x={BAR.x + BAR.w/2} y={BAR.y + BAR.h/2 - 8} fill="#9ca3af" fontSize="12" fontWeight="bold" textAnchor="middle">🍺</text>
                    <text x={BAR.x + BAR.w/2} y={BAR.y + BAR.h/2 + 8} fill="#9ca3af" fontSize="11" fontWeight="bold" textAnchor="middle">БАР</text>

                    {/* Столы */}
                    {TABLES.map(table => {
                      const isBooked = bookedTableIds.has(table.id);
                      const isSelected = selectedTable?.id === table.id;
                      const isHovered = hovered === table.id;
                      const zc = ZONE_COLORS[table.zone];
                      const cx = table.x + table.w / 2;
                      const cy = table.y + table.h / 2;
                      const fill = isBooked ? '#450a0a' : isSelected ? '#9a3412' : isHovered ? zc.fill : '#27272a';
                      const stroke = isBooked ? '#ef4444' : isSelected ? '#f97316' : zc.stroke;

                      return (
                        <g key={table.id}
                          style={{ cursor: isBooked ? 'not-allowed' : 'pointer' }}
                          onClick={() => handleTableClick(table)}
                          onMouseEnter={() => setHovered(table.id)}
                          onMouseLeave={() => setHovered(null)}>
                          {/* Стулья */}
                          {table.shape === 'round' ? (
                            <>
                              <circle cx={cx} cy={table.y - 9} r="5" fill="#3f3f46" stroke={stroke} strokeWidth="1" />
                              <circle cx={cx} cy={table.y + table.h + 9} r="5" fill="#3f3f46" stroke={stroke} strokeWidth="1" />
                              <circle cx={table.x - 9} cy={cy} r="5" fill="#3f3f46" stroke={stroke} strokeWidth="1" />
                              <circle cx={table.x + table.w + 9} cy={cy} r="5" fill="#3f3f46" stroke={stroke} strokeWidth="1" />
                            </>
                          ) : (
                            <>
                              <rect x={table.x + 6} y={table.y - 9} width="12" height="7" rx="2" fill="#3f3f46" stroke={stroke} strokeWidth="1" />
                              <rect x={table.x + table.w - 18} y={table.y - 9} width="12" height="7" rx="2" fill="#3f3f46" stroke={stroke} strokeWidth="1" />
                              <rect x={table.x + 6} y={table.y + table.h + 2} width="12" height="7" rx="2" fill="#3f3f46" stroke={stroke} strokeWidth="1" />
                              <rect x={table.x + table.w - 18} y={table.y + table.h + 2} width="12" height="7" rx="2" fill="#3f3f46" stroke={stroke} strokeWidth="1" />
                              {table.seats > 4 && (
                                <>
                                  <rect x={table.x - 9} y={cy - 8} width="7" height="12" rx="2" fill="#3f3f46" stroke={stroke} strokeWidth="1" />
                                  <rect x={table.x + table.w + 2} y={cy - 8} width="7" height="12" rx="2" fill="#3f3f46" stroke={stroke} strokeWidth="1" />
                                </>
                              )}
                            </>
                          )}
                          {/* Поверхность */}
                          {table.shape === 'round'
                            ? <ellipse cx={cx} cy={cy} rx={table.w/2} ry={table.h/2} fill={fill} stroke={stroke} strokeWidth={isSelected ? 2.5 : 1.5} />
                            : <rect x={table.x} y={table.y} width={table.w} height={table.h} rx="6" fill={fill} stroke={stroke} strokeWidth={isSelected ? 2.5 : 1.5} />}
                          {/* Номер */}
                          <text x={cx} y={cy - 5} fill={isBooked ? '#fca5a5' : isSelected ? '#fed7aa' : zc.text}
                            fontSize="13" fontWeight="700" textAnchor="middle" dominantBaseline="middle">{table.label}</text>
                          {/* Места */}
                          <text x={cx} y={cy + 9} fill={isBooked ? '#fca5a5' : '#71717a'}
                            fontSize="9" textAnchor="middle" dominantBaseline="middle">
                            {isBooked ? '🔒' : `${table.seats} мест`}
                          </text>
                          {/* Спецметка для стола 17 */}
                          {table.id === 17 && !isBooked && (
                            <text x={cx} y={cy + 20} fill="#f9a8d4" fontSize="8" textAnchor="middle">у бара</text>
                          )}
                          {/* Hover outline */}
                          {isHovered && !isBooked && (
                            table.shape === 'round'
                              ? <ellipse cx={cx} cy={cy} rx={table.w/2+4} ry={table.h/2+4} fill="none" stroke={stroke} strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />
                              : <rect x={table.x-4} y={table.y-4} width={table.w+8} height={table.h+8} rx="9" fill="none" stroke={stroke} strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Выбранный стол */}
              <AnimatePresence>
                {selectedTable && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="bg-orange-900/20 border border-orange-500/40 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-orange-400 font-bold text-lg">Стол №{selectedTable.id} — {selectedTable.zone}</p>
                      <p className="text-white/60 text-sm">Мест: {selectedTable.seats} · {date} в {time}</p>
                    </div>
                    <button onClick={() => { if (!date) { setError('Сначала выберите дату'); return; } setStep('form'); }}
                      className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors whitespace-nowrap">
                      Забронировать →
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}

              {/* Список столов */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {TABLES.map(table => {
                  const isBooked = bookedTableIds.has(table.id);
                  const isSelected = selectedTable?.id === table.id;
                  const zc = ZONE_COLORS[table.zone];
                  return (
                    <button key={table.id} onClick={() => handleTableClick(table)} disabled={isBooked}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isBooked ? 'border-red-800 bg-red-950/30 cursor-not-allowed opacity-60' :
                        isSelected ? 'border-orange-500 bg-orange-900/30' :
                        'border-white/10 bg-zinc-900 hover:border-orange-500/50 hover:bg-zinc-800'
                      }`}>
                      <p className="font-bold text-sm" style={{ color: isBooked ? '#fca5a5' : zc.text }}>
                        Стол {table.id}{table.id === 17 ? ' 🍺' : ''}
                      </p>
                      <p className="text-white/40 text-xs">{table.zone}</p>
                      <p className="text-white/50 text-xs">{table.seats} мест</p>
                      <p className={`text-xs font-medium mt-1 ${isBooked ? 'text-red-400' : 'text-green-400'}`}>
                        {isBooked ? '🔒 Занят' : '✓ Свободен'}
                      </p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ШАГ 2 — ФОРМА */}
          {step === 'form' && selectedTable && (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-lg mx-auto">
              <button onClick={() => setStep('map')} className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={18} /> Назад к схеме
              </button>
              <div className="bg-zinc-900 rounded-3xl border border-white/10 overflow-hidden">
                <div className="p-5 border-b border-white/10 bg-orange-900/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-400 font-bold text-lg">Стол №{selectedTable.id} — {selectedTable.zone}</p>
                      <p className="text-white/60 text-sm">{selectedTable.seats} мест · {date} в {time}</p>
                    </div>
                    <div className="text-4xl">🪑</div>
                  </div>
                </div>
                <form onSubmit={handleBook} className="p-6 space-y-4">
                  <label className="block">
                    <span className="text-white/60 text-sm">Ваше имя *</span>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                      placeholder="Иван Иванов" required />
                  </label>
                  <label className="block">
                    <span className="text-white/60 text-sm">Телефон *</span>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                      placeholder="+7 (___) ___-__-__" type="tel" required />
                  </label>
                  <label className="block">
                    <span className="text-white/60 text-sm">Повод (необязательно)</span>
                    <input value={form.occasion} onChange={e => setForm({ ...form, occasion: e.target.value })}
                      className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                      placeholder="День рождения, свидание, деловая встреча..." />
                  </label>
                  <label className="block">
                    <span className="text-white/60 text-sm flex items-center gap-1"><Users size={14} /> Количество гостей *</span>
                    <div className="flex items-center gap-3 mt-1">
                      <button type="button" onClick={() => setForm({ ...form, guests: Math.max(1, form.guests - 1) })}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-orange-600 transition-colors font-bold text-lg">−</button>
                      <span className="text-2xl font-black text-orange-400 w-8 text-center">{form.guests}</span>
                      <button type="button" onClick={() => setForm({ ...form, guests: Math.min(selectedTable.seats, form.guests + 1) })}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-orange-600 transition-colors font-bold text-lg">+</button>
                      <span className="text-white/40 text-sm">макс. {selectedTable.seats}</span>
                    </div>
                  </label>
                  <label className="block">
                    <span className="text-white/60 text-sm">Комментарий</span>
                    <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })}
                      className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 resize-none"
                      rows={2} placeholder="Пожелания, аллергии..." />
                  </label>
                  {error && <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3"><p className="text-red-400 text-sm">❌ {error}</p></div>}
                  <button type="submit" disabled={loading}
                    className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-lg">
                    {loading ? 'Бронируем...' : 'Подтвердить бронь'}
                  </button>
                  <p className="text-white/30 text-xs text-center">
                    Нажимая кнопку, вы соглашаетесь с <a href="/privacy" className="underline">политикой конфиденциальности</a>
                  </p>
                </form>
              </div>
            </motion.div>
          )}

          {/* ШАГ 3 — УСПЕХ */}
          {step === 'success' && bookingResult && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center">
              <div className="bg-zinc-900 rounded-3xl border border-green-500/30 p-10">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                  className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="text-green-400" size={48} />
                </motion.div>
                <h2 className="text-2xl font-black text-white mb-2">Стол забронирован!</h2>
                <p className="text-white/50 mb-6">Мы свяжемся с вами для подтверждения</p>
                <div className="bg-white/5 rounded-2xl p-5 text-left space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Стол</span>
                    <span className="text-white font-medium">№{bookingResult.table_number} — {bookingResult.zone || 'зал'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Дата и время</span>
                    <span className="text-white font-medium">{bookingResult.event_date} в {bookingResult.event_time}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Гостей</span>
                    <span className="text-white font-medium">{bookingResult.guests_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Номер брони</span>
                    <span className="text-orange-400 font-black">#{bookingResult.id}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <a href="tel:+79257677778"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm">
                    <Phone size={16} /> Позвонить
                  </a>
                  <button onClick={reset}
                    className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors text-sm">
                    Новая бронь
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
