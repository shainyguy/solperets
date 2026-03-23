import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Flame, Clock, Leaf, Wheat, Milk, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  old_price?: number;
  image_url: string;
  category: string;
  type: string;
  is_featured: boolean;
  is_day_special: boolean;
  calories?: number;
  cook_time?: number;
  allergens?: string[];
  weight?: string;
}

const FOOD_CATEGORIES = [
  { key: 'all', label: 'Всё меню' },
  { key: 'mangal', label: '🔥 Блюда с мангала' },
  { key: 'shashlik_bones', label: '🍖 Шашлык на костях' },
  { key: 'sadj', label: '🫕 Садж' },
  { key: 'fish_mangal', label: '🐟 Рыба на мангале' },
  { key: 'vegetables_mangal', label: '🥦 Овощи на мангале' },
  { key: 'soups', label: '🍲 Супы' },
  { key: 'hot', label: '🍽️ Горячие блюда' },
  { key: 'plov', label: '🍚 Шах-плов' },
  { key: 'pasta', label: '🍝 Паста' },
  { key: 'salads', label: '🥗 Салаты' },
  { key: 'cold_appetizers', label: '❄️ Холодные закуски' },
  { key: 'sides', label: '🥔 Гарниры' },
  { key: 'beer_snacks', label: '🍺 Закуски к пиву' },
  { key: 'sauces', label: '🫙 Соусы' },
  { key: 'desserts', label: '🍰 Десерты' },
  { key: 'ice_cream', label: '🍦 Мороженое' },
  { key: 'drinks', label: '🥤 Напитки' },
  { key: 'author_tea', label: '🍵 Авторские чаи' },
];

const ALLERGEN_FILTERS = [
  { key: 'gluten_free', label: 'Без глютена', icon: <Wheat size={14} /> },
  { key: 'lactose_free', label: 'Без лактозы', icon: <Milk size={14} /> },
  { key: 'vegan', label: 'Вегетарианское', icon: <Leaf size={14} /> },
];

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [allergenFilter, setAllergenFilter] = useState<string[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ type: 'food' });
    if (category !== 'all') params.set('category', category);
    fetch(`/api/menu?${params}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => {
        setItems(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Menu fetch error:', err);
        setItems([]);
        setLoading(false);
      });
  }, [category]);

  const filtered = items.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.description?.toLowerCase().includes(search.toLowerCase());
    const matchAllergens = allergenFilter.length === 0 || allergenFilter.every(f => item.allergens?.includes(f));
    return matchSearch && matchAllergens;
  });

  const daySpecials = filtered.filter(i => i.is_day_special);
  const regular = filtered.filter(i => !i.is_day_special);

  return (
    <div className="bg-zinc-950 min-h-screen text-white pt-20">
      {/* Header */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/shashlik.jpg" alt="Меню" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-zinc-950/60 to-zinc-950" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-orange-400 text-sm font-medium tracking-[0.3em] uppercase mb-4">Кафе «Соль и Перец»</p>
            <h1 className="text-5xl md:text-6xl font-black mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Наше меню
            </h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Свежие ингредиенты, авторские рецепты и домашний вкус — всё, что вы любите
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Search & Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="Поиск по меню..." />
          </div>

          {/* Allergen filters */}
          <div className="flex flex-wrap gap-2">
            {ALLERGEN_FILTERS.map(f => (
              <button key={f.key} onClick={() => setAllergenFilter(prev => prev.includes(f.key) ? prev.filter(x => x !== f.key) : [...prev, f.key])}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${allergenFilter.includes(f.key) ? 'bg-green-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                {f.icon} {f.label}
              </button>
            ))}
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {FOOD_CATEGORIES.map(cat => (
              <button key={cat.key} onClick={() => setCategory(cat.key)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors shrink-0 ${category === cat.key ? 'bg-orange-600 text-white' : 'bg-zinc-900 text-white/60 hover:bg-zinc-800 border border-white/10'}`}>
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Day Specials */}
        {daySpecials.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <Flame className="text-orange-400" size={24} />
              <h2 className="text-2xl font-bold">Блюда дня — специальные цены</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {daySpecials.map((item, i) => (
                <MenuCard key={item.id} item={item} index={i} onAdd={() => addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image_url, type: item.type })} isSpecial />
              ))}
            </div>
          </div>
        )}

        {/* Regular items */}
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
        ) : regular.length === 0 && daySpecials.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <Filter size={48} className="mx-auto mb-4" />
            <p className="text-lg">Ничего не найдено</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {regular.map((item, i) => (
                <MenuCard key={item.id} item={item} index={i} onAdd={() => addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image_url, type: item.type })} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function MenuCard({ item, index, onAdd, isSpecial = false }: { item: MenuItem; index: number; onAdd: () => void; isSpecial?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className={`group bg-zinc-900 rounded-2xl overflow-hidden border transition-all cursor-pointer ${isSpecial ? 'border-orange-500/40' : 'border-white/10 hover:border-orange-500/30'} hover:-translate-y-1`}>
      <div className="relative overflow-hidden">
        <img src={item.image_url || '/images/dish-1.jpg'} alt={item.name}
          className="w-full h-36 md:h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
        {isSpecial && (
          <div className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
            <Flame size={10} /> Блюдо дня
          </div>
        )}
        {item.allergens?.includes('vegan') && (
          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">🌱</div>
        )}
        <AnimatePresence>
          {hovered && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <button onClick={(e) => { e.stopPropagation(); onAdd(); }}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
                <ShoppingCart size={16} /> В корзину
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="p-3 md:p-4">
        <h3 className="font-bold text-white text-sm md:text-base mb-1 line-clamp-2">{item.name}</h3>
        <p className="text-white/40 text-xs mb-2 line-clamp-2 hidden md:block">{item.description}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {item.cook_time && <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full flex items-center gap-1"><Clock size={10} /> {item.cook_time} мин</span>}
          {item.calories && <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">{item.calories} ккал</span>}
          {item.weight && <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">{item.weight}</span>}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-orange-400 font-black text-base md:text-lg">{item.price}₽</span>
            {item.old_price && <span className="text-white/30 text-xs line-through ml-1">{item.old_price}₽</span>}
          </div>
          <button onClick={onAdd} className="p-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors md:hidden">
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
