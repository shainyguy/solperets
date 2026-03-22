import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Calendar, Star, MessageSquare,
  UtensilsCrossed, Settings, LogOut, Check, X,
  Eye, Trash2, Edit3, Plus, DollarSign,
  RefreshCw, Send, Phone, MapPin, BookOpen, AlertCircle, Image
} from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:       { label: 'Новый',        color: 'bg-blue-500' },
  confirmed: { label: 'Подтверждён',  color: 'bg-green-500' },
  preparing: { label: 'Готовится',    color: 'bg-yellow-500' },
  delivering:{ label: 'Доставляется', color: 'bg-orange-500' },
  done:      { label: 'Выполнен',     color: 'bg-gray-500' },
  cancelled: { label: 'Отменён',      color: 'bg-red-500' },
};

const BOOKING_STATUS: Record<string, { label: string; color: string }> = {
  new:       { label: 'Новая',       color: 'bg-blue-500' },
  confirmed: { label: 'Подтверждена',color: 'bg-green-500' },
  done:      { label: 'Состоялась',  color: 'bg-gray-500' },
  cancelled: { label: 'Отменена',    color: 'bg-red-500' },
};

const CATEGORIES = [
  { key: 'mangal',            label: '🔥 Блюда с мангала' },
  { key: 'shashlik_bones',   label: '🍖 Шашлык на костях' },
  { key: 'sadj',             label: '🫕 Садж' },
  { key: 'fish_mangal',      label: '🐟 Рыба на мангале' },
  { key: 'vegetables_mangal',label: '🥦 Овощи на мангале' },
  { key: 'soups',            label: '🍲 Супы' },
  { key: 'hot',              label: '🍽️ Горячие блюда' },
  { key: 'plov',             label: '🍚 Шах-плов' },
  { key: 'pasta',            label: '🍝 Паста' },
  { key: 'salads',           label: '🥗 Салаты' },
  { key: 'cold_appetizers',  label: '🥗 Холодные закуски' },
  { key: 'sides',            label: '🥔 Гарниры' },
  { key: 'beer_snacks',      label: '🍺 Закуски к пиву' },
  { key: 'sauces',           label: '🫙 Соусы' },
  { key: 'desserts',         label: '🍰 Десерты' },
  { key: 'ice_cream',        label: '🍦 Мороженое' },
  { key: 'drinks',           label: '🥤 Напитки' },
  { key: 'author_tea',       label: '🍵 Авторские чаи' },
  { key: 'cocktails',        label: '🍸 Коктейли (бар)' },
  { key: 'beer',             label: '🍺 Пиво (бар)' },
  { key: 'wine',             label: '🍷 Вино (бар)' },
  { key: 'whiskey',          label: '🥃 Виски (бар)' },
  { key: 'vodka',            label: '🫙 Водка (бар)' },
  { key: 'cognac',           label: '🥃 Коньяк (бар)' },
  { key: 'champagne',        label: '🥂 Шампанское (бар)' },
  { key: 'shots',            label: '🔥 Шоты (бар)' },
  { key: 'soft',             label: '🥤 Безалкогольные (бар)' },
];

