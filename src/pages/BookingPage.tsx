import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Calendar, Clock, CheckCircle, ChevronLeft } from 'lucide-react';

// ─── Конфигурация столов ────────────────────────────────────────────────────

interface TableConfig {
  id: number;
  zone: string;
  seats: number;
  // SVG координаты для интерактивных зон
  x: number;
  y: number;
  w: number;
  h: number;
}

const TABLES: TableConfig[] = [
  // Зона A
  { id: 1,  zone: 'A', seats: 4,  x: 150, y: 445, w: 42, h: 42 },
  { id: 2,  zone: 'A', seats: 4,  x: 195, y: 395, w: 42, h: 42 },
  { id: 3,  zone: 'A', seats: 4,  x: 228, y: 350, w: 42, h: 42 },
  { id: 4,  zone: 'A', seats: 4,  x: 240, y: 430, w: 42, h: 42 },
  { id: 5,  zone: 'A', seats: 4,  x: 280, y: 365, w: 42, h: 42 },
  { id: 6,  zone: 'A', seats: 4,  x: 305, y: 290, w: 42, h: 42 },
  // Зона B
  { id: 7,  zone: 'B', seats: 4,  x: 365, y: 310, w: 42, h: 42 },
  { id: 8,  zone: 'B', seats: 4,  x: 400, y: 250, w: 42, h: 42 },
  { id: 9,  zone: 'B', seats: 4,  x: 450, y: 330, w: 42, h: 42 },
  { id: 10, zone: 'B', seats: 4,  x: 485, y: 260, w: 42, h: 42 },
  { id: 11, zone: 'B', seats: 4,  x: 425, y: 420, w: 42, h: 42 },
  { id: 15, zone: 'B', seats: 4,  x: 475, y: 420, w: 42, h: 42 },
  // Зона C
  { id: 12, zone: 'C', seats: 6,  x: 590, y: 270, w: 42, h: 42 },
  { id: 13, zone: 'C', seats: 6,  x: 700, y: 265, w: 42, h: 42 },
  { id: 14, zone: 'C', seats: 6,  x: 830, y: 270, w: 42, h: 42 },
  // Зона D
  { id: 16, zone: 'D', seats: 8,  x: 505, y: 502, w: 42, h: 42 },
  { id: 17, zone: 'D', seats: 8,  x: 650, y: 502, w: 42, h: 42 },
];

const ZONE_COLORS: Record<string, string> = {
  A: '#E53935', B: '#1565C0', C: '#2E7D32', D: '#7B1FA2',
};

type Step = 'map' | 'form' | 'success';

