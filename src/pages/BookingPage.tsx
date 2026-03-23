import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, Phone, User, MessageSquare, CheckCircle, X } from 'lucide-react';

interface Reservation {
  id: number;
  table_number: number;
  customer_name: string;
  reservation_date: string;
  reservation_time: string;
  duration_hours: number;
  guests_count: number;
  status: string;
}

// Конфигурация столов: id, позиция x/y, ширина/высота, вместимость, зона
const TABLES = [
  // Левая сторона (5 столов вертикально)
  { id: 1,  x: 30,  y: 80,  w: 80, h: 55, cap: 4,  zone: 'left',   label: '1' },
  { id: 2,  x: 30,  y: 155, w: 80, h: 55, cap: 4,  zone: 'left',   label: '2' },
  { id: 3,  x: 30,  y: 230, w: 80, h: 55, cap: 4,  zone: 'left',   label: '3' },
  { id: 4,  x: 30,  y: 305, w: 80, h: 55, cap: 4,  zone: 'left',   label: '4' },
  { id: 5,  x: 30,  y: 380, w: 80, h: 55, cap: 4,  zone: 'left',   label: '5' },
  // Верхняя сторона (2 стола горизонтально)
  { id: 6,  x: 200, y: 20,  w: 120, h: 50, cap: 6, zone: 'top',    label: '6' },
  { id: 7,  x: 360, y: 20,  w: 120, h: 50, cap: 6, zone: 'top',    label: '7' },
  // Центр (5 столов)
  { id: 8,  x: 195, y: 130, w: 90, h: 60, cap: 6,  zone: 'center', label: '8' },
  { id: 9,  x: 310, y: 130, w: 90, h: 60, cap: 6,  zone: 'center', label: '9' },
  { id: 10, x: 195, y: 220, w: 90, h: 60, cap: 6,  zone: 'center', label: '10' },
  { id: 11, x: 310, y: 220, w: 90, h: 60, cap: 6,  zone: 'center', label: '11' },
  { id: 12, x: 252, y: 310, w: 90, h: 60, cap: 8,  zone: 'center', label: '12' },
  // Нижняя сторона (3 стола)
  { id: 13, x: 170, y: 410, w: 90, h: 55, cap: 4,  zone: 'bottom', label: '13' },
  { id: 14, x: 280, y: 410, w: 90, h: 55, cap: 4,  zone: 'bottom', label: '14' },
  { id: 15, x: 390, y: 410, w: 90, h: 55, cap: 4,  zone: 'bottom', label: '15' },
  // Правая сторона — бар + большой стол
  { id: 16, x: 530, y: 80,  w: 100, h: 160, cap: 8, zone: 'bar',   label: 'БАР' },
  { id: 17, x: 530, y: 270, w: 100, h: 100, cap: 12, zone: 'right', label: '17\nVIP' },
];

