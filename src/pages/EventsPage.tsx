import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Phone, Send, Users, ChevronRight } from 'lucide-react';

interface BanquetService {
  id: number;
  name: string;
  description: string;
  price: number;
  price_type: string;
  category: string;
  icon: string;
}

const PACKAGES = [
  {
    key: 'econom',
    name: 'Эконом',
    price: 3000,
    color: 'from-zinc-800 to-zinc-900',
    border: 'border-white/10',
    badge: '',
    emoji: '🍽️',
    includes: [
      'Холодные закуски: чабан салат, оливье, мимоза',
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
    name: 'Стандарт',
    price: 4000,
    color: 'from-orange-900/40 to-zinc-900',
    border: 'border-orange-500/30',
    badge: '⭐ Популярный',
    emoji: '🥂',
    includes: [
      'Всё из пакета Эконом',
      '+ Сельдь под шубой',
      '+ Бакинский букет',
      '+ Гнездо глухаря',
      '+ Сырная и мясная тарелка',
      '+ Ассорти из солений',
      '+ Жульен',
      '🎵 Живая музыка и DJ',
    ],
  },
  {
    key: 'premium',
    name: 'Премиум',
    price: 5000,
    color: 'from-yellow-900/30 to-zinc-900',
    border: 'border-yellow-500/30',
    badge: '👑 Премиум',
    emoji: '👑',
    includes: [
      'Всё из пакета Стандарт',
      '+ Шах-плов',
      '+ Шашлык из баранины на выбор',
      '+ Натуральный сок',
      '🎵 Живая музыка и DJ',
    ],
  },
];

// Популярные доп. услуги с актуальными ценами
const DEFAULT_SERVICES = [
  { id: 's1', name: 'DJ на мероприятие', description: '4 часа работы профессионального DJ', price: 10000, price_type: 'fixed', icon: '🎧', category: 'Музыка' },
  { id: 's2', name: 'Живая музыка (дуэт)', description: 'Живое выступление музыкантов 3 часа', price: 15000, price_type: 'fixed', icon: '🎸', category: 'Музыка' },
  { id: 's3', name: 'Ведущий / тамада', description: 'Профессиональный ведущий на весь вечер', price: 12000, price_type: 'fixed', icon: '🎤', category: 'Развлечения' },
  { id: 's4', name: 'Фотограф', description: 'Профессиональная фотосъёмка 4 часа + обработка', price: 15000, price_type: 'fixed', icon: '📸', category: 'Фото/Видео' },
  { id: 's5', name: 'Видеограф', description: 'Видеосъёмка + монтаж highlight-ролика', price: 18000, price_type: 'fixed', icon: '🎥', category: 'Фото/Видео' },
  { id: 's6', name: 'Декор зала шарами', description: 'Оформление зала воздушными шарами в вашей цветовой гамме', price: 8000, price_type: 'fixed', icon: '🎈', category: 'Декор' },
  { id: 's7', name: 'Свадебный декор', description: 'Полное оформление зала в свадебном стиле: цветы, ткани, свечи', price: 25000, price_type: 'fixed', icon: '💐', category: 'Декор' },
  { id: 's8', name: 'Торт на заказ', description: 'Индивидуальный торт от кондитера по вашему дизайну', price: 5000, price_type: 'fixed', icon: '🎂', category: 'Кейтеринг' },
  { id: 's9', name: 'Ростовые куклы / аниматоры', description: 'Яркие персонажи для детей и взрослых (2 часа)', price: 8000, price_type: 'fixed', icon: '🤡', category: 'Развлечения' },
  { id: 's10', name: 'Профессиональный салют', description: 'Пиротехническое шоу (5 минут)', price: 20000, price_type: 'fixed', icon: '🎆', category: 'Развлечения' },
  { id: 's11', name: 'Шах-плов на мероприятие', description: 'Торжественный плов на большую компанию (цена за человека)', price: 500, price_type: 'per_person', icon: '🍚', category: 'Кейтеринг' },
  { id: 's12', name: 'Кавказский стол', description: 'Традиционные кавказские блюда: долма, хинкали, шашлык и многое другое', price: 800, price_type: 'per_person', icon: '🫕', category: 'Кейтеринг' },
  { id: 's13', name: 'Детская анимация', description: 'Игры, конкурсы, аниматор для детей 3–12 лет (3 часа)', price: 9000, price_type: 'fixed', icon: '🎠', category: 'Развлечения' },
  { id: 's14', name: 'Вендинговый аппарат', description: 'Автомат с напитками или снеками для гостей', price: 5000, price_type: 'fixed', icon: '🧃', category: 'Развлечения' },
  { id: 's15', name: 'Трансфер для гостей', description: 'Микроавтобус для доставки гостей (до 20 человек)', price: 7000, price_type: 'fixed', icon: '🚌', category: 'Транспорт' },
];

export default function EventsPage() {
  const [dbServices, setDbServices] = useState<BanquetService[]>([]);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [selectedPackage, setSelectedPackage] = useState<string>('standard');
  const [guests, setGuests] = useState(30);
  const [step, setStep] = useState<'packages' | 'calc' | 'form' | 'success'>('packages');
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', time: '18:00', occasion: '', comment: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/banquet-services').then(r => r.json()).then(d => setDbServices(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  // Объединяем услуги из БД и дефолтные
  const allServices = [
    ...DEFAULT_SERVICES,
    ...dbServices.map(s => ({ ...s, id: 'db_' + s.id })),
  ];

  const servicesByCategory = allServices.reduce((acc, s) => {
    const cat = s.category || 'Прочее';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {} as Record<string, typeof allServices>);

  const pkg = PACKAGES.find(p => p.key === selectedPackage)!;
  const pkgTotal = pkg.price * guests;
  const servicesTotal = allServices
    .filter(s => selectedServices.has(String(s.id)))
    .reduce((sum, s) => sum + (s.price_type === 'per_person' ? s.price * guests : s.price), 0);
  const total = pkgTotal + servicesTotal;

  const toggleService = (id: string) => {
    setSelectedServices(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date) { setError('Заполните обязательные поля'); return; }
    setLoading(true); setError('');
    try {
      const selectedServiceNames = allServices
        .filter(s => selectedServices.has(String(s.id)))
        .map(s => s.name);
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          customer_phone: form.phone,
          customer_email: form.email,
          event_type: form.occasion || `${pkg.name} пакет`,
          event_date: form.date,
          event_time: form.time,
          guests_count: guests,
          package_type: pkg.name,
          extra_services: [`Пакет: ${pkg.name} (${pkg.price}₽/чел)`, ...selectedServiceNames],
          total_estimate: total,
          comment: form.comment,
        })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Ошибка отправки'); }
      setStep('success');
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-white pt-20">
      {/* Hero */}
      <div className="relative py-16 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/banquet.jpg" alt="Банкеты" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 to-zinc-950" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-orange-400 text-sm font-medium tracking-[0.3em] uppercase mb-3">Банкеты и мероприятия</p>
            <h1 className="text-4xl md:text-6xl font-black mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Ваш праздник</h1>
            <p className="text-white/50 text-base max-w-xl mx-auto">Дни рождения, свадьбы, корпоративы, поминки — организуем любое мероприятие</p>
          </motion.div>
        </div>
      </div>

      {/* Disco banner */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <div className="bg-gradient-to-r from-purple-900/30 to-zinc-900 rounded-2xl p-5 border border-purple-500/20 flex flex-col sm:flex-row items-center gap-4">
          <div className="text-3xl">🎵</div>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-white font-bold">Каждую пятницу и субботу — дискотека и DJ!</p>
            <p className="text-white/50 text-sm">В каждый банкетный пакет входит живая музыка и DJ.</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 bg-purple-600/30 text-purple-300 rounded-full border border-purple-500/30 text-sm">Пт</span>
            <span className="px-3 py-1.5 bg-purple-600/30 text-purple-300 rounded-full border border-purple-500/30 text-sm">Сб</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-20">

        {/* SUCCESS */}
        {step === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 rounded-3xl p-12 text-center border border-green-500/30">
            <div className="text-6xl mb-6">🎉</div>
            <h3 className="text-3xl font-black mb-4">Заявка принята!</h3>
            <p className="text-white/60 mb-8">Мы свяжемся с вами в ближайшее время для уточнения деталей</p>
            <div className="flex gap-4 justify-center">
              <a href="tel:+79257677778" className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
                <Phone size={18} /> Позвонить
              </a>
              <button onClick={() => { setStep('packages'); setForm({ name: '', phone: '', email: '', date: '', time: '18:00', occasion: '', comment: '' }); setSelectedServices(new Set()); }}
                className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
                Новая заявка
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 1: PACKAGES */}
        {step === 'packages' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-3xl font-black text-center mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Выберите пакет</h2>
            <p className="text-white/40 text-center mb-8 text-sm">Все пакеты включают живую музыку и DJ</p>
            <div className="grid md:grid-cols-3 gap-5 mb-8">
              {PACKAGES.map((p, i) => (
                <motion.button key={p.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  onClick={() => setSelectedPackage(p.key)}
                  className={`bg-gradient-to-b ${p.color} rounded-2xl p-6 border text-left transition-all hover:scale-105 ${
                    selectedPackage === p.key ? p.border + ' ring-2 ring-orange-500/50 scale-105' : p.border
                  }`}>
                  {p.badge && <span className="text-xs font-bold text-orange-400 mb-3 block">{p.badge}</span>}
                  <div className="text-4xl mb-3">{p.emoji}</div>
                  <h3 className="text-2xl font-black mb-1">{p.name}</h3>
                  <p className="text-3xl font-black text-orange-400 mb-4">{p.price.toLocaleString('ru-RU')}₽<span className="text-sm text-white/40 font-normal">/чел</span></p>
                  <ul className="space-y-1.5">
                    {p.includes.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-white/70">
                        <Check size={13} className="text-green-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.button>
              ))}
            </div>
            <div className="text-center">
              <button onClick={() => setStep('calc')}
                className="inline-flex items-center gap-2 px-10 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all hover:scale-105 text-lg">
                Далее — Калькулятор <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: CALC */}
        {step === 'calc' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep('packages')} className="text-white/40 hover:text-white transition-colors text-sm">← Назад</button>
              <h2 className="text-2xl font-black" style={{ fontFamily: 'Playfair Display, serif' }}>Калькулятор банкета</h2>
            </div>

            <div className="bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden mb-6">
              {/* Выбранный пакет */}
              <div className={`p-5 bg-gradient-to-r ${pkg.color} border-b border-white/10 flex items-center justify-between`}>
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Выбранный пакет</p>
                  <p className="text-xl font-black">{pkg.emoji} {pkg.name} — {pkg.price.toLocaleString('ru-RU')}₽/чел</p>
                </div>
                <button onClick={() => setStep('packages')} className="text-white/40 hover:text-orange-400 transition-colors text-sm border border-white/20 hover:border-orange-400 px-3 py-1.5 rounded-lg">Изменить</button>
              </div>

              {/* Ползунок гостей */}
              <div className="p-5 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold flex items-center gap-2"><Users size={18} className="text-orange-400" /> Количество гостей</h3>
                  <span className="text-3xl font-black text-orange-400">{guests}</span>
                </div>
                <input
                  type="range" min={10} max={100} step={1}
                  value={guests}
                  onChange={e => setGuests(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #ea580c ${(guests - 10) / 90 * 100}%, #3f3f46 ${(guests - 10) / 90 * 100}%)` }}
                />
                <div className="flex justify-between text-white/30 text-xs mt-1">
                  <span>10</span>
                  <span>55</span>
                  <span>100</span>
                </div>
                <div className="flex gap-2 flex-wrap mt-3">
                  {[10, 20, 30, 50, 75, 100].map(n => (
                    <button key={n} onClick={() => setGuests(n)}
                      className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                        guests === n ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}>{n} чел</button>
                  ))}
                </div>
              </div>

              {/* Доп. услуги */}
              <div className="p-5 border-b border-white/10">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Sparkles size={18} className="text-orange-400" /> Дополнительные услуги</h3>
                {Object.entries(servicesByCategory).map(([cat, catServices]) => (
                  <div key={cat} className="mb-5">
                    <p className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-2">{cat}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {catServices.map(service => {
                        const sid = String(service.id);
                        const checked = selectedServices.has(sid);
                        return (
                          <button key={sid} onClick={() => toggleService(sid)}
                            className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                              checked ? 'bg-orange-600/20 border-orange-500' : 'bg-white/5 border-white/10 hover:border-orange-500/30'
                            }`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                              checked ? 'bg-orange-500 border-orange-500' : 'border-white/30'
                            }`}>
                              {checked && <Check size={11} className="text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{service.icon} {service.name}</p>
                              <p className="text-xs text-white/40 mt-0.5">{service.description}</p>
                              <p className="text-orange-400 text-sm font-bold mt-1">
                                {service.price.toLocaleString('ru-RU')}₽{service.price_type === 'per_person' ? '/чел' : ''}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Итого */}
              <div className="p-5 bg-gradient-to-r from-orange-900/20 to-zinc-900">
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">{pkg.name}: {pkg.price.toLocaleString('ru-RU')}₽ × {guests} чел</span>
                    <span className="text-white">{pkgTotal.toLocaleString('ru-RU')}₽</span>
                  </div>
                  {allServices.filter(s => selectedServices.has(String(s.id))).map(s => (
                    <div key={s.id} className="flex justify-between text-sm">
                      <span className="text-white/50 truncate mr-2">{s.icon} {s.name}</span>
                      <span className="text-white shrink-0">{(s.price_type === 'per_person' ? s.price * guests : s.price).toLocaleString('ru-RU')}₽</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <span className="text-white font-bold">Итого (примерно)</span>
                  <span className="text-3xl font-black text-orange-400">~{total.toLocaleString('ru-RU')}₽</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button onClick={() => setStep('form')}
                className="inline-flex items-center gap-2 px-10 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all hover:scale-105 text-lg">
                Оформить заявку <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: FORM */}
        {step === 'form' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep('calc')} className="text-white/40 hover:text-white transition-colors text-sm">← Назад</button>
              <h2 className="text-2xl font-black" style={{ fontFamily: 'Playfair Display, serif' }}>Оформление заявки</h2>
            </div>

            {/* Сводка */}
            <div className="bg-zinc-900 rounded-2xl border border-white/10 p-5 mb-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                <div><p className="text-white/40 text-xs mb-1">Пакет</p><p className="text-white font-bold">{pkg.emoji} {pkg.name}</p></div>
                <div><p className="text-white/40 text-xs mb-1">Гостей</p><p className="text-white font-bold">{guests} чел</p></div>
                <div><p className="text-white/40 text-xs mb-1">Сумма</p><p className="text-orange-400 font-black">~{total.toLocaleString('ru-RU')}₽</p></div>
              </div>
              {selectedServices.size > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-white/40 text-xs mb-2">Доп. услуги:</p>
                  <div className="flex flex-wrap gap-1">
                    {allServices.filter(s => selectedServices.has(String(s.id))).map(s => (
                      <span key={s.id} className="text-xs bg-orange-600/20 text-orange-300 px-2 py-1 rounded-full border border-orange-500/20">{s.icon} {s.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={submitBooking} className="bg-zinc-900 rounded-2xl border border-white/10 p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-white/60 text-sm">Имя *</span>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                    placeholder="Ваше имя" required />
                </label>
                <label className="block">
                  <span className="text-white/60 text-sm">Телефон *</span>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                    placeholder="+7 (___) ___-__-__" type="tel" required />
                </label>
                <label className="block">
                  <span className="text-white/60 text-sm">Email</span>
                  <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                    placeholder="email@example.com" type="email" />
                </label>
                <label className="block">
                  <span className="text-white/60 text-sm">Повод (необязательно)</span>
                  <input value={form.occasion} onChange={e => setForm({ ...form, occasion: e.target.value })}
                    className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                    placeholder="День рождения, свадьба, корпоратив..." />
                </label>
                <label className="block">
                  <span className="text-white/60 text-sm">Дата *</span>
                  <input value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                    type="date" required min={new Date().toISOString().split('T')[0]} />
                </label>
                <label className="block">
                  <span className="text-white/60 text-sm">Время начала</span>
                  <input value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
                    className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                    type="time" />
                </label>
              </div>
              <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 resize-none"
                rows={3} placeholder="Дополнительные пожелания, особые требования..." />
              {error && <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3"><p className="text-red-400 text-sm">❌ {error}</p></div>}
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep('calc')} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">Назад</button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Send size={18} /> {loading ? 'Отправка...' : 'Отправить заявку'}
                </button>
              </div>
              <a href="tel:+79257677778" className="flex items-center justify-center gap-2 py-3 border border-white/10 hover:border-orange-500/50 text-white/50 hover:text-white rounded-xl transition-colors text-sm">
                <Phone size={16} /> Позвонить нам: +7 (925) 767-77-78
              </a>
              <p className="text-white/30 text-xs text-center">Нажимая кнопку, вы соглашаетесь с <a href="/privacy" className="underline">политикой конфиденциальности</a></p>
            </form>
          </motion.div>
        )}

      </div>
    </div>
  );
}
