import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Calendar, Star, MessageSquare,
  UtensilsCrossed, Settings, LogOut, Check, X,
  Eye, Trash2, Edit3, Plus, DollarSign,
  RefreshCw, Send, Phone, MapPin, BookOpen
} from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'Новый', color: 'bg-blue-500' },
  confirmed: { label: 'Подтверждён', color: 'bg-green-500' },
  preparing: { label: 'Готовится', color: 'bg-yellow-500' },
  delivering: { label: 'Доставляется', color: 'bg-orange-500' },
  done: { label: 'Выполнен', color: 'bg-gray-500' },
  cancelled: { label: 'Отменён', color: 'bg-red-500' },
};

const BOOKING_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'Новая', color: 'bg-blue-500' },
  confirmed: { label: 'Подтверждена', color: 'bg-green-500' },
  done: { label: 'Состоялась', color: 'bg-gray-500' },
  cancelled: { label: 'Отменена', color: 'bg-red-500' },
};

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_authed') === 'true');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [section, setSection] = useState('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [banquetServices, setBanquetServices] = useState<any[]>([]);
  const [editModal, setEditModal] = useState<{ type: string; item?: any } | null>(null);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        sessionStorage.setItem('admin_authed', 'true');
        setAuthed(true);
      } else {
        setAuthError('Неверный пароль');
      }
    } catch {
      setAuthError('Ошибка подключения');
    }
  };

  const logout = () => {
    sessionStorage.removeItem('admin_authed');
    setAuthed(false);
  };

  const fetchAll = async () => {
    try {
      const [statsRes, ordersRes, bookingsRes, reviewsRes, msgRes, menuRes, servicesRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/orders'),
        fetch('/api/bookings'),
        fetch('/api/reviews'),
        fetch('/api/contacts'),
        fetch('/api/menu'),
        fetch('/api/banquet-services')
      ]);
      setStats(await statsRes.json());
      setOrders(await ordersRes.json());
      setBookings(await bookingsRes.json());
      setReviews(await reviewsRes.json());
      setMessages(await msgRes.json());
      setMenuItems(await menuRes.json());
      setBanquetServices(await servicesRes.json());
    } catch {}
  };

  useEffect(() => { if (authed) fetchAll(); }, [authed, section]);

  const updateOrderStatus = async (id: number, status: string, comment?: string) => {
    await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, admin_comment: comment })
    });
    fetchAll();
  };

  const updateBookingStatus = async (id: number, status: string, comment?: string) => {
    await fetch('/api/bookings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, admin_comment: comment })
    });
    fetchAll();
  };

  const moderateReview = async (id: number, approved: boolean) => {
    await fetch('/api/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_approved: approved })
    });
    fetchAll();
  };

  const deleteReview = async (id: number) => {
    await fetch('/api/reviews', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    fetchAll();
  };

  const deleteMessage = async (id: number) => {
    await fetch('/api/contacts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    fetchAll();
  };

  const saveMenuItem = async (item: any) => {
    const method = item.id ? 'PUT' : 'POST';
    await fetch('/api/menu', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    setEditModal(null);
    fetchAll();
  };

  const deleteMenuItem = async (id: number) => {
    await fetch('/api/menu', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    fetchAll();
  };

  const saveService = async (service: any) => {
    const method = service.id ? 'PUT' : 'POST';
    await fetch('/api/banquet-services', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(service)
    });
    setEditModal(null);
    fetchAll();
  };

  const deleteService = async (id: number) => {
    await fetch('/api/banquet-services', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    fetchAll();
  };

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
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
              placeholder="Пароль администратора" required />
            {authError && <p className="text-red-400 text-sm">{authError}</p>}
            <button type="submit" className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
              Войти
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const navItems = [
    { key: 'dashboard', label: 'Дашборд', icon: <LayoutDashboard size={18} />, badge: null },
    { key: 'orders', label: 'Заказы', icon: <ShoppingBag size={18} />, badge: stats?.new_orders },
    { key: 'bookings', label: 'Бронирования', icon: <Calendar size={18} />, badge: stats?.pending_bookings },
    { key: 'reviews', label: 'Отзывы', icon: <Star size={18} />, badge: stats?.pending_reviews },
    { key: 'messages', label: 'Сообщения', icon: <MessageSquare size={18} />, badge: stats?.unread_messages },
    { key: 'menu', label: 'Меню', icon: <UtensilsCrossed size={18} />, badge: null },
    { key: 'services', label: 'Услуги банкета', icon: <Settings size={18} />, badge: null },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Sidebar */}
      <div className="w-64 shrink-0 bg-zinc-900 border-r border-white/10 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-white/10">
          <p className="text-orange-400 font-black text-lg">Соль & Перец</p>
          <p className="text-white/40 text-xs">Панель управления</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button key={item.key} onClick={() => setSection(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${section === item.key ? 'bg-orange-600/20 text-orange-400' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge > 0 && <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          <button onClick={fetchAll} className="w-full flex items-center gap-2 px-4 py-2 text-white/40 hover:text-white text-sm transition-colors">
            <RefreshCw size={16} /> Обновить
          </button>
          <Link to="/admin/instructions" className="w-full flex items-center gap-2 px-4 py-2 text-white/40 hover:text-orange-400 text-sm transition-colors">
            <BookOpen size={16} /> Инструкция
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-white/40 hover:text-red-400 text-sm transition-colors">
            <LogOut size={16} /> Выйти
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-white/10 flex md:hidden z-50">
        {navItems.slice(0, 5).map(item => (
          <button key={item.key} onClick={() => setSection(item.key)}
            className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs transition-colors relative ${section === item.key ? 'text-orange-400' : 'text-white/40'}`}>
            {item.icon}
            <span className="hidden sm:block">{item.label}</span>
            {item.badge > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{item.badge}</span>}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto pb-20 md:pb-0">
        <div className="p-4 md:p-8">
          {/* Dashboard */}
          {section === 'dashboard' && (
            <div>
              <h1 className="text-2xl font-black mb-8">Дашборд</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: <ShoppingBag size={24} />, label: 'Новых заказов', value: stats?.new_orders || 0, color: 'text-blue-400' },
                  { icon: <DollarSign size={24} />, label: 'Выручка', value: `${(stats?.total_revenue || 0).toLocaleString('ru-RU')}₽`, color: 'text-green-400' },
                  { icon: <Calendar size={24} />, label: 'Заявок на банкет', value: stats?.pending_bookings || 0, color: 'text-orange-400' },
                  { icon: <Star size={24} />, label: 'Рейтинг', value: stats?.avg_rating || '—', color: 'text-yellow-400' },
                ].map((s, i) => (
                  <div key={i} className="bg-zinc-900 rounded-2xl p-5 border border-white/10">
                    <div className={`mb-3 ${s.color}`}>{s.icon}</div>
                    <p className="text-2xl font-black text-white">{s.value}</p>
                    <p className="text-white/40 text-sm">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent orders */}
              <div className="bg-zinc-900 rounded-2xl border border-white/10 p-6">
                <h2 className="text-lg font-bold mb-4">Последние заказы</h2>
                <div className="space-y-3">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{order.customer_name}</p>
                        <p className="text-white/40 text-xs">{order.customer_phone}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full text-white ${STATUS_LABELS[order.status]?.color || 'bg-gray-500'}`}>
                        {STATUS_LABELS[order.status]?.label || order.status}
                      </span>
                      <span className="text-orange-400 font-bold text-sm">{order.total_price}₽</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Orders */}
          {section === 'orders' && (
            <div>
              <h1 className="text-2xl font-black mb-8">Заказы ({orders.length})</h1>
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-zinc-900 rounded-2xl border border-white/10 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-white">#{order.id} — {order.customer_name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full text-white ${STATUS_LABELS[order.status]?.color || 'bg-gray-500'}`}>
                            {STATUS_LABELS[order.status]?.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-white/50">
                          <span className="flex items-center gap-1"><Phone size={14} /> {order.customer_phone}</span>
                          {order.delivery_address && <span className="flex items-center gap-1"><MapPin size={14} /> {order.delivery_address}</span>}
                          <span>{new Date(order.created_at).toLocaleString('ru-RU')}</span>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-orange-400">{order.total_price}₽</span>
                    </div>

                    {/* Items */}
                    <div className="mb-4 p-3 bg-white/5 rounded-xl">
                      {(order.items || []).map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm py-1">
                          <span className="text-white/70">{item.name} × {item.quantity}</span>
                          <span className="text-white">{item.price * item.quantity}₽</span>
                        </div>
                      ))}
                    </div>

                    {order.comment && <p className="text-white/50 text-sm mb-4">💬 {order.comment}</p>}
                    {order.admin_comment && <p className="text-orange-400 text-sm mb-4">📝 Заметка: {order.admin_comment}</p>}

                    {/* Status change */}
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(STATUS_LABELS).map(([status, { label, color }]) => (
                        <button key={status} onClick={() => updateOrderStatus(order.id, status)}
                          disabled={order.status === status}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${order.status === status ? `${color} text-white opacity-100` : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Admin comment */}
                    <div className="mt-3 flex gap-2">
                      <input
                        placeholder="Заметка для заказа..."
                        defaultValue={order.admin_comment || ''}
                        onBlur={e => { if (e.target.value !== (order.admin_comment || '')) updateOrderStatus(order.id, order.status, e.target.value); }}
                        className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    {/* Call button */}
                    <div className="mt-3">
                      <a href={`tel:${order.customer_phone}`} className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm rounded-lg transition-colors">
                        <Phone size={14} /> Позвонить клиенту
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bookings */}
          {section === 'bookings' && (
            <div>
              <h1 className="text-2xl font-black mb-8">Бронирования ({bookings.length})</h1>
              <div className="space-y-4">
                {bookings.map(booking => (
                  <div key={booking.id} className="bg-zinc-900 rounded-2xl border border-white/10 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-bold text-white">#{booking.id} — {booking.customer_name}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full text-white ${BOOKING_STATUS_LABELS[booking.status]?.color || 'bg-gray-500'}`}>
                            {BOOKING_STATUS_LABELS[booking.status]?.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-white/50">
                          <span><Phone size={14} className="inline mr-1" />{booking.customer_phone}</span>
                          <span>📅 {booking.event_date} в {booking.event_time}</span>
                          <span>👥 {booking.guests_count} гостей</span>
                          <span>🎭 {booking.event_type}</span>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-orange-400">~{booking.total_estimate?.toLocaleString('ru-RU')}₽</span>
                    </div>

                    {booking.extra_services?.length > 0 && (
                      <div className="mb-3 p-3 bg-white/5 rounded-xl">
                        <p className="text-white/50 text-xs mb-1">Доп. услуги:</p>
                        <p className="text-white/70 text-sm">{booking.extra_services.join(', ')}</p>
                      </div>
                    )}

                    {booking.comment && <p className="text-white/50 text-sm mb-4">💬 {booking.comment}</p>}

                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(BOOKING_STATUS_LABELS).map(([status, { label, color }]) => (
                        <button key={status} onClick={() => updateBookingStatus(booking.id, status)}
                          disabled={booking.status === status}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${booking.status === status ? `${color} text-white` : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <a href={`tel:${booking.customer_phone}`} className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm rounded-lg transition-colors">
                        <Phone size={14} /> Позвонить
                      </a>
                      {booking.customer_email && (
                        <a href={`mailto:${booking.customer_email}`} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors">
                          <Send size={14} /> Email
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {section === 'reviews' && (
            <div>
              <h1 className="text-2xl font-black mb-8">Отзывы ({reviews.length})</h1>
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className={`bg-zinc-900 rounded-2xl border p-5 ${review.is_approved ? 'border-green-500/30' : 'border-yellow-500/30'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-white">{review.author_name}</span>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => <span key={s} className={s <= review.rating ? 'text-yellow-400' : 'text-white/20'}>★</span>)}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${review.is_approved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {review.is_approved ? 'Опубликован' : 'На модерации'}
                          </span>
                        </div>
                        <p className="text-white/70 text-sm">{review.text}</p>
                        <p className="text-white/30 text-xs mt-2">{new Date(review.created_at).toLocaleString('ru-RU')}</p>
                      </div>
                      <div className="flex gap-2">
                        {!review.is_approved && (
                          <button onClick={() => moderateReview(review.id, true)} className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors">
                            <Check size={16} />
                          </button>
                        )}
                        {review.is_approved && (
                          <button onClick={() => moderateReview(review.id, false)} className="p-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-colors">
                            <Eye size={16} />
                          </button>
                        )}
                        <button onClick={() => deleteReview(review.id)} className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {section === 'messages' && (
            <div>
              <h1 className="text-2xl font-black mb-8">Сообщения ({messages.length})</h1>
              <div className="space-y-4">
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
                      <div className="flex gap-2">
                        {msg.phone && (
                          <a href={`tel:${msg.phone}`} className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors">
                            <Phone size={16} />
                          </a>
                        )}
                        <button onClick={() => deleteMessage(msg.id)} className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Menu management */}
          {section === 'menu' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-black">Управление меню ({menuItems.length})</h1>
                <button onClick={() => setEditModal({ type: 'menu' })}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition-colors">
                  <Plus size={18} /> Добавить блюдо
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map(item => (
                  <div key={item.id} className="bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden">
                    <img src={item.image_url || '/images/dish-1.jpg'} alt={item.name} className="w-full h-40 object-cover" />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-white text-sm">{item.name}</h3>
                        <span className="text-orange-400 font-bold text-sm shrink-0">{item.price}₽</span>
                      </div>
                      <p className="text-white/40 text-xs mb-1">{item.category} · {item.type === 'bar' ? 'Бар' : 'Еда'}</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => setEditModal({ type: 'menu', item })}
                          className="flex-1 flex items-center justify-center gap-1 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-colors">
                          <Edit3 size={14} /> Изменить
                        </button>
                        <button onClick={() => deleteMenuItem(item.id)}
                          className="p-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Banquet services */}
          {section === 'services' && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-black">Услуги банкета ({banquetServices.length})</h1>
                <button onClick={() => setEditModal({ type: 'service' })}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition-colors">
                  <Plus size={18} /> Добавить услугу
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {banquetServices.map(service => (
                  <div key={service.id} className="bg-zinc-900 rounded-2xl border border-white/10 p-5 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-white">{service.icon} {service.name}</p>
                      <p className="text-white/50 text-sm mt-1">{service.description}</p>
                      <p className="text-orange-400 font-bold mt-2">{service.price}₽{service.price_type === 'per_person' ? '/чел' : ''}</p>
                      <p className="text-white/30 text-xs">{service.category}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditModal({ type: 'service', item: service })}
                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => deleteService(service.id)}
                        className="p-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" onClick={() => setEditModal(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-zinc-900 rounded-3xl border border-white/10 z-50 overflow-y-auto max-h-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">{editModal.item ? 'Редактировать' : 'Добавить'} {editModal.type === 'menu' ? 'блюдо' : 'услугу'}</h2>
                  <button onClick={() => setEditModal(null)} className="text-white/40 hover:text-white"><X size={22} /></button>
                </div>

                {editModal.type === 'menu' && (
                  <MenuItemForm item={editModal.item} onSave={saveMenuItem} onCancel={() => setEditModal(null)} />
                )}
                {editModal.type === 'service' && (
                  <ServiceForm item={editModal.item} onSave={saveService} onCancel={() => setEditModal(null)} />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItemForm({ item, onSave, onCancel }: { item?: any; onSave: (data: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    id: item?.id,
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || '',
    old_price: item?.old_price || '',
    image_url: item?.image_url || '',
    category: item?.category || 'shashlik',
    type: item?.type || 'food',
    calories: item?.calories || '',
    cook_time: item?.cook_time || '',
    weight: item?.weight || '',
    is_featured: item?.is_featured || false,
    is_day_special: item?.is_day_special || false,
    is_active: item?.is_active !== false,
    sort_order: item?.sort_order || 0,
    allergens: item?.allergens || [],
    volume: item?.volume || '',
    abv: item?.abv || '',
  });

  const allergenOptions = ['gluten_free', 'lactose_free', 'vegan', 'nut_free'];

  return (
    <div className="space-y-4">
      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
        placeholder="Название блюда *" required />
      <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 resize-none"
        rows={2} placeholder="Описание" />
      <div className="grid grid-cols-2 gap-3">
        <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
          placeholder="Цена (₽) *" type="number" required />
        <input value={form.old_price} onChange={e => setForm({ ...form, old_price: e.target.value })}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
          placeholder="Старая цена" type="number" />
      </div>
      <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })}
        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
        placeholder="URL изображения" />
      <div className="grid grid-cols-2 gap-3">
        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500">
          <option value="food">Еда</option>
          <option value="bar">Бар</option>
        </select>
        <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
          placeholder="Категория" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <input value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
          placeholder="Ккал" type="number" />
        <input value={form.cook_time} onChange={e => setForm({ ...form, cook_time: e.target.value })}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
          placeholder="Время (мин)" type="number" />
        <input value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
          placeholder="Вес/объём" />
      </div>
      {form.type === 'bar' && (
        <div className="grid grid-cols-2 gap-3">
          <input value={form.volume} onChange={e => setForm({ ...form, volume: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
            placeholder="Объём (50мл)" />
          <input value={form.abv} onChange={e => setForm({ ...form, abv: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
            placeholder="Крепость (%)" type="number" />
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        {[
          { key: 'is_featured', label: 'Рекомендуем' },
          { key: 'is_day_special', label: 'Блюдо дня' },
          { key: 'is_active', label: 'Активно' },
        ].map(f => (
          <label key={f.key} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.checked })}
              className="w-4 h-4 accent-orange-500" />
            <span className="text-white/70 text-sm">{f.label}</span>
          </label>
        ))}
      </div>
      <div>
        <p className="text-white/60 text-sm mb-2">Аллергены:</p>
        <div className="flex flex-wrap gap-2">
          {allergenOptions.map(a => (
            <label key={a} className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={form.allergens.includes(a)}
                onChange={e => setForm({ ...form, allergens: e.target.checked ? [...form.allergens, a] : form.allergens.filter((x: string) => x !== a) })}
                className="w-4 h-4 accent-orange-500" />
              <span className="text-white/60 text-xs">{a}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">Отмена</button>
        <button onClick={() => onSave(form)} className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">Сохранить</button>
      </div>
    </div>
  );
}

function ServiceForm({ item, onSave, onCancel }: { item?: any; onSave: (data: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-center text-2xl focus:outline-none focus:border-orange-500"
          placeholder="🎉" />
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          className="col-span-3 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
          placeholder="Название услуги *" required />
      </div>
      <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 resize-none"
        rows={2} placeholder="Описание" />
      <div className="grid grid-cols-2 gap-3">
        <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
          placeholder="Цена (₽)" type="number" required />
        <select value={form.price_type} onChange={e => setForm({ ...form, price_type: e.target.value })}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500">
          <option value="fixed">Фиксированная</option>
          <option value="per_person">За человека</option>
        </select>
      </div>
      <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
        placeholder="Категория (Развлечения, Декор, Кейтеринг...)" />
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-orange-500" />
        <span className="text-white/70 text-sm">Активно</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">Отмена</button>
        <button onClick={() => onSave(form)} className="flex-1 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">Сохранить</button>
      </div>
    </div>
  );
}
