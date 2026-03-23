import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Calendar, Star, MessageSquare,
  UtensilsCrossed, Settings, LogOut, Check, X,
  Eye, Trash2, Edit3, Plus, DollarSign,
  RefreshCw, Send, Phone, MapPin, BookOpen, Armchair
} from 'lucide-react';

// ─── Типы ────────────────────────────────────────────────────────────────────

const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  new:        { label: 'Новый',        color: 'bg-blue-500' },
  confirmed:  { label: 'Подтверждён', color: 'bg-green-500' },
  preparing:  { label: 'Готовится',   color: 'bg-yellow-500' },
  delivering: { label: 'Доставляется',color: 'bg-orange-500' },
  done:       { label: 'Выполнен',    color: 'bg-zinc-500' },
  cancelled:  { label: 'Отменён',     color: 'bg-red-500' },
};

const BOOKING_STATUS: Record<string, { label: string; color: string }> = {
  new:       { label: 'Новая',       color: 'bg-blue-500' },
  confirmed: { label: 'Подтверждена',color: 'bg-green-500' },
  done:      { label: 'Состоялась',  color: 'bg-zinc-500' },
  cancelled: { label: 'Отменена',    color: 'bg-red-500' },
};

// ─── Хелпер fetch ─────────────────────────────────────────────────────────────