export default function BookingPage() {
  const [selectedTable, setSelectedTable] = useState<TableConfig | null>(null);
  const [bookedTables, setBookedTables] = useState<Record<number, boolean>>({});
  const [step, setStep] = useState<Step>('map');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', guests: 2, comment: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [tooltip, setTooltip] = useState<{ table: TableConfig; x: number; y: number } | null>(null);

  // Загружаем занятые столы на выбранную дату+время
  useEffect(() => {
    if (!date || !time) { setBookedTables({}); return; }
    fetch(`/api/table-bookings?date=${date}`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const booked: Record<number, boolean> = {};
        data.forEach((b: any) => {
          if (b.booking_time === time && b.status !== 'cancelled') {
            booked[b.table_number] = true;
          }
        });
        setBookedTables(booked);
      })
      .catch(() => {});
  }, [date, time]);

  const handleTableClick = (table: TableConfig) => {
    if (bookedTables[table.id]) return;
    setSelectedTable(table);
    setTooltip(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable || !date || !time) { setError('Заполните все поля'); return; }
    if (!form.name || !form.phone) { setError('Укажите имя и телефон'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/table-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_number: selectedTable.id,
          zone: selectedTable.zone,
          seats: selectedTable.seats,
          customer_name: form.name,
          customer_phone: form.phone,
          guests_count: form.guests,
          booking_date: date,
          booking_time: time,
          comment: form.comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка бронирования');
      setBookingResult(data);
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
    setForm({ name: '', phone: '', guests: 2, comment: '' });
    setBookingResult(null);
    setError('');
  };

  const today = new Date().toISOString().split('T')[0];

  const TIME_SLOTS = [
    '10:00','11:00','12:00','13:00','14:00','15:00',
    '16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00',
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-20">
      {/* Header */}
      <div className="py-10 text-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-orange-400 text-xs font-medium tracking-[0.3em] uppercase mb-3">Кафе «Соль и Перец»</p>
          <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Забронировать стол
          </h1>
          <p className="text-white/50">Выберите стол на схеме, дату и время — мы подтвердим бронь</p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">

        {/* Step: MAP */}
        {step === 'map' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

            {/* Date + Time picker */}
            <div className="bg-zinc-900 rounded-2xl p-5 mb-6 border border-white/10">
              <p className="text-white/60 text-sm mb-4 font-medium">Выберите дату и время для проверки доступности столов:</p>
              <div className="flex flex-wrap gap-4">
                <label className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
                  <span className="text-white/50 text-xs flex items-center gap-1.5"><Calendar size={13} /> Дата</span>
                  <input type="date" value={date} min={today}
                    onChange={e => setDate(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                </label>
                <label className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
                  <span className="text-white/50 text-xs flex items-center gap-1.5"><Clock size={13} /> Время</span>
                  <select value={time} onChange={e => setTime(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors">
                    <option value="">— выберите —</option>
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
              </div>
              {date && time && (
                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-white/50"><span className="w-3 h-3 rounded bg-zinc-700 inline-block" /> Свободен</span>
                  <span className="flex items-center gap-1.5 text-orange-400"><span className="w-3 h-3 rounded bg-orange-500 inline-block" /> Выбран</span>
                  <span className="flex items-center gap-1.5 text-red-400"><span className="w-3 h-3 rounded bg-red-700 inline-block" /> Занят</span>
                </div>
              )}
            </div>

            {/* SVG Map */}
            <div className="bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden relative">
              <div className="overflow-x-auto">
                <svg
                  viewBox="0 0 1050 720"
                  className="w-full"
                  style={{ minWidth: 520, fontFamily: "'Segoe UI','Helvetica Neue',Arial,sans-serif" }}
                >
                  <defs>
                    <filter id="venShadow"><feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.06"/></filter>
                    <filter id="boxShadow"><feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15"/></filter>
                    <filter id="tblShadow"><feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.25"/></filter>
                    <pattern id="floor" width="40" height="40" patternUnits="userSpaceOnUse">
                      <rect width="40" height="40" fill="#1a1a2e"/>
                      <rect width="20" height="20" fill="#1e1e35" opacity="0.5"/>
                      <rect x="20" y="20" width="20" height="20" fill="#1e1e35" opacity="0.5"/>
                    </pattern>
                    <pattern id="dfloor" width="25" height="25" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                      <rect width="25" height="25" fill="rgba(156,39,176,0.08)"/>
                      <rect width="12.5" height="12.5" fill="rgba(156,39,176,0.12)"/>
                      <rect x="12.5" y="12.5" width="12.5" height="12.5" fill="rgba(156,39,176,0.12)"/>
                    </pattern>
                    <clipPath id="venueClip">
                      <path d="M 100,490 L 310,225 L 890,225 L 890,560 L 435,560 L 435,490 Z"/>
                    </clipPath>
                  </defs>

                  {/* Фон */}
                  <rect width="1050" height="720" fill="#0f0f1a"/>

                  {/* Шапка */}
                  <rect width="1050" height="85" fill="#1B1B2F"/>
                  <text x="525" y="38" textAnchor="middle" fontSize="24" fontWeight="700" fill="#FFF" letterSpacing="5">СОЛЬ · ПЕРЕЦ</text>
                  <line x1="435" y1="50" x2="615" y2="50" stroke="#E53935" strokeWidth="2.5" strokeLinecap="round"/>
                  <text x="525" y="68" textAnchor="middle" fontSize="11" fill="#777" letterSpacing="2.5">СХЕМА БРОНИРОВАНИЯ СТОЛОВ</text>

                  {/* Контур */}
                  <path d="M 100,490 L 310,225 L 890,225 L 890,560 L 435,560 L 435,490 Z"
                    fill="url(#floor)" stroke="#333" strokeWidth="3" strokeLinejoin="round" filter="url(#venShadow)"/>

                  {/* Подсветка зон */}
                  <g clipPath="url(#venueClip)">
                    <path d="M 100,490 L 310,225 L 400,225 L 400,490 Z" fill="#E53935" opacity="0.04"/>
                    <rect x="400" y="225" width="160" height="265" fill="#1565C0" opacity="0.04"/>
                    <rect x="560" y="225" width="330" height="265" fill="#2E7D32" opacity="0.04"/>
                    <rect x="435" y="490" width="455" height="70" fill="#7B1FA2" opacity="0.06"/>
                  </g>

                  {/* Разделители */}
                  <line x1="400" y1="228" x2="400" y2="487" stroke="#333" strokeWidth="1" strokeDasharray="6,4"/>
                  <line x1="560" y1="228" x2="560" y2="487" stroke="#333" strokeWidth="1" strokeDasharray="6,4"/>
                  <line x1="438" y1="490" x2="887" y2="490" stroke="#333" strokeWidth="1" strokeDasharray="6,4"/>

                  {/* Названия зон */}
                  <text x="350" y="243" textAnchor="middle" fontSize="9" fill="#E53935" letterSpacing="2" fontWeight="600" opacity="0.7">ЗОНА A</text>
                  <text x="480" y="243" textAnchor="middle" fontSize="9" fill="#4A9EFF" letterSpacing="2" fontWeight="600" opacity="0.7">ЗОНА B</text>
                  <text x="725" y="243" textAnchor="middle" fontSize="9" fill="#4CAF50" letterSpacing="2" fontWeight="600" opacity="0.7">ЗОНА C</text>
                  <text x="660" y="553" textAnchor="middle" fontSize="9" fill="#CE93D8" letterSpacing="2" fontWeight="600" opacity="0.7">ЗОНА D</text>

                  {/* ВХОД */}
                  <rect x="55" y="473" width="52" height="36" rx="8" fill="#E53935" filter="url(#boxShadow)"/>
                  <text x="81" y="496" textAnchor="middle" fontSize="10" fill="#FFF" fontWeight="700" letterSpacing="1">ВХОД</text>
                  <polygon points="107,491 120,484 120,498" fill="#E53935"/>

                  {/* WC */}
                  <rect x="500" y="150" width="158" height="75" rx="12" fill="#388E3C" filter="url(#boxShadow)"/>
                  <text x="579" y="182" textAnchor="middle" fontSize="12" fill="#FFF" fontWeight="700">WC / КУРИЛКА</text>
                  <text x="579" y="200" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.7)">Туалет · Зона для курения</text>
                  <rect x="540" y="222" width="78" height="6" rx="3" fill="#388E3C" opacity="0.4"/>

                  {/* БАР */}
                  <rect x="890" y="268" width="78" height="172" rx="12" fill="#1565C0" filter="url(#boxShadow)"/>
                  <text transform="rotate(-90,929,354)" x="929" y="358" textAnchor="middle" fontSize="15" fill="#FFF" fontWeight="700" letterSpacing="3">БАР</text>
                  {[298,318,338,358,378,398,418].map(cy => (
                    <circle key={cy} cx="896" cy={cy} r="3.5" fill="rgba(255,255,255,0.25)"/>
                  ))}

                  {/* DJ */}
                  <g transform="rotate(-8,885,570)">
                    <rect x="855" y="548" width="60" height="44" rx="10" fill="#F57F17" filter="url(#boxShadow)"/>
                    <text x="885" y="575" textAnchor="middle" fontSize="13" fill="#FFF" fontWeight="700">DJ</text>
                  </g>

                  {/* ТАНЦПОЛ */}
                  <rect x="660" y="345" width="148" height="103" rx="14" fill="url(#dfloor)" stroke="#9C27B0" strokeWidth="2" strokeDasharray="8,4"/>
                  <text x="734" y="393" textAnchor="middle" fontSize="12" fill="#CE93D8" fontWeight="700" letterSpacing="1">ТАНЦПОЛ</text>
                  <text x="734" y="412" textAnchor="middle" fontSize="9" fill="#9C27B0" opacity="0.6">DANCE FLOOR</text>

                  {/* СТОЛЫ — интерактивные */}
                  {TABLES.map(table => {
                    const isBooked = bookedTables[table.id];
                    const isSelected = selectedTable?.id === table.id;
                    const zoneColor = ZONE_COLORS[table.zone];
                    let fill = '#2D2D2D';
                    if (isSelected) fill = '#E8631A';
                    else if (isBooked) fill = '#7f1d1d';
                    return (
                      <g
                        key={table.id}
                        style={{ cursor: isBooked ? 'not-allowed' : 'pointer' }}
                        onClick={() => handleTableClick(table)}
                        onMouseEnter={e => {
                          const svg = (e.target as SVGElement).closest('svg');
                          if (!svg) return;
                          const rect = svg.getBoundingClientRect();
                          const scaleX = rect.width / 1050;
                          const scaleY = rect.height / 720;
                          setTooltip({
                            table,
                            x: (table.x + table.w / 2) * scaleX,
                            y: (table.y - 15) * scaleY,
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        {/* Glow ring для выбранного */}
                        {isSelected && (
                          <rect x={table.x - 4} y={table.y - 4} width={table.w + 8} height={table.h + 8}
                            rx="11" fill="none" stroke="#E8631A" strokeWidth="2" opacity="0.6">
                            <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite"/>
                          </rect>
                        )}
                        {/* Зона-индикатор */}
                        <rect x={table.x} y={table.y} width={table.w} height={4} rx="2"
                          fill={isBooked ? '#7f1d1d' : isSelected ? '#E8631A' : zoneColor} opacity="0.8"/>
                        {/* Тело стола */}
                        <rect x={table.x} y={table.y} width={table.w} height={table.h} rx="8"
                          fill={fill} filter="url(#tblShadow)"
                          stroke={isSelected ? '#E8631A' : isBooked ? '#991b1b' : '#444'}
                          strokeWidth={isSelected ? 2 : 1}/>
                        {/* Номер */}
                        <text x={table.x + table.w / 2} y={table.y + table.h / 2 + 6}
                          textAnchor="middle" fontSize={table.id >= 10 ? 13 : 15}
                          fill={isBooked ? '#9ca3af' : '#FFF'} fontWeight="600">
                          {table.id}
                        </text>
                        {/* Крест для занятых */}
                        {isBooked && (
                          <>
                            <line x1={table.x + 6} y1={table.y + 6} x2={table.x + table.w - 6} y2={table.y + table.h - 6}
                              stroke="#ef4444" strokeWidth="1.5" opacity="0.5"/>
                            <line x1={table.x + table.w - 6} y1={table.y + 6} x2={table.x + 6} y2={table.y + table.h - 6}
                              stroke="#ef4444" strokeWidth="1.5" opacity="0.5"/>
                          </>
                        )}
                      </g>
                    );
                  })}

                  {/* ЛЕГЕНДА */}
                  <rect x="50" y="600" width="950" height="105" rx="12" fill="#1B1B2F" stroke="#333" strokeWidth="1"/>
                  <text x="525" y="623" textAnchor="middle" fontSize="10" fill="#555" letterSpacing="2" fontWeight="600">УСЛОВНЫЕ ОБОЗНАЧЕНИЯ</text>
                  <rect x="90"  y="640" width="18" height="18" rx="4" fill="#2D2D2D" stroke="#444" strokeWidth="1"/>
                  <text x="116" y="654" fontSize="11" fill="#888">Свободен</text>
                  <rect x="220" y="640" width="18" height="18" rx="4" fill="#E8631A"/>
                  <text x="246" y="654" fontSize="11" fill="#888">Выбран</text>
                  <rect x="340" y="640" width="18" height="18" rx="4" fill="#7f1d1d" stroke="#991b1b" strokeWidth="1"/>
                  <text x="366" y="654" fontSize="11" fill="#888">Занят</text>
                  <rect x="450" y="640" width="18" height="18" rx="4" fill="#E53935"/>
                  <text x="476" y="654" fontSize="11" fill="#888">Вход</text>
                  <rect x="540" y="640" width="18" height="18" rx="4" fill="#1565C0"/>
                  <text x="566" y="654" fontSize="11" fill="#888">Бар</text>
                  <rect x="630" y="640" width="18" height="18" rx="4" fill="#F57F17"/>
                  <text x="656" y="654" fontSize="11" fill="#888">DJ Зона</text>
                  <rect x="750" y="640" width="18" height="18" rx="4" fill="none" stroke="#9C27B0" strokeWidth="2"/>
                  <text x="776" y="654" fontSize="11" fill="#888">Танцпол</text>
                  <text x="525" y="688" textAnchor="middle" fontSize="10" fill="#444" letterSpacing="1">
                    ВСЕГО: 17 СТОЛОВ · ЗОНА A: 6 · ЗОНА B: 7 · ЗОНА C: 3 · ЗОНА D: 2
                  </text>
                </svg>
              </div>

              {/* Tooltip */}
              <AnimatePresence>
                {tooltip && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute pointer-events-none bg-zinc-800 border border-white/20 rounded-xl px-3 py-2 text-xs shadow-xl z-20"
                    style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
                  >
                    <p className="text-white font-bold">Стол №{tooltip.table.id}</p>
                    <p className="text-white/60">Зона {tooltip.table.zone} · {tooltip.table.seats} мест</p>
                    {bookedTables[tooltip.table.id]
                      ? <p className="text-red-400 mt-0.5">Занят на это время</p>
                      : <p className="text-green-400 mt-0.5">Свободен</p>
                    }
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Выбранный стол + кнопка */}
            <AnimatePresence>
              {selectedTable && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-6 bg-zinc-900 rounded-2xl p-5 border border-orange-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black text-white"
                      style={{ background: ZONE_COLORS[selectedTable.zone] }}>
                      {selectedTable.id}
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">Стол №{selectedTable.id}</p>
                      <p className="text-white/50 text-sm">Зона {selectedTable.zone} · до {selectedTable.seats} мест</p>
                      {date && time && <p className="text-orange-400 text-sm">{date} в {time}</p>}
                    </div>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button onClick={() => setSelectedTable(null)}
                      className="flex-1 sm:flex-none px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm">
                      Отменить
                    </button>
                    <button
                      onClick={() => {
                        if (!date || !time) { alert('Выберите дату и время'); return; }
                        setStep('form');
                      }}
                      className="flex-1 sm:flex-none px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all hover:scale-105 text-sm">
                      Забронировать →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!selectedTable && (
              <p className="text-center text-white/30 text-sm mt-6">
                {!date || !time ? '👆 Выберите дату и время, затем нажмите на стол на схеме' : '👆 Нажмите на свободный стол для бронирования'}
              </p>
            )}
          </motion.div>
        )}

        {/* Step: FORM */}
        {step === 'form' && selectedTable && (
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="max-w-lg mx-auto">
            <button onClick={() => setStep('map')}
              className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors text-sm">
              <ChevronLeft size={18} /> Назад к схеме
            </button>

            <div className="bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden">
              {/* Шапка формы */}
              <div className="p-5 border-b border-white/10 flex items-center gap-4"
                style={{ background: `${ZONE_COLORS[selectedTable.zone]}15` }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black text-white shrink-0"
                  style={{ background: ZONE_COLORS[selectedTable.zone] }}>
                  {selectedTable.id}
                </div>
                <div>
                  <p className="text-white font-bold text-lg">Стол №{selectedTable.id} · Зона {selectedTable.zone}</p>
                  <p className="text-white/50 text-sm">До {selectedTable.seats} мест · {date} в {time}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  <span className="text-white/60 text-sm">Количество гостей *</span>
                  <div className="mt-1 flex items-center gap-3">
                    <button type="button"
                      onClick={() => setForm(f => ({ ...f, guests: Math.max(1, f.guests - 1) }))}
                      className="w-11 h-11 rounded-xl bg-white/10 hover:bg-orange-600 text-white font-bold text-xl transition-colors">−</button>
                    <span className="text-white text-2xl font-black w-10 text-center">{form.guests}</span>
                    <button type="button"
                      onClick={() => setForm(f => ({ ...f, guests: Math.min(selectedTable.seats, f.guests + 1) }))}
                      className="w-11 h-11 rounded-xl bg-white/10 hover:bg-orange-600 text-white font-bold text-xl transition-colors">+</button>
                    <span className="text-white/40 text-sm ml-2">макс. {selectedTable.seats} чел.</span>
                  </div>
                </label>

                <label className="block">
                  <span className="text-white/60 text-sm">Пожелания</span>
                  <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })}
                    className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                    rows={3} placeholder="Отмечаем день рождения, нужен торт..." />
                </label>

                {error && (
                  <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3">
                    <p className="text-red-400 text-sm">❌ {error}</p>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all hover:scale-[1.02] text-base">
                  {loading ? 'Отправка...' : '🪑 Подтвердить бронирование'}
                </button>

                <p className="text-white/30 text-xs text-center">
                  Нажимая кнопку, вы соглашаетесь с <a href="/privacy" className="underline">политикой конфиденциальности</a>.
                  Мы позвоним для подтверждения.
                </p>
              </form>
            </div>
          </motion.div>
        )}

        {/* Step: SUCCESS */}
        {step === 'success' && bookingResult && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center">
            <div className="bg-zinc-900 rounded-3xl p-10 border border-green-500/30">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-green-400" size={48} />
              </motion.div>
              <h2 className="text-3xl font-black mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                Бронь принята!
              </h2>
              <p className="text-white/60 mb-6">Мы свяжемся с вами для подтверждения</p>

              <div className="bg-white/5 rounded-2xl p-5 text-left space-y-3 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Стол</span>
                  <span className="text-white font-bold">№{bookingResult.table_number} · Зона {bookingResult.zone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Дата</span>
                  <span className="text-white font-bold">{bookingResult.booking_date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Время</span>
                  <span className="text-white font-bold">{bookingResult.booking_time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Гостей</span>
                  <span className="text-white font-bold">{bookingResult.guests_count} чел.</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Номер брони</span>
                  <span className="text-orange-400 font-bold">#{bookingResult.id}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <a href="tel:+79257677778"
                  className="flex items-center justify-center gap-2 py-3 bg-green-700 hover:bg-green-600 text-white font-bold rounded-xl transition-colors">
                  <Phone size={18} /> +7 (925) 767-77-78
                </a>
                <button onClick={reset}
                  className="py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm">
                  Забронировать ещё один стол
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
