import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Calendar, Clock, CheckCircle, Users, ArrowLeft, Info } from 'lucide-react';

// ─── Конфигурация зала (17 столов) ──────────────────────────────────────────
// Схема: слева 5, сверху 2, справа бар + 1 большой, снизу 3, центр 5
interface TableConfig {
  id: number;
  label: string;
  zone: string;
  seats: number;
  x: number; // % от ширины SVG
  y: number; // % от высоты SVG
  w: number;
  h: number;
  shape?: 'round' | 'rect';
}

const TABLES: TableConfig[] = [
  // ЛЕВАЯ СТОРОНА — 5 столов
  { id: 1,  label: '1',  zone: 'Левая',   seats: 4, x: 60,  y: 200, w: 54, h: 46, shape: 'rect' },
  { id: 2,  label: '2',  zone: 'Левая',   seats: 4, x: 60,  y: 270, w: 54, h: 46, shape: 'rect' },
  { id: 3,  label: '3',  zone: 'Левая',   seats: 4, x: 60,  y: 340, w: 54, h: 46, shape: 'rect' },
  { id: 4,  label: '4',  zone: 'Левая',   seats: 4, x: 60,  y: 410, w: 54, h: 46, shape: 'rect' },
  { id: 5,  label: '5',  zone: 'Левая',   seats: 4, x: 60,  y: 480, w: 54, h: 46, shape: 'rect' },

  // ВЕРХНЯЯ СТОРОНА — 2 стола
  { id: 6,  label: '6',  zone: 'Верхняя', seats: 6, x: 280, y: 60,  w: 60, h: 50, shape: 'rect' },
  { id: 7,  label: '7',  zone: 'Верхняя', seats: 6, x: 420, y: 60,  w: 60, h: 50, shape: 'rect' },

  // ЦЕНТР — 5 столов
  { id: 8,  label: '8',  zone: 'Центр',   seats: 4, x: 240, y: 220, w: 54, h: 46, shape: 'round' },
  { id: 9,  label: '9',  zone: 'Центр',   seats: 4, x: 330, y: 220, w: 54, h: 46, shape: 'round' },
  { id: 10, label: '10', zone: 'Центр',   seats: 4, x: 420, y: 220, w: 54, h: 46, shape: 'round' },
  { id: 11, label: '11', zone: 'Центр',   seats: 4, x: 285, y: 310, w: 54, h: 46, shape: 'round' },
  { id: 12, label: '12', zone: 'Центр',   seats: 4, x: 375, y: 310, w: 54, h: 46, shape: 'round' },

  // НИЖНЯЯ СТОРОНА — 3 стола
  { id: 13, label: '13', zone: 'Нижняя',  seats: 6, x: 200, y: 530, w: 60, h: 50, shape: 'rect' },
  { id: 14, label: '14', zone: 'Нижняя',  seats: 6, x: 310, y: 530, w: 60, h: 50, shape: 'rect' },
  { id: 15, label: '15', zone: 'Нижняя',  seats: 6, x: 420, y: 530, w: 60, h: 50, shape: 'rect' },

  // ПРАВАЯ СТОРОНА — 1 большой VIP стол
  { id: 16, label: '16 VIP', zone: 'VIP',    seats: 12, x: 570, y: 280, w: 80, h: 120, shape: 'rect' },

  // БАР — стойка (не бронируется, просто отображается)
  { id: 17, label: 'Бар',    zone: 'Бар',    seats: 6,  x: 570, y: 160, w: 80, h: 80,  shape: 'rect' },
];

const ZONE_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  'Левая':   { fill: '#1e3a5f', stroke: '#3b82f6', text: '#93c5fd' },
  'Верхняя': { fill: '#3b1f1f', stroke: '#f97316', text: '#fdba74' },
  'Центр':   { fill: '#1a3a2a', stroke: '#22c55e', text: '#86efac' },
  'Нижняя':  { fill: '#2d1f3a', stroke: '#a855f7', text: '#d8b4fe' },
  'VIP':     { fill: '#3a2a00', stroke: '#f59e0b', text: '#fde68a' },
  'Бар':     { fill: '#1f1f1f', stroke: '#6b7280', text: '#9ca3af' },
};

