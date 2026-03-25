import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users } from 'lucide-react';

// ─── Схема зала: 17 столов ───────────────────────────────────────────────────
// Слева 5, сверху 2, справа бар + стол №8 (большой), снизу 3, по середине 5
// Стол №17 на карте — 10 мест, Бар — 2 места, остальные 4–6 мест

interface Table {
  id: number;
  zone: string;
  seats: number;
  maxSeats: number;
  shape: 'round' | 'rect';
  isBar?: boolean;
}

const TABLES: Table[] = [
  // Левая стена — 5 столов (диванчики у стены, 4–6 мест)
  { id: 1,  zone: 'Левая стена',   seats: 4, maxSeats: 6,  shape: 'rect' },
  { id: 2,  zone: 'Левая стена',   seats: 4, maxSeats: 6,  shape: 'rect' },
  { id: 3,  zone: 'Левая стена',   seats: 4, maxSeats: 6,  shape: 'rect' },
  { id: 4,  zone: 'Левая стена',   seats: 4, maxSeats: 6,  shape: 'rect' },
  { id: 5,  zone: 'Левая стена',   seats: 4, maxSeats: 6,  shape: 'rect' },
  // Верхняя стена — 2 стола
  { id: 6,  zone: 'Верхняя стена', seats: 4, maxSeats: 6,  shape: 'rect' },
  { id: 7,  zone: 'Верхняя стена', seats: 4, maxSeats: 6,  shape: 'rect' },
  // Правая сторона — большой стол №8
  { id: 8,  zone: 'Правая стена',  seats: 6, maxSeats: 10, shape: 'rect' },
  // Нижняя стена — 3 стола
  { id: 9,  zone: 'Нижняя стена',  seats: 4, maxSeats: 6,  shape: 'rect' },
  { id: 10, zone: 'Нижняя стена',  seats: 4, maxSeats: 6,  shape: 'rect' },
  { id: 11, zone: 'Нижняя стена',  seats: 4, maxSeats: 6,  shape: 'rect' },
  // Центр — 5 круглых столов
  { id: 12, zone: 'Центр',         seats: 4, maxSeats: 6,  shape: 'round' },
  { id: 13, zone: 'Центр',         seats: 4, maxSeats: 6,  shape: 'round' },
  { id: 14, zone: 'Центр',         seats: 4, maxSeats: 6,  shape: 'round' },
  { id: 15, zone: 'Центр',         seats: 4, maxSeats: 6,  shape: 'round' },
  { id: 16, zone: 'Центр',         seats: 4, maxSeats: 6,  shape: 'round' },
  // Большой стол №17 — 10 мест (карта)
  { id: 17, zone: 'Карта',         seats: 8, maxSeats: 10, shape: 'rect' },
  // Бар — 2 места
  { id: 18, zone: 'Бар',           seats: 2, maxSeats: 2,  shape: 'rect', isBar: true },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function TableBookingModal({ isOpen, onClose }: Props) {
  const [step, setStep] = useState<'map' | 'form' | 'success'>('map');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', guests: 2, date: '', time: '19:00', occasion: '', comment: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    onClose();
    setTimeout(() => { setStep('map'); setSelectedTable(null); setError(''); setForm({ name: '', phone: '', guests: 2, date: '', time: '19:00', occasion: '', comment: '' }); }, 300);
  };

  const handleSelectTable = (t: Table) => {
    if (t.isBar) return;
    setSelectedTable(t);
    setForm(f => ({ ...f, guests: Math.min(f.guests, t.maxSeats) }));
    setStep('form');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date) { setError('Заполните все обязательные поля'); return; }
    if (form.guests > selectedTable!.maxSeats) { setError(`Максимум ${selectedTable!.maxSeats} гостей за этим столом`); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/table-reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_number:     selectedTable!.id,
          seats:            selectedTable!.maxSeats,
          customer_name:    form.name,
          customer_phone:   form.phone,
          guests_count:     form.guests,
          reservation_date: form.date,
          reservation_time: form.time,
          occasion:         form.occasion || null,
          comment:          form.comment  || null,
        })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Ошибка отправки'); setLoading(false); return; }
      setStep('success');
    } catch { setError('Ошибка соединения. Попробуйте ещё раз.'); }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 z-50 backdrop-blur-sm" onClick={handleClose} />

          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="fixed inset-2 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl bg-zinc-900 rounded-3xl z-50 overflow-hidden flex flex-col shadow-2xl border border-white/10"
            style={{ maxHeight: '95vh' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <div>
                <h2 className="text-xl font-black text-white">
                  {step === 'map' ? '🪑 Выберите стол' : step === 'form' ? `Стол №${selectedTable?.id} — бронирование` : '✅ Забронировано!'}
                </h2>
                <p className="text-white/40 text-xs mt-0.5">
                  {step === 'map' && 'Нажмите на стол чтобы выбрать'}
                  {step === 'form' && `${selectedTable?.zone} · до ${selectedTable?.maxSeats} гостей`}
                  {step === 'success' && 'Ожидайте подтверждения'}
                </p>
              </div>
              <button onClick={handleClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">

              {/* ═══ СХЕМА ЗАЛА ═══ */}
              {step === 'map' && (
                <div className="p-4 md:p-5">
                  {/* Легенда */}
                  <div className="flex flex-wrap gap-3 mb-4 text-xs">
                    <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-zinc-600 border border-zinc-500" /><span className="text-white/50">Свободен</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-orange-600" /><span className="text-white/50">Выбран</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded bg-zinc-800 border border-white/10" /><span className="text-white/50">Бар</span></div>
                  </div>

                  {/* Зал */}
                  <div className="relative bg-zinc-950 rounded-2xl border border-white/10 p-4 md:p-5" style={{ minHeight: 380 }}>
                    {/* Метки стен */}
                    {[
                      { cls: 'top-1.5 left-1/2 -translate-x-1/2', text: '▲ Верхняя стена' },
                      { cls: 'bottom-5 left-1/2 -translate-x-1/2', text: '▼ Нижняя стена' },
                      { cls: 'left-1 top-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap', text: '◄ Левая стена' },
                    ].map(m => (
                      <div key={m.text} className={`absolute text-white/15 text-xs pointer-events-none ${m.cls}`}>{m.text}</div>
                    ))}

                    {/* Вход */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <div className="w-14 h-1.5 bg-orange-500 rounded-t-sm" />
                      <span className="text-orange-400 text-xs font-medium mt-0.5">🚪 Вход</span>
                    </div>

                    <div className="flex flex-col gap-3 pb-6">

                      {/* Верхняя стена — столы 6,7 */}
                      <div className="flex justify-center gap-3">
                        {TABLES.filter(t => t.zone === 'Верхняя стена').map(t => (
                          <TableBtn key={t.id} table={t} selected={selectedTable?.id === t.id} onClick={() => handleSelectTable(t)} />
                        ))}
                      </div>

                      {/* Средняя полоса */}
                      <div className="flex gap-2 items-stretch">

                        {/* Левая стена — столы 1–5 */}
                        <div className="flex flex-col gap-2 shrink-0">
                          {TABLES.filter(t => t.zone === 'Левая стена').map(t => (
                            <TableBtn key={t.id} table={t} selected={selectedTable?.id === t.id} onClick={() => handleSelectTable(t)} />
                          ))}
                        </div>

                        {/* Центр — столы 12–16 */}
                        <div className="flex-1 flex flex-wrap gap-2.5 justify-center items-center px-2">
                          {TABLES.filter(t => t.zone === 'Центр').map(t => (
                            <TableBtn key={t.id} table={t} selected={selectedTable?.id === t.id} onClick={() => handleSelectTable(t)} round />
                          ))}
                          {/* Стол 17 — карта (большой) */}
                          {TABLES.filter(t => t.zone === 'Карта').map(t => (
                            <TableBtn key={t.id} table={t} selected={selectedTable?.id === t.id} onClick={() => handleSelectTable(t)} large />
                          ))}
                        </div>

                        {/* Правая сторона — Бар + стол 8 */}
                        <div className="flex flex-col gap-2 shrink-0 items-center justify-start">
                          {/* Бар */}
                          <div className="bg-zinc-800 border border-white/10 rounded-xl px-2 py-2 text-center w-14">
                            <div className="text-2xl">🍸</div>
                            <div className="text-white/30 text-xs font-bold leading-tight">БАР</div>
                            <div className="text-white/20 text-xs">2 м</div>
                          </div>
                          {/* Стол 8 */}
                          {TABLES.filter(t => t.zone === 'Правая стена').map(t => (
                            <TableBtn key={t.id} table={t} selected={selectedTable?.id === t.id} onClick={() => handleSelectTable(t)} large />
                          ))}
                        </div>
                      </div>

                      {/* Нижняя стена — столы 9–11 */}
                      <div className="flex justify-center gap-3">
                        {TABLES.filter(t => t.zone === 'Нижняя стена').map(t => (
                          <TableBtn key={t.id} table={t} selected={selectedTable?.id === t.id} onClick={() => handleSelectTable(t)} />
                        ))}
                      </div>

                    </div>
                  </div>

                  <p className="text-white/25 text-xs text-center mt-3">Схема ознакомительная. Администратор подтвердит бронь звонком.</p>
                </div>
              )}

              {/* ═══ ФОРМА ═══ */}
              {step === 'form' && (
                <form onSubmit={submit} className="p-5 space-y-4">
                  {/* Выбранный стол */}
                  <div className="bg-orange-600/10 border border-orange-500/30 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black text-xl shrink-0">
                      {selectedTable?.id}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold">Стол №{selectedTable?.id}</p>
                      <p className="text-white/50 text-sm">{selectedTable?.zone} · до {selectedTable?.maxSeats} гостей</p>
                    </div>
                    <button type="button" onClick={() => setStep('map')}
                      className="text-orange-400 text-sm hover:text-orange-300 transition-colors font-medium">
                      Изменить
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-white/60 text-sm">Ваше имя *</span>
                      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                        className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="Имя" />
                    </label>
                    <label className="block">
                      <span className="text-white/60 text-sm">Телефон *</span>
                      <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required type="tel"
                        className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 transition-colors"
                        placeholder="+7 (___) ___-__-__" />
                    </label>
                    <label className="block">
                      <span className="text-white/60 text-sm">Дата *</span>
                      <input value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required type="date"
                        min={new Date().toISOString().split('T')[0]}
                        className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                    </label>
                    <label className="block">
                      <span className="text-white/60 text-sm">Время</span>
                      <input value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} type="time"
                        className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors" />
                    </label>
                  </div>

                  {/* Количество гостей — ползунок */}
                  <label className="block">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-sm flex items-center gap-1.5"><Users size={14} /> Количество гостей</span>
                      <span className="text-orange-400 font-black text-lg">{form.guests}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={selectedTable?.maxSeats || 6}
                      value={form.guests}
                      onChange={e => setForm({ ...form, guests: Number(e.target.value) })}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: '#ea580c' }}
                    />
                    <div className="flex justify-between text-white/30 text-xs mt-1">
                      <span>1</span>
                      <span className="text-white/40">макс. {selectedTable?.maxSeats}</span>
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-white/60 text-sm">Комментарий</span>
                    <input value={form.occasion} onChange={e => setForm({ ...form, occasion: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 text-sm"
                      placeholder="Повод (день рождения, свадьба, юбилей...) — необязательно" />
                    <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} rows={2}
                      className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 resize-none transition-colors"
                      placeholder="Повод, пожелания, аллергии..." />
                  </label>

                  {error && (
                    <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3">
                      <p className="text-red-400 text-sm">❌ {error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-lg">
                    {loading ? '⏳ Отправка...' : <><Calendar size={20} /> Забронировать стол</>}
                  </button>
                  <p className="text-white/25 text-xs text-center">
                    Нажимая кнопку, вы соглашаетесь с <a href="/privacy" className="underline hover:text-white/50">политикой конфиденциальности</a>
                  </p>
                </form>
              )}

              {/* ═══ УСПЕХ ═══ */}
              {step === 'success' && (
                <div className="flex flex-col items-center justify-center p-10 text-center gap-5 min-h-64">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                    className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center text-5xl">🎉</motion.div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">Стол забронирован!</h3>
                    <p className="text-white/60 mb-1">Стол №{selectedTable?.id} · {selectedTable?.zone}</p>
                    <p className="text-white/60 mb-1">{form.date} в {form.time} · {form.guests} {form.guests === 1 ? 'гость' : form.guests < 5 ? 'гостя' : 'гостей'}</p>
                    <p className="text-white/40 text-sm mt-3">Мы свяжемся с вами в течение 15 минут для подтверждения.</p>
                  </div>
                  <button onClick={handleClose}
                    className="px-10 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
                    Отлично!
                  </button>
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Кнопка стола ────────────────────────────────────────────────────────────
function TableBtn({ table, selected, onClick, round = false, large = false }:
  { table: Table; selected: boolean; onClick: () => void; round?: boolean; large?: boolean }) {
  const isBar = table.isBar;
  const sizeClass = large
    ? 'w-16 h-14 md:w-20 md:h-16 text-base'
    : 'w-12 h-10 md:w-14 md:h-12 text-sm';

  return (
    <motion.button
      type="button"
      whileHover={!isBar ? { scale: 1.1 } : {}}
      whileTap={!isBar ? { scale: 0.93 } : {}}
      onClick={onClick}
      disabled={isBar}
      title={`Стол №${table.id} · ${table.zone} · до ${table.maxSeats} гостей`}
      className={`
        flex flex-col items-center justify-center transition-all border-2 font-bold
        ${round ? 'rounded-full' : 'rounded-xl'}
        ${sizeClass}
        ${selected
          ? 'bg-orange-600 border-orange-400 text-white shadow-lg shadow-orange-900/60 scale-105'
          : isBar
            ? 'bg-zinc-800 border-white/10 text-white/25 cursor-not-allowed'
            : 'bg-zinc-700 border-zinc-600 text-white/80 hover:bg-zinc-600 hover:border-orange-500/60 cursor-pointer'
        }
      `}
    >
      <span className="font-black leading-none">{table.id}</span>
      <span className="text-xs opacity-60 leading-none mt-0.5">{table.maxSeats}м</span>
    </motion.button>
  );
}