const TIME_SLOTS = ['11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];

export default function BookingPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [hoveredTable, setHoveredTable] = useState<number | null>(null);
  const [step, setStep] = useState<'map' | 'form' | 'success'>('map');
  const [form, setForm] = useState({ name: '', phone: '', guests: 2, time: '19:00', duration: 2, comment: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/table-reservations?date=${selectedDate}`)
      .then(r => r.json())
      .then(d => setReservations(Array.isArray(d) ? d : []));
  }, [selectedDate]);

  const getTableReservations = (tableId: number) =>
    reservations.filter(r => r.table_number === tableId);

  const isTableBusy = (tableId: number) => {
    const rsvs = getTableReservations(tableId);
    if (!rsvs.length) return false;
    if (!form.time) return rsvs.length > 0;
    const selectedStart = timeToMinutes(form.time);
    const selectedEnd = selectedStart + form.duration * 60;
    return rsvs.some(r => {
      const rStart = timeToMinutes(r.reservation_time);
      const rEnd = rStart + r.duration_hours * 60;
      return selectedStart < rEnd && selectedEnd > rStart;
    });
  };

  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  const getTableColor = (tableId: number) => {
    const busy = isTableBusy(tableId);
    const selected = selectedTable === tableId;
    const hovered = hoveredTable === tableId;
    if (selected) return { fill: '#E8631A', stroke: '#ff8c42', text: '#fff' };
    if (busy) return { fill: '#3f1a1a', stroke: '#7f1d1d', text: '#f87171' };
    if (hovered) return { fill: '#1c2a1c', stroke: '#4ade80', text: '#4ade80' };
    return { fill: '#1a1a2e', stroke: '#3a3a5c', text: '#a0a0c0' };
  };

  const handleTableClick = (tableId: number) => {
    if (isTableBusy(tableId)) return;
    setSelectedTable(tableId === selectedTable ? null : tableId);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) { setError('Заполните имя и телефон'); return; }
    if (!selectedTable) { setError('Выберите стол'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/table-reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_number: selectedTable,
          customer_name: form.name,
          customer_phone: form.phone,
          guests_count: form.guests,
          reservation_date: selectedDate,
          reservation_time: form.time,
          duration_hours: form.duration,
          comment: form.comment
        })
      });
      if (!res.ok) throw new Error('Ошибка');
      setStep('success');
      // Обновляем бронирования
      fetch(`/api/table-reservations?date=${selectedDate}`)
        .then(r => r.json()).then(d => setReservations(Array.isArray(d) ? d : []));
    } catch (e: any) {
      setError('Ошибка бронирования. Попробуйте ещё раз.');
    } finally { setLoading(false); }
  };

  const tableInfo = selectedTable ? TABLES.find(t => t.id === selectedTable) : null;

  return (
    <div className="bg-zinc-950 min-h-screen text-white pt-20">
      {/* Header */}
      <div className="py-14 text-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-orange-400 text-xs font-semibold tracking-[0.3em] uppercase mb-3">Онлайн-бронирование</p>
          <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Выбор стола
          </h1>
          <p className="text-white/40 text-sm max-w-md mx-auto">Выберите дату, время и стол на интерактивной схеме зала</p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        {step === 'success' ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto bg-zinc-900 rounded-3xl p-12 text-center border border-green-500/30">
            <CheckCircle className="text-green-400 mx-auto mb-6" size={64} />
            <h2 className="text-3xl font-black mb-3">Стол забронирован!</h2>
            <p className="text-white/50 mb-2">Стол <strong className="text-orange-400">№{selectedTable}</strong></p>
            <p className="text-white/50 mb-2">{selectedDate} в {form.time}</p>
            <p className="text-white/50 mb-8">Мы позвоним для подтверждения</p>
            <button onClick={() => { setStep('map'); setSelectedTable(null); setForm({ name:'',phone:'',guests:2,time:'19:00',duration:2,comment:'' }); }}
              className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
              Забронировать ещё
            </button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_340px] gap-8">
            {/* Левая колонка — схема */}
            <div>
              {/* Дата и время */}
              <div className="bg-zinc-900 rounded-2xl p-5 border border-white/10 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <label className="col-span-2 md:col-span-1 block">
                    <span className="text-white/50 text-xs mb-1 block flex items-center gap-1"><Calendar size={12}/> Дата</span>
                    <input type="date" value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => { setSelectedDate(e.target.value); setSelectedTable(null); }}
                      className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
                  </label>
                  <label className="block">
                    <span className="text-white/50 text-xs mb-1 block flex items-center gap-1"><Clock size={12}/> Время</span>
                    <select value={form.time} onChange={e => { setForm({...form, time: e.target.value}); setSelectedTable(null); }}
                      className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-white/50 text-xs mb-1 block flex items-center gap-1"><Clock size={12}/> Длительность</span>
                    <select value={form.duration} onChange={e => { setForm({...form, duration: Number(e.target.value)}); setSelectedTable(null); }}
                      className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500">
                      {[1,2,3,4,5].map(h => <option key={h} value={h}>{h} ч.</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-white/50 text-xs mb-1 block flex items-center gap-1"><Users size={12}/> Гостей</span>
                    <input type="number" min={1} max={50} value={form.guests}
                      onChange={e => setForm({...form, guests: Number(e.target.value)})}
                      className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
                  </label>
                </div>
              </div>

              {/* Легенда */}
              <div className="flex flex-wrap gap-4 mb-4 text-xs">
                {[
                  { color: '#1a1a2e', stroke: '#3a3a5c', label: 'Свободен' },
                  { color: '#3f1a1a', stroke: '#7f1d1d', label: 'Занят' },
                  { color: '#E8631A', stroke: '#ff8c42', label: 'Выбран' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded" style={{ background: l.color, border: `2px solid ${l.stroke}` }} />
                    <span className="text-white/50">{l.label}</span>
                  </div>
                ))}
              </div>

              {/* SVG схема зала */}
              <div className="bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-3 border-b border-white/10 flex items-center justify-between">
                  <span className="text-white/60 text-xs font-medium">🏠 Схема зала — «Соль и Перец»</span>
                  <span className="text-white/30 text-xs">Нажмите на стол для бронирования</span>
                </div>
                <div className="overflow-x-auto">
                  <svg viewBox="0 0 660 490" className="w-full max-w-full" style={{ minWidth: 320 }}>
                    {/* Фон зала */}
                    <rect x="0" y="0" width="660" height="490" fill="#0f0f1a" rx="0" />
                    {/* Стены */}
                    <rect x="10" y="10" width="640" height="470" fill="none" stroke="#2a2a4a" strokeWidth="2" rx="8" />

                    {/* Зоны подписи */}
                    <text x="30" y="68" fill="#3a3a5a" fontSize="9" fontFamily="sans-serif">ЛЕВАЯ ЗОНА</text>
                    <text x="200" y="14" fill="#3a3a5a" fontSize="9" fontFamily="sans-serif">ВЕРХНЯЯ ЗОНА</text>
                    <text x="230" y="118" fill="#3a3a5a" fontSize="9" fontFamily="sans-serif">ЦЕНТРАЛЬНАЯ ЗОНА</text>
                    <text x="185" y="400" fill="#3a3a5a" fontSize="9" fontFamily="sans-serif">НИЖНЯЯ ЗОНА</text>
                    <text x="530" y="68" fill="#3a3a5a" fontSize="9" fontFamily="sans-serif">БАР / VIP</text>

                    {/* Вход */}
                    <rect x="290" y="470" width="80" height="10" fill="#E8631A" opacity="0.4" rx="2" />
                    <text x="330" y="468" fill="#E8631A" fontSize="9" textAnchor="middle" fontFamily="sans-serif">ВХОД</text>

                    {/* Барная стойка декоративная */}
                    <rect x="522" y="60" width="6" height="320" fill="#2a1a0a" stroke="#5a3a1a" strokeWidth="1" rx="3" />

                    {/* Столы */}
                    {TABLES.map(table => {
                      const colors = getTableColor(table.id);
                      const busy = isTableBusy(table.id);
                      const rsvs = getTableReservations(table.id);
                      return (
                        <g key={table.id}
                          onClick={() => handleTableClick(table.id)}
                          onMouseEnter={() => setHoveredTable(table.id)}
                          onMouseLeave={() => setHoveredTable(null)}
                          style={{ cursor: busy ? 'not-allowed' : 'pointer' }}>
                          {/* Тень */}
                          <rect x={table.x + 3} y={table.y + 3} width={table.w} height={table.h}
                            fill="rgba(0,0,0,0.5)" rx="8" />
                          {/* Стол */}
                          <rect x={table.x} y={table.y} width={table.w} height={table.h}
                            fill={colors.fill} stroke={colors.stroke} strokeWidth="1.5" rx="8"
                            style={{ transition: 'all 0.15s' }} />

                          {/* Если занят — полосатый паттерн */}
                          {busy && (
                            <rect x={table.x} y={table.y} width={table.w} height={table.h}
                              fill="url(#busy-pattern)" rx="8" opacity="0.3" />
                          )}

                          {/* Номер стола */}
                          <text x={table.x + table.w / 2} y={table.y + table.h / 2 - (busy && rsvs.length ? 8 : 2)}
                            fill={colors.text} fontSize={table.id === 17 ? 9 : 12}
                            fontWeight="bold" textAnchor="middle" dominantBaseline="middle"
                            fontFamily="sans-serif" style={{ pointerEvents: 'none' }}>
                            {table.label.split('\n')[0]}
                          </text>
                          {table.label.includes('\n') && (
                            <text x={table.x + table.w / 2} y={table.y + table.h / 2 + 10}
                              fill={colors.text} fontSize="8" textAnchor="middle"
                              fontFamily="sans-serif" style={{ pointerEvents: 'none' }}>
                              {table.label.split('\n')[1]}
                            </text>
                          )}

                          {/* Вместимость */}
                          <text x={table.x + table.w / 2} y={table.y + table.h - 8}
                            fill={colors.text} fontSize="8" textAnchor="middle" opacity="0.6"
                            fontFamily="sans-serif" style={{ pointerEvents: 'none' }}>
                            до {table.cap} чел.
                          </text>

                          {/* Время брони если занят */}
                          {busy && rsvs.length > 0 && (
                            <text x={table.x + table.w / 2} y={table.y + table.h / 2 + 8}
                              fill="#f87171" fontSize="8" textAnchor="middle"
                              fontFamily="sans-serif" style={{ pointerEvents: 'none' }}>
                              {rsvs[0].reservation_time} ({rsvs[0].duration_hours}ч)
                            </text>
                          )}

                          {/* Стулья — декоративные точки */}
                          {[...Array(Math.min(table.cap, 6))].map((_, i) => {
                            const angle = (i / Math.min(table.cap, 6)) * Math.PI * 2 - Math.PI / 2;
                            const rx = table.w / 2 + 8;
                            const ry = table.h / 2 + 8;
                            const cx = table.x + table.w / 2 + Math.cos(angle) * rx;
                            const cy = table.y + table.h / 2 + Math.sin(angle) * ry;
                            return <circle key={i} cx={cx} cy={cy} r="4"
                              fill={busy ? '#3f1a1a' : '#1e1e3a'} stroke={colors.stroke} strokeWidth="1" />;
                          })}
                        </g>
                      );
                    })}

                    {/* Паттерн для занятых столов */}
                    <defs>
                      <pattern id="busy-pattern" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="8" x2="8" y2="0" stroke="#ef4444" strokeWidth="1" opacity="0.4" />
                      </pattern>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Список броней на выбранную дату */}
              {reservations.length > 0 && (
                <div className="mt-4 bg-zinc-900 rounded-2xl border border-white/10 p-4">
                  <p className="text-white/50 text-xs font-medium mb-3 uppercase tracking-wider">Брони на {selectedDate}</p>
                  <div className="space-y-2">
                    {reservations.map(r => (
                      <div key={r.id} className="flex items-center gap-3 text-sm">
                        <span className="w-8 h-8 bg-red-900/30 border border-red-500/30 rounded-lg flex items-center justify-center text-red-400 font-bold text-xs shrink-0">
                          {r.table_number}
                        </span>
                        <span className="text-white/70">Стол №{r.table_number}</span>
                        <span className="text-white/40">{r.reservation_time} — {r.guests_count} чел.</span>
                        <span className="text-white/30 text-xs ml-auto">{r.duration_hours}ч</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Правая колонка — форма */}
            <div>
              <AnimatePresence mode="wait">
                {!selectedTable ? (
                  <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="bg-zinc-900 rounded-2xl border border-white/10 p-8 text-center sticky top-24">
                    <div className="text-5xl mb-4">👆</div>
                    <h3 className="text-lg font-bold mb-2">Выберите стол</h3>
                    <p className="text-white/40 text-sm">Нажмите на свободный стол на схеме, чтобы забронировать его</p>
                    <div className="mt-6 space-y-2 text-left">
                      {TABLES.map(t => {
                        const busy = isTableBusy(t.id);
                        return (
                          <div key={t.id} onClick={() => !busy && handleTableClick(t.id)}
                            className={`flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${busy ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'}`}>
                            <span className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${busy ? 'bg-red-900/50 text-red-400' : 'bg-orange-600/20 text-orange-400'}`}>
                              {t.id}
                            </span>
                            <span className="text-white/60">Стол №{t.id}</span>
                            <span className="text-white/30 text-xs ml-auto">до {t.cap} чел.</span>
                            {busy && <span className="text-red-400 text-xs">занят</span>}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="bg-zinc-900 rounded-2xl border border-orange-500/30 p-6 sticky top-24">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-lg font-bold">Стол №{selectedTable}</h3>
                        <p className="text-white/40 text-xs">до {tableInfo?.cap} человек · {form.time} · {form.duration}ч</p>
                      </div>
                      <button onClick={() => setSelectedTable(null)} className="text-white/30 hover:text-white transition-colors">
                        <X size={20} />
                      </button>
                    </div>

                    <form onSubmit={submit} className="space-y-3">
                      <label className="block">
                        <span className="text-white/50 text-xs mb-1 block flex items-center gap-1"><User size={10}/> Ваше имя *</span>
                        <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                          className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-orange-500"
                          placeholder="Иван Иванов" required />
                      </label>
                      <label className="block">
                        <span className="text-white/50 text-xs mb-1 block flex items-center gap-1"><Phone size={10}/> Телефон *</span>
                        <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                          className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-orange-500"
                          placeholder="+7 (___) ___-__-__" type="tel" required />
                      </label>
                      <label className="block">
                        <span className="text-white/50 text-xs mb-1 block flex items-center gap-1"><MessageSquare size={10}/> Пожелания</span>
                        <textarea value={form.comment} onChange={e => setForm({...form, comment: e.target.value})}
                          className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-orange-500 resize-none"
                          rows={2} placeholder="Повод, пожелания к столу..." />
                      </label>

                      {/* Итог */}
                      <div className="bg-zinc-800 rounded-xl p-4 space-y-1.5 text-sm">
                        <div className="flex justify-between text-white/60">
                          <span>Стол</span><span className="text-orange-400 font-bold">№{selectedTable}</span>
                        </div>
                        <div className="flex justify-between text-white/60">
                          <span>Дата</span><span className="text-white">{selectedDate}</span>
                        </div>
                        <div className="flex justify-between text-white/60">
                          <span>Время</span><span className="text-white">{form.time} ({form.duration}ч)</span>
                        </div>
                        <div className="flex justify-between text-white/60">
                          <span>Гостей</span><span className="text-white">{form.guests}</span>
                        </div>
                      </div>

                      {error && <p className="text-red-400 text-xs">{error}</p>}

                      <button type="submit" disabled={loading}
                        className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-sm">
                        {loading ? 'Бронируем...' : '✓ Забронировать стол'}
                      </button>
                      <p className="text-white/20 text-xs text-center">
                        Нажимая кнопку, вы соглашаетесь с <a href="/privacy" className="underline">политикой</a>
                      </p>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
