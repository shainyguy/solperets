import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Phone, User, MessageSquare, CheckCircle, ChevronLeft, Info } from 'lucide-react';

const TABLES = [
  { id: 1,  zone: 'A', seats: 4,  x: 150, y: 445 },
  { id: 2,  zone: 'A', seats: 4,  x: 195, y: 395 },
  { id: 3,  zone: 'A', seats: 4,  x: 228, y: 350 },
  { id: 4,  zone: 'A', seats: 4,  x: 240, y: 430 },
  { id: 5,  zone: 'A', seats: 4,  x: 280, y: 365 },
  { id: 6,  zone: 'A', seats: 4,  x: 305, y: 290 },
  { id: 7,  zone: 'B', seats: 4,  x: 365, y: 310 },
  { id: 8,  zone: 'B', seats: 4,  x: 400, y: 250 },
  { id: 9,  zone: 'B', seats: 4,  x: 450, y: 330 },
  { id: 10, zone: 'B', seats: 4,  x: 485, y: 260 },
  { id: 11, zone: 'B', seats: 4,  x: 425, y: 420 },
  { id: 15, zone: 'B', seats: 4,  x: 475, y: 420 },
  { id: 12, zone: 'C', seats: 6,  x: 590, y: 270 },
  { id: 13, zone: 'C', seats: 6,  x: 700, y: 265 },
  { id: 14, zone: 'C', seats: 6,  x: 830, y: 270 },
  { id: 16, zone: 'D', seats: 8,  x: 505, y: 502 },
  { id: 17, zone: 'D', seats: 10, x: 650, y: 502 },
];

const ZONE_COLORS: Record<string, string> = {
  A: '#E8631A', B: '#2563eb', C: '#059669', D: '#9333ea'
};

const TIMES = ['12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00','23:00'];

interface Reservation { table_number: number; reservation_date: string; status: string; }

