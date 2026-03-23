import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Calendar, Star, MessageSquare,
  UtensilsCrossed, Settings, LogOut, Check, X, Eye,
  Trash2, Edit3, Plus, RefreshCw, Phone, BookOpen,
  ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Прямое подключение к Supabase — работает в браузере
const sb = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://ylfaprsqkzcgzeizpmsc.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_RKd3PCmrhnMfo9wxjAyoxQ_Rr0fwkfp'
);

// ─── Константы ───────────────────────────────────────────────────────────────

const ORDER_STATUSES: Record<string, { label: string; color: string }> = {
  new:        { label: 'Новый',        color: 'bg-blue-500' },
  confirmed:  { label: 'Подтверждён', color: 'bg-green-500' },
  preparing:  { label: 'Готовится',   color: 'bg-yellow-500' },
  delivering: { label: 'Доставляется',color: 'bg-orange-500' },
  done:       { label: 'Выполнен',    color: 'bg-gray-500' },
  cancelled:  { label: 'Отменён',     color: 'bg-red-500' },
};

const BOOKING_STATUSES: Record<string, { label: string; color: string }> = {
  new:       { label: 'Новая',        color: 'bg-blue-500' },
  confirmed: { label: 'Подтверждена', color: 'bg-green-500' },
  done:      { label: 'Состоялась',   color: 'bg-gray-500' },
  cancelled: { label: 'Отменена',     color: 'bg-red-500' },
};

const FOOD_CATEGORIES = [
  { key: 'mangal',            label: '🔥 Блюда с мангала' },
  { key: 'shashlik_bones',    label: '🍖 Шашлык на костях' },
  { key: 'vegetables_mangal', label: '🥦 Овощи на мангале' },
  { key: 'fish_mangal',       label: '🐟 Рыба на мангале' },
  { key: 'sadj',              label: '🫕 Садж' },
  { key: 'soups',             label: '🍲 Супы' },
  { key: 'hot',               label: '🍽️ Горячие блюда' },
  { key: 'plov',              label: '🍚 Шах-плов' },
  { key: 'pasta',             label: '🍝 Паста' },
  { key: 'sides',             label: '🥔 Гарниры' },
  { key: 'beer_snacks',       label: '🍺 Закуски к пиву' },
  { key: 'sauces',            label: '🫙 Соусы' },
  { key: 'cold_appetizers',   label: '🥗 Холодные закуски' },
  { key: 'salads',            label: '🥗 Салаты' },
  { key: 'drinks',            label: '🥤 Напитки' },
  { key: 'tea',               label: '🍵 Авторские чаи' },
  { key: 'ice_cream',         label: '🍦 Мороженое' },
  { key: 'desserts',          label: '🍰 Десерты' },
];

const BAR_CATEGORIES = [
  { key: 'cocktails', label: '🍸 Коктейли' },
  { key: 'beer',      label: '🍺 Пиво' },
  { key: 'wine',      label: '🍷 Вино' },
  { key: 'whiskey',   label: '🥃 Виски' },
  { key: 'vodka',     label: '🫙 Водка' },
  { key: 'cognac',    label: '🥃 Коньяк' },
  { key: 'champagne', label: '🥂 Шампанское' },
  { key: 'shots',     label: '🔥 Шоты' },
  { key: 'soft',      label: '🥤 Безалкогольные' },
];