type Step = 'map' | 'form' | 'success';

export default function BookingPage() {
  const [selectedTable, setSelectedTable] = useState<TableConfig | null>(null);
  const [bookedTableIds, setBookedTableIds] = useState<Set<number>>(new Set());
  const [step, setStep] = useState<Step>('map');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:00');
  const [form, setForm] = useState({ name: '', phone: '', guests: 2, comment: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const today = new Date().toISOString().split('T')[0];

  // Загружаем занятые столы при смене даты/времени
  useEffect(() => {
    if (!date || !time) return;
    fetch(`/api/table-bookings?date=${date}&time=${time}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          const ids = new Set<number>(
            data
              .filter((b: any) => b.status !== 'cancelled')
              .map((b: any) => Number(b.table_number))
          );
          setBookedTableIds(ids);
        }
      })
      .catch(() => {});
  }, [date, time]);

  const handleTableClick = (table: TableConfig) => {
    if (table.zone === 'Бар') return; // бар не бронируется
    if (bookedTableIds.has(table.id)) return; // уже занят
    setSelectedTable(table);
    setError('');
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable || !date || !time) { setError('Заполните все поля'); return; }
    if (!form.name || !form.phone) { setError('Введите имя и телефон'); return; }
    if (form.guests > selectedTable.seats) {
      setError(`За этим столом максимум ${selectedTable.seats} мест`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/table-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_number: selectedTable.id,
          customer_name: form.name,
          customer_phone: form.phone,
          guests_count: form.guests,
          event_date: date,
          event_time: time,
          comment: form.comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка бронирования');
      setBookingResult(data);
      setStep('success');
      // Обновляем занятые столы
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
    setForm({ name: '', phone: '', guests: 2, comment: '' });
    setError('');
    setBookingResult(null);
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-white pt-20">
      {/* Header */}
      <div className="py-12 text-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-orange-400 text-sm font-medium tracking-[0.3em] uppercase mb-3">Онлайн-бронирование</p>
          <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Забронировать стол
          </h1>
          <p className="text-white/50">Выберите дату, время и стол на интерактивной схеме зала</p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">

          {/* ШАГ 1 — КАРТА ЗАЛА */}
          {step === 'map' && (
            <motion.div key="map" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {/* Выбор даты и времени */}
              <div className="bg-zinc-900 rounded-2xl p-5 border border-white/10 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                  <label className="col-span-2 md:col-span-1 block">
                    <span className="text-white/60 text-sm flex items-center gap-1 mb-1"><Calendar size={14} /> Дата</span>
                    <input type="date" value={date} min={today}
                      onChange={e => { setDate(e.target.value); setSelectedTable(null); }}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                  </label>
                  <label className="col-span-2 md:col-span-1 block">
                    <span className="text-white/60 text-sm flex items-center gap-1 mb-1"><Clock size={14} /> Время</span>
                    <select value={time} onChange={e => { setTime(e.target.value); setSelectedTable(null); }}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors">
                      {['11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                  <div className="col-span-2 flex flex-wrap gap-3 text-sm">
                    <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-zinc-700 border border-green-500 inline-block" />Свободен</span>
                    <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-red-900/60 border border-red-500 inline-block" />Занят</span>
                    <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-orange-600 border border-orange-400 inline-block" />Выбран</span>
                  </div>
                </div>
                {!date && (
                  <p className="text-orange-400 text-sm mt-3 flex items-center gap-2">
                    <Info size={14} /> Выберите дату чтобы увидеть доступные столы
                  </p>
                )}
              </div>

              {/* Схема зала */}
              <div className="bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden mb-6">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <h2 className="font-bold text-white">Схема зала</h2>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ZONE_COLORS).map(([zone, c]) => (
                      <span key={zone} className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: c.stroke, color: c.text, backgroundColor: c.fill + '80' }}>
                        {zone}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <svg viewBox="0 0 720 640" className="w-full min-w-[480px]" style={{ maxHeight: 520 }}>
                    {/* Фон зала */}
                    <rect x="30" y="30" width="660" height="590" rx="16" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />

                    {/* Подписи зон */}
                    <text x="40" y="175" fill="#6b7280" fontSize="11" fontWeight="600">ЛЕВАЯ ЗОНА</text>
                    <text x="250" y="48" fill="#6b7280" fontSize="11" fontWeight="600">ВЕРХНЯЯ ЗОНА</text>
                    <text x="270" y="200" fill="#6b7280" fontSize="11" fontWeight="600">ЦЕНТР</text>
                    <text x="200" y="520" fill="#6b7280" fontSize="11" fontWeight="600">НИЖНЯЯ ЗОНА</text>
                    <text x="560" y="148" fill="#6b7280" fontSize="11" fontWeight="600">БАР / VIP</text>

                    {/* Вход */}
                    <rect x="300" y="600" width="120" height="22" rx="4" fill="#292524" stroke="#78716c" strokeWidth="1" />
                    <text x="360" y="615" fill="#a8a29e" fontSize="11" textAnchor="middle">ВХОД</text>

                    {/* Стены */}
                    <line x1="30" y1="30" x2="690" y2="30" stroke="#52525b" strokeWidth="3" />
                    <line x1="30" y1="30" x2="30" y2="620" stroke="#52525b" strokeWidth="3" />
                    <line x1="690" y1="30" x2="690" y2="620" stroke="#52525b" strokeWidth="3" />

                    {/* Столы */}
                    {TABLES.map(table => {
                      const isBooked = bookedTableIds.has(table.id);
                      const isSelected = selectedTable?.id === table.id;
                      const isBar = table.zone === 'Бар';
                      const isHovered = hovered === table.id;
                      const zc = ZONE_COLORS[table.zone];

                      let fill = isBar ? '#27272a' : isBooked ? '#450a0a' : isSelected ? '#9a3412' : isHovered && !isBooked ? zc.fill : '#27272a';
                      let stroke = isBar ? '#6b7280' : isBooked ? '#ef4444' : isSelected ? '#f97316' : zc.stroke;
                      let opacity = isBar ? 0.7 : 1;

                      const cx = table.x + table.w / 2;
                      const cy = table.y + table.h / 2;

                      return (
                        <g key={table.id}
                          style={{ cursor: isBar ? 'default' : isBooked ? 'not-allowed' : 'pointer' }}
                          onClick={() => handleTableClick(table)}
                          onMouseEnter={() => setHovered(table.id)}
                          onMouseLeave={() => setHovered(null)}
                          opacity={opacity}
                        >
                          {/* Стул-точки вокруг стола (декоративные) */}
                          {!isBar && table.shape === 'round' && (
                            <>
                              <circle cx={cx} cy={table.y - 8} r="5" fill="#3f3f46" stroke={stroke} strokeWidth="1" />
                              <circle cx={cx} cy={table.y + table.h + 8} r="5" fill="#3f3f46" stroke={stroke} strokeWidth="1" />
                              <circle cx={table.x - 8} cy={cy} r="5" fill="#3f3f46" stroke={stroke} strokeWidth="1" />
                              <circle cx={table.x + table.w + 8} cy={cy} r="5" fill="#3f3f46" stroke={stroke} strokeWidth="1" />
                            </>
                          )}
                          {!isBar && table.shape === 'rect' && (
                            <>
                              <rect x={table.x + 6} y={table.y - 8} width="12" height="6" rx="2" fill="#3f3f46" stroke={stroke} strokeWidth="1" />
                              <rect x={table.x + table.w - 18} y={table.y - 8} width="12" height="6" rx="2" fill="#3f3f46" stroke={stroke} strokeWidth="1" />
                              <rect x={table.x + 6} y={table.y + table.h + 2} width="12" height="6" rx="2" fill="#3f3f46" stroke={stroke} strokeWidth="1" />
                              <rect x={table.x + table.w - 18} y={table.y + table.h + 2} width="12" height="6" rx="2" fill="#3f3f46" stroke={stroke} strokeWidth="1" />
                            </>
                          )}

                          {/* Поверхность стола */}
                          {table.shape === 'round'
                            ? <ellipse cx={cx} cy={cy} rx={table.w / 2} ry={table.h / 2} fill={fill} stroke={stroke} strokeWidth={isSelected ? 2.5 : 1.5} />
                            : <rect x={table.x} y={table.y} width={table.w} height={table.h} rx="6" fill={fill} stroke={stroke} strokeWidth={isSelected ? 2.5 : 1.5} />
                          }

                          {/* Номер стола */}
                          <text x={cx} y={cy - 4} fill={isBooked ? '#fca5a5' : isSelected ? '#fed7aa' : zc.text}
                            fontSize={table.id >= 16 ? "11" : "13"} fontWeight="700" textAnchor="middle" dominantBaseline="middle">
                            {table.label}
                          </text>
                          {/* Кол-во мест */}
                          <text x={cx} y={cy + 10} fill={isBooked ? '#fca5a5' : '#71717a'}
                            fontSize="9" textAnchor="middle" dominantBaseline="middle">
                            {isBar ? 'Бар' : isBooked ? '🔒' : `${table.seats} мест`}
                          </text>

                          {/* Подсветка при наведении */}
                          {isHovered && !isBooked && !isBar && (
                            table.shape === 'round'
                              ? <ellipse cx={cx} cy={cy} rx={table.w / 2 + 3} ry={table.h / 2 + 3} fill="none" stroke={stroke} strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />
                              : <rect x={table.x - 3} y={table.y - 3} width={table.w + 6} height={table.h + 6} rx="8" fill="none" stroke={stroke} strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />
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
                    <button
                      onClick={() => { if (!date) { setError('Сначала выберите дату'); return; } setStep('form'); }}
                      className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors whitespace-nowrap"
                    >
                      Забронировать →
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}

              {/* Список всех столов */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {TABLES.filter(t => t.zone !== 'Бар').map(table => {
                  const isBooked = bookedTableIds.has(table.id);
                  const isSelected = selectedTable?.id === table.id;
                  const zc = ZONE_COLORS[table.zone];
                  return (
                    <button key={table.id}
                      onClick={() => handleTableClick(table)}
                      disabled={isBooked}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isBooked ? 'border-red-800 bg-red-950/30 cursor-not-allowed opacity-60' :
                        isSelected ? 'border-orange-500 bg-orange-900/30' :
                        'border-white/10 bg-zinc-900 hover:border-orange-500/50 hover:bg-zinc-800'
                      }`}
                    >
                      <p className="font-bold text-sm" style={{ color: isBooked ? '#fca5a5' : zc.text }}>
                        Стол {table.id}
                        {table.id === 16 && ' ⭐'}
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
                {/* Инфо о столе */}
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
                      className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="Иван Иванов" required />
                  </label>
                  <label className="block">
                    <span className="text-white/60 text-sm">Телефон *</span>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="+7 (___) ___-__-__" type="tel" required />
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
                      className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                      rows={2} placeholder="Пожелания, повод, аллергии..." />
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
                    <span className="text-white font-medium">№{bookingResult.table_number} — {bookingResult.zone}</span>
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
                    <span className="text-orange-400 font-bold">#{bookingResult.id}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a href={`tel:+79257677778`}
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
