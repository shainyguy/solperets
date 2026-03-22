import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, X, Phone } from 'lucide-react';

interface TableInfo {
  id: number;
  zone: string;
  seats: number;
  x: number;
  y: number;
  w: number;
  h: number;
  rx: number;
}

const TABLES: TableInfo[] = [
  { id: 1,  zone: 'A', seats: 4, x: 150, y: 445, w: 42, h: 42, rx: 8 },
  { id: 2,  zone: 'A', seats: 4, x: 195, y: 395, w: 42, h: 42, rx: 8 },
  { id: 3,  zone: 'A', seats: 4, x: 228, y: 350, w: 42, h: 42, rx: 8 },
  { id: 4,  zone: 'A', seats: 4, x: 240, y: 430, w: 42, h: 42, rx: 8 },
  { id: 5,  zone: 'A', seats: 4, x: 280, y: 365, w: 42, h: 42, rx: 8 },
  { id: 6,  zone: 'A', seats: 4, x: 305, y: 290, w: 42, h: 42, rx: 8 },
  { id: 7,  zone: 'B', seats: 4, x: 365, y: 310, w: 42, h: 42, rx: 8 },
  { id: 8,  zone: 'B', seats: 4, x: 400, y: 250, w: 42, h: 42, rx: 8 },
  { id: 9,  zone: 'B', seats: 4, x: 450, y: 330, w: 42, h: 42, rx: 8 },
  { id: 10, zone: 'B', seats: 4, x: 485, y: 260, w: 42, h: 42, rx: 8 },
  { id: 11, zone: 'B', seats: 4, x: 425, y: 420, w: 42, h: 42, rx: 8 },
  { id: 12, zone: 'C', seats: 6, x: 590, y: 270, w: 42, h: 42, rx: 8 },
  { id: 13, zone: 'C', seats: 6, x: 700, y: 265, w: 42, h: 42, rx: 8 },
  { id: 14, zone: 'C', seats: 6, x: 830, y: 270, w: 42, h: 42, rx: 8 },
  { id: 15, zone: 'B', seats: 4, x: 475, y: 420, w: 42, h: 42, rx: 8 },
  { id: 16, zone: 'D', seats: 8, x: 505, y: 502, w: 42, h: 42, rx: 8 },
  { id: 17, zone: 'D', seats: 8, x: 650, y: 502, w: 42, h: 42, rx: 8 },
];

const ZONE_COLORS: Record<string, string> = {
  A: '#f97316', B: '#3b82f6', C: '#8b5cf6', D: '#10b981'
};

type TableStatus = 'free' | 'booked' | 'selected';