export default function AdminPage() {
  const [authed, setAuthed]   = useState(() => sessionStorage.getItem('admin_authed') === 'true');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [section, setSection] = useState('dashboard');

  const [stats,           setStats]           = useState<any>(null);
  const [orders,          setOrders]          = useState<any[]>([]);
  const [bookings,        setBookings]        = useState<any[]>([]);
  const [reviews,         setReviews]         = useState<any[]>([]);
  const [messages,        setMessages]        = useState<any[]>([]);
  const [menuItems,       setMenuItems]       = useState<any[]>([]);
  const [banquetServices, setBanquetServices] = useState<any[]>([]);

  const [editModal, setEditModal] = useState<{ type: string; item?: any } | null>(null);
  const [saveError, setSaveError] = useState('');
  const [saving,    setSaving]    = useState(false);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res  = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        sessionStorage.setItem('admin_authed', 'true');
        setAuthed(true);
      } else {
        setAuthError(data.error || 'Неверный пароль');
      }
    } catch {
      setAuthError('Ошибка подключения к серверу');
    }
  };

  const logout = () => { sessionStorage.removeItem('admin_authed'); setAuthed(false); };

  // ── Fetch all ─────────────────────────────────────────────────────────────
  const fetchAll = async () => {
    try {
      const [sR, oR, bR, rvR, mR, mnR, svR] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/orders'),
        fetch('/api/bookings'),
        fetch('/api/reviews'),
        fetch('/api/contacts'),
        fetch('/api/menu'),
        fetch('/api/banquet-services'),
      ]);
      if (sR.ok)  setStats(await sR.json());
      if (oR.ok)  setOrders(await oR.json());
      if (bR.ok)  setBookings(await bR.json());
      if (rvR.ok) setReviews(await rvR.json());
      if (mR.ok)  setMessages(await mR.json());
      if (mnR.ok) setMenuItems(await mnR.json());
      if (svR.ok) setBanquetServices(await svR.json());
    } catch (e) { console.error('fetchAll error', e); }
  };

  useEffect(() => { if (authed) fetchAll(); }, [authed, section]);

  // ── Orders ────────────────────────────────────────────────────────────────
  const updateOrder = async (id: number, status: string, admin_comment?: string) => {
    await fetch('/api/orders', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, admin_comment }),
    });
    fetchAll();
  };

  // ── Bookings ──────────────────────────────────────────────────────────────
  const updateBooking = async (id: number, status: string) => {
    await fetch('/api/bookings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchAll();
  };

  // ── Reviews ───────────────────────────────────────────────────────────────
  const approveReview = async (id: number, is_approved: boolean) => {
    await fetch('/api/reviews', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_approved }),
    });
    fetchAll();
  };
  const deleteReview = async (id: number) => {
    await fetch('/api/reviews', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchAll();
  };

  // ── Messages ──────────────────────────────────────────────────────────────
  const deleteMessage = async (id: number) => {
    await fetch('/api/contacts', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchAll();
  };

  // ── Menu CRUD ─────────────────────────────────────────────────────────────
  const saveMenuItem = async (raw: any) => {
    setSaving(true);
    setSaveError('');
    // Приводим типы — числа как числа, строки как строки
    const payload: any = {
      name:          String(raw.name || '').trim(),
      description:   String(raw.description || '').trim(),
      price:         Number(raw.price) || 0,
      image_url:     String(raw.image_url || '').trim(),
      category:      String(raw.category || 'hot').trim(),
      type:          String(raw.type || 'food'),
      is_featured:   Boolean(raw.is_featured),
      is_day_special:Boolean(raw.is_day_special),
      is_active:     raw.is_active !== false,
      sort_order:    Number(raw.sort_order) || 0,
      weight:        String(raw.weight || '').trim() || null,
      allergens:     raw.allergens || [],
    };
    if (raw.old_price)  payload.old_price  = Number(raw.old_price);
    if (raw.calories)   payload.calories   = Number(raw.calories);
    if (raw.cook_time)  payload.cook_time  = Number(raw.cook_time);
    if (raw.volume)     payload.volume     = String(raw.volume).trim();
    if (raw.abv)        payload.abv        = Number(raw.abv);

    const isEdit = Boolean(raw.id);
    if (isEdit) payload.id = raw.id;

    try {
      const res = await fetch('/api/menu', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setEditModal(null);
      fetchAll();
    } catch (e: any) {
      setSaveError(e.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const deleteMenuItem = async (id: number) => {
    if (!confirm('Удалить блюдо?')) return;
    await fetch('/api/menu', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchAll();
  };

  // ── Banquet services CRUD ─────────────────────────────────────────────────
  const saveService = async (raw: any) => {
    setSaving(true);
    setSaveError('');
    const payload: any = {
      name:       String(raw.name || '').trim(),
      description:String(raw.description || '').trim(),
      price:      Number(raw.price) || 0,
      price_type: String(raw.price_type || 'fixed'),
      category:   String(raw.category || 'Прочее').trim(),
      icon:       String(raw.icon || '🎉'),
      is_active:  raw.is_active !== false,
      sort_order: Number(raw.sort_order) || 0,
    };
    const isEdit = Boolean(raw.id);
    if (isEdit) payload.id = raw.id;

    try {
      const res = await fetch('/api/banquet-services', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setEditModal(null);
      fetchAll();
    } catch (e: any) {
      setSaveError(e.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async (id: number) => {
    if (!confirm('Удалить услугу?')) return;
    await fetch('/api/banquet-services', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchAll();
  };

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-zinc-900 rounded-3xl p-8 border border-white/10">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🔐</div>
            <h1 className="text-2xl font-black text-white">Панель управления</h1>
            <p className="text-white/40 text-sm mt-1">Кафе «Соль и Перец»</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <input type="text" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
              placeholder="Пароль администратора" autoComplete="current-password" required />
            {authError && (
              <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
                <AlertCircle size={16} className="text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{authError}</p>
              </div>
            )}
            <button type="submit" className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
              Войти
            </button>
          </form>
          <div className="mt-5 p-3 bg-zinc-800 rounded-xl text-center">
            <p className="text-white/40 text-xs mb-1">Пароль по умолчанию:</p>
            <p className="text-orange-400 font-mono font-bold">soliperec2025</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Nav items ─────────────────────────────────────────────────────────────
  const navItems = [
    { key: 'dashboard', label: 'Дашборд',      icon: <LayoutDashboard size={18} />, badge: 0 },
    { key: 'orders',    label: 'Заказы',        icon: <ShoppingBag size={18} />,     badge: stats?.new_orders || 0 },
    { key: 'bookings',  label: 'Бронирования',  icon: <Calendar size={18} />,        badge: stats?.pending_bookings || 0 },
    { key: 'reviews',   label: 'Отзывы',        icon: <Star size={18} />,            badge: stats?.pending_reviews || 0 },
    { key: 'messages',  label: 'Сообщения',     icon: <MessageSquare size={18} />,   badge: stats?.unread_messages || 0 },
    { key: 'menu',      label: 'Меню',          icon: <UtensilsCrossed size={18} />, badge: 0 },
    { key: 'services',  label: 'Услуги банкета',icon: <Settings size={18} />,        badge: 0 },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">

      {/* ── Sidebar desktop ── */}
      <div className="w-60 shrink-0 bg-zinc-900 border-r border-white/10 flex-col hidden md:flex">
        <div className="p-5 border-b border-white/10">
          <p className="text-orange-400 font-black">Соль & Перец</p>
          <p className="text-white/40 text-xs">Панель управления</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(n => (
            <button key={n.key} onClick={() => setSection(n.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${section === n.key ? 'bg-orange-600/20 text-orange-400' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
              {n.icon}
              <span className="flex-1 text-left">{n.label}</span>
              {n.badge > 0 && <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{n.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <button onClick={fetchAll} className="w-full flex items-center gap-2 px-3 py-2 text-white/40 hover:text-white text-sm transition-colors rounded-lg hover:bg-white/5">
            <RefreshCw size={15} /> Обновить
          </button>
          <Link to="/admin/instructions" className="w-full flex items-center gap-2 px-3 py-2 text-white/40 hover:text-orange-400 text-sm transition-colors rounded-lg hover:bg-white/5">
            <BookOpen size={15} /> Инструкция
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-white/40 hover:text-red-400 text-sm transition-colors rounded-lg hover:bg-white/5">
            <LogOut size={15} /> Выйти
          </button>
        </div>
      </div>

      {/* ── Mobile bottom nav ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-white/10 flex md:hidden z-50">
        {navItems.slice(0, 5).map(n => (
          <button key={n.key} onClick={() => setSection(n.key)}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs relative transition-colors ${section === n.key ? 'text-orange-400' : 'text-white/40'}`}>
            {n.icon}
            {n.badge > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{n.badge}</span>}
          </button>
        ))}
      </div>

      {/* ── Main ── */}
      <div className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="p-4 md:p-6 max-w-6xl">

          {/* DASHBOARD */}
          {section === 'dashboard' && (
            <div>
              <h1 className="text-2xl font-black mb-6">Дашборд</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { icon: <ShoppingBag size={22} />, label: 'Новых заказов',   value: stats?.new_orders || 0,                         color: 'text-blue-400' },
                  { icon: <DollarSign size={22} />,  label: 'Выручка',         value: `${(stats?.total_revenue||0).toLocaleString('ru-RU')}₽`, color: 'text-green-400' },
                  { icon: <Calendar size={22} />,    label: 'Заявок банкет',   value: stats?.pending_bookings || 0,                   color: 'text-orange-400' },
                  { icon: <Star size={22} />,        label: 'Рейтинг',         value: stats?.avg_rating || '—',                       color: 'text-yellow-400' },
                ].map((s, i) => (
                  <div key={i} className="bg-zinc-900 rounded-2xl p-4 border border-white/10">
                    <div className={`mb-2 ${s.color}`}>{s.icon}</div>
                    <p className="text-2xl font-black text-white">{s.value}</p>
                    <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-zinc-900 rounded-2xl border border-white/10 p-5">
                <h2 className="font-bold mb-4">Последние заказы</h2>
                <div className="space-y-2">
                  {orders.slice(0, 8).map(o => (
                    <div key={o.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{o.customer_name}</p>
                        <p className="text-white/40 text-xs">{o.customer_phone}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full text-white shrink-0 ${STATUS_LABELS[o.status]?.color || 'bg-gray-500'}`}>
                        {STATUS_LABELS[o.status]?.label || o.status}
                      </span>
                      <span className="text-orange-400 font-bold text-sm shrink-0">{o.total_price}₽</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {section === 'orders' && (
            <div>
              <h1 className="text-2xl font-black mb-6">Заказы ({orders.length})</h1>
              <div className="space-y-4">
                {orders.map(o => (
                  <div key={o.id} className="bg-zinc-900 rounded-2xl border border-white/10 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-white">#{o.id} — {o.customer_name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full text-white ${STATUS_LABELS[o.status]?.color || 'bg-gray-500'}`}>
                            {STATUS_LABELS[o.status]?.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-white/50">
                          <span className="flex items-center gap-1"><Phone size={12}/>{o.customer_phone}</span>
                          {o.delivery_address && <span className="flex items-center gap-1"><MapPin size={12}/>{o.delivery_address}</span>}
                          <span>{new Date(o.created_at).toLocaleString('ru-RU')}</span>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-orange-400">{o.total_price}₽</span>
                    </div>
                    <div className="mb-3 p-3 bg-white/5 rounded-xl text-sm space-y-1">
                      {(o.items||[]).map((it:any,i:number) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-white/70">{it.name} × {it.quantity}</span>
                          <span className="text-white">{it.price*it.quantity}₽</span>
                        </div>
                      ))}
                    </div>
                    {o.comment && <p className="text-white/50 text-sm mb-3">💬 {o.comment}</p>}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(STATUS_LABELS).map(([st, {label, color}]) => (
                        <button key={st} onClick={() => updateOrder(o.id, st)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${o.status===st ? `${color} text-white` : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input defaultValue={o.admin_comment||''}
                        onBlur={e => { if (e.target.value !== (o.admin_comment||'')) updateOrder(o.id, o.status, e.target.value); }}
                        className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-orange-500"
                        placeholder="Заметка для заказа..." />
                      <a href={`tel:${o.customer_phone}`}
                        className="flex items-center gap-1.5 px-3 py-2 bg-green-700 hover:bg-green-600 text-white text-sm rounded-lg transition-colors">
                        <Phone size={14}/> Звонок
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOOKINGS */}
          {section === 'bookings' && (
            <div>
              <h1 className="text-2xl font-black mb-6">Бронирования ({bookings.length})</h1>
              <div className="space-y-4">
                {bookings.map(b => (
                  <div key={b.id} className="bg-zinc-900 rounded-2xl border border-white/10 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold text-white">#{b.id} — {b.customer_name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full text-white ${BOOKING_STATUS[b.status]?.color||'bg-gray-500'}`}>
                            {BOOKING_STATUS[b.status]?.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-white/50">
                          <span><Phone size={12} className="inline mr-1"/>{b.customer_phone}</span>
                          <span>📅 {b.event_date} в {b.event_time}</span>
                          <span>👥 {b.guests_count} гостей</span>
                          {b.table_number && <span>🪑 Стол #{b.table_number}</span>}
                        </div>
                      </div>
                      <span className="text-xl font-black text-orange-400">~{(b.total_estimate||0).toLocaleString('ru-RU')}₽</span>
                    </div>
                    {b.event_type && <p className="text-white/60 text-sm mb-2">🎭 {b.event_type}</p>}
                    {b.extra_services?.length > 0 && (
                      <p className="text-white/50 text-xs mb-3">Услуги: {b.extra_services.join(', ')}</p>
                    )}
                    {b.comment && <p className="text-white/50 text-sm mb-3">💬 {b.comment}</p>}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(BOOKING_STATUS).map(([st,{label,color}]) => (
                        <button key={st} onClick={() => updateBooking(b.id, st)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${b.status===st ? `${color} text-white` : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <a href={`tel:${b.customer_phone}`} className="flex items-center gap-1.5 px-3 py-2 bg-green-700 hover:bg-green-600 text-white text-sm rounded-lg transition-colors">
                        <Phone size={14}/> Позвонить
                      </a>
                      {b.customer_email && (
                        <a href={`mailto:${b.customer_email}`} className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors">
                          <Send size={14}/> Email
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REVIEWS */}
          {section === 'reviews' && (
            <div>
              <h1 className="text-2xl font-black mb-6">Отзывы ({reviews.length})</h1>
              <div className="space-y-3">
                {reviews.map(r => (
                  <div key={r.id} className={`bg-zinc-900 rounded-2xl border p-5 ${r.is_approved ? 'border-green-500/30' : 'border-yellow-500/30'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-white">{r.author_name}</span>
                          <span className="text-yellow-400">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${r.is_approved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {r.is_approved ? 'Опубликован' : 'На модерации'}
                          </span>
                        </div>
                        <p className="text-white/70 text-sm">{r.text}</p>
                        <p className="text-white/30 text-xs mt-1">{new Date(r.created_at).toLocaleString('ru-RU')}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => approveReview(r.id, !r.is_approved)}
                          className={`p-2 rounded-lg transition-colors ${r.is_approved ? 'bg-yellow-600/20 hover:bg-yellow-600 text-yellow-400 hover:text-white' : 'bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white'}`}>
                          {r.is_approved ? <Eye size={16}/> : <Check size={16}/>}
                        </button>
                        <button onClick={() => deleteReview(r.id)} className="p-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors">
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MESSAGES */}
          {section === 'messages' && (
            <div>
              <h1 className="text-2xl font-black mb-6">Сообщения ({messages.length})</h1>
              <div className="space-y-3">
                {messages.map(m => (
                  <div key={m.id} className="bg-zinc-900 rounded-2xl border border-white/10 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-bold text-white">{m.name}</span>
                          {m.phone && <a href={`tel:${m.phone}`} className="text-orange-400 text-sm hover:underline flex items-center gap-1"><Phone size={12}/>{m.phone}</a>}
                          {m.email && <a href={`mailto:${m.email}`} className="text-blue-400 text-sm hover:underline">{m.email}</a>}
                        </div>
                        <p className="text-white/70 text-sm">{m.message}</p>
                        <p className="text-white/30 text-xs mt-1">{new Date(m.created_at).toLocaleString('ru-RU')}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {m.phone && <a href={`tel:${m.phone}`} className="p-2 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white rounded-lg transition-colors"><Phone size={16}/></a>}
                        <button onClick={() => deleteMessage(m.id)} className="p-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MENU */}
          {section === 'menu' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black">Меню ({menuItems.length} позиций)</h1>
                <button onClick={() => { setSaveError(''); setEditModal({ type: 'menu' }); }}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition-colors text-sm font-medium">
                  <Plus size={18}/> Добавить блюдо
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map(item => (
                  <div key={item.id} className="bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="relative">
                      <img src={item.image_url || '/images/dish-1.jpg'} alt={item.name}
                        className="w-full h-36 object-cover"
                        onError={e => { (e.target as HTMLImageElement).src = '/images/dish-1.jpg'; }}
                      />
                      {!item.is_active && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white/70 text-sm font-medium">Скрыто</span>
                        </div>
                      )}
                      {item.is_day_special && <span className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-0.5 rounded-full">🔥 Дня</span>}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-white text-sm leading-tight">{item.name}</h3>
                        <span className="text-orange-400 font-black text-sm shrink-0">{item.price}₽</span>
                      </div>
                      <p className="text-white/40 text-xs mb-1">{CATEGORIES.find(c=>c.key===item.category)?.label || item.category}</p>
                      {item.weight && <p className="text-white/30 text-xs">{item.weight}</p>}
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => { setSaveError(''); setEditModal({ type: 'menu', item }); }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white/10 hover:bg-orange-600/20 hover:text-orange-400 text-white text-xs rounded-lg transition-colors">
                          <Edit3 size={14}/> Изменить
                        </button>
                        <button onClick={() => deleteMenuItem(item.id)}
                          className="p-2 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BANQUET SERVICES */}
          {section === 'services' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black">Услуги банкета ({banquetServices.length})</h1>
                <button onClick={() => { setSaveError(''); setEditModal({ type: 'service' }); }}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition-colors text-sm font-medium">
                  <Plus size={18}/> Добавить услугу
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banquetServices.map(s => (
                  <div key={s.id} className="bg-zinc-900 rounded-2xl border border-white/10 p-5 flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-bold text-white">{s.icon} {s.name}</p>
                      <p className="text-white/50 text-sm mt-0.5">{s.description}</p>
                      <p className="text-orange-400 font-bold mt-1">{s.price}₽{s.price_type==='per_person'?'/чел':''}</p>
                      <p className="text-white/30 text-xs">{s.category}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => { setSaveError(''); setEditModal({ type: 'service', item: s }); }}
                        className="p-2 bg-white/10 hover:bg-orange-600/20 text-white hover:text-orange-400 rounded-lg transition-colors">
                        <Edit3 size={16}/>
                      </button>
                      <button onClick={() => deleteService(s.id)}
                        className="p-2 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" onClick={() => setEditModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-zinc-900 rounded-3xl border border-white/10 z-50 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
                <h2 className="text-lg font-bold">
                  {editModal.item ? 'Редактировать' : 'Добавить'} {editModal.type === 'menu' ? 'блюдо' : 'услугу'}
                </h2>
                <button onClick={() => setEditModal(null)} className="text-white/40 hover:text-white"><X size={22}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                {saveError && (
                  <div className="mb-4 bg-red-900/30 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-400 shrink-0"/>
                    <p className="text-red-400 text-sm">{saveError}</p>
                  </div>
                )}
                {editModal.type === 'menu' && (
                  <MenuItemForm item={editModal.item} onSave={saveMenuItem} onCancel={() => setEditModal(null)} saving={saving} />
                )}
                {editModal.type === 'service' && (
                  <ServiceForm item={editModal.item} onSave={saveService} onCancel={() => setEditModal(null)} saving={saving} />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── MenuItemForm ──────────────────────────────────────────────────────────────
function MenuItemForm({ item, onSave, onCancel, saving }: {
  item?: any; onSave: (d: any) => void; onCancel: () => void; saving: boolean;
}) {
  const [form, setForm] = useState({
    id:            item?.id ?? undefined,
    name:          item?.name ?? '',
    description:   item?.description ?? '',
    price:         item?.price ?? '',
    old_price:     item?.old_price ?? '',
    image_url:     item?.image_url ?? '',
    category:      item?.category ?? 'mangal',
    type:          item?.type ?? 'food',
    weight:        item?.weight ?? '',
    calories:      item?.calories ?? '',
    cook_time:     item?.cook_time ?? '',
    volume:        item?.volume ?? '',
    abv:           item?.abv ?? '',
    is_featured:   item?.is_featured ?? false,
    is_day_special:item?.is_day_special ?? false,
    is_active:     item?.is_active !== false,
    sort_order:    item?.sort_order ?? 0,
    allergens:     item?.allergens ?? [],
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const inp = "w-full bg-zinc-800 border border-white/15 rounded-lg px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 text-sm";

  return (
    <div className="space-y-3">
      <div>
        <label className="text-white/50 text-xs mb-1 block">Название *</label>
        <input value={form.name} onChange={e => set('name', e.target.value)} className={inp} placeholder="Название блюда" />
      </div>
      <div>
        <label className="text-white/50 text-xs mb-1 block">Описание</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} className={inp + ' resize-none'} rows={2} placeholder="Описание блюда" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-white/50 text-xs mb-1 block">Цена (₽) *</label>
          <input value={form.price} onChange={e => set('price', e.target.value)} className={inp} placeholder="450" type="number" min="0" />
        </div>
        <div>
          <label className="text-white/50 text-xs mb-1 block">Старая цена (₽)</label>
          <input value={form.old_price} onChange={e => set('old_price', e.target.value)} className={inp} placeholder="600" type="number" min="0" />
        </div>
      </div>

      {/* Изображение */}
      <div>
        <label className="text-white/50 text-xs mb-1 block flex items-center gap-1"><Image size={12}/> URL фото</label>
        <input value={form.image_url} onChange={e => set('image_url', e.target.value)} className={inp} placeholder="https://... или /images/dish-1.jpg" />
        {form.image_url && (
          <img src={form.image_url} alt="preview"
            className="mt-2 w-full h-32 object-cover rounded-lg border border-white/10"
            onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-white/50 text-xs mb-1 block">Тип</label>
          <select value={form.type} onChange={e => set('type', e.target.value)} className={inp}>
            <option value="food">🍽 Еда</option>
            <option value="bar">🍸 Бар</option>
          </select>
        </div>
        <div>
          <label className="text-white/50 text-xs mb-1 block">Категория</label>
          <select value={form.category} onChange={e => set('category', e.target.value)} className={inp}>
            {[
              {key:'mangal',label:'🔥 Блюда с мангала'},{key:'shashlik_bones',label:'🍖 Шашлык на костях'},
              {key:'sadj',label:'🫕 Садж'},{key:'fish_mangal',label:'🐟 Рыба на мангале'},
              {key:'vegetables_mangal',label:'🥦 Овощи на мангале'},{key:'soups',label:'🍲 Супы'},
              {key:'hot',label:'🍽️ Горячие блюда'},{key:'plov',label:'🍚 Шах-плов'},
              {key:'pasta',label:'🍝 Паста'},{key:'salads',label:'🥗 Салаты'},
              {key:'cold_appetizers',label:'🥗 Холодные закуски'},{key:'sides',label:'🥔 Гарниры'},
              {key:'beer_snacks',label:'🍺 Закуски к пиву'},{key:'sauces',label:'🫙 Соусы'},
              {key:'desserts',label:'🍰 Десерты'},{key:'ice_cream',label:'🍦 Мороженое'},
              {key:'drinks',label:'🥤 Напитки'},{key:'author_tea',label:'🍵 Авторские чаи'},
              {key:'cocktails',label:'🍸 Коктейли'},{key:'beer',label:'🍺 Пиво'},
              {key:'wine',label:'🍷 Вино'},{key:'whiskey',label:'🥃 Виски'},
              {key:'vodka',label:'🫙 Водка'},{key:'cognac',label:'🥃 Коньяк'},
              {key:'champagne',label:'🥂 Шампанское'},{key:'shots',label:'🔥 Шоты'},
              {key:'soft',label:'🥤 Безалкогольные'},
            ].map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-white/50 text-xs mb-1 block">Вес/объём</label>
          <input value={form.weight} onChange={e => set('weight', e.target.value)} className={inp} placeholder="200г" />
        </div>
        <div>
          <label className="text-white/50 text-xs mb-1 block">Ккал</label>
          <input value={form.calories} onChange={e => set('calories', e.target.value)} className={inp} placeholder="380" type="number" min="0" />
        </div>
        <div>
          <label className="text-white/50 text-xs mb-1 block">Время мин</label>
          <input value={form.cook_time} onChange={e => set('cook_time', e.target.value)} className={inp} placeholder="20" type="number" min="0" />
        </div>
      </div>

      {form.type === 'bar' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-white/50 text-xs mb-1 block">Объём</label>
            <input value={form.volume} onChange={e => set('volume', e.target.value)} className={inp} placeholder="50мл" />
          </div>
          <div>
            <label className="text-white/50 text-xs mb-1 block">Крепость %</label>
            <input value={form.abv} onChange={e => set('abv', e.target.value)} className={inp} placeholder="40" type="number" min="0" />
          </div>
        </div>
      )}

      <div>
        <label className="text-white/50 text-xs mb-1 block">Порядок сортировки</label>
        <input value={form.sort_order} onChange={e => set('sort_order', e.target.value)} className={inp} placeholder="0" type="number" />
      </div>

      <div className="flex flex-wrap gap-4 pt-1">
        {([['is_featured','⭐ Рекомендуем'],['is_day_special','🔥 Блюдо дня'],['is_active','✅ Активно']] as [string,string][]).map(([k,l]) => (
          <label key={k} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={(form as any)[k]} onChange={e => set(k, e.target.checked)} className="w-4 h-4 accent-orange-500" />
            <span className="text-white/70 text-sm">{l}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm">Отмена</button>
        <button onClick={() => onSave(form)} disabled={saving || !form.name || !form.price}
          className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-sm">
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
}

// ── ServiceForm ───────────────────────────────────────────────────────────────
function ServiceForm({ item, onSave, onCancel, saving }: {
  item?: any; onSave: (d: any) => void; onCancel: () => void; saving: boolean;
}) {
  const [form, setForm] = useState({
    id:         item?.id ?? undefined,
    name:       item?.name ?? '',
    description:item?.description ?? '',
    price:      item?.price ?? '',
    price_type: item?.price_type ?? 'fixed',
    category:   item?.category ?? 'Прочее',
    icon:       item?.icon ?? '🎉',
    is_active:  item?.is_active !== false,
    sort_order: item?.sort_order ?? 0,
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const inp = "w-full bg-zinc-800 border border-white/15 rounded-lg px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 text-sm";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-3">
        <div>
          <label className="text-white/50 text-xs mb-1 block">Иконка</label>
          <input value={form.icon} onChange={e => set('icon', e.target.value)} className={inp + ' text-center text-2xl'} placeholder="🎉" />
        </div>
        <div className="col-span-4">
          <label className="text-white/50 text-xs mb-1 block">Название *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} className={inp} placeholder="Название услуги" />
        </div>
      </div>
      <div>
        <label className="text-white/50 text-xs mb-1 block">Описание</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} className={inp + ' resize-none'} rows={2} placeholder="Описание услуги" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-white/50 text-xs mb-1 block">Цена (₽) *</label>
          <input value={form.price} onChange={e => set('price', e.target.value)} className={inp} placeholder="5000" type="number" min="0" />
        </div>
        <div>
          <label className="text-white/50 text-xs mb-1 block">Тип цены</label>
          <select value={form.price_type} onChange={e => set('price_type', e.target.value)} className={inp}>
            <option value="fixed">Фиксированная</option>
            <option value="per_person">За человека</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-white/50 text-xs mb-1 block">Категория</label>
        <input value={form.category} onChange={e => set('category', e.target.value)} className={inp} placeholder="Развлечения / Декор / Кейтеринг..." />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="w-4 h-4 accent-orange-500" />
        <span className="text-white/70 text-sm">✅ Активно</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm">Отмена</button>
        <button onClick={() => onSave(form)} disabled={saving || !form.name || !form.price}
          className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-sm">
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
}
