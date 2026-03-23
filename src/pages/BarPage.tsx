import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine, AlertTriangle, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface BarItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  type: string;
  volume?: string;
  abv?: number;
}

const BAR_CATEGORIES = [
  { key: 'all', label: '🍹 Всё' },
  { key: 'cocktails', label: '🍸 Коктейли' },
  { key: 'beer', label: '🍺 Пиво' },
  { key: 'wine', label: '🍷 Вино' },
  { key: 'whiskey', label: '🥃 Виски' },
  { key: 'vodka', label: '🫙 Водка' },
  { key: 'cognac', label: '🥃 Коньяк' },
  { key: 'champagne', label: '🥂 Шампанское' },
  { key: 'soft', label: '🥤 Безалкогольные' },
  { key: 'shots', label: '🔥 Шоты' },
];

export default function BarPage() {
  const [items, setItems] = useState<BarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(() => localStorage.getItem('age_confirmed') === 'true');
  const { addItem } = useCart();

  useEffect(() => {
    if (!ageConfirmed) return;
    setLoading(true);
    const params = new URLSearchParams({ type: 'bar' });
    if (category !== 'all') params.set('category', category);
    fetch(`/api/menu?${params}`).then(r => r.json()).then(d => {
      setItems(Array.isArray(d) ? d : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [category, ageConfirmed]);

  const confirmAge = () => {
    localStorage.setItem('age_confirmed', 'true');
    setAgeConfirmed(true);
  };

  const filtered = items.filter(item =>
    !search || item.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!ageConfirmed) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-zinc-900 rounded-3xl p-10 text-center border border-white/10">
          <div className="w-20 h-20 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wine className="text-orange-400" size={36} />
          </div>
          <h2 className="text-3xl font-black mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Меню бара</h2>
          <div className="bg-amber-900/30 border border-amber-600/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-amber-300 mb-2">
              <AlertTriangle size={18} />
              <span className="font-semibold">Подтверждение возраста</span>
            </div>
            <p className="text-amber-200/70 text-sm">
              Алкогольная продукция продаётся только лицам, достигшим 18 лет. Согласно законодательству РФ (ФЗ №171).
            </p>
          </div>
          <p className="text-white/60 mb-8 text-sm">Подтверждаю, что мне исполнилось 18 лет</p>
          <div className="flex gap-4">
            <button onClick={() => window.history.back()} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
              Нет, мне нет 18
            </button>
            <button onClick={confirmAge} className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
              Да, мне 18+
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-white pt-20">
      {/* Header */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/bar-bg.jpg" alt="Бар" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/50 to-zinc-950" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-orange-400 text-sm font-medium tracking-[0.3em] uppercase mb-4">18+</p>
            <h1 className="text-5xl md:text-6xl font-black mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Меню бара
            </h1>
            <p className="text-white/50 text-lg">Широкий выбор напитков для любого настроения</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Age warning banner */}
        <div className="bg-amber-900/20 border border-amber-600/20 rounded-xl p-4 mb-8 flex items-start gap-3">
          <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-amber-300 text-sm font-medium">Важная информация</p>
            <p className="text-amber-200/60 text-xs mt-1">
              Алкогольная продукция реализуется только в заведении. Доставка алкоголя запрещена законодательством РФ (ФЗ №171-ФЗ). 
              Продажа алкоголя лицам до 18 лет запрещена. Чрезмерное употребление алкоголя вредит вашему здоровью.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
            placeholder="Поиск по бару..." />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
          {BAR_CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setCategory(cat.key)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors shrink-0 ${category === cat.key ? 'bg-orange-600 text-white' : 'bg-zinc-900 text-white/60 hover:bg-zinc-800 border border-white/10'}`}>
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-zinc-900 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-36 md:h-48 bg-zinc-800" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-zinc-800 rounded" />
                  <div className="h-3 bg-zinc-800 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {filtered.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="group bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 hover:border-orange-500/30 transition-all hover:-translate-y-1">
                  <div className="relative overflow-hidden">
                    <img src={item.image_url || '/images/cocktail.jpg'} alt={item.name}
                      className="w-full h-36 md:h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
                    {item.abv && item.abv > 0 && (
                      <div className="absolute top-2 right-2 bg-black/60 text-white/70 text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        {item.abv}%
                      </div>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="font-bold text-white text-sm md:text-base mb-1 line-clamp-2">{item.name}</h3>
                    <p className="text-white/40 text-xs mb-2 line-clamp-2 hidden md:block">{item.description}</p>
                    {item.volume && <p className="text-white/30 text-xs mb-2">{item.volume}</p>}
                    <div className="flex items-center justify-between">
                      <span className="text-orange-400 font-black text-base md:text-lg">{item.price}₽</span>
                      <button onClick={() => addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image_url, type: 'bar' })}
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg transition-colors">
                        + В заказ
                      </button>
                    </div>
                    <p className="text-amber-500/50 text-xs mt-1">🏠 Только в заведении</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
