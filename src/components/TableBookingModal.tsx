import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar } from 'lucide-react';

interface Table {
  id: number;
  zone: string;
  seats: number;
  shape?: 'round' | 'rect';
}

// Схема зала: 17 столов
// Слева 5, сверху 2, справа бар + 1 большой, снизу 3, по середине 5
const TABLES: Table[] = [
  // Левая стена — 5 столов
  { id: 1,  zone: 'Левая стена',   seats: 4, shape: 'rect' },
  { id: 2,  zone: 'Левая стена',   seats: 4, shape: 'rect' },
  { id: 3,  zone: 'Левая стена',   seats: 4, shape: 'rect' },
  { id: 4,  zone: 'Левая стена',   seats: 4, shape: 'rect' },
  { id: 5,  zone: 'Левая стена',   seats: 4, shape: 'rect' },
  // Верхняя стена — 2 стола
  { id: 6,  zone: 'Верхняя стена', seats: 6, shape: 'rect' },
  { id: 7,  zone: 'Верхняя стена', seats: 6, shape: 'rect' },
  // Правая сторона — бар (не бронируется) + 1 большой стол
  { id: 8,  zone: 'VIP / Правая',  seats: 10, shape: 'rect' },
  // Нижняя стена — 3 стола
  { id: 9,  zone: 'Нижняя стена',  seats: 4, shape: 'rect' },
  { id: 10, zone: 'Нижняя стена',  seats: 4, shape: 'rect' },
  { id: 11, zone: 'Нижняя стена',  seats: 4, shape: 'rect' },
  // Центр — 5 круглых столов
  { id: 12, zone: 'Центр',         seats: 4, shape: 'round' },
  { id: 13, zone: 'Центр',         seats: 4, shape: 'round' },
  { id: 14, zone: 'Центр',         seats: 4, shape: 'round' },
  { id: 15, zone: 'Центр',         seats: 4, shape: 'round' },
  { id: 16, zone: 'Центр',         seats: 4, shape: 'round' },
  // Барная зона (информационно)
  { id: 17, zone: 'Бар',           seats: 6, shape: 'rect' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function TableBookingModal({ isOpen, onClose }: Props) {
  const [step, setStep] = useState<'map' | 'form' | 'success'>('map');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', guests: 2, date: '', time: '19:00', comment: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    onClose();
    setTimeout(() => { setStep('map'); setSelectedTable(null); setError(''); }, 300);
  };

  const handleSelectTable = (t: Table) => {
    if (t.zone === 'Бар') return;
    setSelectedTable(t);
    setStep('form');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date) { setError('Заполните все обязательные поля'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/table-reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_number: selectedTable!.id,
          table_zone: selectedTable!.zone,
          customer_name: form.name,
          customer_phone: form.phone,
          guests_count: form.guests,
          reservation_date: form.date,
          reservation_time: form.time,
          comment: form.comment
        })
      });
      if (!res.ok) throw new Error('Ошибка');
      setStep('success');
    } catch { setError('Ошибка отправки. Попробуйте ещё раз.'); }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" onClick={handleClose} />

          <motion.div initial={{ opacity: 0, y: 60, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60 }} transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl md:max-h-[90vh] bg-zinc-900 rounded-3xl z-50 overflow-hidden flex flex-col shadow-2xl border border-white/10">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
              <div>
                <h2 className="text-xl font-black text-white">
                  {step === 'map' ? '🪑 Выберите стол' : step === 'form' ? `Стол №${selectedTable?.id}` : '✅ Готово!'}
                </h2>
                {step === 'map' && <p className="text-white/40 text-sm mt-0.5">Нажмите на свободный стол</p>}
                {step === 'form' && <p className="text-white/40 text-sm mt-0.5">{selectedTable?.zone} · {selectedTable?.seats} мест</p>}
              </div>
              <button onClick={handleClose} className="text-white/40 hover:text-white p-2 transition-colors"><X size={22} /></button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* ── СХЕМА ЗАЛА ── */}
              {step === 'map' && (
                <div className="p-4 md:p-6">
                  {/* Легенда */}
                  <div className="flex flex-wrap gap-3 mb-5 text-xs">
                    {[
                      { color: 'bg-zinc-700', label: 'Свободен' },
                      { color: 'bg-orange-600', label: 'Выбран' },
                      { color: 'bg-zinc-800 border border-white/10', label: 'Бар (не бронируется)' },
                    ].map(l => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <div className={`w-4 h-4 rounded ${l.color}`} />
                        <span className="text-white/50">{l.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Схема */}
                  <div className="relative bg-zinc-950 rounded-2xl border border-white/10 overflow-hidden" style={{ minHeight: 420 }}>
                    {/* Метки стен */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white/20 text-xs">— Верхняя стена —</div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/20 text-xs">— Нижняя стена —</div>
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-white/20 text-xs whitespace-nowrap">Левая стена</div>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 rotate-90 text-white/20 text-xs whitespace-nowrap">Правая стена</div>

                    {/* Входная дверь */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <div className="w-12 h-1.5 bg-orange-500 rounded-t" />
                      <span className="text-orange-400 text-xs mt-0.5">Вход</span>
                    </div>

                    <div className="p-6 pt-8">
                      {/* Верхняя стена — 2 стола */}
                      <div className="flex justify-center gap-4 mb-6">
                        {TABLES.filter(t => t.zone === 'Верхняя стена').map(t => (
                          <TableBtn key={t.id} table={t} selected={selectedTable?.id === t.id} onClick={() => handleSelectTable(t)} />
                        ))}
                      </div>

                      {/* Средняя часть */}
                      <div className="flex gap-2 items-start">
                        {/* Левая стена — 5 столов */}
                        <div className="flex flex-col gap-2 shrink-0">
                          {TABLES.filter(t => t.zone === 'Левая стена').map(t => (
                            <TableBtn key={t.id} table={t} selected={selectedTable?.id === t.id} onClick={() => handleSelectTable(t)} />
                          ))}
                        </div>

                        {/* Центр — 5 круглых столов */}
                        <div className="flex-1 flex flex-wrap gap-3 justify-center items-center py-4">
                          {TABLES.filter(t => t.zone === 'Центр').map(t => (
                            <TableBtn key={t.id} table={t} selected={selectedTable?.id === t.id} onClick={() => handleSelectTable(t)} />
                          ))}
                        </div>

                        {/* Правая сторона — бар + большой стол */}
                        <div className="flex flex-col gap-2 shrink-0 items-end">
                          {/* Бар */}
                          <div className="bg-zinc-800 border border-white/10 rounded-xl px-3 py-2 text-center cursor-not-allowed">
                            <div className="text-white/30 text-xs font-bold">🍸 БАР</div>
                            <div className="text-white/20 text-xs">6 мест</div>
                          </div>
                          {/* VIP стол */}
                          {TABLES.filter(t => t.zone === 'VIP / Правая').map(t => (
                            <TableBtn key={t.id} table={t} selected={selectedTable?.id === t.id} onClick={() => handleSelectTable(t)} large />
                          ))}
                        </div>
                      </div>

                      {/* Нижняя стена — 3 стола */}
                      <div className="flex justify-center gap-4 mt-6">
                        {TABLES.filter(t => t.zone === 'Нижняя стена').map(t => (
                          <TableBtn key={t.id} table={t} selected={selectedTable?.id === t.id} onClick={() => handleSelectTable(t)} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-white/30 text-xs text-center mt-3">Схема носит ознакомительный характер. Администратор подтвердит бронь.</p>
                </div>
              )}

              {/* ── ФОРМА ── */}
              {step === 'form' && (
                <form onSubmit={submit} className="p-5 space-y-4">
                  <div className="bg-orange-600/10 border border-orange-500/30 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black text-lg">
                      {selectedTable?.id}
                    </div>
                    <div>
                      <p className="text-white font-bold">Стол №{selectedTable?.id}</p>
                      <p className="text-white/50 text-sm">{selectedTable?.zone} · до {selectedTable?.seats} гостей</p>
                    </div>
                    <button type="button" onClick={() => setStep('map')} className="ml-auto text-orange-400 text-sm hover:underline">Изменить</button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-white/60 text-sm">Ваше имя *</span>
                      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                        className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                        placeholder="Имя" />
                    </label>
                    <label className="block">
                      <span className="text-white/60 text-sm">Телефон *</span>
                      <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required type="tel"
                        className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                        placeholder="+7 (___) ___-__-__" />
                    </label>
                    <label className="block">
                      <span className="text-white/60 text-sm">Дата *</span>
                      <input value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required type="date"
                        min={new Date().toISOString().split('T')[0]}
                        className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500" />
                    </label>
                    <label className="block">
                      <span className="text-white/60 text-sm">Время</span>
                      <input value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} type="time"
                        className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500" />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-white/60 text-sm">Количество гостей</span>
                    <div className="flex items-center gap-3 mt-1">
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <button key={n} type="button" onClick={() => setForm({ ...form, guests: n })}
                          className={`w-9 h-9 rounded-full text-sm font-bold transition-colors ${form.guests === n ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-white/60 text-sm">Комментарий</span>
                    <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} rows={2}
                      className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 resize-none"
                      placeholder="Пожелания, повод, аллергии..." />
                  </label>

                  {error && <p className="text-red-400 text-sm">{error}</p>}

                  <button type="submit" disabled={loading}
                    className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                    {loading ? 'Отправка...' : <><Calendar size={18} /> Забронировать стол</>}
                  </button>
                  <p className="text-white/30 text-xs text-center">Нажимая кнопку, вы соглашаетесь с <a href="/privacy" className="underline">политикой конфиденциальности</a></p>
                </form>
              )}

              {/* ── УСПЕХ ── */}
              {step === 'success' && (
                <div className="flex flex-col items-center justify-center p-10 text-center gap-5">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                    className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center text-5xl">🎉</motion.div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">Стол забронирован!</h3>
                    <p className="text-white/50">Мы свяжемся с вами в течение 15 минут для подтверждения.</p>
                    <p className="text-white/50 mt-1">Стол №{selectedTable?.id} · {form.date} в {form.time}</p>
                  </div>
                  <button onClick={handleClose} className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
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

function TableBtn({ table, selected, onClick, large = false }: { table: Table; selected: boolean; onClick: () => void; large?: boolean }) {
  const isBar = table.zone === 'Бар';
  const isRound = table.shape === 'round';
  const isLarge = large || table.seats >= 8;

  return (
    <motion.button
      whileHover={!isBar ? { scale: 1.08 } : {}}
      whileTap={!isBar ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={isBar}
      className={`
        flex flex-col items-center justify-center transition-all border-2 font-bold text-xs
        ${isRound ? 'rounded-full' : 'rounded-xl'}
        ${isLarge ? 'w-16 h-12 md:w-20 md:h-14' : 'w-12 h-10 md:w-14 md:h-12'}
        ${selected ? 'bg-orange-600 border-orange-400 text-white shadow-lg shadow-orange-900/50' : 
          isBar ? 'bg-zinc-800 border-white/10 text-white/30 cursor-not-allowed' :
          'bg-zinc-700 border-zinc-600 text-white/80 hover:bg-zinc-600 hover:border-orange-500/50'}
      `}
    >
      <span className="text-sm font-black leading-none">{table.id}</span>
      <span className="text-xs opacity-70 leading-none mt-0.5">{table.seats}м</span>
    </motion.button>
  );
}
