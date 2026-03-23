import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Calendar, Star, MessageSquare,
  UtensilsCrossed, Settings, LogOut, Check, X,
  Eye, Trash2, Edit3, Plus, DollarSign,
  RefreshCw, Send, Phone, MapPin, BookOpen, Sparkles
} from 'lucide-react';

const ORDER_STATUSES: Record<string, { label: string; color: string }> = {
  new:        { label: 'Новый',       color: 'bg-blue-500' },
  confirmed:  { label: 'Подтверждён', color: 'bg-green-500' },
  preparing:  { label: 'Готовится',   color: 'bg-yellow-500' },
  delivering: { label: 'Доставляется',color: 'bg-orange-500' },
  done:       { label: 'Выполнен',    color: 'bg-gray-500' },
  cancelled:  { label: 'Отменён',     color: 'bg-red-500' },
};

const BOOKING_STATUSES: Record<string, { label: string; color: string }> = {
  new:       { label: 'Новая',      color: 'bg-blue-500' },
  confirmed: { label: 'Подтверждена',color: 'bg-green-500' },
  done:      { label: 'Состоялась', color: 'bg-gray-500' },
  cancelled: { label: 'Отменена',   color: 'bg-red-500' },
};

export default function AdminPage() {
  const [authed, setAuthed]   = useState(() => sessionStorage.getItem('admin_authed') === 'true');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [section,  setSection]  = useState('dashboard');

  const [stats,           setStats]           = useState<any>(null);
  const [orders,          setOrders]          = useState<any[]>([]);
  const [tableReservations, setTableReservations] = useState<any[]>([]);
  const [banquetBookings, setBanquetBookings] = useState<any[]>([]);
  const [reviews,         setReviews]         = useState<any[]>([]);
  const [messages,        setMessages]        = useState<any[]>([]);
  const [menuItems,       setMenuItems]       = useState<any[]>([]);
  const [banquetServices, setBanquetServices] = useState<any[]>([]);
  const [editModal,       setEditModal]       = useState<{ type: string; item?: any } | null>(null);

  // ── Auth ──────────────────────────────────────────────────────────────────

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res  = await fetch('/api/admin-auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      const data = await res.json();
      if (res.ok && data.ok) { sessionStorage.setItem('admin_authed', 'true'); setAuthed(true); }
      else setAuthError(data.error || 'Неверный пароль');
    } catch { setAuthError('Ошибка подключения к серверу'); }
  };

  const logout = () => { sessionStorage.removeItem('admin_authed'); setAuthed(false); };

  // ── Fetch all ─────────────────────────────────────────────────────────────

  const fetchAll = async () => {
    try {
      const [sRes, oRes, trRes, bbRes, rRes, mRes, miRes, bsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/orders'),
        fetch('/api/table-reservations'),
        fetch('/api/bookings'),
        fetch('/api/reviews'),
        fetch('/api/contacts'),
        fetch('/api/menu'),
        fetch('/api/banquet-services'),
      ]);
      setStats(await sRes.json());
      const od = await oRes.json();   setOrders(Array.isArray(od) ? od : []);
      const tr = await trRes.json();  setTableReservations(Array.isArray(tr) ? tr : []);
      const bb = await bbRes.json();  setBanquetBookings(Array.isArray(bb) ? bb : []);
      const rv = await rRes.json();   setReviews(Array.isArray(rv) ? rv : []);
      const ms = await mRes.json();   setMessages(Array.isArray(ms) ? ms : []);
      const mi = await miRes.json();  setMenuItems(Array.isArray(mi) ? mi : []);
      const bs = await bsRes.json();  setBanquetServices(Array.isArray(bs) ? bs : []);
    } catch (e) { console.error('fetchAll error:', e); }
  };

  useEffect(() => { if (authed) fetchAll(); }, [authed, section]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const updateOrder       = async (id: number, status: string, admin_comment?: string) => {
    await fetch('/api/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, admin_comment }) });
    fetchAll();
  };
  const updateTableRes    = async (id: number, status: string) => {
    await fetch('/api/table-reservations', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    fetchAll();
  };
  const updateBanquet     = async (id: number, status: string, admin_comment?: string) => {
    await fetch('/api/bookings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, admin_comment }) });
    fetchAll();
  };
  const moderateReview    = async (id: number, is_approved: boolean) => {
    await fetch('/api/reviews', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, is_approved }) });
    fetchAll();
  };
  const deleteReview      = async (id: number) => {
    await fetch('/api/reviews', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchAll();
  };
  const deleteMessage     = async (id: number) => {
    await fetch('/api/contacts', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchAll();
  };
  const saveMenuItem      = async (item: any) => {
    await fetch('/api/menu', { method: item.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) });
    setEditModal(null); fetchAll();
  };
  const deleteMenuItem    = async (id: number) => {
    await fetch('/api/menu', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchAll();
  };
  const saveService       = async (s: any) => {
    await fetch('/api/banquet-services', { method: s.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) });
    setEditModal(null); fetchAll();
  };
  const deleteService     = async (id: number) => {
    await fetch('/api/banquet-services', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
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
              placeholder="Пароль администратора" required autoComplete="off" />
            {authError && <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3"><p className="text-red-400 text-sm">❌ {authError}</p></div>}
            <button type="submit" className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">Войти</button>
          </form>
          <div className="mt-5 p-4 bg-zinc-800 rounded-xl border border-white/5">
            <p className="text-white/40 text-xs text-center mb-1">Пароль по умолчанию:</p>
            <p className="text-orange-400 font-mono text-center font-bold tracking-wider">soliperec2025</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Nav ───────────────────────────────────────────────────────────────────

  const newTableRes = tableReservations.filter(r => r.status === 'new').length;
  const newBanquets = banquetBookings.filter(b => b.status === 'new').length;

  const navItems = [
    { key: 'dashboard',  label: 'Дашборд',       icon: <LayoutDashboard size={18}/>, badge: 0 },
    { key: 'orders',     label: 'Заказы',         icon: <ShoppingBag size={18}/>,     badge: stats?.new_orders || 0 },
    { key: 'tables',     label: 'Брони столов',   icon: <Calendar size={18}/>,        badge: newTableRes },
    { key: 'banquets',   label: 'Банкеты',        icon: <Sparkles size={18}/>,        badge: newBanquets },
    { key: 'reviews',    label: 'Отзывы',         icon: <Star size={18}/>,            badge: stats?.pending_reviews || 0 },
    { key: 'messages',   label: 'Сообщения',      icon: <MessageSquare size={18}/>,   badge: stats?.unread_messages || 0 },
    { key: 'menu',       label: 'Меню',           icon: <UtensilsCrossed size={18}/>, badge: 0 },
    { key: 'services',   label: 'Услуги банкета', icon: <Settings size={18}/>,        badge: 0 },
  ];

  // ── Layout ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">

      {/* Sidebar */}
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
            <RefreshCw size={16}/> Обновить
          </button>
          <Link to="/admin/instructions" className="w-full flex items-center gap-2 px-3 py-2 text-white/40 hover:text-orange-400 text-sm transition-colors rounded-lg hover:bg-white/5">
            <BookOpen size={16}/> Инструкция
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-white/40 hover:text-red-400 text-sm transition-colors rounded-lg hover:bg-white/5">
            <LogOut size={16}/> Выйти
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-white/10 flex md:hidden z-50">
        {navItems.slice(0, 6).map(n => (
          <button key={n.key} onClick={() => setSection(n.key)}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs relative transition-colors ${section === n.key ? 'text-orange-400' : 'text-white/40'}`}>
            {n.icon}
            {n.badge > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{n.badge}</span>}
          </button>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="p-4 md:p-8">

          {/* ── Dashboard ── */}
          {section === 'dashboard' && (
            <div>
              <h1 className="text-2xl font-black mb-6">Дашборд</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: <ShoppingBag size={22}/>, label: 'Новых заказов',   value: stats?.new_orders || 0,                                           color: 'text-blue-400' },
                  { icon: <DollarSign  size={22}/>, label: 'Выручка',         value: `${(stats?.total_revenue||0).toLocaleString('ru')}₽`,             color: 'text-green-400' },
                  { icon: <Calendar    size={22}/>, label: 'Новых броней',    value: (newTableRes + newBanquets),                                      color: 'text-orange-400' },
                  { icon: <Star        size={22}/>, label: 'Рейтинг',         value: stats?.avg_rating || '—',                                         color: 'text-yellow-400' },
                ].map((s, i) => (
                  <div key={i} className="bg-zinc-900 rounded-2xl p-5 border border-white/10">
                    <div className={`mb-3 ${s.color}`}>{s.icon}</div>
                    <p className="text-2xl font-black text-white">{s.value}</p>
                    <p className="text-white/40 text-sm">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-zinc-900 rounded-2xl border border-white/10 p-5">
                  <h2 className="font-bold mb-4">Последние заказы</h2>
                  <div className="space-y-2">
                    {orders.slice(0, 5).map(o => (
                      <div key={o.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{o.customer_name}</p>
                          <p className="text-white/40 text-xs">{o.customer_phone}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full text-white ${ORDER_STATUSES[o.status]?.color || 'bg-gray-500'}`}>{ORDER_STATUSES[o.status]?.label}</span>
                        <span className="text-orange-400 font-bold text-sm">{o.total_price}₽</span>
                      </div>
                    ))}
                    {orders.length === 0 && <p className="text-white/30 text-sm">Заказов пока нет</p>}
                  </div>
                </div>
                <div className="bg-zinc-900 rounded-2xl border border-white/10 p-5">
                  <h2 className="font-bold mb-4">Последние брони столов</h2>
                  <div className="space-y-2">
                    {tableReservations.slice(0, 5).map(r => (
                      <div key={r.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{r.guest_name} — стол №{r.table_number}</p>
                          <p className="text-white/40 text-xs">{r.reservation_date} в {r.reservation_time}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full text-white ${BOOKING_STATUSES[r.status]?.color || 'bg-gray-500'}`}>{BOOKING_STATUSES[r.status]?.label}</span>
                      </div>
                    ))}
                    {tableReservations.length === 0 && <p className="text-white/30 text-sm">Броней пока нет</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Orders ── */}
          {section === 'orders' && (
            <div>
              <h1 className="text-2xl font-black mb-6">Заказы ({orders.length})</h1>
              <div className="space-y-4">
                {orders.map(o => (
                  <div key={o.id} className="bg-zinc-900 rounded-2xl border border-white/10 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold">#{o.id} — {o.customer_name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full text-white ${ORDER_STATUSES[o.status]?.color||'bg-gray-500'}`}>{ORDER_STATUSES[o.status]?.label}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-white/50">
                          <span className="flex items-center gap-1"><Phone size={13}/> {o.customer_phone}</span>
                          {o.delivery_address && <span className="flex items-center gap-1"><MapPin size={13}/> {o.delivery_address}</span>}
                          <span>{new Date(o.created_at).toLocaleString('ru-RU')}</span>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-orange-400">{o.total_price}₽</span>
                    </div>
                    <div className="mb-3 p-3 bg-white/5 rounded-xl">
                      {(o.items||[]).map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm py-0.5">
                          <span className="text-white/70">{item.name} × {item.quantity}</span>
                          <span className="text-white">{item.price * item.quantity}₽</span>
                        </div>
                      ))}
                    </div>
                    {o.comment && <p className="text-white/50 text-sm mb-3">💬 {o.comment}</p>}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(ORDER_STATUSES).map(([s, { label, color }]) => (
                        <button key={s} onClick={() => updateOrder(o.id, s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${o.status===s ? `${color} text-white` : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <a href={`tel:${o.customer_phone}`} className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm rounded-lg transition-colors">
                        <Phone size={14}/> Позвонить
                      </a>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-white/30">Заказов пока нет</p>}
              </div>
            </div>
          )}

          {/* ── Table reservations ── */}
          {section === 'tables' && (
            <div>
              <h1 className="text-2xl font-black mb-6">Брони столов ({tableReservations.length})</h1>
              <div className="space-y-4">
                {tableReservations.map(r => (
                  <div key={r.id} className="bg-zinc-900 rounded-2xl border border-white/10 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold">#{r.id} — {r.guest_name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full text-white ${BOOKING_STATUSES[r.status]?.color||'bg-gray-500'}`}>{BOOKING_STATUSES[r.status]?.label}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-white/50">
                          <span className="flex items-center gap-1"><Phone size={13}/> {r.guest_phone}</span>
                          <span>📅 {r.reservation_date} в {r.reservation_time}</span>
                          <span>🪑 Стол №{r.table_number} (Зона {r.table_zone})</span>
                          <span>👥 {r.guests_count} гостей</span>
                        </div>
                      </div>
                    </div>
                    {r.comment && <p className="text-white/50 text-sm mb-3">💬 {r.comment}</p>}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(BOOKING_STATUSES).map(([s, { label, color }]) => (
                        <button key={s} onClick={() => updateTableRes(r.id, s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${r.status===s ? `${color} text-white` : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                    <a href={`tel:${r.guest_phone}`} className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm rounded-lg transition-colors">
                      <Phone size={14}/> Позвонить
                    </a>
                  </div>
                ))}
                {tableReservations.length === 0 && <p className="text-white/30">Броней столов пока нет</p>}
              </div>
            </div>
          )}

          {/* ── Banquet bookings ── */}
          {section === 'banquets' && (
            <div>
              <h1 className="text-2xl font-black mb-6">Банкеты ({banquetBookings.length})</h1>
              <div className="space-y-4">
                {banquetBookings.map(b => (
                  <div key={b.id} className="bg-zinc-900 rounded-2xl border border-white/10 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold">#{b.id} — {b.customer_name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full text-white ${BOOKING_STATUSES[b.status]?.color||'bg-gray-500'}`}>{BOOKING_STATUSES[b.status]?.label}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-white/50">
                          <span><Phone size={13} className="inline mr-1"/>{b.customer_phone}</span>
                          <span>📅 {b.event_date} в {b.event_time}</span>
                          <span>👥 {b.guests_count} чел.</span>
                          <span>🎭 {b.event_type}</span>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-orange-400">~{(b.total_estimate||0).toLocaleString('ru')}₽</span>
                    </div>
                    {b.extra_services?.length > 0 && (
                      <div className="mb-3 p-3 bg-white/5 rounded-xl">
                        <p className="text-white/40 text-xs mb-1">Услуги:</p>
                        <p className="text-white/70 text-sm">{b.extra_services.join(', ')}</p>
                      </div>
                    )}
                    {b.comment && <p className="text-white/50 text-sm mb-3">💬 {b.comment}</p>}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(BOOKING_STATUSES).map(([s, { label, color }]) => (
                        <button key={s} onClick={() => updateBanquet(b.id, s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${b.status===s ? `${color} text-white` : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <a href={`tel:${b.customer_phone}`} className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm rounded-lg transition-colors">
                        <Phone size={14}/> Позвонить
                      </a>
                      {b.customer_email && (
                        <a href={`mailto:${b.customer_email}`} className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors">
                          <Send size={14}/> Email
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {banquetBookings.length === 0 && <p className="text-white/30">Банкетов пока нет</p>}
              </div>
            </div>
          )}

          {/* ── Reviews ── */}
          {section === 'reviews' && (
            <div>
              <h1 className="text-2xl font-black mb-6">Отзывы ({reviews.length})</h1>
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className={`bg-zinc-900 rounded-2xl border p-5 ${r.is_approved ? 'border-green-500/20' : 'border-yellow-500/30'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold">{r.author_name}</span>
                          <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <span key={s} className={s<=r.rating?'text-yellow-400':'text-white/20'}>★</span>)}</div>
                          <span className={`text-xs px-2 py-1 rounded-full ${r.is_approved?'bg-green-500/20 text-green-400':'bg-yellow-500/20 text-yellow-400'}`}>
                            {r.is_approved ? 'Опубликован' : 'На модерации'}
                          </span>
                        </div>
                        <p className="text-white/70 text-sm">{r.text}</p>
                        <p className="text-white/30 text-xs mt-2">{new Date(r.created_at).toLocaleString('ru-RU')}</p>
                      </div>
                      <div className="flex gap-2">
                        {!r.is_approved && <button onClick={() => moderateReview(r.id, true)} className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"><Check size={16}/></button>}
                        {r.is_approved  && <button onClick={() => moderateReview(r.id, false)} className="p-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors"><Eye size={16}/></button>}
                        <button onClick={() => deleteReview(r.id)} className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  </div>
                ))}
                {reviews.length === 0 && <p className="text-white/30">Отзывов пока нет</p>}
              </div>
            </div>
          )}

          {/* ── Messages ── */}
          {section === 'messages' && (
            <div>
              <h1 className="text-2xl font-black mb-6">Сообщения ({messages.length})</h1>
              <div className="space-y-4">
                {messages.map(m => (
                  <div key={m.id} className="bg-zinc-900 rounded-2xl border border-white/10 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="font-bold">{m.name}</span>
                          {m.phone && <a href={`tel:${m.phone}`} className="text-orange-400 text-sm hover:underline flex items-center gap-1"><Phone size={12}/>{m.phone}</a>}
                          {m.email && <a href={`mailto:${m.email}`} className="text-blue-400 text-sm hover:underline">{m.email}</a>}
                        </div>
                        <p className="text-white/70 text-sm">{m.message}</p>
                        <p className="text-white/30 text-xs mt-2">{new Date(m.created_at).toLocaleString('ru-RU')}</p>
                      </div>
                      <div className="flex gap-2">
                        {m.phone && <a href={`tel:${m.phone}`} className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"><Phone size={16}/></a>}
                        <button onClick={() => deleteMessage(m.id)} className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && <p className="text-white/30">Сообщений пока нет</p>}
              </div>
            </div>
          )}

          {/* ── Menu ── */}
          {section === 'menu' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black">Меню ({menuItems.length})</h1>
                <button onClick={() => setEditModal({ type: 'menu' })} className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition-colors">
                  <Plus size={18}/> Добавить
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map(item => (
                  <div key={item.id} className="bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden">
                    <img src={item.image_url || '/images/dish-1.jpg'} alt={item.name} className="w-full h-36 object-cover"/>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-sm">{item.name}</h3>
                        <span className="text-orange-400 font-bold text-sm shrink-0">{item.price}₽</span>
                      </div>
                      <p className="text-white/40 text-xs mb-3">{item.category} · {item.type === 'bar' ? 'Бар' : 'Еда'}</p>
                      <div className="flex gap-2">
                        <button onClick={() => setEditModal({ type: 'menu', item })} className="flex-1 flex items-center justify-center gap-1 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors">
                          <Edit3 size={13}/> Изменить
                        </button>
                        <button onClick={() => deleteMenuItem(item.id)} className="p-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Services ── */}
          {section === 'services' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black">Услуги банкета ({banquetServices.length})</h1>
                <button onClick={() => setEditModal({ type: 'service' })} className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition-colors">
                  <Plus size={18}/> Добавить
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banquetServices.map(s => (
                  <div key={s.id} className="bg-zinc-900 rounded-2xl border border-white/10 p-5 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-bold">{s.icon} {s.name}</p>
                      <p className="text-white/50 text-sm mt-1">{s.description}</p>
                      <p className="text-orange-400 font-bold mt-2">{s.price.toLocaleString('ru')}₽{s.price_type==='per_person'?'/чел':''}</p>
                      <p className="text-white/30 text-xs">{s.category}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditModal({ type: 'service', item: s })} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"><Edit3 size={16}/></button>
                      <button onClick={() => deleteService(s.id)} className="p-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors"><Trash2 size={16}/></button>
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
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" onClick={() => setEditModal(null)}/>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-zinc-900 rounded-3xl border border-white/10 z-50 overflow-y-auto max-h-[90vh]">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">{editModal.item ? 'Редактировать' : 'Добавить'} {editModal.type === 'menu' ? 'блюдо' : 'услугу'}</h2>
                  <button onClick={() => setEditModal(null)} className="text-white/40 hover:text-white"><X size={22}/></button>
                </div>
                {editModal.type === 'menu'    && <MenuItemForm    item={editModal.item} onSave={saveMenuItem} onCancel={() => setEditModal(null)}/>}
                {editModal.type === 'service' && <ServiceForm item={editModal.item} onSave={saveService}  onCancel={() => setEditModal(null)}/>}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── MenuItemForm ──────────────────────────────────────────────────────────────

function MenuItemForm({ item, onSave, onCancel }: { item?: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [f, setF] = useState({
    id: item?.id, name: item?.name||'', description: item?.description||'',
    price: item?.price||'', old_price: item?.old_price||'', image_url: item?.image_url||'',
    category: item?.category||'mangal', type: item?.type||'food',
    calories: item?.calories||'', cook_time: item?.cook_time||'', weight: item?.weight||'',
    is_featured: item?.is_featured||false, is_day_special: item?.is_day_special||false,
    is_active: item?.is_active!==false, sort_order: item?.sort_order||0,
    volume: item?.volume||'', abv: item?.abv||'',
  });
  const inp = 'w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500';
  return (
    <div className="space-y-3">
      <input value={f.name} onChange={e=>setF({...f,name:e.target.value})} className={inp} placeholder="Название *" required/>
      <textarea value={f.description} onChange={e=>setF({...f,description:e.target.value})} className={inp+' resize-none'} rows={2} placeholder="Описание"/>
      <div className="grid grid-cols-2 gap-3">
        <input value={f.price} onChange={e=>setF({...f,price:e.target.value})} className={inp} placeholder="Цена ₽ *" type="number"/>
        <input value={f.old_price} onChange={e=>setF({...f,old_price:e.target.value})} className={inp} placeholder="Старая цена" type="number"/>
      </div>
      <input value={f.image_url} onChange={e=>setF({...f,image_url:e.target.value})} className={inp} placeholder="URL фото"/>
      <div className="grid grid-cols-2 gap-3">
        <select value={f.type} onChange={e=>setF({...f,type:e.target.value})} className={inp}>
          <option value="food">Еда</option>
          <option value="bar">Бар</option>
        </select>
        <input value={f.category} onChange={e=>setF({...f,category:e.target.value})} className={inp} placeholder="Категория"/>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <input value={f.calories} onChange={e=>setF({...f,calories:e.target.value})} className={inp} placeholder="Ккал" type="number"/>
        <input value={f.cook_time} onChange={e=>setF({...f,cook_time:e.target.value})} className={inp} placeholder="Мин" type="number"/>
        <input value={f.weight} onChange={e=>setF({...f,weight:e.target.value})} className={inp} placeholder="Вес/объём"/>
      </div>
      {f.type==='bar' && (
        <div className="grid grid-cols-2 gap-3">
          <input value={f.volume} onChange={e=>setF({...f,volume:e.target.value})} className={inp} placeholder="Объём (50мл)"/>
          <input value={f.abv} onChange={e=>setF({...f,abv:e.target.value})} className={inp} placeholder="Крепость %" type="number"/>
        </div>
      )}
      <div className="flex flex-wrap gap-4">
        {[['is_featured','Рекомендуем'],['is_day_special','Блюдо дня'],['is_active','Активно']].map(([k,l])=>(
          <label key={k} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={(f as any)[k]} onChange={e=>setF({...f,[k]:e.target.checked})} className="w-4 h-4 accent-orange-500"/>
            <span className="text-white/70 text-sm">{l}</span>
          </label>
        ))}
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">Отмена</button>
        <button onClick={()=>onSave(f)} className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">Сохранить</button>
      </div>
    </div>
  );
}

// ── ServiceForm ───────────────────────────────────────────────────────────────

function ServiceForm({ item, onSave, onCancel }: { item?: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [f, setF] = useState({
    id: item?.id, name: item?.name||'', description: item?.description||'',
    price: item?.price||'', price_type: item?.price_type||'fixed',
    category: item?.category||'Развлечения', icon: item?.icon||'🎉',
    is_active: item?.is_active!==false, sort_order: item?.sort_order||0,
  });
  const inp = 'w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500';
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        <input value={f.icon} onChange={e=>setF({...f,icon:e.target.value})} className={inp+' text-center text-2xl'} placeholder="🎉"/>
        <input value={f.name} onChange={e=>setF({...f,name:e.target.value})} className={inp+' col-span-3'} placeholder="Название *" required/>
      </div>
      <textarea value={f.description} onChange={e=>setF({...f,description:e.target.value})} className={inp+' resize-none'} rows={2} placeholder="Описание"/>
      <div className="grid grid-cols-2 gap-3">
        <input value={f.price} onChange={e=>setF({...f,price:e.target.value})} className={inp} placeholder="Цена ₽" type="number" required/>
        <select value={f.price_type} onChange={e=>setF({...f,price_type:e.target.value})} className={inp}>
          <option value="fixed">Фиксированная</option>
          <option value="per_person">За человека</option>
        </select>
      </div>
      <input value={f.category} onChange={e=>setF({...f,category:e.target.value})} className={inp} placeholder="Категория (Развлечения, Декор...)"/>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={f.is_active} onChange={e=>setF({...f,is_active:e.target.checked})} className="w-4 h-4 accent-orange-500"/>
        <span className="text-white/70 text-sm">Активно</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">Отмена</button>
        <button onClick={()=>onSave(f)} className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">Сохранить</button>
      </div>
    </div>
  );
}
