import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Calendar, Star, MessageSquare,
  UtensilsCrossed, Settings, LogOut, Check, X, Eye,
  Trash2, Edit3, Plus, DollarSign, RefreshCw, Send, Phone, BookOpen
} from 'lucide-react';

// ─── Статусы ─────────────────────────────────────────────────────────────────

const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  new:        { label: 'Новый',       color: 'bg-blue-500' },
  confirmed:  { label: 'Подтверждён', color: 'bg-green-500' },
  preparing:  { label: 'Готовится',   color: 'bg-yellow-500' },
  delivering: { label: 'Доставляется',color: 'bg-orange-500' },
  done:       { label: 'Выполнен',    color: 'bg-gray-500' },
  cancelled:  { label: 'Отменён',     color: 'bg-red-500' },
};

const RES_STATUS: Record<string, { label: string; color: string }> = {
  new:       { label: 'Новая',        color: 'bg-blue-500' },
  confirmed: { label: 'Подтверждена', color: 'bg-green-500' },
  done:      { label: 'Состоялась',   color: 'bg-gray-500' },
  cancelled: { label: 'Отменена',     color: 'bg-red-500' },
};

// ─── Хелпер fetch ────────────────────────────────────────────────────────────

async function api(url: string, opts?: RequestInit) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  return res.json();
}