export default function BookingPage() {
  const [step, setStep] = useState<'map' | 'form' | 'success'>('map');
  const [selected, setSelected] = useState<typeof TABLES[0] | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:00', guests: 2, occasion: '', comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/reservations?date=${filterDate}`)
      .then(r => r.json()).then(d => setReservations(Array.isArray(d) ? d : [])).catch(() => {});
  }, [filterDate]);

  const isBusy = (id: number) =>
    reservations.some(r => r.table_number === id && r.reservation_date === form.date && r.status !== 'cancelled');

  const pickTable = (t: typeof TABLES[0]) => {
    if (isBusy(t.id)) return;
    setSelected(t);
    setForm(f => ({ ...f, guests: Math.min(f.guests, t.seats) }));
    setStep('form');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !form.name || !form.phone) { setError('Заполните обязательные поля'); return; }
    setLoading(true); setError('');
    try {
      const r = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_number: selected.id, zone: selected.zone, seats: selected.seats,
          customer_name: form.name, customer_phone: form.phone, customer_email: form.email,
          reservation_date: form.date, reservation_time: form.time,
          guests_count: form.guests, occasion: form.occasion, comment: form.comment
        })
      });
      if (!r.ok) throw new Error('Ошибка отправки');
      setStep('success');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const reset = () => {
    setStep('map'); setSelected(null); setError('');
    setForm({ name:'', phone:'', email:'', date: new Date().toISOString().split('T')[0], time:'19:00', guests:2, occasion:'', comment:'' });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-20">
      <div className="text-center py-10 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-orange-400 text-xs font-semibold tracking-[0.3em] uppercase mb-3">Онлайн-бронирование</p>
          <h1 className="text-4xl md:text-5xl font-black mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Выберите стол
          </h1>
          <p className="text-white/40 text-sm">Нажмите на свободный стол → заполните форму → готово</p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">

          {/* ── MAP ── */}
          {step === 'map' && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Date + legend */}
              <div className="flex flex-wrap items-center gap-4 mb-5">
                <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5">
                  <Calendar size={16} className="text-orange-400" />
                  <span className="text-white/50 text-sm">Дата:</span>
                  <input type="date" value={filterDate}
                    onChange={e => { setFilterDate(e.target.value); setForm(f => ({ ...f, date: e.target.value })); }}
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-transparent text-white text-sm focus:outline-none" />
                </div>
                <div className="flex gap-4 text-xs text-white/50">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-zinc-700 inline-block"/>Свободен</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-800 inline-block"/>Занят</span>
                </div>
              </div>

              {/* Map container */}
              <div className="bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <svg viewBox="0 0 1050 610" xmlns="http://www.w3.org/2000/svg"
                    style={{ minWidth: 580, width: '100%', maxHeight: 500 }}>
                    <defs>
                      <pattern id="floorDark" width="40" height="40" patternUnits="userSpaceOnUse">
                        <rect width="40" height="40" fill="#18181b"/>
                        <rect width="20" height="20" fill="#1f1f23" opacity="0.7"/>
                        <rect x="20" y="20" width="20" height="20" fill="#1f1f23" opacity="0.7"/>
                      </pattern>
                      <filter id="glow2"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                    </defs>

                    {/* Venue shape */}
                    <path d="M 100,490 L 310,225 L 890,225 L 890,560 L 435,560 L 435,490 Z"
                      fill="url(#floorDark)" stroke="#3f3f46" strokeWidth="2.5" strokeLinejoin="round"/>

                    {/* Zone dividers */}
                    <line x1="400" y1="228" x2="400" y2="487" stroke="#3f3f46" strokeWidth="1" strokeDasharray="5,4"/>
                    <line x1="560" y1="228" x2="560" y2="487" stroke="#3f3f46" strokeWidth="1" strokeDasharray="5,4"/>
                    <line x1="438" y1="490" x2="887" y2="490" stroke="#3f3f46" strokeWidth="1" strokeDasharray="5,4"/>

                    {/* Zone labels */}
                    {([['A',260,253],['B',480,243],['C',720,243],['D',660,543]] as [string,number,number][]).map(([z,x,y]) => (
                      <text key={z} x={x} y={y} textAnchor="middle" fontSize="9" fill="#52525b" letterSpacing="3" fontWeight="700">ЗОНА {z}</text>
                    ))}

                    {/* Entrance */}
                    <rect x="55" y="473" width="52" height="36" rx="8" fill="#dc2626"/>
                    <text x="81" y="496" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="700">ВХОД</text>
                    <polygon points="107,491 120,484 120,498" fill="#dc2626"/>

                    {/* WC */}
                    <rect x="500" y="150" width="130" height="58" rx="10" fill="#166534"/>
                    <text x="565" y="176" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="700">WC / КУРИЛКА</text>
                    <text x="565" y="194" textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.55)">Туалет · Зона для курения</text>

                    {/* Bar */}
                    <rect x="892" y="268" width="68" height="172" rx="10" fill="#1d4ed8"/>
                    <text transform="rotate(-90,926,354)" x="926" y="358" textAnchor="middle" fontSize="14" fill="#fff" fontWeight="700" letterSpacing="3">БАР</text>

                    {/* DJ */}
                    <rect x="856" y="548" width="54" height="36" rx="8" fill="#d97706"/>
                    <text x="883" y="571" textAnchor="middle" fontSize="12" fill="#fff" fontWeight="700">DJ</text>

                    {/* Dancefloor */}
                    <rect x="660" y="345" width="148" height="103" rx="12"
                      fill="rgba(147,51,234,0.1)" stroke="#9333ea" strokeWidth="1.5" strokeDasharray="6,4"/>
                    <text x="734" y="393" textAnchor="middle" fontSize="11" fill="#a855f7" fontWeight="700">ТАНЦПОЛ</text>

                    {/* Tables */}
                    {TABLES.map(t => {
                      const busy = isBusy(t.id);
                      const isHov = hovered === t.id;
                      const zc = ZONE_COLORS[t.zone];
                      const fill = busy ? '#450a0a' : isHov ? '#2d2d30' : '#1c1c1f';
                      const stroke = busy ? '#dc2626' : isHov ? zc : '#3f3f46';
                      const sw = isHov && !busy ? 2.5 : 1.5;

                      return (
                        <g key={t.id}
                          onClick={() => pickTable(t)}
                          onMouseEnter={() => setHovered(t.id)}
                          onMouseLeave={() => setHovered(null)}
                          style={{ cursor: busy ? 'not-allowed' : 'pointer' }}
                          filter={isHov && !busy ? 'url(#glow2)' : undefined}>
                          {/* Table rect */}
                          <rect x={t.x} y={t.y} width="44" height="44" rx="9"
                            fill={fill} stroke={stroke} strokeWidth={sw}/>
                          {/* Table number */}
                          <text x={t.x + 22} y={t.y + 29} textAnchor="middle"
                            fontSize={t.id >= 10 ? 13 : 15} fill={busy ? '#ef4444' : '#fff'} fontWeight="700">
                            {t.id}
                          </text>
                          {/* Seats badge */}
                          <rect x={t.x + 27} y={t.y - 9} width="24" height="15" rx="5" fill={busy ? '#7f1d1d' : zc}/>
                          <text x={t.x + 39} y={t.y + 1} textAnchor="middle" fontSize="8" fill="#fff" fontWeight="700">
                            {t.seats}м
                          </text>
                          {/* Busy tag */}
                          {busy && (
                            <text x={t.x + 22} y={t.y + 57} textAnchor="middle" fontSize="7" fill="#ef4444">занят</text>
                          )}
                        </g>
                      );
                    })}

                    {/* Hover tooltip */}
                    {hovered && (() => {
                      const t = TABLES.find(x => x.id === hovered);
                      if (!t) return null;
                      const busy = isBusy(t.id);
                      return (
                        <g pointerEvents="none">
                          <rect x={t.x - 16} y={t.y - 50} width="88" height="38" rx="7"
                            fill="#09090b" stroke="#3f3f46" strokeWidth="1"/>
                          <text x={t.x + 22} y={t.y - 30} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="600">
                            Стол {t.id} · Зона {t.zone}
                          </text>
                          <text x={t.x + 22} y={t.y - 17} textAnchor="middle" fontSize="9"
                            fill={busy ? '#f87171' : '#4ade80'}>
                            {busy ? 'Занят на эту дату' : `Свободен · ${t.seats} мест`}
                          </text>
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>

              {/* Zone chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {(Object.entries(ZONE_COLORS) as [string,string][]).map(([zone, color]) => (
                  <div key={zone} className="bg-zinc-900 rounded-xl p-3 border border-white/10 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: color }}/>
                    <div>
                      <p className="text-white text-sm font-semibold">Зона {zone}</p>
                      <p className="text-white/40 text-xs">{TABLES.filter(t => t.zone === zone).length} стола</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 p-4 bg-orange-900/20 border border-orange-500/20 rounded-xl flex gap-3">
                <Info size={15} className="text-orange-400 shrink-0 mt-0.5"/>
                <p className="text-orange-200/60 text-sm">
                  Нажмите на свободный стол. Бронь подтверждается администратором по звонку.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── FORM ── */}
          {step === 'form' && selected && (
            <motion.div key="form" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <button onClick={() => setStep('map')}
                className="flex items-center gap-2 text-white/40 hover:text-white mb-6 transition-colors text-sm">
                <ChevronLeft size={16}/> Назад к схеме
              </button>

              <div className="max-w-md mx-auto">
                {/* Selected table */}
                <div className="rounded-2xl p-4 border mb-6 flex items-center gap-4"
                  style={{ background: ZONE_COLORS[selected.zone] + '15', borderColor: ZONE_COLORS[selected.zone] + '40' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-black shrink-0"
                    style={{ background: ZONE_COLORS[selected.zone] }}>
                    {selected.id}
                  </div>
                  <div>
                    <p className="text-white font-bold">Стол #{selected.id} · Зона {selected.zone}</p>
                    <p className="text-white/50 text-sm">до {selected.seats} мест</p>
                  </div>
                </div>

                <form onSubmit={submit} className="space-y-4">
                  {/* Name */}
                  <label className="block">
                    <span className="text-white/40 text-xs uppercase tracking-wider">Имя *</span>
                    <div className="relative mt-1">
                      <User size={15} className="absolute left-3 top-3.5 text-white/25"/>
                      <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="Ваше имя" required/>
                    </div>
                  </label>

                  {/* Phone */}
                  <label className="block">
                    <span className="text-white/40 text-xs uppercase tracking-wider">Телефон *</span>
                    <div className="relative mt-1">
                      <Phone size={15} className="absolute left-3 top-3.5 text-white/25"/>
                      <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="+7 (___) ___-__-__" type="tel" required/>
                    </div>
                  </label>

                  {/* Date + Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-white/40 text-xs uppercase tracking-wider">Дата *</span>
                      <div className="relative mt-1">
                        <Calendar size={15} className="absolute left-3 top-3.5 text-white/25"/>
                        <input type="date" value={form.date}
                          onChange={e => setForm({...form, date: e.target.value})}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors" required/>
                      </div>
                    </label>
                    <label className="block">
                      <span className="text-white/40 text-xs uppercase tracking-wider">Время *</span>
                      <div className="relative mt-1">
                        <Clock size={15} className="absolute left-3 top-3.5 text-white/25"/>
                        <select value={form.time} onChange={e => setForm({...form, time: e.target.value})}
                          className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none">
                          {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </label>
                  </div>

                  {/* Guests */}
                  <label className="block">
                    <span className="text-white/40 text-xs uppercase tracking-wider">Гостей (макс. {selected.seats})</span>
                    <div className="mt-2 flex items-center gap-3">
                      <button type="button" onClick={() => setForm(f => ({...f, guests: Math.max(1, f.guests-1)}))}
                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-orange-600 flex items-center justify-center text-white font-bold transition-colors">−</button>
                      <span className="text-3xl font-black text-orange-400 w-10 text-center">{form.guests}</span>
                      <button type="button" onClick={() => setForm(f => ({...f, guests: Math.min(selected.seats, f.guests+1)}))}
                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-orange-600 flex items-center justify-center text-white font-bold transition-colors">+</button>
                      <div className="flex gap-1.5 flex-wrap ml-2">
                        {Array.from({length: selected.seats}, (_, i) => i+1).map(n => (
                          <button key={n} type="button" onClick={() => setForm(f => ({...f, guests: n}))}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${form.guests===n ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/40 hover:bg-white/20'}`}>
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </label>

                  {/* Occasion */}
                  <label className="block">
                    <span className="text-white/40 text-xs uppercase tracking-wider">Повод (необязательно)</span>
                    <input value={form.occasion} onChange={e => setForm({...form, occasion: e.target.value})}
                      className="mt-1 w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-orange-500 transition-colors"
                      placeholder="День рождения, свидание, встреча..."/>
                  </label>

                  {/* Comment */}
                  <label className="block">
                    <span className="text-white/40 text-xs uppercase tracking-wider">Пожелания</span>
                    <div className="relative mt-1">
                      <MessageSquare size={15} className="absolute left-3 top-3.5 text-white/25"/>
                      <textarea value={form.comment} onChange={e => setForm({...form, comment: e.target.value})}
                        className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                        rows={2} placeholder="Аллергии, украшение стола, высокий стул..."/>
                    </div>
                  </label>

                  {error && (
                    <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3">
                      <p className="text-red-400 text-sm">⚠️ {error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-base">
                    {loading ? 'Отправка...' : '✓ Забронировать стол'}
                  </button>
                  <p className="text-white/20 text-xs text-center">
                    Бронь подтверждается администратором по звонку
                  </p>
                </form>
              </div>
            </motion.div>
          )}

          {/* ── SUCCESS ── */}
          {step === 'success' && selected && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="max-w-sm mx-auto text-center py-16">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-400"/>
              </motion.div>
              <h2 className="text-3xl font-black mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Готово!</h2>
              <div className="bg-zinc-900 rounded-2xl p-5 border border-white/10 mb-6 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Стол</span>
                  <span className="text-white font-semibold">#{selected.id} · Зона {selected.zone}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Дата и время</span>
                  <span className="text-white font-semibold">{form.date} в {form.time}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Гостей</span>
                  <span className="text-white font-semibold">{form.guests} чел.</span>
                </div>
              </div>
              <p className="text-white/40 text-sm mb-8">
                Администратор позвонит на {form.phone} для подтверждения
              </p>
              <button onClick={reset}
                className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
                Забронировать ещё
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile call button */}
      <div className="fixed bottom-6 right-6 md:hidden z-40">
        <a href="tel:+79257677778"
          className="flex items-center gap-2 px-5 py-3 bg-orange-600 text-white font-bold rounded-full shadow-lg transition-all hover:scale-105">
          <Phone size={18}/> Позвонить
        </a>
      </div>
    </div>
  );
}
