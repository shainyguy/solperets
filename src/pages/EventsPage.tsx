import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Plus, Minus, Send, Music, Sparkles, Phone } from 'lucide-react';

// ─── Банкетные пакеты ────────────────────────────────────────────────────────
const PACKAGES = [
  {
    key: 'econom',
    label: 'Эконом',
    price: 3000,
    color: 'border-zinc-600',
    badge: '',
    accent: 'text-zinc-300',
    bg: 'bg-zinc-800/60',
    includes: [
      'Холодные закуски: Чобан салат, Оливье, Мимоза',
      'Горячее на выбор: отбивная (свинина / говядина / курица)',
      'Садж на выбор: цыплёнок / баранина / говядина / свинина',
      'Шашлык на выбор: курица / свинина',
      'Напитки: морс / лимонад / вода газ. или без',
      'Хлебная корзинка',
      '🎵 Живая музыка и DJ',
    ],
  },
  {
    key: 'standard',
    label: 'Стандарт',
    price: 4000,
    color: 'border-orange-500',
    badge: '⭐ Популярный',
    accent: 'text-orange-400',
    bg: 'bg-orange-900/20',
    includes: [
      'Всё из пакета «Эконом»',
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
    key: 'premium',
    label: 'Премиум',
    price: 5000,
    color: 'border-yellow-400',
    badge: '👑 Лучший выбор',
    accent: 'text-yellow-400',
    bg: 'bg-yellow-900/20',
    includes: [
      'Всё из пакета «Стандарт»',
      'Шах-плов',
      'Шашлык из баранины на выбор',
      'Натуральные соки',
      '🎵 Живая музыка и DJ',
    ],
  },
];

// ─── Дополнительные услуги ───────────────────────────────────────────────────
const EXTRA_SERVICES = [
  { key: 'photographer', label: 'Фотограф', price: 15000, icon: '📸', desc: 'Профессиональная фотосъёмка мероприятия' },
  { key: 'videographer', label: 'Видеограф', price: 20000, icon: '🎬', desc: 'Видеосъёмка и монтаж' },
  { key: 'fireworks', label: 'Фейерверк', price: 15000, icon: '🎆', desc: 'Профессиональный пиротехнический салют' },
  { key: 'mascots', label: 'Ростовые куклы', price: 5000, icon: '🤡', desc: 'Аниматоры и ростовые куклы для гостей' },
  { key: 'decor_wedding', label: 'Свадебный декор', price: 12000, icon: '💐', desc: 'Цветы, ткани, арка, оформление зала' },
  { key: 'decor_balloons', label: 'Декор шарами', price: 5000, icon: '🎈', desc: 'Воздушные шары в цвете праздника' },
  { key: 'host', label: 'Ведущий', price: 8000, icon: '🎙️', desc: 'Профессиональный тамада / ведущий' },
  { key: 'cake', label: 'Торт на заказ', price: 3000, icon: '🎂', desc: 'Индивидуальный торт от нашего кондитера' },
  { key: 'kids_animation', label: 'Детская анимация', price: 7000, icon: '🎠', desc: 'Игры, конкурсы, аниматор для детей' },
  { key: 'vending', label: 'Вендинговый аппарат', price: 5000, icon: '🍭', desc: 'Аппарат со сладостями / напитками' },
  { key: 'plov_shah', label: 'Шах-плов (доп.)', price: 500, icon: '🍚', desc: 'Дополнительный шах-плов — цена за человека', per_person: true },
  { key: 'caucasian_table', label: 'Кавказский стол', price: 800, icon: '🫕', desc: 'Долма, хинкали, хачапури — цена за человека', per_person: true },
];

export default function EventsPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [guests, setGuests] = useState(30);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', time: '18:00', occasion: '', comment: '' });
  const [step, setStep] = useState<'config' | 'form' | 'success'>('config');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pkg = PACKAGES.find(p => p.key === selectedPackage);
  const pkgTotal = pkg ? pkg.price * guests : 0;
  const extrasTotal = EXTRA_SERVICES
    .filter(s => selectedExtras.includes(s.key))
    .reduce((sum, s) => sum + (s.per_person ? s.price * guests : s.price), 0);
  const total = pkgTotal + extrasTotal;

  const toggleExtra = (key: string) =>
    setSelectedExtras(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) { setError('Выберите пакет'); return; }
    if (!form.name || !form.phone || !form.date) { setError('Заполните обязательные поля'); return; }
    setLoading(true); setError('');
    try {
      const extraNames = EXTRA_SERVICES.filter(s => selectedExtras.includes(s.key)).map(s => s.label);
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          customer_phone: form.phone,
          customer_email: form.email,
          event_type: `${pkg?.label} — ${form.occasion || 'не указан'}`,
          event_date: form.date,
          event_time: form.time,
          guests_count: guests,
          extra_services: extraNames,
          total_estimate: total,
          comment: form.comment,
        }),
      });
      if (!res.ok) throw new Error('Ошибка отправки');
      setStep('success');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-white pt-20">
      {/* Hero */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/banquet.jpg" alt="Банкеты" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 to-zinc-950" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-orange-400 text-sm font-medium tracking-[0.3em] uppercase mb-4">Банкеты и мероприятия</p>
            <h1 className="text-5xl md:text-6xl font-black mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Ваш праздник<br />в наших руках
            </h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Дни рождения, свадьбы, корпоративы, поминки — организуем любое мероприятие
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-24">

        {step === 'success' ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 rounded-3xl p-12 text-center border border-green-500/30 max-w-lg mx-auto">
            <div className="text-6xl mb-6">🎉</div>
            <h3 className="text-3xl font-black mb-4">Заявка принята!</h3>
            <p className="text-white/60 mb-8">Мы свяжемся с вами в ближайшее время для подтверждения деталей</p>
            <a href="tel:+79257677778" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
              <Phone size={18} /> Позвонить нам
            </a>
            <button onClick={() => { setStep('config'); setSelectedPackage(null); setSelectedExtras([]); setGuests(30); setForm({ name:'',phone:'',email:'',date:'',time:'18:00',occasion:'',comment:'' }); }}
              className="block mx-auto mt-4 text-white/40 hover:text-white text-sm transition-colors">
              Оформить ещё одну заявку
            </button>
          </motion.div>
        ) : step === 'form' ? (
          /* ─── ФОРМА ─────────────────────────────────────────────── */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto">
            {/* Итог */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-white/10 mb-6">
              <h3 className="font-bold text-white mb-3">Ваш выбор</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60">Пакет «{pkg?.label}»</span>
                <span className="text-white">{pkg?.price.toLocaleString('ru-RU')}₽ × {guests} чел. = {pkgTotal.toLocaleString('ru-RU')}₽</span>
              </div>
              {selectedExtras.length > 0 && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60">Доп. услуги ({selectedExtras.length})</span>
                  <span className="text-white">{extrasTotal.toLocaleString('ru-RU')}₽</span>
                </div>
              )}
              <div className="border-t border-white/10 mt-3 pt-3 flex items-center justify-between">
                <span className="text-white font-bold">Итого (ориентировочно)</span>
                <span className="text-2xl font-black text-orange-400">от {total.toLocaleString('ru-RU')}₽</span>
              </div>
            </div>

            <form onSubmit={submit} className="bg-zinc-900 rounded-2xl p-6 border border-white/10 space-y-4">
              <h3 className="font-bold text-white text-lg mb-2">Контактные данные</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-white/60 text-sm">Имя *</span>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                    className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                    placeholder="Ваше имя" />
                </label>
                <label className="block">
                  <span className="text-white/60 text-sm">Телефон *</span>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required type="tel"
                    className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                    placeholder="+7 (___) ___-__-__" />
                </label>
                <label className="block">
                  <span className="text-white/60 text-sm">Email</span>
                  <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email"
                    className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                    placeholder="email@example.com" />
                </label>
                <label className="block">
                  <span className="text-white/60 text-sm">Повод</span>
                  <input value={form.occasion} onChange={e => setForm({...form, occasion: e.target.value})}
                    className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                    placeholder="День рождения, свадьба..." />
                </label>
                <label className="block">
                  <span className="text-white/60 text-sm">Дата *</span>
                  <input value={form.date} onChange={e => setForm({...form, date: e.target.value})} required type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500" />
                </label>
                <label className="block">
                  <span className="text-white/60 text-sm">Время начала</span>
                  <input value={form.time} onChange={e => setForm({...form, time: e.target.value})} type="time"
                    className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500" />
                </label>
              </div>
              <label className="block">
                <span className="text-white/60 text-sm">Пожелания</span>
                <textarea value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} rows={3}
                  className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 resize-none"
                  placeholder="Особые пожелания, аллергии, детали..." />
              </label>
              {error && <p className="text-red-400 text-sm">❌ {error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep('config')}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
                  ← Назад
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
                  <Send size={18} /> {loading ? 'Отправка...' : 'Отправить заявку'}
                </button>
              </div>
              <p className="text-white/30 text-xs text-center">
                Нажимая кнопку, вы соглашаетесь с <a href="/privacy" className="underline">политикой конфиденциальности</a>
              </p>
            </form>
          </motion.div>

        ) : (
          /* ─── КОНФИГУРАТОР ──────────────────────────────────────── */
          <>
            {/* Гости — ползунок */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 rounded-2xl p-6 border border-white/10 mb-8">
              <h2 className="text-xl font-bold mb-5">Количество гостей</h2>
              <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setGuests(g => Math.max(10, g - 1))}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-orange-600 flex items-center justify-center transition-colors">
                  <Minus size={18} />
                </button>
                <span className="text-5xl font-black text-orange-400 w-20 text-center">{guests}</span>
                <button onClick={() => setGuests(g => Math.min(100, g + 1))}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-orange-600 flex items-center justify-center transition-colors">
                  <Plus size={18} />
                </button>
                <span className="text-white/40 text-sm">человек (макс. 100)</span>
              </div>
              <input type="range" min={10} max={100} value={guests} onChange={e => setGuests(Number(e.target.value))}
                className="w-full accent-orange-500 h-2 rounded-full" />
              <div className="flex justify-between text-white/30 text-xs mt-1">
                <span>10</span><span>50</span><span>100</span>
              </div>
            </motion.div>

            {/* Пакеты */}
            <h2 className="text-2xl font-black mb-5">Выберите пакет</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
              {PACKAGES.map((p, i) => (
                <motion.div key={p.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedPackage(p.key)}
                  className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all hover:-translate-y-1 ${p.color} ${selectedPackage === p.key ? p.bg + ' scale-[1.02]' : 'bg-zinc-900'}`}>
                  {p.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      {p.badge}
                    </div>
                  )}
                  <div className={`flex items-center gap-2 mb-1 ${p.accent}`}>
                    <Music size={18} />
                    <span className="font-bold text-lg">{p.label}</span>
                  </div>
                  <div className="text-3xl font-black text-white mb-1">{p.price.toLocaleString('ru-RU')}₽</div>
                  <div className="text-white/40 text-xs mb-4">с человека · итого ~{(p.price * guests).toLocaleString('ru-RU')}₽</div>
                  <ul className="space-y-2">
                    {p.includes.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-white/70">
                        <Check size={14} className="text-green-400 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  {selectedPackage === p.key && (
                    <div className={`mt-4 text-center text-sm font-bold ${p.accent}`}>✓ Выбран</div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Доп. услуги */}
            <h2 className="text-2xl font-black mb-5">Дополнительные услуги</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
              {EXTRA_SERVICES.map((s, i) => {
                const active = selectedExtras.includes(s.key);
                const price = s.per_person ? s.price * guests : s.price;
                return (
                  <motion.button key={s.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    onClick={() => toggleExtra(s.key)}
                    className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${active ? 'bg-orange-600/20 border-orange-500' : 'bg-zinc-900 border-white/10 hover:border-orange-500/40'}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${active ? 'bg-orange-500 border-orange-500' : 'border-white/30'}`}>
                      {active && <Check size={11} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{s.icon}</span>
                        <span className="font-medium text-white text-sm">{s.label}</span>
                      </div>
                      <p className="text-white/40 text-xs mt-0.5">{s.desc}</p>
                      <p className="text-orange-400 font-bold text-sm mt-1">
                        {price.toLocaleString('ru-RU')}₽{s.per_person ? ` (${s.price}₽/чел)` : ''}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Итог и кнопка */}
            <div className="sticky bottom-4 z-30">
              <div className="bg-zinc-900/95 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
                <div>
                  {!selectedPackage ? (
                    <p className="text-white/50 text-sm">Выберите пакет выше ↑</p>
                  ) : (
                    <>
                      <p className="text-white/50 text-sm">Пакет «{pkg?.label}» · {guests} гостей{selectedExtras.length > 0 ? ` · ${selectedExtras.length} доп. услуги` : ''}</p>
                      <p className="text-2xl font-black text-orange-400">от {total.toLocaleString('ru-RU')}₽</p>
                    </>
                  )}
                </div>
                <button onClick={() => { if (!selectedPackage) { setError('Сначала выберите пакет'); return; } setError(''); setStep('form'); }}
                  disabled={!selectedPackage}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all hover:scale-105">
                  <Sparkles size={18} /> Оставить заявку
                </button>
              </div>
              {error && <p className="text-red-400 text-sm text-center mt-2">❌ {error}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