// ─── Компонент ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed]     = useState(() => sessionStorage.getItem('admin_ok') === '1');
  const [password, setPassword] = useState('');
  const [authErr, setAuthErr]   = useState('');
  const [section, setSection]   = useState('dashboard');

  // Данные
  const [orders,    setOrders]    = useState<any[]>([]);
  const [bookings,  setBookings]  = useState<any[]>([]);
  const [reviews,   setReviews]   = useState<any[]>([]);
  const [messages,  setMessages]  = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [services,  setServices]  = useState<any[]>([]);
  const [stats,     setStats]     = useState<any>({});
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  // Модалки
  const [editModal, setEditModal] = useState<{ type: 'menu' | 'service'; item?: any } | null>(null);
  const [expandedOrder,   setExpandedOrder]   = useState<number | null>(null);
  const [expandedBooking, setExpandedBooking] = useState<number | null>(null);

  // ── Загрузка данных ─────────────────────────────────────────────────────

  const load = useCallback(async () => {
    if (!authed) return;
    setLoading(true);
    setError('');
    try {
      const [o, b, r, m, mi, sv] = await Promise.all([
        sb.from('orders').select('*').order('created_at', { ascending: false }),
        sb.from('bookings').select('*').order('created_at', { ascending: false }),
        sb.from('reviews').select('*').order('created_at', { ascending: false }),
        sb.from('contact_messages').select('*').order('created_at', { ascending: false }),
        sb.from('menu_items').select('*').order('sort_order', { ascending: true }),
        sb.from('banquet_services').select('*').order('sort_order', { ascending: true }),
      ]);

      if (o.error) throw o.error;
      if (b.error) throw b.error;
      if (r.error) throw r.error;
      if (m.error) throw m.error;
      if (mi.error) throw mi.error;
      if (sv.error) throw sv.error;

      setOrders(o.data || []);
      setBookings(b.data || []);
      setReviews(r.data || []);
      setMessages(m.data || []);
      setMenuItems(mi.data || []);
      setServices(sv.data || []);

      const ordersData   = o.data || [];
      const reviewsData  = r.data || [];
      const messagesData = m.data || [];
      const bookingsData = b.data || [];
      setStats({
        new_orders:       ordersData.filter(x => x.status === 'new').length,
        total_revenue:    ordersData.filter(x => x.status !== 'cancelled').reduce((s: number, x: any) => s + Number(x.total_price || 0), 0),
        pending_bookings: bookingsData.filter(x => x.status === 'new').length,
        pending_reviews:  reviewsData.filter(x => !x.is_approved).length,
        unread_messages:  messagesData.filter(x => !x.is_read).length,
        avg_rating:       reviewsData.filter(x => x.is_approved).length
          ? (reviewsData.filter(x => x.is_approved).reduce((s: number, x: any) => s + x.rating, 0) / reviewsData.filter(x => x.is_approved).length).toFixed(1)
          : '—',
      });
    } catch (e: any) {
      setError('Ошибка загрузки: ' + e.message);
    }
    setLoading(false);
  }, [authed]);

  useEffect(() => { load(); }, [load]);

  // ── Авторизация ─────────────────────────────────────────────────────────

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'soliperec2025' || password === (import.meta.env.VITE_ADMIN_PASSWORD || '')) {
      sessionStorage.setItem('admin_ok', '1');
      setAuthed(true);
      setAuthErr('');
    } else {
      setAuthErr('Неверный пароль');
    }
  };

  const logout = () => { sessionStorage.removeItem('admin_ok'); setAuthed(false); };

  // ── Заказы ──────────────────────────────────────────────────────────────

  const updateOrder = async (id: number, upd: any) => {
    await sb.from('orders').update(upd).eq('id', id);
    load();
  };

  // ── Бронирования ────────────────────────────────────────────────────────

  const updateBooking = async (id: number, upd: any) => {
    await sb.from('bookings').update(upd).eq('id', id);
    load();
  };

  const deleteBooking = async (id: number) => {
    await sb.from('bookings').delete().eq('id', id);
    load();
  };

  // ── Отзывы ──────────────────────────────────────────────────────────────

  const approveReview = async (id: number, val: boolean) => {
    await sb.from('reviews').update({ is_approved: val }).eq('id', id);
    load();
  };

  const deleteReview = async (id: number) => {
    await sb.from('reviews').delete().eq('id', id);
    load();
  };

  // ── Сообщения ───────────────────────────────────────────────────────────

  const markRead = async (id: number) => {
    await sb.from('contact_messages').update({ is_read: true }).eq('id', id);
    load();
  };

  const deleteMessage = async (id: number) => {
    await sb.from('contact_messages').delete().eq('id', id);
    load();
  };

  // ── Меню ────────────────────────────────────────────────────────────────

  const saveMenuItem = async (item: any) => {
    const payload = {
      name:         item.name,
      description:  item.description || '',
      price:        Number(item.price) || 0,
      old_price:    item.old_price ? Number(item.old_price) : null,
      image_url:    item.image_url || '',
      category:     item.category || 'mangal',
      type:         item.type || 'food',
      is_featured:  !!item.is_featured,
      is_day_special: !!item.is_day_special,
      is_active:    item.is_active !== false,
      calories:     item.calories ? Number(item.calories) : null,
      cook_time:    item.cook_time ? Number(item.cook_time) : null,
      weight:       item.weight || '',
      volume:       item.volume || '',
      abv:          item.abv ? Number(item.abv) : null,
      sort_order:   Number(item.sort_order) || 0,
    };
    if (item.id) {
      await sb.from('menu_items').update(payload).eq('id', item.id);
    } else {
      await sb.from('menu_items').insert(payload);
    }
    setEditModal(null);
    load();
  };

  const toggleActive = async (id: number, val: boolean) => {
    await sb.from('menu_items').update({ is_active: val }).eq('id', id);
    load();
  };

  const deleteMenuItem = async (id: number) => {
    if (!confirm('Удалить блюдо?')) return;
    await sb.from('menu_items').delete().eq('id', id);
    load();
  };

  // ── Услуги банкета ──────────────────────────────────────────────────────

  const saveService = async (item: any) => {
    const payload = {
      name:       item.name,
      description:item.description || '',
      price:      Number(item.price) || 0,
      price_type: item.price_type || 'fixed',
      category:   item.category || 'Развлечения',
      icon:       item.icon || '🎉',
      is_active:  item.is_active !== false,
      sort_order: Number(item.sort_order) || 0,
    };
    if (item.id) {
      await sb.from('banquet_services').update(payload).eq('id', item.id);
    } else {
      await sb.from('banquet_services').insert(payload);
    }
    setEditModal(null);
    load();
  };

  const deleteService = async (id: number) => {
    if (!confirm('Удалить услугу?')) return;
    await sb.from('banquet_services').delete().eq('id', id);
    load();
  };

  // ── Навигация ───────────────────────────────────────────────────────────

  const navItems = [
    { key: 'dashboard', label: 'Дашборд',      icon: <LayoutDashboard size={18} />, badge: 0 },
    { key: 'orders',    label: 'Заказы',        icon: <ShoppingBag size={18} />,     badge: stats.new_orders || 0 },
    { key: 'bookings',  label: 'Бронирования',  icon: <Calendar size={18} />,        badge: stats.pending_bookings || 0 },
    { key: 'reviews',   label: 'Отзывы',        icon: <Star size={18} />,            badge: stats.pending_reviews || 0 },
    { key: 'messages',  label: 'Сообщения',     icon: <MessageSquare size={18} />,   badge: stats.unread_messages || 0 },
    { key: 'menu',      label: 'Меню',          icon: <UtensilsCrossed size={18} />, badge: 0 },
    { key: 'services',  label: 'Услуги банкета',icon: <Settings size={18} />,        badge: 0 },
  ];

  // ── Экран входа ─────────────────────────────────────────────────────────

  if (!authed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-zinc-900 rounded-3xl p-8 border border-white/10">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🔐</div>
            <h1 className="text-2xl font-black text-white">Панель управления</h1>
            <p className="text-white/40 text-sm mt-1">Кафе «Соль и Перец»</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <input type="text" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
              placeholder="Пароль" autoComplete="off" required />
            {authErr && <p className="text-red-400 text-sm text-center">{authErr}</p>}
            <button type="submit" className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
              Войти
            </button>
          </form>
          <div className="mt-5 p-3 bg-zinc-800 rounded-xl text-center">
            <p className="text-white/30 text-xs mb-1">Пароль по умолчанию:</p>
            <p className="text-orange-400 font-mono font-bold">soliperec2025</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Основной интерфейс ──────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">

      {/* Сайдбар — десктоп */}
      <aside className="hidden md:flex w-60 shrink-0 bg-zinc-900 border-r border-white/10 flex-col">
        <div className="p-5 border-b border-white/10">
          <p className="text-orange-400 font-black text-lg leading-tight">Соль & Перец</p>
          <p className="text-white/30 text-xs mt-0.5">Панель управления</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(n => (
            <button key={n.key} onClick={() => setSection(n.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${section === n.key ? 'bg-orange-600/20 text-orange-400' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
              {n.icon}
              <span className="flex-1 text-left">{n.label}</span>
              {n.badge > 0 && <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{n.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-0.5">
          <button onClick={load} className="w-full flex items-center gap-2 px-3 py-2 text-white/40 hover:text-white text-sm rounded-lg transition-colors">
            <RefreshCw size={15} /> Обновить
          </button>
          <Link to="/admin/instructions" className="w-full flex items-center gap-2 px-3 py-2 text-white/40 hover:text-orange-400 text-sm rounded-lg transition-colors">
            <BookOpen size={15} /> Инструкция
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-white/40 hover:text-red-400 text-sm rounded-lg transition-colors">
            <LogOut size={15} /> Выйти
          </button>
        </div>
      </aside>

      {/* Нижняя навигация — мобайл */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-white/10 flex md:hidden z-50">
        {navItems.slice(0, 5).map(n => (
          <button key={n.key} onClick={() => setSection(n.key)}
            className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 text-xs relative transition-colors ${section === n.key ? 'text-orange-400' : 'text-white/40'}`}>
            {n.icon}
            {n.badge > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{n.badge}</span>}
          </button>
        ))}
      </div>

      {/* Контент */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="p-4 md:p-6 max-w-6xl mx-auto">

          {/* Ошибка */}
          {error && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-500/30 rounded-xl flex items-center gap-3">
              <AlertCircle size={18} className="text-red-400 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
              <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300"><X size={16} /></button>
            </div>
          )}

          {loading && (
            <div className="mb-4 text-center text-white/40 text-sm animate-pulse">Загрузка данных...</div>
          )}

          {/* ─── ДАШБОРД ─────────────────────────────────────────────────── */}
          {section === 'dashboard' && (
            <div>
              <h1 className="text-2xl font-black mb-6">Дашборд</h1>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                {[
                  { icon: '🛒', label: 'Новых заказов',  value: stats.new_orders || 0,      color: 'text-blue-400' },
                  { icon: '💰', label: 'Выручка',        value: `${(stats.total_revenue||0).toLocaleString('ru')}₽`, color: 'text-green-400' },
                  { icon: '📅', label: 'Брони (новых)',  value: stats.pending_bookings || 0, color: 'text-orange-400' },
                  { icon: '⭐', label: 'Рейтинг',        value: stats.avg_rating || '—',    color: 'text-yellow-400' },
                  { icon: '💬', label: 'Сообщений',      value: stats.unread_messages || 0, color: 'text-purple-400' },
                  { icon: '📝', label: 'Отзывов (ожид.)',value: stats.pending_reviews || 0, color: 'text-pink-400' },
                ].map((s, i) => (
                  <div key={i} className="bg-zinc-900 rounded-2xl p-4 border border-white/10 text-center">
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-zinc-900 rounded-2xl border border-white/10 p-5">
                  <h2 className="font-bold mb-3 flex items-center gap-2"><ShoppingBag size={16} className="text-orange-400" /> Последние заказы</h2>
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full text-white ${ORDER_STATUSES[o.status]?.color || 'bg-gray-500'}`}>{ORDER_STATUSES[o.status]?.label}</span>
                      <span className="text-white/70 text-sm flex-1 truncate">{o.customer_name}</span>
                      <span className="text-orange-400 font-bold text-sm">{o.total_price}₽</span>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-white/30 text-sm">Заказов пока нет</p>}
                </div>
                <div className="bg-zinc-900 rounded-2xl border border-white/10 p-5">
                  <h2 className="font-bold mb-3 flex items-center gap-2"><Calendar size={16} className="text-orange-400" /> Последние бронирования</h2>
                  {bookings.slice(0, 5).map(b => (
                    <div key={b.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full text-white ${BOOKING_STATUSES[b.status]?.color || 'bg-gray-500'}`}>{BOOKING_STATUSES[b.status]?.label}</span>
                      <span className="text-white/70 text-sm flex-1 truncate">{b.customer_name}</span>
                      <span className="text-white/40 text-xs">{b.event_date}</span>
                    </div>
                  ))}
                  {bookings.length === 0 && <p className="text-white/30 text-sm">Бронирований пока нет</p>}
                </div>
              </div>
            </div>
          )}

          {/* ─── ЗАКАЗЫ ──────────────────────────────────────────────────── */}
          {section === 'orders' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black">Заказы <span className="text-white/30 text-lg">({orders.length})</span></h1>
                <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors"><RefreshCw size={14} /> Обновить</button>
              </div>
              {orders.length === 0 && !loading && <p className="text-white/30 text-center py-12">Заказов пока нет</p>}
              <div className="space-y-3">
                {orders.map(o => (
                  <div key={o.id} className="bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}>
                      <span className={`text-xs px-2 py-1 rounded-full text-white font-medium shrink-0 ${ORDER_STATUSES[o.status]?.color || 'bg-gray-500'}`}>{ORDER_STATUSES[o.status]?.label}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">#{o.id} — {o.customer_name}</p>
                        <p className="text-white/40 text-xs">{o.customer_phone} · {new Date(o.created_at).toLocaleString('ru-RU')}</p>
                      </div>
                      <span className="text-orange-400 font-black">{o.total_price}₽</span>
                      {expandedOrder === o.id ? <ChevronUp size={16} className="text-white/40 shrink-0" /> : <ChevronDown size={16} className="text-white/40 shrink-0" />}
                    </div>
                    {expandedOrder === o.id && (
                      <div className="px-4 pb-4 border-t border-white/10 pt-4 space-y-4">
                        {o.delivery_address && <p className="text-white/60 text-sm">📍 {o.delivery_address}</p>}
                        {o.comment && <p className="text-white/60 text-sm">💬 {o.comment}</p>}
                        <div className="bg-white/5 rounded-xl p-3 space-y-1">
                          {(o.items || []).map((it: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-white/70">{it.name} × {it.quantity}</span>
                              <span className="text-white">{it.price * it.quantity}₽</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <p className="text-white/50 text-xs mb-2">Изменить статус:</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(ORDER_STATUSES).map(([k, v]) => (
                              <button key={k} onClick={() => updateOrder(o.id, { status: k })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${o.status === k ? `${v.color} text-white` : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                                {v.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a href={`tel:${o.customer_phone}`} className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm rounded-xl transition-colors">
                            <Phone size={14} /> Позвонить
                          </a>
                        </div>
                        <label className="block">
                          <span className="text-white/40 text-xs">Заметка администратора:</span>
                          <input defaultValue={o.admin_comment || ''} onBlur={e => { if (e.target.value !== (o.admin_comment || '')) updateOrder(o.id, { admin_comment: e.target.value }); }}
                            className="mt-1 w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500 placeholder-white/20"
                            placeholder="Введите заметку..." />
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── БРОНИРОВАНИЯ ────────────────────────────────────────────── */}
          {section === 'bookings' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black">Бронирования <span className="text-white/30 text-lg">({bookings.length})</span></h1>
                <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors"><RefreshCw size={14} /> Обновить</button>
              </div>
              {bookings.length === 0 && !loading && <p className="text-white/30 text-center py-12">Бронирований пока нет</p>}
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.id} className="bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpandedBooking(expandedBooking === b.id ? null : b.id)}>
                      <span className={`text-xs px-2 py-1 rounded-full text-white font-medium shrink-0 ${BOOKING_STATUSES[b.status]?.color || 'bg-gray-500'}`}>{BOOKING_STATUSES[b.status]?.label}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">#{b.id} — {b.customer_name}</p>
                        <p className="text-white/40 text-xs">{b.event_date} {b.event_time} · {b.guests_count} гостей · {b.table_number ? `Стол №${b.table_number}` : ''}</p>
                      </div>
                      <span className="text-orange-400 font-bold text-sm shrink-0">~{(b.total_estimate || 0).toLocaleString('ru')}₽</span>
                      {expandedBooking === b.id ? <ChevronUp size={16} className="text-white/40 shrink-0" /> : <ChevronDown size={16} className="text-white/40 shrink-0" />}
                    </div>
                    {expandedBooking === b.id && (
                      <div className="px-4 pb-4 border-t border-white/10 pt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div><span className="text-white/40">Телефон:</span> <a href={`tel:${b.customer_phone}`} className="text-orange-400 hover:underline">{b.customer_phone}</a></div>
                          {b.customer_email && <div><span className="text-white/40">Email:</span> <a href={`mailto:${b.customer_email}`} className="text-blue-400 hover:underline">{b.customer_email}</a></div>}
                          <div><span className="text-white/40">Тип события:</span> <span className="text-white">{b.event_type || '—'}</span></div>
                          <div><span className="text-white/40">Повод:</span> <span className="text-white">{b.occasion || '—'}</span></div>
                          <div><span className="text-white/40">Стол №:</span> <span className="text-white">{b.table_number || '—'}</span></div>
                          <div><span className="text-white/40">Пакет:</span> <span className="text-white">{b.package_name || '—'}</span></div>
                        </div>
                        {b.extra_services?.length > 0 && (
                          <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-white/40 text-xs mb-1">Доп. услуги:</p>
                            <p className="text-white/70 text-sm">{b.extra_services.join(', ')}</p>
                          </div>
                        )}
                        {b.comment && <p className="text-white/60 text-sm">💬 {b.comment}</p>}
                        <div>
                          <p className="text-white/50 text-xs mb-2">Изменить статус:</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(BOOKING_STATUSES).map(([k, v]) => (
                              <button key={k} onClick={() => updateBooking(b.id, { status: k })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${b.status === k ? `${v.color} text-white` : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                                {v.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a href={`tel:${b.customer_phone}`} className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm rounded-xl transition-colors">
                            <Phone size={14} /> Позвонить
                          </a>
                          <button onClick={() => deleteBooking(b.id)} className="flex items-center gap-2 px-4 py-2 bg-red-700/50 hover:bg-red-700 text-white text-sm rounded-xl transition-colors">
                            <Trash2 size={14} /> Удалить
                          </button>
                        </div>
                        <label className="block">
                          <span className="text-white/40 text-xs">Заметка:</span>
                          <input defaultValue={b.admin_comment || ''} onBlur={e => { if (e.target.value !== (b.admin_comment || '')) updateBooking(b.id, { admin_comment: e.target.value }); }}
                            className="mt-1 w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500 placeholder-white/20"
                            placeholder="Заметка..." />
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── ОТЗЫВЫ ──────────────────────────────────────────────────── */}
          {section === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black">Отзывы <span className="text-white/30 text-lg">({reviews.length})</span></h1>
                <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors"><RefreshCw size={14} /> Обновить</button>
              </div>
              {reviews.length === 0 && !loading && <p className="text-white/30 text-center py-12">Отзывов пока нет</p>}
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className={`bg-zinc-900 rounded-2xl border p-5 ${r.is_approved ? 'border-green-500/20' : 'border-yellow-500/30'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-bold text-white">{r.author_name}</span>
                          <span className="text-yellow-400">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${r.is_approved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {r.is_approved ? '✓ Опубликован' : '⏳ На модерации'}
                          </span>
                        </div>
                        <p className="text-white/70 text-sm">{r.text}</p>
                        <p className="text-white/30 text-xs mt-2">{new Date(r.created_at).toLocaleString('ru-RU')}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {!r.is_approved
                          ? <button onClick={() => approveReview(r.id, true)} className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors" title="Опубликовать"><Check size={16} /></button>
                          : <button onClick={() => approveReview(r.id, false)} className="p-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors" title="Снять с публикации"><Eye size={16} /></button>
                        }
                        <button onClick={() => deleteReview(r.id)} className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors" title="Удалить"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── СООБЩЕНИЯ ───────────────────────────────────────────────── */}
          {section === 'messages' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black">Сообщения <span className="text-white/30 text-lg">({messages.length})</span></h1>
                <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors"><RefreshCw size={14} /> Обновить</button>
              </div>
              {messages.length === 0 && !loading && <p className="text-white/30 text-center py-12">Сообщений пока нет</p>}
              <div className="space-y-3">
                {messages.map(m => (
                  <div key={m.id} className={`bg-zinc-900 rounded-2xl border p-5 ${m.is_read ? 'border-white/10' : 'border-blue-500/30'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-bold text-white">{m.name}</span>
                          {!m.is_read && <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">Новое</span>}
                        </div>
                        {m.phone && <a href={`tel:${m.phone}`} className="text-orange-400 text-sm hover:underline flex items-center gap-1 mb-1"><Phone size={12} />{m.phone}</a>}
                        {m.email && <a href={`mailto:${m.email}`} className="text-blue-400 text-sm hover:underline block mb-2">{m.email}</a>}
                        <p className="text-white/70 text-sm">{m.message}</p>
                        <p className="text-white/30 text-xs mt-2">{new Date(m.created_at).toLocaleString('ru-RU')}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {!m.is_read && <button onClick={() => markRead(m.id)} className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors" title="Отметить прочитанным"><Check size={16} /></button>}
                        <button onClick={() => deleteMessage(m.id)} className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors" title="Удалить"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── МЕНЮ ────────────────────────────────────────────────────── */}
          {section === 'menu' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black">Меню <span className="text-white/30 text-lg">({menuItems.length} позиций)</span></h1>
                <button onClick={() => setEditModal({ type: 'menu' })}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-medium transition-colors">
                  <Plus size={16} /> Добавить блюдо
                </button>
              </div>

              {/* Группировка по категориям */}
              {[...FOOD_CATEGORIES, ...BAR_CATEGORIES].map(cat => {
                const items = menuItems.filter(i => i.category === cat.key);
                if (items.length === 0) return null;
                return (
                  <div key={cat.key} className="mb-6">
                    <h2 className="text-sm font-bold text-orange-400 uppercase tracking-wider mb-3">{cat.label} ({items.length})</h2>
                    <div className="space-y-2">
                      {items.map(item => (
                        <div key={item.id} className={`flex items-center gap-3 bg-zinc-900 rounded-xl p-3 border ${item.is_active ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
                          {item.image_url && <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded-lg shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">{item.name}</p>
                            <p className="text-white/40 text-xs">{item.weight || ''} {item.calories ? `· ${item.calories} ккал` : ''}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {item.is_day_special && <span className="text-xs bg-orange-600/20 text-orange-400 px-2 py-0.5 rounded-full">Блюдо дня</span>}
                            {item.is_featured && <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-0.5 rounded-full hidden md:block">Топ</span>}
                            <span className="text-orange-400 font-bold text-sm">{item.price}₽</span>
                            <button onClick={() => toggleActive(item.id, !item.is_active)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${item.is_active ? 'bg-green-600/20 text-green-400 hover:bg-green-600' : 'bg-white/10 text-white/30 hover:bg-white/20'}`}
                              title={item.is_active ? 'Скрыть' : 'Показать'}>
                              <Eye size={14} />
                            </button>
                            <button onClick={() => setEditModal({ type: 'menu', item })}
                              className="w-8 h-8 bg-white/10 hover:bg-blue-600 text-white/60 hover:text-white rounded-lg flex items-center justify-center transition-colors">
                              <Edit3 size={14} />
                            </button>
                            <button onClick={() => deleteMenuItem(item.id)}
                              className="w-8 h-8 bg-white/10 hover:bg-red-600 text-white/60 hover:text-white rounded-lg flex items-center justify-center transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {menuItems.length === 0 && !loading && (
                <div className="text-center py-16 text-white/30">
                  <UtensilsCrossed size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Меню пустое. Добавьте первое блюдо!</p>
                </div>
              )}
            </div>
          )}

          {/* ─── УСЛУГИ БАНКЕТА ──────────────────────────────────────────── */}
          {section === 'services' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black">Услуги банкета <span className="text-white/30 text-lg">({services.length})</span></h1>
                <button onClick={() => setEditModal({ type: 'service' })}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-medium transition-colors">
                  <Plus size={16} /> Добавить услугу
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services.map(s => (
                  <div key={s.id} className={`bg-zinc-900 rounded-2xl border p-4 flex items-start justify-between gap-3 ${s.is_active ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
                    <div className="flex-1">
                      <p className="font-bold text-white">{s.icon} {s.name}</p>
                      <p className="text-white/50 text-sm mt-0.5">{s.description}</p>
                      <p className="text-orange-400 font-bold mt-1">{s.price}₽{s.price_type === 'per_person' ? '/чел' : ''}</p>
                      <p className="text-white/30 text-xs">{s.category}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setEditModal({ type: 'service', item: s })}
                        className="w-8 h-8 bg-white/10 hover:bg-blue-600 text-white/60 hover:text-white rounded-lg flex items-center justify-center transition-colors">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => deleteService(s.id)}
                        className="w-8 h-8 bg-white/10 hover:bg-red-600 text-white/60 hover:text-white rounded-lg flex items-center justify-center transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {services.length === 0 && !loading && (
                  <div className="col-span-2 text-center py-12 text-white/30">Услуг пока нет</div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ─── МОДАЛКИ ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" onClick={() => setEditModal(null)} />
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-zinc-900 rounded-3xl border border-white/10 z-50 overflow-y-auto max-h-[90vh]">
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-black">
                    {editModal.item ? 'Редактировать' : 'Добавить'} {editModal.type === 'menu' ? 'блюдо' : 'услугу'}
                  </h2>
                  <button onClick={() => setEditModal(null)} className="text-white/40 hover:text-white transition-colors"><X size={22} /></button>
                </div>
                {editModal.type === 'menu'
                  ? <MenuForm item={editModal.item} onSave={saveMenuItem} onCancel={() => setEditModal(null)} />
                  : <ServiceForm item={editModal.item} onSave={saveService} onCancel={() => setEditModal(null)} />
                }
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Форма блюда ─────────────────────────────────────────────────────────────

function MenuForm({ item, onSave, onCancel }: { item?: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [f, setF] = useState({
    id: item?.id,
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || '',
    old_price: item?.old_price || '',
    image_url: item?.image_url || '',
    type: item?.type || 'food',
    category: item?.category || 'mangal',
    weight: item?.weight || '',
    calories: item?.calories || '',
    cook_time: item?.cook_time || '',
    volume: item?.volume || '',
    abv: item?.abv || '',
    is_featured: item?.is_featured || false,
    is_day_special: item?.is_day_special || false,
    is_active: item?.is_active !== false,
    sort_order: item?.sort_order || 0,
  });

  const allCats = [
    { key: 'mangal', label: '🔥 Блюда с мангала', type: 'food' },
    { key: 'shashlik_bones', label: '🍖 Шашлык на костях', type: 'food' },
    { key: 'vegetables_mangal', label: '🥦 Овощи на мангале', type: 'food' },
    { key: 'fish_mangal', label: '🐟 Рыба на мангале', type: 'food' },
    { key: 'sadj', label: '🫕 Садж', type: 'food' },
    { key: 'soups', label: '🍲 Супы', type: 'food' },
    { key: 'hot', label: '🍽️ Горячие блюда', type: 'food' },
    { key: 'plov', label: '🍚 Шах-плов', type: 'food' },
    { key: 'pasta', label: '🍝 Паста', type: 'food' },
    { key: 'sides', label: '🥔 Гарниры', type: 'food' },
    { key: 'beer_snacks', label: '🍺 Закуски к пиву', type: 'food' },
    { key: 'sauces', label: '🫙 Соусы', type: 'food' },
    { key: 'cold_appetizers', label: '🥗 Холодные закуски', type: 'food' },
    { key: 'salads', label: '🥗 Салаты', type: 'food' },
    { key: 'drinks', label: '🥤 Напитки', type: 'food' },
    { key: 'tea', label: '🍵 Авторские чаи', type: 'food' },
    { key: 'ice_cream', label: '🍦 Мороженое', type: 'food' },
    { key: 'desserts', label: '🍰 Десерты', type: 'food' },
    { key: 'cocktails', label: '🍸 Коктейли', type: 'bar' },
    { key: 'beer', label: '🍺 Пиво', type: 'bar' },
    { key: 'wine', label: '🍷 Вино', type: 'bar' },
    { key: 'whiskey', label: '🥃 Виски', type: 'bar' },
    { key: 'vodka', label: '🫙 Водка', type: 'bar' },
    { key: 'cognac', label: '🥃 Коньяк', type: 'bar' },
    { key: 'champagne', label: '🥂 Шампанское', type: 'bar' },
    { key: 'shots', label: '🔥 Шоты', type: 'bar' },
    { key: 'soft', label: '🥤 Безалкогольные (бар)', type: 'bar' },
  ];

  const inp = 'w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 text-sm';

  return (
    <div className="space-y-3">
      <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className={inp} placeholder="Название *" required />
      <textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} className={inp + ' resize-none'} rows={2} placeholder="Описание" />
      <div className="grid grid-cols-2 gap-3">
        <input value={f.price} onChange={e => setF({ ...f, price: e.target.value })} className={inp} placeholder="Цена ₽ *" type="number" required />
        <input value={f.old_price} onChange={e => setF({ ...f, old_price: e.target.value })} className={inp} placeholder="Старая цена" type="number" />
      </div>
      <input value={f.image_url} onChange={e => setF({ ...f, image_url: e.target.value })} className={inp} placeholder="URL фото (https://...)" />
      {f.image_url && <img src={f.image_url} alt="preview" className="w-full h-32 object-cover rounded-xl" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
      <div className="grid grid-cols-2 gap-3">
        <select value={f.type} onChange={e => setF({ ...f, type: e.target.value })} className={inp}>
          <option value="food">🍽️ Еда</option>
          <option value="bar">🍸 Бар</option>
        </select>
        <select value={f.category} onChange={e => setF({ ...f, category: e.target.value })} className={inp}>
          {allCats.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <input value={f.weight} onChange={e => setF({ ...f, weight: e.target.value })} className={inp} placeholder="Вес (200г)" />
        <input value={f.calories} onChange={e => setF({ ...f, calories: e.target.value })} className={inp} placeholder="Ккал" type="number" />
        <input value={f.cook_time} onChange={e => setF({ ...f, cook_time: e.target.value })} className={inp} placeholder="Мин." type="number" />
      </div>
      {f.type === 'bar' && (
        <div className="grid grid-cols-2 gap-3">
          <input value={f.volume} onChange={e => setF({ ...f, volume: e.target.value })} className={inp} placeholder="Объём (50мл)" />
          <input value={f.abv} onChange={e => setF({ ...f, abv: e.target.value })} className={inp} placeholder="Крепость %" type="number" />
        </div>
      )}
      <input value={f.sort_order} onChange={e => setF({ ...f, sort_order: Number(e.target.value) })} className={inp} placeholder="Порядок сортировки (0, 10, 20...)" type="number" />
      <div className="flex flex-wrap gap-4">
        {[
          { key: 'is_featured',    label: '⭐ Рекомендуем' },
          { key: 'is_day_special', label: '🔥 Блюдо дня' },
          { key: 'is_active',      label: '✓ Активно (показывать)' },
        ].map(cb => (
          <label key={cb.key} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={(f as any)[cb.key]} onChange={e => setF({ ...f, [cb.key]: e.target.checked })} className="w-4 h-4 accent-orange-500" />
            <span className="text-white/70 text-sm">{cb.label}</span>
          </label>
        ))}
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm">Отмена</button>
        <button onClick={() => onSave(f)} className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors text-sm">Сохранить</button>
      </div>
    </div>
  );
}

// ─── Форма услуги ─────────────────────────────────────────────────────────────

function ServiceForm({ item, onSave, onCancel }: { item?: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [f, setF] = useState({
    id: item?.id,
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || '',
    price_type: item?.price_type || 'fixed',
    category: item?.category || 'Развлечения',
    icon: item?.icon || '🎉',
    is_active: item?.is_active !== false,
    sort_order: item?.sort_order || 0,
  });

  const inp = 'w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 text-sm';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-3">
        <input value={f.icon} onChange={e => setF({ ...f, icon: e.target.value })} className={inp + ' col-span-1 text-center text-xl'} placeholder="🎉" />
        <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className={inp + ' col-span-4'} placeholder="Название услуги *" required />
      </div>
      <textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} className={inp + ' resize-none'} rows={2} placeholder="Описание" />
      <div className="grid grid-cols-2 gap-3">
        <input value={f.price} onChange={e => setF({ ...f, price: e.target.value })} className={inp} placeholder="Цена ₽ *" type="number" required />
        <select value={f.price_type} onChange={e => setF({ ...f, price_type: e.target.value })} className={inp}>
          <option value="fixed">Фиксированная</option>
          <option value="per_person">За человека</option>
        </select>
      </div>
      <input value={f.category} onChange={e => setF({ ...f, category: e.target.value })} className={inp} placeholder="Категория (Развлечения, Декор, Кейтеринг...)" />
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={f.is_active} onChange={e => setF({ ...f, is_active: e.target.checked })} className="w-4 h-4 accent-orange-500" />
        <span className="text-white/70 text-sm">Активно (показывать в калькуляторе)</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm">Отмена</button>
        <button onClick={() => onSave(f)} className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors text-sm">Сохранить</button>
      </div>
    </div>
  );
}