async function api(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

// ─── Компонент ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed]   = useState(() => sessionStorage.getItem('admin_authed') === 'true');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [section, setSection] = useState('dashboard');

  // данные
  const [stats,          setStats]          = useState<any>(null);
  const [orders,         setOrders]         = useState<any[]>([]);
  const [bookings,       setBookings]       = useState<any[]>([]);
  const [tableRes,       setTableRes]       = useState<any[]>([]);
  const [reviews,        setReviews]        = useState<any[]>([]);
  const [messages,       setMessages]       = useState<any[]>([]);
  const [menuItems,      setMenuItems]      = useState<any[]>([]);
  const [banquetServices,setBanquetServices]= useState<any[]>([]);

  const [loadError, setLoadError] = useState('');
  const [editModal, setEditModal] = useState<{ type: string; item?: any } | null>(null);

  // ── Логин ──────────────────────────────────────────────────────────────────

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const data = await api('/api/admin-auth', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      if (data.ok) {
        sessionStorage.setItem('admin_authed', 'true');
        setAuthed(true);
      } else {
        setAuthError(data.error || 'Неверный пароль');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Ошибка подключения');
    }
  };

  const logout = () => { sessionStorage.removeItem('admin_authed'); setAuthed(false); };

  // ── Загрузка данных ────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoadError('');
    try {
      const [s, o, b, tr, r, m, mi, bs] = await Promise.all([
        api('/api/stats'),
        api('/api/orders'),
        api('/api/bookings'),
        api('/api/table-reservations'),
        api('/api/reviews'),
        api('/api/contacts'),
        api('/api/menu'),
        api('/api/banquet-services'),
      ]);
      setStats(s);
      setOrders(Array.isArray(o) ? o : []);
      setBookings(Array.isArray(b) ? b : []);
      setTableRes(Array.isArray(tr) ? tr : []);
      setReviews(Array.isArray(r) ? r : []);
      setMessages(Array.isArray(m) ? m : []);
      setMenuItems(Array.isArray(mi) ? mi : []);
      setBanquetServices(Array.isArray(bs) ? bs : []);
    } catch (err: any) {
      setLoadError('Ошибка загрузки: ' + err.message);
    }
  }, []);

  useEffect(() => { if (authed) fetchAll(); }, [authed, fetchAll]);

  // ── Мутации ────────────────────────────────────────────────────────────────

  const updateOrder = async (id: number, status: string, admin_comment?: string) => {
    await api('/api/orders', { method: 'PUT', body: JSON.stringify({ id, status, admin_comment }) });
    fetchAll();
  };

  const updateBooking = async (id: number, status: string) => {
    await api('/api/bookings', { method: 'PUT', body: JSON.stringify({ id, status }) });
    fetchAll();
  };

  const updateTableRes = async (id: number, status: string) => {
    await api('/api/table-reservations', { method: 'PUT', body: JSON.stringify({ id, status }) });
    fetchAll();
  };

  const deleteTableRes = async (id: number) => {
    await api('/api/table-reservations', { method: 'DELETE', body: JSON.stringify({ id }) });
    fetchAll();
  };

  const moderateReview = async (id: number, is_approved: boolean) => {
    await api('/api/reviews', { method: 'PUT', body: JSON.stringify({ id, is_approved }) });
    fetchAll();
  };

  const deleteReview = async (id: number) => {
    await api('/api/reviews', { method: 'DELETE', body: JSON.stringify({ id }) });
    fetchAll();
  };

  const deleteMessage = async (id: number) => {
    await api('/api/contacts', { method: 'DELETE', body: JSON.stringify({ id }) });
    fetchAll();
  };

  const saveMenuItem = async (item: any) => {
    const method = item.id ? 'PUT' : 'POST';
    await api('/api/menu', { method, body: JSON.stringify(item) });
    setEditModal(null);
    fetchAll();
  };

  const deleteMenuItem = async (id: number) => {
    if (!confirm('Удалить блюдо?')) return;
    await api('/api/menu', { method: 'DELETE', body: JSON.stringify({ id }) });
    fetchAll();
  };

  const saveService = async (item: any) => {
    const method = item.id ? 'PUT' : 'POST';
    await api('/api/banquet-services', { method, body: JSON.stringify(item) });
    setEditModal(null);
    fetchAll();
  };

  const deleteService = async (id: number) => {
    if (!confirm('Удалить услугу?')) return;
    await api('/api/banquet-services', { method: 'DELETE', body: JSON.stringify({ id }) });
    fetchAll();
  };

  // ── Страница логина ────────────────────────────────────────────────────────

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
              placeholder="Пароль администратора" required autoComplete="current-password" />
            {authError && (
              <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-400 text-sm">❌ {authError}</p>
              </div>
            )}
            <button type="submit" className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
              Войти
            </button>
          </form>
          <div className="mt-6 p-4 bg-zinc-800 rounded-xl border border-white/5 text-center">
            <p className="text-white/40 text-xs mb-1">Пароль по умолчанию:</p>
            <p className="text-orange-400 font-mono font-bold tracking-wider">soliperec2025</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Навигация ──────────────────────────────────────────────────────────────

  const nav = [
    { key: 'dashboard',  label: 'Дашборд',      icon: <LayoutDashboard size={18} />, badge: 0 },
    { key: 'orders',     label: 'Заказы',        icon: <ShoppingBag size={18} />,     badge: stats?.new_orders || 0 },
    { key: 'bookings',   label: 'Банкеты',       icon: <Calendar size={18} />,        badge: stats?.pending_bookings || 0 },
    { key: 'tables',     label: 'Брони столов',  icon: <Armchair size={18} />,        badge: (tableRes.filter(t => t.status === 'new')).length },
    { key: 'reviews',    label: 'Отзывы',        icon: <Star size={18} />,            badge: stats?.pending_reviews || 0 },
    { key: 'messages',   label: 'Сообщения',     icon: <MessageSquare size={18} />,   badge: stats?.unread_messages || 0 },
    { key: 'menu',       label: 'Меню',          icon: <UtensilsCrossed size={18} />, badge: 0 },
    { key: 'services',   label: 'Услуги банкета',icon: <Settings size={18} />,        badge: 0 },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">

      {/* ── Сайдбар ── */}
      <div className="w-60 shrink-0 bg-zinc-900 border-r border-white/10 flex-col hidden md:flex">
        <div className="p-5 border-b border-white/10">
          <p className="text-orange-400 font-black">Соль & Перец</p>
          <p className="text-white/40 text-xs">Панель управления</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map(item => (
            <button key={item.key} onClick={() => setSection(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${section === item.key ? 'bg-orange-600/20 text-orange-400' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge > 0 && <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{item.badge}</span>}
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

      {/* ── Мобильная навигация ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-white/10 flex md:hidden z-50">
        {nav.slice(0, 6).map(item => (
          <button key={item.key} onClick={() => setSection(item.key)}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs transition-colors relative ${section === item.key ? 'text-orange-400' : 'text-white/40'}`}>
            {item.icon}
            {item.badge > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center leading-none">{item.badge}</span>}
          </button>
        ))}
      </div>

      {/* ── Контент ── */}
      <div className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="p-4 md:p-6 max-w-6xl">

          {loadError && (
            <div className="mb-4 bg-red-900/30 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
              <X className="text-red-400 shrink-0" size={18} />
              <div>
                <p className="text-red-400 font-medium text-sm">{loadError}</p>
                <button onClick={fetchAll} className="text-red-300 text-xs underline mt-1">Попробовать снова</button>
              </div>
            </div>
          )}

          {/* ── ДАШБОРД ── */}
          {section === 'dashboard' && (
            <div>
              <h1 className="text-2xl font-black mb-6">Дашборд</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: <ShoppingBag size={22} className="text-blue-400" />,   label: 'Новых заказов',  value: stats?.new_orders || 0 },
                  { icon: <DollarSign  size={22} className="text-green-400" />,  label: 'Выручка',        value: `${Number(stats?.total_revenue||0).toLocaleString('ru-RU')}₽` },
                  { icon: <Calendar    size={22} className="text-orange-400" />, label: 'Заявок банкет',  value: stats?.pending_bookings || 0 },
                  { icon: <Star        size={22} className="text-yellow-400" />, label: 'Рейтинг',        value: stats?.avg_rating || '—' },
                ].map((s, i) => (
                  <div key={i} className="bg-zinc-900 rounded-2xl p-5 border border-white/10">
                    <div className="mb-3">{s.icon}</div>
                    <p className="text-2xl font-black text-white">{s.value}</p>
                    <p className="text-white/40 text-sm">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-zinc-900 rounded-2xl border border-white/10 p-5">
                <h2 className="text-base font-bold mb-4">Последние заказы</h2>
                <div className="space-y-2">
                  {orders.slice(0, 8).map(o => (
                    <div key={o.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{o.customer_name}</p>
                        <p className="text-white/40 text-xs">{o.customer_phone}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full text-white shrink-0 ${ORDER_STATUS[o.status]?.color || 'bg-zinc-500'}`}>
                        {ORDER_STATUS[o.status]?.label || o.status}
                      </span>
                      <span className="text-orange-400 font-bold text-sm shrink-0">{o.total_price}₽</span>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-white/30 text-sm text-center py-4">Заказов пока нет</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── ЗАКАЗЫ ── */}
          {section === 'orders' && (
            <div>
              <h1 className="text-2xl font-black mb-6">Заказы ({orders.length})</h1>
              <div className="space-y-4">
                {orders.length === 0 && <p className="text-white/40 text-center py-10">Заказов нет</p>}
                {orders.map(order => (
                  <div key={order.id} className="bg-zinc-900 rounded-2xl border border-white/10 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-bold text-white">#{order.id} — {order.customer_name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full text-white ${ORDER_STATUS[order.status]?.color || 'bg-zinc-500'}`}>
                            {ORDER_STATUS[order.status]?.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-white/50">
                          <span className="flex items-center gap-1"><Phone size={12} />{order.customer_phone}</span>
                          {order.delivery_address && <span className="flex items-center gap-1"><MapPin size={12} />{order.delivery_address}</span>}
                          <span>{new Date(order.created_at).toLocaleString('ru-RU')}</span>
                        </div>
                      </div>
                      <span className="text-xl font-black text-orange-400">{order.total_price}₽</span>
                    </div>

                    <div className="mb-3 p-3 bg-white/5 rounded-xl text-sm space-y-1">
                      {(order.items || []).map((item: any, i: number) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-white/70">{item.name} × {item.quantity}</span>
                          <span className="text-white">{item.price * item.quantity}₽</span>
                        </div>
                      ))}
                    </div>

                    {order.comment && <p className="text-white/50 text-sm mb-3">💬 {order.comment}</p>}

                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(ORDER_STATUS).map(([st, { label, color }]) => (
                        <button key={st} onClick={() => updateOrder(order.id, st)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${order.status === st ? `${color} text-white` : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input defaultValue={order.admin_comment || ''}
                        onBlur={e => { if (e.target.value !== (order.admin_comment || '')) updateOrder(order.id, order.status, e.target.value); }}
                        className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-xs placeholder-white/30 focus:outline-none focus:border-orange-500"
                        placeholder="Заметка для заказа..." />
                      <a href={`tel:${order.customer_phone}`} className="flex items-center gap-1.5 px-3 py-2 bg-green-700 hover:bg-green-600 text-white text-xs rounded-lg transition-colors">
                        <Phone size={13} /> Позвонить
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── БАНКЕТЫ ── */}
          {section === 'bookings' && (
            <div>
              <h1 className="text-2xl font-black mb-6">Заявки на банкет ({bookings.length})</h1>
              <div className="space-y-4">
                {bookings.length === 0 && <p className="text-white/40 text-center py-10">Заявок нет</p>}
                {bookings.map(b => (
                  <div key={b.id} className="bg-zinc-900 rounded-2xl border border-white/10 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-bold text-white">#{b.id} — {b.customer_name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full text-white ${BOOKING_STATUS[b.status]?.color || 'bg-zinc-500'}`}>
                            {BOOKING_STATUS[b.status]?.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-white/50">
                          <span><Phone size={12} className="inline mr-1" />{b.customer_phone}</span>
                          <span>📅 {b.event_date} в {b.event_time}</span>
                          <span>👥 {b.guests_count} гостей</span>
                          <span>🎭 {b.event_type}</span>
                        </div>
                      </div>
                      <span className="text-xl font-black text-orange-400">~{Number(b.total_estimate||0).toLocaleString('ru-RU')}₽</span>
                    </div>

                    {b.extra_services?.length > 0 && (
                      <div className="mb-3 p-3 bg-white/5 rounded-xl text-xs text-white/60">
                        🎉 Услуги: {b.extra_services.join(', ')}
                      </div>
                    )}
                    {b.comment && <p className="text-white/50 text-sm mb-3">💬 {b.comment}</p>}

                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(BOOKING_STATUS).map(([st, { label, color }]) => (
                        <button key={st} onClick={() => updateBooking(b.id, st)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${b.status === st ? `${color} text-white` : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <a href={`tel:${b.customer_phone}`} className="flex items-center gap-1.5 px-3 py-2 bg-green-700 hover:bg-green-600 text-white text-xs rounded-lg transition-colors">
                        <Phone size={13} /> Позвонить
                      </a>
                      {b.customer_email && (
                        <a href={`mailto:${b.customer_email}`} className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors">
                          <Send size={13} /> Email
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── БРОНИ СТОЛОВ ── */}
          {section === 'tables' && (
            <div>
              <h1 className="text-2xl font-black mb-6">Бронирования столов ({tableRes.length})</h1>
              <div className="space-y-4">
                {tableRes.length === 0 && <p className="text-white/40 text-center py-10">Броней нет</p>}
                {tableRes.map(t => (
                  <div key={t.id} className="bg-zinc-900 rounded-2xl border border-white/10 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-bold text-white">#{t.id} — Стол №{t.table_number}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full text-white ${BOOKING_STATUS[t.status]?.color || 'bg-zinc-500'}`}>
                            {BOOKING_STATUS[t.status]?.label || t.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-white/50">
                          <span>👤 {t.customer_name}</span>
                          <span><Phone size={12} className="inline mr-1" />{t.customer_phone}</span>
                          <span>📅 {t.reservation_date} в {t.reservation_time}</span>
                          <span>👥 {t.guests_count} гостей</span>
                          <span>🪑 {t.seats_count} мест</span>
                        </div>
                      </div>
                    </div>
                    {t.comment && <p className="text-white/50 text-sm mb-3">💬 {t.comment}</p>}

                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(BOOKING_STATUS).map(([st, { label, color }]) => (
                        <button key={st} onClick={() => updateTableRes(t.id, st)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${t.status === st ? `${color} text-white` : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <a href={`tel:${t.customer_phone}`} className="flex items-center gap-1.5 px-3 py-2 bg-green-700 hover:bg-green-600 text-white text-xs rounded-lg transition-colors">
                        <Phone size={13} /> Позвонить
                      </a>
                      <button onClick={() => deleteTableRes(t.id)} className="flex items-center gap-1.5 px-3 py-2 bg-red-700 hover:bg-red-600 text-white text-xs rounded-lg transition-colors">
                        <Trash2 size={13} /> Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ОТЗЫВЫ ── */}
          {section === 'reviews' && (
            <div>
              <h1 className="text-2xl font-black mb-6">Отзывы ({reviews.length})</h1>
              <div className="space-y-4">
                {reviews.length === 0 && <p className="text-white/40 text-center py-10">Отзывов нет</p>}
                {reviews.map(r => (
                  <div key={r.id} className={`bg-zinc-900 rounded-2xl border p-5 ${r.is_approved ? 'border-green-500/20' : 'border-yellow-500/20'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="font-bold text-white">{r.author_name}</span>
                          <span className="text-yellow-400">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${r.is_approved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {r.is_approved ? 'Опубликован' : 'На модерации'}
                          </span>
                        </div>
                        <p className="text-white/70 text-sm">{r.text}</p>
                        <p className="text-white/30 text-xs mt-2">{new Date(r.created_at).toLocaleString('ru-RU')}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {!r.is_approved
                          ? <button onClick={() => moderateReview(r.id, true)} className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors" title="Одобрить"><Check size={15} /></button>
                          : <button onClick={() => moderateReview(r.id, false)} className="p-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors" title="Скрыть"><Eye size={15} /></button>
                        }
                        <button onClick={() => deleteReview(r.id)} className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors" title="Удалить"><Trash2 size={15} /></button>
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
              <div className="space-y-4">
                {messages.length === 0 && <p className="text-white/40 text-center py-10">Сообщений нет</p>}
                {messages.map(msg => (
                  <div key={msg.id} className="bg-zinc-900 rounded-2xl border border-white/10 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <span className="font-bold text-white">{msg.name}</span>
                          {msg.phone && <a href={`tel:${msg.phone}`} className="text-orange-400 text-sm hover:underline flex items-center gap-1"><Phone size={12} />{msg.phone}</a>}
                          {msg.email && <a href={`mailto:${msg.email}`} className="text-blue-400 text-sm hover:underline">{msg.email}</a>}
                        </div>
                        <p className="text-white/70 text-sm">{msg.message}</p>
                        <p className="text-white/30 text-xs mt-2">{new Date(msg.created_at).toLocaleString('ru-RU')}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {msg.phone && <a href={`tel:${msg.phone}`} className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"><Phone size={15} /></a>}
                        <button onClick={() => deleteMessage(msg.id)} className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"><Trash2 size={15} /></button>
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
                <h1 className="text-2xl font-black">Меню ({menuItems.length})</h1>
                <button onClick={() => setEditModal({ type: 'menu' })}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition-colors text-sm">
                  <Plus size={16} /> Добавить блюдо
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map(item => (
                  <div key={item.id} className="bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden">
                    <img src={item.image_url || '/images/dish-1.jpg'} alt={item.name} className="w-full h-36 object-cover" />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-white text-sm">{item.name}</h3>
                        <span className="text-orange-400 font-bold text-sm shrink-0">{item.price}₽</span>
                      </div>
                      <p className="text-white/40 text-xs mb-1">{item.category} · {item.weight}</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => setEditModal({ type: 'menu', item })}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors">
                          <Edit3 size={13} /> Изменить
                        </button>
                        <button onClick={() => deleteMenuItem(item.id)}
                          className="p-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors">
                          <Trash2 size={13} />
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
                <h1 className="text-2xl font-black">Услуги банкета ({banquetServices.length})</h1>
                <button onClick={() => setEditModal({ type: 'service' })}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition-colors text-sm">
                  <Plus size={16} /> Добавить услугу
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banquetServices.map(s => (
                  <div key={s.id} className="bg-zinc-900 rounded-2xl border border-white/10 p-5 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-white">{s.icon} {s.name}</p>
                      <p className="text-white/50 text-sm mt-1">{s.description}</p>
                      <p className="text-orange-400 font-bold mt-2">{s.price}₽{s.price_type === 'per_person' ? '/чел' : ''}</p>
                      <p className="text-white/30 text-xs">{s.category}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setEditModal({ type: 'service', item: s })}
                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"><Edit3 size={15} /></button>
                      <button onClick={() => deleteService(s.id)}
                        className="p-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Модальное окно редактирования ── */}
      <AnimatePresence>
        {editModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" onClick={() => setEditModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-zinc-900 rounded-3xl border border-white/10 z-50 overflow-y-auto max-h-[90vh]">
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold">{editModal.item ? 'Редактировать' : 'Добавить'} {editModal.type === 'menu' ? 'блюдо' : 'услугу'}</h2>
                  <button onClick={() => setEditModal(null)} className="text-white/40 hover:text-white"><X size={20} /></button>
                </div>
                {editModal.type === 'menu'    && <MenuItemForm    item={editModal.item} onSave={saveMenuItem} onCancel={() => setEditModal(null)} />}
                {editModal.type === 'service' && <ServiceForm     item={editModal.item} onSave={saveService}  onCancel={() => setEditModal(null)} />}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Форма блюда ──────────────────────────────────────────────────────────────

function MenuItemForm({ item, onSave, onCancel }: { item?: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [f, setF] = useState({
    id: item?.id, name: item?.name || '', description: item?.description || '',
    price: item?.price || '', old_price: item?.old_price || '',
    image_url: item?.image_url || '', category: item?.category || 'mangal',
    type: item?.type || 'food', calories: item?.calories || '',
    cook_time: item?.cook_time || '', weight: item?.weight || '',
    is_featured: item?.is_featured || false, is_day_special: item?.is_day_special || false,
    is_active: item?.is_active !== false, sort_order: item?.sort_order || 0,
    volume: item?.volume || '', abv: item?.abv || '',
  });

  return (
    <div className="space-y-3">
      <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })}
        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 text-sm"
        placeholder="Название *" required />
      <textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })}
        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 resize-none text-sm"
        rows={2} placeholder="Описание" />
      <div className="grid grid-cols-2 gap-3">
        <input value={f.price} onChange={e => setF({ ...f, price: e.target.value })} type="number"
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 text-sm"
          placeholder="Цена ₽ *" required />
        <input value={f.old_price} onChange={e => setF({ ...f, old_price: e.target.value })} type="number"
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 text-sm"
          placeholder="Старая цена" />
      </div>
      <input value={f.image_url} onChange={e => setF({ ...f, image_url: e.target.value })}
        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 text-sm"
        placeholder="URL фото (https://...)" />
      <div className="grid grid-cols-2 gap-3">
        <select value={f.type} onChange={e => setF({ ...f, type: e.target.value })}
          className="w-full bg-zinc-800 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 text-sm">
          <option value="food">Еда</option>
          <option value="bar">Бар</option>
        </select>
        <input value={f.category} onChange={e => setF({ ...f, category: e.target.value })}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 text-sm"
          placeholder="Категория (mangal, salads...)" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <input value={f.calories} onChange={e => setF({ ...f, calories: e.target.value })} type="number"
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 text-sm"
          placeholder="Ккал" />
        <input value={f.cook_time} onChange={e => setF({ ...f, cook_time: e.target.value })} type="number"
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 text-sm"
          placeholder="Мин" />
        <input value={f.weight} onChange={e => setF({ ...f, weight: e.target.value })}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 text-sm"
          placeholder="Вес/объём" />
      </div>
      <div className="flex flex-wrap gap-4">
        {[['is_featured','Рекомендуем'],['is_day_special','Блюдо дня'],['is_active','Активно']].map(([k,l]) => (
          <label key={k} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={(f as any)[k]} onChange={e => setF({ ...f, [k]: e.target.checked })} className="w-4 h-4 accent-orange-500" />
            <span className="text-white/70 text-sm">{l}</span>
          </label>
        ))}
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm">Отмена</button>
        <button onClick={() => onSave(f)} className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors text-sm">Сохранить</button>
      </div>
    </div>
  );
}

// ─── Форма услуги ─────────────────────────────────────────────────────────────

function ServiceForm({ item, onSave, onCancel }: { item?: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [f, setF] = useState({
    id: item?.id, name: item?.name || '', description: item?.description || '',
    price: item?.price || '', price_type: item?.price_type || 'fixed',
    category: item?.category || 'Развлечения', icon: item?.icon || '🎉',
    is_active: item?.is_active !== false, sort_order: item?.sort_order || 0,
  });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        <input value={f.icon} onChange={e => setF({ ...f, icon: e.target.value })}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-2 py-2.5 text-white text-center text-xl focus:outline-none focus:border-orange-500"
          placeholder="🎉" />
        <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })}
          className="col-span-3 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 text-sm"
          placeholder="Название *" required />
      </div>
      <textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })}
        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 resize-none text-sm"
        rows={2} placeholder="Описание" />
      <div className="grid grid-cols-2 gap-3">
        <input value={f.price} onChange={e => setF({ ...f, price: e.target.value })} type="number"
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 text-sm"
          placeholder="Цена ₽" />
        <select value={f.price_type} onChange={e => setF({ ...f, price_type: e.target.value })}
          className="w-full bg-zinc-800 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 text-sm">
          <option value="fixed">Фиксированная</option>
          <option value="per_person">За человека</option>
        </select>
      </div>
      <input value={f.category} onChange={e => setF({ ...f, category: e.target.value })}
        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 text-sm"
        placeholder="Категория (Развлечения, Декор, Кейтеринг...)" />
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={f.is_active} onChange={e => setF({ ...f, is_active: e.target.checked })} className="w-4 h-4 accent-orange-500" />
        <span className="text-white/70 text-sm">Активно</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm">Отмена</button>
        <button onClick={() => onSave(f)} className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors text-sm">Сохранить</button>
      </div>
    </div>
  );
}