export default function BookingPage() {
  const [tableStatuses, setTableStatuses] = useState<Record<number, TableStatus>>({});
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
  const [step, setStep] = useState<'map' | 'form' | 'success'>('map');
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', time: '19:00', guests: 2, comment: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Загружаем бронирования чтобы показать занятые столы
    fetch('/api/bookings').then(r => r.json()).then(data => {
      if (!Array.isArray(data)) return;
      const statuses: Record<number, TableStatus> = {};
      data.forEach((b: any) => {
        if (b.table_number && b.status !== 'cancelled' && b.event_date === form.date) {
          statuses[b.table_number] = 'booked';
        }
      });
      setTableStatuses(statuses);
    }).catch(() => {});
  }, [form.date]);

  const getStatus = (id: number): TableStatus => {
    if (selectedTable?.id === id) return 'selected';
    return tableStatuses[id] || 'free';
  };

  const getTableColor = (id: number) => {
    const s = getStatus(id);
    if (s === 'selected') return '#E8631A';
    if (s === 'booked') return '#ef4444';
    return '#2D2D2D';
  };

  const handleTableClick = (t: TableInfo) => {
    if (getStatus(t.id) === 'booked') return;
    setSelectedTable(prev => prev?.id === t.id ? null : t);
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) { setError('Выберите стол на схеме'); return; }
    if (!form.name || !form.phone || !form.date) { setError('Заполните обязательные поля'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          customer_phone: form.phone,
          customer_email: form.email,
          event_type: 'Бронирование стола',
          event_date: form.date,
          event_time: form.time,
          guests_count: form.guests,
          extra_services: [],
          total_estimate: 0,
          comment: `Стол №${selectedTable.id} (Зона ${selectedTable.zone}). ${form.comment}`,
          table_number: selectedTable.id,
        })
      });
      if (!res.ok) throw new Error('Ошибка отправки');
      setStep('success');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-white pt-20">
      <div className="py-12 text-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-orange-400 text-sm font-medium tracking-[0.3em] uppercase mb-3">Онлайн-бронирование</p>
          <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Выберите стол</h1>
          <p className="text-white/50">Нажмите на стол на схеме, затем заполните форму</p>
        </motion.div>
      </div>

      {step === 'success' ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto px-4 pb-20 text-center">
          <div className="bg-zinc-900 rounded-3xl p-10 border border-green-500/30">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-black mb-3">Стол забронирован!</h2>
            <p className="text-white/60 mb-2">Стол <strong className="text-orange-400">№{selectedTable?.id}</strong>, Зона {selectedTable?.zone}</p>
            <p className="text-white/60 mb-2">{form.date} в {form.time}</p>
            <p className="text-white/60 mb-8">Гостей: {form.guests}</p>
            <p className="text-white/40 text-sm">Мы свяжемся с вами для подтверждения</p>
            <button onClick={() => { setStep('map'); setSelectedTable(null); setForm({ name:'', phone:'', email:'', date:'', time:'19:00', guests:2, comment:'' }); }}
              className="mt-6 px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
              Новое бронирование
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="max-w-7xl mx-auto px-2 sm:px-4 pb-20">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* SVG MAP */}
            <div className="lg:col-span-2">
              <div className="bg-zinc-900 rounded-3xl p-3 sm:p-5 border border-white/10">
                <div className="flex flex-wrap gap-3 mb-4 px-2">
                  {[
                    { color: '#2D2D2D', label: 'Свободен' },
                    { color: '#E8631A', label: 'Выбран' },
                    { color: '#ef4444', label: 'Занят' },
                  ].map(l => (
                    <div key={l.label} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ background: l.color }} />
                      <span className="text-white/50 text-xs">{l.label}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 ml-auto">
                    {Object.entries(ZONE_COLORS).map(([z, c]) => (
                      <div key={z} className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full" style={{ background: c }} />
                        <span className="text-white/40 text-xs">Зона {z}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full overflow-x-auto">
                  <svg viewBox="0 0 1050 720" className="w-full min-w-[320px]"
                    style={{ fontFamily: "'Segoe UI','Helvetica Neue',Arial,sans-serif" }}>
                    <defs>
                      <filter id="venShadow"><feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.06"/></filter>
                      <filter id="boxShadow"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.15"/></filter>
                      <filter id="tblShadow"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.25"/></filter>
                      <pattern id="floor" width="40" height="40" patternUnits="userSpaceOnUse">
                        <rect width="40" height="40" fill="#1a1a2e"/>
                        <rect width="20" height="20" fill="#1e1e35" opacity="0.5"/>
                        <rect x="20" y="20" width="20" height="20" fill="#1e1e35" opacity="0.5"/>
                      </pattern>
                      <pattern id="dfloor" width="25" height="25" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <rect width="25" height="25" fill="rgba(156,39,176,0.05)"/>
                        <rect width="12.5" height="12.5" fill="rgba(156,39,176,0.1)"/>
                        <rect x="12.5" y="12.5" width="12.5" height="12.5" fill="rgba(156,39,176,0.1)"/>
                      </pattern>
                      <clipPath id="venueClip">
                        <path d="M 100,490 L 310,225 L 890,225 L 890,560 L 435,560 L 435,490 Z"/>
                      </clipPath>
                    </defs>

                    {/* Фон */}
                    <rect width="1050" height="720" fill="#09090b"/>

                    {/* Шапка */}
                    <rect width="1050" height="85" fill="#1B1B2F"/>
                    <text x="525" y="38" textAnchor="middle" fontSize="24" fontWeight="700" fill="#FFF" letterSpacing="5">СОЛЬ · ПЕРЕЦ</text>
                    <line x1="435" y1="50" x2="615" y2="50" stroke="#E53935" strokeWidth="2.5" strokeLinecap="round"/>
                    <text x="525" y="68" textAnchor="middle" fontSize="11" fill="#777" letterSpacing="2.5">СХЕМА БРОНИРОВАНИЯ СТОЛОВ</text>

                    {/* Контур */}
                    <path d="M 100,490 L 310,225 L 890,225 L 890,560 L 435,560 L 435,490 Z"
                          fill="url(#floor)" stroke="#444" strokeWidth="3" strokeLinejoin="round" filter="url(#venShadow)"/>

                    {/* Зоны */}
                    <g clipPath="url(#venueClip)">
                      <path d="M 100,490 L 310,225 L 400,225 L 400,490 Z" fill="#f97316" opacity="0.05"/>
                      <rect x="400" y="225" width="160" height="265" fill="#3b82f6" opacity="0.04"/>
                      <rect x="560" y="225" width="330" height="265" fill="#8b5cf6" opacity="0.04"/>
                      <rect x="435" y="490" width="455" height="70" fill="#10b981" opacity="0.05"/>
                    </g>

                    {/* Разделители */}
                    <line x1="400" y1="228" x2="400" y2="487" stroke="#444" strokeWidth="1" strokeDasharray="6,4"/>
                    <line x1="560" y1="228" x2="560" y2="487" stroke="#444" strokeWidth="1" strokeDasharray="6,4"/>
                    <line x1="438" y1="490" x2="887" y2="490" stroke="#444" strokeWidth="1" strokeDasharray="6,4"/>

                    {/* Названия зон */}
                    <text x="350" y="243" textAnchor="middle" fontSize="9" fill="#f97316" letterSpacing="2" fontWeight="600">ЗОНА A</text>
                    <text x="480" y="243" textAnchor="middle" fontSize="9" fill="#3b82f6" letterSpacing="2" fontWeight="600">ЗОНА B</text>
                    <text x="725" y="243" textAnchor="middle" fontSize="9" fill="#8b5cf6" letterSpacing="2" fontWeight="600">ЗОНА C</text>
                    <text x="660" y="553" textAnchor="middle" fontSize="9" fill="#10b981" letterSpacing="2" fontWeight="600">ЗОНА D</text>

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
                      <circle key={cy} cx="896" cy={cy} r="3.5" fill="rgba(255,255,255,0.3)"/>
                    ))}

                    {/* DJ */}
                    <g transform="rotate(-8,885,570)">
                      <rect x="855" y="548" width="60" height="44" rx="10" fill="#F57F17" filter="url(#boxShadow)"/>
                      <text x="885" y="575" textAnchor="middle" fontSize="13" fill="#FFF" fontWeight="700">DJ</text>
                    </g>

                    {/* ТАНЦПОЛ */}
                    <rect x="660" y="345" width="148" height="103" rx="14" fill="url(#dfloor)" stroke="#9C27B0" strokeWidth="2" strokeDasharray="8,4"/>
                    <text x="734" y="393" textAnchor="middle" fontSize="12" fill="#CE93D8" fontWeight="700" letterSpacing="1">ТАНЦПОЛ</text>
                    <text x="734" y="412" textAnchor="middle" fontSize="9" fill="#9C27B0" opacity="0.7">DANCE FLOOR</text>

                    {/* СТОЛЫ — интерактивные */}
                    {TABLES.map(t => {
                      const status = getStatus(t.id);
                      const color = getTableColor(t.id);
                      const isBooked = status === 'booked';
                      const isSelected = status === 'selected';
                      const zoneColor = ZONE_COLORS[t.zone];
                      return (
                        <g key={t.id} onClick={() => handleTableClick(t)}
                          style={{ cursor: isBooked ? 'not-allowed' : 'pointer' }}>
                          {/* Зональный ореол */}
                          <rect x={t.x - 4} y={t.y - 4} width={t.w + 8} height={t.h + 8} rx={t.rx + 4}
                            fill={isSelected ? '#E8631A' : zoneColor} opacity={isSelected ? 0.4 : 0.15}/>
                          {/* Основной прямоугольник */}
                          <rect x={t.x} y={t.y} width={t.w} height={t.h} rx={t.rx}
                            fill={color} filter="url(#tblShadow)"
                            stroke={isSelected ? '#E8631A' : isBooked ? '#ef4444' : zoneColor}
                            strokeWidth={isSelected ? 3 : 1.5} opacity={isBooked ? 0.6 : 1}/>
                          {/* Номер */}
                          <text x={t.x + t.w / 2} y={t.y + t.h / 2 + 6}
                            textAnchor="middle" fontSize={t.id >= 10 ? 13 : 15}
                            fill={isBooked ? '#aaa' : '#FFF'} fontWeight="600">
                            {t.id}
                          </text>
                          {/* Иконка занятости */}
                          {isBooked && (
                            <text x={t.x + t.w - 8} y={t.y + 12} textAnchor="middle" fontSize="10" fill="#ef4444">✕</text>
                          )}
                          {isSelected && (
                            <text x={t.x + t.w - 8} y={t.y + 12} textAnchor="middle" fontSize="10" fill="#E8631A">✓</text>
                          )}
                        </g>
                      );
                    })}

                    {/* ЛЕГЕНДА */}
                    <rect x="50" y="600" width="950" height="105" rx="12" fill="#111" stroke="#333" strokeWidth="1"/>
                    <text x="525" y="623" textAnchor="middle" fontSize="10" fill="#555" letterSpacing="2" fontWeight="600">УСЛОВНЫЕ ОБОЗНАЧЕНИЯ</text>
                    <rect x="90" y="640" width="18" height="18" rx="4" fill="#2D2D2D" stroke="#666" strokeWidth="1.5"/>
                    <text x="116" y="654" fontSize="11" fill="#888">Свободен</text>
                    <rect x="220" y="640" width="18" height="18" rx="4" fill="#E8631A"/>
                    <text x="246" y="654" fontSize="11" fill="#888">Выбран</text>
                    <rect x="330" y="640" width="18" height="18" rx="4" fill="#ef4444" opacity="0.7"/>
                    <text x="356" y="654" fontSize="11" fill="#888">Занят</text>
                    <rect x="460" y="640" width="18" height="18" rx="4" fill="#E53935"/>
                    <text x="486" y="654" fontSize="11" fill="#888">Вход</text>
                    <rect x="560" y="640" width="18" height="18" rx="4" fill="#1565C0"/>
                    <text x="586" y="654" fontSize="11" fill="#888">Бар</text>
                    <rect x="650" y="640" width="18" height="18" rx="4" fill="#F57F17"/>
                    <text x="676" y="654" fontSize="11" fill="#888">DJ</text>
                    <rect x="750" y="640" width="18" height="18" rx="4" fill="none" stroke="#9C27B0" strokeWidth="2"/>
                    <text x="776" y="654" fontSize="11" fill="#888">Танцпол</text>
                    <text x="525" y="690" textAnchor="middle" fontSize="10" fill="#444" letterSpacing="1">17 СТОЛОВ · ЗОНА A: 6 · ЗОНА B: 7 · ЗОНА C: 3 · ЗОНА D: 2</text>
                  </svg>
                </div>

                {selectedTable && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-4 mx-2 p-4 bg-orange-600/20 border border-orange-500/40 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-orange-400 font-bold">Стол №{selectedTable.id} выбран</p>
                      <p className="text-white/60 text-sm">Зона {selectedTable.zone} · до {selectedTable.seats} мест</p>
                    </div>
                    <button onClick={() => setSelectedTable(null)} className="text-white/40 hover:text-white">
                      <X size={20} />
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* ФОРМА */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-900 rounded-3xl p-6 border border-white/10 sticky top-24">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Calendar className="text-orange-400" size={22} />
                  Забронировать стол
                </h2>

                {!selectedTable && (
                  <div className="mb-5 p-4 bg-orange-600/10 border border-orange-500/20 rounded-xl">
                    <p className="text-orange-400 text-sm">👆 Выберите стол на схеме слева</p>
                  </div>
                )}

                <form onSubmit={submitBooking} className="space-y-4">
                  <label className="block">
                    <span className="text-white/60 text-sm">Дата *</span>
                    <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors" required />
                  </label>
                  <label className="block">
                    <span className="text-white/60 text-sm">Время *</span>
                    <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
                      className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors" required />
                  </label>
                  <label className="block">
                    <span className="text-white/60 text-sm">Количество гостей *</span>
                    <div className="mt-1 flex items-center gap-3">
                      <button type="button" onClick={() => setForm({ ...form, guests: Math.max(1, form.guests - 1) })}
                        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-orange-600 flex items-center justify-center transition-colors text-white font-bold">−</button>
                      <span className="text-white text-xl font-bold w-8 text-center">{form.guests}</span>
                      <button type="button" onClick={() => setForm({ ...form, guests: Math.min(selectedTable?.seats || 10, form.guests + 1) })}
                        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-orange-600 flex items-center justify-center transition-colors text-white font-bold">+</button>
                      {selectedTable && <span className="text-white/40 text-sm">макс. {selectedTable.seats}</span>}
                    </div>
                  </label>
                  <label className="block">
                    <span className="text-white/60 text-sm">Имя *</span>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="Ваше имя" required />
                  </label>
                  <label className="block">
                    <span className="text-white/60 text-sm">Телефон *</span>
                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="+7 (___) ___-__-__" required />
                  </label>
                  <label className="block">
                    <span className="text-white/60 text-sm">Email</span>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                      className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="email@example.com" />
                  </label>
                  <label className="block">
                    <span className="text-white/60 text-sm">Пожелания</span>
                    <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })}
                      className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                      rows={2} placeholder="Особые пожелания..." />
                  </label>

                  {error && <p className="text-red-400 text-sm">{error}</p>}

                  <button type="submit" disabled={loading || !selectedTable}
                    className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                    {loading ? 'Отправка...' : <>Забронировать <ChevronRight size={18} /></>}
                  </button>

                  <p className="text-white/30 text-xs text-center">
                    Нажимая кнопку, вы соглашаетесь с <a href="/privacy" className="underline hover:text-white/50">политикой конфиденциальности</a>
                  </p>
                </form>

                <div className="mt-6 pt-5 border-t border-white/10">
                  <p className="text-white/40 text-xs mb-3">Или позвоните нам:</p>
                  <a href="tel:+79257677778" className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors font-medium">
                    <Phone size={16} /> +7 (925) 767-77-78
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile call button */}
      <div className="fixed bottom-6 right-6 md:hidden z-40">
        <a href="tel:+79257677778" className="flex items-center gap-2 px-5 py-3 bg-orange-600 text-white font-bold rounded-full shadow-lg">
          <Phone size={20} /> Позвонить
        </a>
      </div>
    </div>
  );
}