// ─── Компонент ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed,   setAuthed]   = useState(() => sessionStorage.getItem('admin_ok') === '1');
  const [password, setPassword] = useState('');
  const [authErr,  setAuthErr]  = useState('');
  const [section,  setSection]  = useState('dashboard');

  // Данные
  const [stats,    setStats]    = useState<any>({});
  const [orders,   setOrders]   = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [banquetBookings, setBanquetBookings] = useState<any[]>([]);
  const [reviews,  setReviews]  = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [menu,     setMenu]     = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  // Модалка редактирования
  const [modal, setModal] = useState<{ type: 'menu' | 'service'; item?: any } | null>(null);

  // ─── Авторизация ───────────────────────────────────────────────────────────

  const login = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthErr('');
    const d = await api('/api/admin-auth', { method: 'POST', body: JSON.stringify({ password }) });
    if (d.ok) { sessionStorage.setItem('admin_ok', '1'); setAuthed(true); }
    else setAuthErr(d.error || 'Неверный пароль');
  };

  const logout = () => { sessionStorage.removeItem('admin_ok'); setAuthed(false); };

  // ─── Загрузка данных ───────────────────────────────────────────────────────

  const load = async () => {
    const [s, o, r, bb, rv, m, mn, sv] = await Promise.all([
      api('/api/stats'),
      api('/api/orders'),
      api('/api/reservations'),
      api('/api/bookings'),
      api('/api/reviews'),
      api('/api/contacts'),
      api('/api/menu'),
      api('/api/banquet-services'),
    ]);
    setStats(s);
    setOrders(Array.isArray(o) ? o : []);
    setReservations(Array.isArray(r) ? r : []);
    setBanquetBookings(Array.isArray(bb) ? bb : []);
    setReviews(Array.isArray(rv) ? rv : []);
    setMessages(Array.isArray(m) ? m : []);
    setMenu(Array.isArray(mn) ? mn : []);
    setServices(Array.isArray(sv) ? sv : []);
  };

  useEffect(() => { if (authed) load(); }, [authed]);

  // ─── Действия ──────────────────────────────────────────────────────────────

  const setOrderStatus = (id: number, status: string) =>
    api('/api/orders', { method: 'PUT', body: JSON.stringify({ id, status }) }).then(load);

  const setResStatus = (id: number, status: string) =>
    api('/api/reservations', { method: 'PUT', body: JSON.stringify({ id, status }) }).then(load);

  const approveReview = (id: number, val: boolean) =>
    api('/api/reviews', { method: 'PUT', body: JSON.stringify({ id, is_approved: val }) }).then(load);

  const deleteReview = (id: number) =>
    api('/api/reviews', { method: 'DELETE', body: JSON.stringify({ id }) }).then(load);

  const deleteMessage = (id: number) =>
    api('/api/contacts', { method: 'DELETE', body: JSON.stringify({ id }) }).then(load);

  const saveMenuItem = (item: any) => {
    const method = item.id ? 'PUT' : 'POST';
    api('/api/menu', { method, body: JSON.stringify(item) }).then(() => { setModal(null); load(); });
  };

  const deleteMenuItem = (id: number) =>
    api('/api/menu', { method: 'DELETE', body: JSON.stringify({ id }) }).then(load);

  const saveService = (item: any) => {
    const method = item.id ? 'PUT' : 'POST';
    api('/api/banquet-services', { method, body: JSON.stringify(item) }).then(() => { setModal(null); load(); });
  };

  const deleteService = (id: number) =>
    api('/api/banquet-services', { method: 'DELETE', body: JSON.stringify({ id }) }).then(load);

  // ─── Логин ─────────────────────────────────────────────────────────────────

  if (!authed) return (
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
            placeholder="Пароль" required autoComplete="current-password" />
          {authErr && <p className="text-red-400 text-sm">❌ {authErr}</p>}
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

  // ─── Навигация ─────────────────────────────────────────────────────────────

  const nav = [
    { key: 'dashboard',    label: 'Дашборд',      icon: <LayoutDashboard size={18} />, badge: 0 },
    { key: 'orders',       label: 'Заказы',        icon: <ShoppingBag size={18} />,    badge: stats.new_orders || 0 },
    { key: 'reservations', label: 'Брони',         icon: <Calendar size={18} />,       badge: reservations.filter(r => r.status === 'new').length + banquetBookings.filter(r => r.status === 'new').length },
    { key: 'reviews',      label: 'Отзывы',        icon: <Star size={18} />,           badge: stats.pending_reviews || 0 },
    { key: 'messages',     label: 'Сообщения',     icon: <MessageSquare size={18} />,  badge: stats.unread_messages || 0 },
    { key: 'menu',         label: 'Меню',          icon: <UtensilsCrossed size={18} />,badge: 0 },
    { key: 'services',     label: 'Услуги банкета',icon: <Settings size={18} />,       badge: 0 },
  ];

  // ─── Рендер ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">

      {/* Сайдбар десктоп */}
      <aside className="hidden md:flex w-60 shrink-0 bg-zinc-900 border-r border-white/10 flex-col">
        <div className="p-5 border-b border-white/10">
          <p className="text-orange-400 font-black">Соль & Перец</p>
          <p className="text-white/30 text-xs">CRM панель</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map(n => (
            <button key={n.key} onClick={() => setSection(n.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${section === n.key ? 'bg-orange-600/20 text-orange-400' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
              {n.icon}
              <span className="flex-1 text-left">{n.label}</span>
              {n.badge > 0 && <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{n.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-1">
          <button onClick={load} className="w-full flex items-center gap-2 px-3 py-2 text-white/40 hover:text-white text-sm transition-colors">
            <RefreshCw size={15} /> Обновить
          </button>
          <Link to="/admin/instructions" className="w-full flex items-center gap-2 px-3 py-2 text-white/40 hover:text-orange-400 text-sm transition-colors">
            <BookOpen size={15} /> Инструкция
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-white/40 hover:text-red-400 text-sm transition-colors">
            <LogOut size={15} /> Выйти
          </button>
        </div>
      </aside>

      {/* Мобильный таббар */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-white/10 flex md:hidden z-50">
        {nav.slice(0, 5).map(n => (
          <button key={n.key} onClick={() => setSection(n.key)}
            className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 text-xs relative transition-colors ${section === n.key ? 'text-orange-400' : 'text-white/40'}`}>
            {n.icon}
            {n.badge > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center leading-none">{n.badge}</span>}
          </button>
        ))}
      </div>

      {/* Контент */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="p-4 md:p-6">

          {/* ── ДАШБОРД ── */}
          {section === 'dashboard' && (
            <div>
              <h1 className="text-2xl font-black mb-6">Дашборд</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { icon: <ShoppingBag size={20} />, label: 'Новых заказов',  value: stats.new_orders || 0,    color: 'text-blue-400' },
                  { icon: <DollarSign  size={20} />, label: 'Выручка',        value: `${(stats.total_revenue||0).toLocaleString('ru-RU')}₽`, color: 'text-green-400' },
                  { icon: <Calendar   size={20} />, label: 'Новых броней',   value: reservations.filter(r=>r.status==='new').length, color: 'text-orange-400' },
                  { icon: <Star       size={20} />, label: 'Рейтинг',        value: stats.avg_rating || '—',  color: 'text-yellow-400' },
                ].map((s, i) => (
                  <div key={i} className="bg-zinc-900 rounded-2xl p-4 border border-white/10">
                    <div className={`mb-2 ${s.color}`}>{s.icon}</div>
                    <p className="text-2xl font-black">{s.value}</p>
                    <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-zinc-900 rounded-2xl border border-white/10 p-4">
                <h2 className="font-bold mb-3 text-sm text-white/60 uppercase tracking-wider">Последние заказы</h2>
                {orders.slice(0, 5).map(o => (
                  <div key={o.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{o.customer_name}</p>
                      <p className="text-white/40 text-xs">{o.customer_phone}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full text-white ${ORDER_STATUS[o.status]?.color || 'bg-gray-500'}`}>{ORDER_STATUS[o.status]?.label || o.status}</span>
                    <span className="text-orange-400 font-bold text-sm shrink-0">{o.total_price}₽</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ЗАКАЗЫ ── */}
          {section === 'orders' && (
            <div>
              <h1 className="text-2xl font-black mb-6">Заказы ({orders.length})</h1>
              <div className="space-y-3">
                {orders.length === 0 && <p className="text-white/40 text-center py-10">Заказов нет</p>}
                {orders.map(o => (
                  <div key={o.id} className="bg-zinc-900 rounded-2xl border border-white/10 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold">#{o.id} {o.customer_name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full text-white ${ORDER_STATUS[o.status]?.color || 'bg-gray-500'}`}>{ORDER_STATUS[o.status]?.label}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-white/40 text-xs mt-1">
                          <a href={`tel:${o.customer_phone}`} className="flex items-center gap-1 hover:text-orange-400"><Phone size={12}/>{o.customer_phone}</a>
                          {o.delivery_address && <span>📍 {o.delivery_address}</span>}
                          <span>{new Date(o.created_at).toLocaleString('ru-RU')}</span>
                        </div>
                      </div>
                      <span className="text-xl font-black text-orange-400">{o.total_price}₽</span>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 mb-3 text-sm">
                      {(o.items||[]).map((it: any, i: number) => (
                        <div key={i} className="flex justify-between text-white/60 py-0.5">
                          <span>{it.name} × {it.quantity}</span>
                          <span>{it.price * it.quantity}₽</span>
                        </div>
                      ))}
                    </div>
                    {o.comment && <p className="text-white/50 text-sm mb-3">💬 {o.comment}</p>}
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(ORDER_STATUS).map(([s, {label, color}]) => (
                        <button key={s} onClick={() => setOrderStatus(o.id, s)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${o.status===s ? `${color} text-white` : 'bg-white/10 text-white/50 hover:bg-white/20'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── БРОНИ ── */}
          {section === 'reservations' && (
            <div className="space-y-8">
              {/* Банкеты из формы /events */}
              <div>
                <h1 className="text-2xl font-black mb-4">🎉 Заявки на банкет ({banquetBookings.length})</h1>
                <div className="space-y-3">
                  {banquetBookings.length === 0 && <p className="text-white/40 text-center py-6">Заявок нет</p>}
                  {banquetBookings.map(r => (
                    <div key={r.id} className="bg-zinc-900 rounded-2xl border border-orange-500/20 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold">#{r.id} {r.customer_name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full text-white ${RES_STATUS[r.status]?.color || 'bg-gray-500'}`}>{RES_STATUS[r.status]?.label || r.status}</span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-white/40 text-xs mt-1">
                            <a href={`tel:${r.customer_phone}`} className="flex items-center gap-1 hover:text-orange-400"><Phone size={12}/>{r.customer_phone}</a>
                            <span>📆 {r.event_date} в {r.event_time}</span>
                            <span>👥 {r.guests_count} гостей</span>
                            {r.occasion && <span>🎭 {r.occasion}</span>}
                            {r.package_key && <span>🎁 {r.package_key}</span>}
                            {r.total_estimate > 0 && <span className="text-orange-400 font-bold">~{r.total_estimate.toLocaleString('ru-RU')}₽</span>}
                          </div>
                          {r.extra_services && <p className="text-white/40 text-xs mt-1">🎊 {r.extra_services}</p>}
                        </div>
                        <a href={`tel:${r.customer_phone}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs rounded-lg transition-colors">
                          <Phone size={13}/> Позвонить
                        </a>
                      </div>
                      {r.comment && <p className="text-white/50 text-sm mb-3">💬 {r.comment}</p>}
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(RES_STATUS).map(([s, {label, color}]) => (
                          <button key={s}
                            onClick={() => api('/api/bookings', { method: 'PUT', body: JSON.stringify({ id: r.id, status: s }) }).then(load)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${r.status===s ? `${color} text-white` : 'bg-white/10 text-white/50 hover:bg-white/20'}`}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Брони столов */}
              <div>
                <h1 className="text-2xl font-black mb-4">🪑 Брони столов ({reservations.length})</h1>
                <div className="space-y-3">
                  {reservations.length === 0 && <p className="text-white/40 text-center py-6">Броней нет</p>}
                  {reservations.map(r => (
                    <div key={r.id} className="bg-zinc-900 rounded-2xl border border-white/10 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold">#{r.id} Стол №{r.table_number} — {r.customer_name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full text-white ${RES_STATUS[r.status]?.color || 'bg-gray-500'}`}>{RES_STATUS[r.status]?.label || r.status}</span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-white/40 text-xs mt-1">
                            <a href={`tel:${r.customer_phone}`} className="flex items-center gap-1 hover:text-orange-400"><Phone size={12}/>{r.customer_phone}</a>
                            <span>📆 {r.reservation_date} в {r.reservation_time}</span>
                            <span>👥 {r.guests_count} гостей</span>
                            {r.occasion && <span>🎉 {r.occasion}</span>}
                          </div>
                        </div>
                        <a href={`tel:${r.customer_phone}`} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs rounded-lg transition-colors">
                          <Phone size={13}/> Позвонить
                        </a>
                      </div>
                      {r.comment && <p className="text-white/50 text-sm mb-3">💬 {r.comment}</p>}
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(RES_STATUS).map(([s, {label, color}]) => (
                          <button key={s} onClick={() => setResStatus(r.id, s)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${r.status===s ? `${color} text-white` : 'bg-white/10 text-white/50 hover:bg-white/20'}`}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ОТЗЫВЫ ── */}
          {section === 'reviews' && (
            <div>
              <h1 className="text-2xl font-black mb-6">Отзывы ({reviews.length})</h1>
              <div className="space-y-3">
                {reviews.length === 0 && <p className="text-white/40 text-center py-10">Отзывов нет</p>}
                {reviews.map(r => (
                  <div key={r.id} className={`bg-zinc-900 rounded-2xl border p-4 ${r.is_approved ? 'border-green-500/30' : 'border-yellow-500/30'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-bold">{r.author_name}</span>
                          <span className="text-yellow-400">{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${r.is_approved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {r.is_approved ? 'Опубликован' : 'На модерации'}
                          </span>
                        </div>
                        <p className="text-white/70 text-sm">{r.text}</p>
                        <p className="text-white/30 text-xs mt-1">{new Date(r.created_at).toLocaleString('ru-RU')}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {!r.is_approved
                          ? <button onClick={() => approveReview(r.id, true)} className="p-2 bg-green-600 hover:bg-green-500 rounded-lg transition-colors"><Check size={15}/></button>
                          : <button onClick={() => approveReview(r.id, false)} className="p-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition-colors"><Eye size={15}/></button>
                        }
                        <button onClick={() => deleteReview(r.id)} className="p-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors"><Trash2 size={15}/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── СООБЩЕНИЯ ── */}
          {section === 'messages' && (
            <div>
              <h1 className="text-2xl font-black mb-6">Сообщения ({messages.length})</h1>
              <div className="space-y-3">
                {messages.length === 0 && <p className="text-white/40 text-center py-10">Сообщений нет</p>}
                {messages.map(m => (
                  <div key={m.id} className="bg-zinc-900 rounded-2xl border border-white/10 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-bold">{m.name}</span>
                          {m.phone && <a href={`tel:${m.phone}`} className="text-orange-400 text-sm hover:underline flex items-center gap-1"><Phone size={12}/>{m.phone}</a>}
                          {m.email && <a href={`mailto:${m.email}`} className="text-blue-400 text-sm hover:underline">{m.email}</a>}
                        </div>
                        <p className="text-white/70 text-sm">{m.message}</p>
                        <p className="text-white/30 text-xs mt-1">{new Date(m.created_at).toLocaleString('ru-RU')}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {m.phone && <a href={`tel:${m.phone}`} className="p-2 bg-green-700 hover:bg-green-600 text-white rounded-lg transition-colors"><Phone size={15}/></a>}
                        {m.email && <a href={`mailto:${m.email}`} className="p-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg transition-colors"><Send size={15}/></a>}
                        <button onClick={() => deleteMessage(m.id)} className="p-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors"><Trash2 size={15}/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── МЕНЮ ── */}
          {section === 'menu' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black">Меню ({menu.length})</h1>
                <button onClick={() => setModal({ type: 'menu' })}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm transition-colors">
                  <Plus size={16}/> Добавить
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {menu.map(item => (
                  <div key={item.id} className="bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden">
                    <img src={item.image_url || '/images/dish-1.jpg'} alt={item.name} className="w-full h-36 object-cover"/>
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{item.name}</p>
                          <p className="text-white/40 text-xs">{item.category} · {item.type === 'bar' ? 'Бар' : 'Еда'}</p>
                        </div>
                        <span className="text-orange-400 font-black text-sm shrink-0">{item.price}₽</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => setModal({ type: 'menu', item })}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors">
                          <Edit3 size={12}/> Изменить
                        </button>
                        <button onClick={() => deleteMenuItem(item.id)}
                          className="p-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── УСЛУГИ ── */}
          {section === 'services' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-black">Услуги банкета ({services.length})</h1>
                <button onClick={() => setModal({ type: 'service' })}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm transition-colors">
                  <Plus size={16}/> Добавить
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services.map(s => (
                  <div key={s.id} className="bg-zinc-900 rounded-2xl border border-white/10 p-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{s.icon} {s.name}</p>
                      <p className="text-white/50 text-sm mt-0.5">{s.description}</p>
                      <p className="text-orange-400 font-bold mt-1">{s.price}₽{s.price_type === 'per_person' ? '/чел' : ''}</p>
                      <p className="text-white/30 text-xs">{s.category}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setModal({ type: 'service', item: s })}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"><Edit3 size={15}/></button>
                      <button onClick={() => deleteService(s.id)}
                        className="p-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors"><Trash2 size={15}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── МОДАЛКА ── */}
      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" onClick={() => setModal(null)}/>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-zinc-900 rounded-2xl border border-white/10 z-50 overflow-y-auto max-h-[90vh]">
              <div className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold">
                    {modal.item ? 'Редактировать' : 'Добавить'} {modal.type === 'menu' ? 'блюдо' : 'услугу'}
                  </h2>
                  <button onClick={() => setModal(null)} className="text-white/40 hover:text-white"><X size={20}/></button>
                </div>
                {modal.type === 'menu'
                  ? <MenuForm item={modal.item} onSave={saveMenuItem} onCancel={() => setModal(null)}/>
                  : <ServiceForm item={modal.item} onSave={saveService} onCancel={() => setModal(null)}/>
                }
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Форма блюда ──────────────────────────────────────────────────────────────

function MenuForm({ item, onSave, onCancel }: { item?: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [f, setF] = useState({
    id: item?.id, name: item?.name || '', description: item?.description || '',
    price: item?.price || '', old_price: item?.old_price || '',
    image_url: item?.image_url || '', category: item?.category || '',
    type: item?.type || 'food', calories: item?.calories || '',
    cook_time: item?.cook_time || '', weight: item?.weight || '',
    is_featured: item?.is_featured || false, is_day_special: item?.is_day_special || false,
    is_active: item?.is_active !== false, sort_order: item?.sort_order || 0,
    volume: item?.volume || '', abv: item?.abv || '',
  });
  const inp = 'w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 text-sm';
  return (
    <div className="space-y-3">
      <input value={f.name} onChange={e => setF({...f, name: e.target.value})} className={inp} placeholder="Название *" required/>
      <textarea value={f.description} onChange={e => setF({...f, description: e.target.value})} className={inp + ' resize-none'} rows={2} placeholder="Описание"/>
      <div className="grid grid-cols-2 gap-3">
        <input value={f.price} onChange={e => setF({...f, price: e.target.value})} className={inp} placeholder="Цена ₽ *" type="number"/>
        <input value={f.old_price} onChange={e => setF({...f, old_price: e.target.value})} className={inp} placeholder="Старая цена" type="number"/>
      </div>
      <input value={f.image_url} onChange={e => setF({...f, image_url: e.target.value})} className={inp} placeholder="URL фото"/>
      <div className="grid grid-cols-2 gap-3">
        <select value={f.type} onChange={e => setF({...f, type: e.target.value})} className={inp}>
          <option value="food">Еда</option>
          <option value="bar">Бар</option>
        </select>
        <input value={f.category} onChange={e => setF({...f, category: e.target.value})} className={inp} placeholder="Категория (ключ)"/>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <input value={f.calories} onChange={e => setF({...f, calories: e.target.value})} className={inp} placeholder="Ккал" type="number"/>
        <input value={f.cook_time} onChange={e => setF({...f, cook_time: e.target.value})} className={inp} placeholder="Мин" type="number"/>
        <input value={f.weight} onChange={e => setF({...f, weight: e.target.value})} className={inp} placeholder="Вес/объём"/>
      </div>
      {f.type === 'bar' && (
        <div className="grid grid-cols-2 gap-3">
          <input value={f.volume} onChange={e => setF({...f, volume: e.target.value})} className={inp} placeholder="Объём (50мл)"/>
          <input value={f.abv} onChange={e => setF({...f, abv: e.target.value})} className={inp} placeholder="Крепость %" type="number"/>
        </div>
      )}
      <div className="flex flex-wrap gap-4">
        {([['is_featured','Рекомендуем'],['is_day_special','Блюдо дня'],['is_active','Активно']] as [string,string][]).map(([k,l]) => (
          <label key={k} className="flex items-center gap-2 cursor-pointer text-sm text-white/70">
            <input type="checkbox" checked={(f as any)[k]} onChange={e => setF({...f, [k]: e.target.checked})} className="accent-orange-500 w-4 h-4"/>
            {l}
          </label>
        ))}
      </div>
      <div className="flex gap-3 pt-1">
        <button onClick={onCancel} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-colors">Отмена</button>
        <button onClick={() => onSave(f)} className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-sm transition-colors">Сохранить</button>
      </div>
    </div>
  );
}

// ─── Форма услуги ─────────────────────────────────────────────────────────────

function ServiceForm({ item, onSave, onCancel }: { item?: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [f, setF] = useState({
    id: item?.id, name: item?.name || '', description: item?.description || '',
    price: item?.price || '', price_type: item?.price_type || 'fixed',
    category: item?.category || '', icon: item?.icon || '🎉',
    is_active: item?.is_active !== false, sort_order: item?.sort_order || 0,
  });
  const inp = 'w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 text-sm';
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        <input value={f.icon} onChange={e => setF({...f, icon: e.target.value})} className={inp + ' text-center text-2xl col-span-1'} placeholder="🎉"/>
        <input value={f.name} onChange={e => setF({...f, name: e.target.value})} className={inp + ' col-span-3'} placeholder="Название *"/>
      </div>
      <textarea value={f.description} onChange={e => setF({...f, description: e.target.value})} className={inp + ' resize-none'} rows={2} placeholder="Описание"/>
      <div className="grid grid-cols-2 gap-3">
        <input value={f.price} onChange={e => setF({...f, price: e.target.value})} className={inp} placeholder="Цена ₽" type="number"/>
        <select value={f.price_type} onChange={e => setF({...f, price_type: e.target.value})} className={inp}>
          <option value="fixed">Фиксированная</option>
          <option value="per_person">За человека</option>
        </select>
      </div>
      <input value={f.category} onChange={e => setF({...f, category: e.target.value})} className={inp} placeholder="Категория"/>
      <label className="flex items-center gap-2 cursor-pointer text-sm text-white/70">
        <input type="checkbox" checked={f.is_active} onChange={e => setF({...f, is_active: e.target.checked})} className="accent-orange-500 w-4 h-4"/> Активно
      </label>
      <div className="flex gap-3 pt-1">
        <button onClick={onCancel} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-colors">Отмена</button>
        <button onClick={() => onSave(f)} className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-sm transition-colors">Сохранить</button>
      </div>
    </div>
  );
}
