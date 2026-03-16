import { useState, useEffect } from 'react';
import {
  getOrders,
  getReviews,
  getBanquets,
  getMessages,
  getCustomers,
  getStatistics,
  updateOrderStatus,
  addOrderNote,
  addOrderMessage,
  deleteOrder,
  updateReviewStatus,
  editReview,
  deleteReview,
  updateBanquetStatus,
  addBanquetNote,
  updateMessageStatus,
  updateCustomerNotes,
  initDemoData,
  Order,
  Review,
  BanquetRequest,
  ContactMessage,
  Customer,
} from '../services/crmService';
import { sendTelegramMessage, BOT_SETTINGS } from '../services/telegramBot';

// Функция для отправки уведомлений
const sendNotification = (text: string) => {
  BOT_SETTINGS.ADMIN_IDS.forEach(adminId => {
    sendTelegramMessage(adminId, text);
  });
};

// Пароль для входа в админку
const ADMIN_PASSWORD = 'solperecadmin2024';

type Tab = 'dashboard' | 'orders' | 'reviews' | 'banquets' | 'messages' | 'customers' | 'settings';

const statusLabels: Record<string, string> = {
  new: 'Новый',
  confirmed: 'Подтверждён',
  cooking: 'Готовится',
  ready: 'Готов',
  delivering: 'В доставке',
  completed: 'Завершён',
  cancelled: 'Отменён',
  pending: 'На модерации',
  approved: 'Одобрен',
  rejected: 'Отклонён',
  contacted: 'Связались',
  read: 'Прочитано',
  replied: 'Ответили',
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-500',
  confirmed: 'bg-yellow-500',
  cooking: 'bg-orange-500',
  ready: 'bg-green-500',
  delivering: 'bg-purple-500',
  completed: 'bg-gray-500',
  cancelled: 'bg-red-500',
  pending: 'bg-yellow-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  contacted: 'bg-blue-500',
  read: 'bg-gray-500',
  replied: 'bg-green-500',
};

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [banquets, setBanquets] = useState<BanquetRequest[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getStatistics> | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [editingReviewText, setEditingReviewText] = useState('');
  const [replyText, setReplyText] = useState('');

  // Проверка авторизации через URL или localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');
    const savedAuth = localStorage.getItem('crm_auth');
    
    if (adminParam === ADMIN_PASSWORD || savedAuth === 'true') {
      setIsAuthenticated(true);
      localStorage.setItem('crm_auth', 'true');
      initDemoData();
      loadData();
    }
  }, []);

  const loadData = () => {
    setOrders(getOrders());
    setReviews(getReviews());
    setBanquets(getBanquets());
    setMessages(getMessages());
    setCustomers(getCustomers());
    setStats(getStatistics());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('crm_auth', 'true');
      initDemoData();
      loadData();
    } else {
      alert('Неверный пароль');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('crm_auth');
  };

  // ===== ORDER HANDLERS =====
  const handleOrderStatusChange = (orderId: string, status: Order['status']) => {
    const updated = updateOrderStatus(orderId, status);
    if (updated) {
      loadData();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      // Уведомление в Telegram
      sendNotification(`📦 Заказ #${updated.number}\nСтатус изменён: ${statusLabels[status]}\nКлиент: ${updated.customer.name}\nТелефон: ${updated.customer.phone}`);
    }
  };

  const handleAddOrderNote = (orderId: string, note: string) => {
    const updated = addOrderNote(orderId, note);
    if (updated && selectedOrder?.id === orderId) {
      setSelectedOrder(updated);
    }
  };

  const handleSendMessage = (orderId: string) => {
    if (!newMessage.trim()) return;
    const updated = addOrderMessage(orderId, newMessage, 'admin');
    if (updated) {
      setSelectedOrder(updated);
      setNewMessage('');
      // Здесь можно отправить SMS/WhatsApp клиенту
      sendNotification(`💬 Сообщение клиенту\nЗаказ #${updated.number}\nКлиент: ${updated.customer.phone}\nСообщение: ${newMessage}`);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Удалить заказ?')) {
      deleteOrder(orderId);
      loadData();
      setSelectedOrder(null);
    }
  };

  // ===== REVIEW HANDLERS =====
  const handleReviewAction = (reviewId: string, action: 'approve' | 'reject') => {
    const status = action === 'approve' ? 'approved' : 'rejected';
    updateReviewStatus(reviewId, status);
    loadData();
    setSelectedReview(null);
  };

  const handleEditReview = (reviewId: string) => {
    if (!editingReviewText.trim()) return;
    editReview(reviewId, editingReviewText);
    loadData();
    setSelectedReview(null);
    setEditingReviewText('');
  };

  const handleDeleteReview = (reviewId: string) => {
    if (confirm('Удалить отзыв?')) {
      deleteReview(reviewId);
      loadData();
      setSelectedReview(null);
    }
  };

  // ===== BANQUET HANDLERS =====
  const handleBanquetStatusChange = (banquetId: string, status: BanquetRequest['status']) => {
    updateBanquetStatus(banquetId, status);
    loadData();
  };

  const handleBanquetNote = (banquetId: string, note: string) => {
    addBanquetNote(banquetId, note);
    loadData();
  };

  // ===== MESSAGE HANDLERS =====
  const handleMessageReply = (messageId: string) => {
    if (!replyText.trim()) return;
    updateMessageStatus(messageId, 'replied', replyText);
    loadData();
    setReplyText('');
    // Отправить SMS/WhatsApp
    const msg = messages.find(m => m.id === messageId);
    if (msg) {
      sendNotification(`📩 Ответ на сообщение\nКлиент: ${msg.name}\nТелефон: ${msg.phone}\nОтвет: ${replyText}`);
    }
  };

  const handleMarkAsRead = (messageId: string) => {
    updateMessageStatus(messageId, 'read');
    loadData();
  };

  // ===== CUSTOMER HANDLERS =====
  const handleCustomerNote = (customerId: string, note: string) => {
    updateCustomerNotes(customerId, note);
    loadData();
  };

  // Форма входа
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-xl max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">🔐 CRM Соль и Перец</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль администратора"
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg mb-4"
          />
          <button
            type="submit"
            className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
          >
            Войти
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-orange-500">🍖 CRM Соль и Перец</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            Новых заказов: <span className="text-orange-500 font-bold">{stats?.orders.new || 0}</span>
          </span>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white">
            Выйти
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-gray-800 min-h-[calc(100vh-60px)] p-4">
          <ul className="space-y-2">
            {[
              { id: 'dashboard', icon: '📊', label: 'Дашборд' },
              { id: 'orders', icon: '📦', label: 'Заказы', badge: stats?.orders.new },
              { id: 'reviews', icon: '⭐', label: 'Отзывы', badge: stats?.reviews.pending },
              { id: 'banquets', icon: '🎉', label: 'Банкеты', badge: stats?.banquets.new },
              { id: 'messages', icon: '💬', label: 'Сообщения', badge: stats?.messages.new },
              { id: 'customers', icon: '👥', label: 'Клиенты' },
              { id: 'settings', icon: '⚙️', label: 'Настройки' },
            ].map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id as Tab)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition ${
                    activeTab === item.id
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span>{item.icon} {item.label}</span>
                  {item.badge ? (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Dashboard */}
          {activeTab === 'dashboard' && stats && (
            <div>
              <h2 className="text-2xl font-bold mb-6">📊 Дашборд</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-800 rounded-xl p-6">
                  <p className="text-gray-400 text-sm">Заказов сегодня</p>
                  <p className="text-3xl font-bold text-orange-500">{stats.orders.today}</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-6">
                  <p className="text-gray-400 text-sm">Выручка сегодня</p>
                  <p className="text-3xl font-bold text-green-500">{stats.orders.todayRevenue.toLocaleString()} ₽</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-6">
                  <p className="text-gray-400 text-sm">Выручка за месяц</p>
                  <p className="text-3xl font-bold text-blue-500">{stats.orders.monthRevenue.toLocaleString()} ₽</p>
                </div>
                <div className="bg-gray-800 rounded-xl p-6">
                  <p className="text-gray-400 text-sm">Средний чек</p>
                  <p className="text-3xl font-bold text-purple-500">{stats.customers.avgOrderValue} ₽</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="font-semibold mb-4">📦 Статусы заказов</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Новые</span>
                      <span className="text-blue-500 font-bold">{stats.orders.new}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>В работе</span>
                      <span className="text-orange-500 font-bold">{stats.orders.inProgress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Завершено</span>
                      <span className="text-green-500 font-bold">{stats.orders.completed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Отменено</span>
                      <span className="text-red-500 font-bold">{stats.orders.cancelled}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="font-semibold mb-4">⭐ Отзывы</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Средний рейтинг</span>
                      <span className="text-yellow-500 font-bold">⭐ {stats.reviews.avgRating}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>На модерации</span>
                      <span className="text-yellow-500 font-bold">{stats.reviews.pending}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Всего одобрено</span>
                      <span className="text-green-500 font-bold">{stats.reviews.approved}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="font-semibold mb-4">👥 Клиенты</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Всего клиентов</span>
                      <span className="font-bold">{stats.customers.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Общая выручка</span>
                      <span className="text-green-500 font-bold">{stats.customers.totalRevenue.toLocaleString()} ₽</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="font-semibold mb-4">🎉 Банкеты</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Новые заявки</span>
                      <span className="text-blue-500 font-bold">{stats.banquets.new}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Подтверждено</span>
                      <span className="text-green-500 font-bold">{stats.banquets.confirmed}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab === 'orders' && (
            <div className="flex gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-6">📦 Заказы</h2>
                
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`bg-gray-800 rounded-xl p-4 cursor-pointer transition hover:bg-gray-750 ${
                        selectedOrder?.id === order.id ? 'ring-2 ring-orange-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold">Заказ #{order.number}</span>
                        <span className={`px-2 py-1 rounded text-xs text-white ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{order.customer.name}</p>
                      <p className="text-sm text-gray-400">{order.customer.phone}</p>
                      <div className="flex justify-between mt-2">
                        <span className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleString('ru')}
                        </span>
                        <span className="font-bold text-orange-500">{order.total} ₽</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Details */}
              {selectedOrder && (
                <div className="w-96 bg-gray-800 rounded-xl p-6 h-fit sticky top-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">Заказ #{selectedOrder.number}</h3>
                    <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white">✕</button>
                  </div>

                  {/* Status Change */}
                  <div className="mb-4">
                    <label className="text-sm text-gray-400 block mb-2">Статус</label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleOrderStatusChange(selectedOrder.id, e.target.value as Order['status'])}
                      className="w-full bg-gray-700 rounded-lg px-3 py-2"
                    >
                      <option value="new">Новый</option>
                      <option value="confirmed">Подтверждён</option>
                      <option value="cooking">Готовится</option>
                      <option value="ready">Готов</option>
                      <option value="delivering">В доставке</option>
                      <option value="completed">Завершён</option>
                      <option value="cancelled">Отменён</option>
                    </select>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                    <p className="font-semibold">{selectedOrder.customer.name}</p>
                    <a href={`tel:${selectedOrder.customer.phone}`} className="text-orange-500">
                      {selectedOrder.customer.phone}
                    </a>
                    {selectedOrder.customer.address && (
                      <p className="text-sm text-gray-400 mt-1">📍 {selectedOrder.customer.address}</p>
                    )}
                    <p className="text-sm text-gray-400 mt-1">
                      {selectedOrder.deliveryType === 'delivery' ? '🚗 Доставка' : '🏪 Самовывоз'}
                    </p>
                  </div>

                  {/* Items */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Состав заказа:</p>
                    <div className="space-y-1">
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{item.name} × {item.quantity}</span>
                          <span>{item.price * item.quantity} ₽</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-600 mt-2 pt-2 flex justify-between font-bold">
                      <span>Итого:</span>
                      <span className="text-orange-500">{selectedOrder.total} ₽</span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-4">
                    <label className="text-sm text-gray-400 block mb-2">Заметки</label>
                    <textarea
                      value={selectedOrder.notes}
                      onChange={(e) => handleAddOrderNote(selectedOrder.id, e.target.value)}
                      className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm"
                      rows={2}
                      placeholder="Добавить заметку..."
                    />
                  </div>

                  {/* Messages */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Переписка с клиентом:</p>
                    <div className="bg-gray-700 rounded-lg p-3 max-h-40 overflow-y-auto mb-2">
                      {selectedOrder.messages.length === 0 ? (
                        <p className="text-sm text-gray-500">Нет сообщений</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedOrder.messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`text-sm p-2 rounded ${
                                msg.from === 'admin' ? 'bg-orange-500/20 ml-4' : 'bg-gray-600 mr-4'
                              }`}
                            >
                              <p>{msg.text}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString('ru')}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Сообщение клиенту..."
                        className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(selectedOrder.id)}
                      />
                      <button
                        onClick={() => handleSendMessage(selectedOrder.id)}
                        className="bg-orange-500 px-4 rounded-lg hover:bg-orange-600"
                      >
                        📤
                      </button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <a
                      href={`tel:${selectedOrder.customer.phone}`}
                      className="flex-1 bg-green-500 text-center py-2 rounded-lg hover:bg-green-600"
                    >
                      📞 Позвонить
                    </a>
                    <button
                      onClick={() => handleDeleteOrder(selectedOrder.id)}
                      className="bg-red-500 px-4 rounded-lg hover:bg-red-600"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reviews */}
          {activeTab === 'reviews' && (
            <div className="flex gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-6">⭐ Отзывы</h2>
                
                <div className="flex gap-2 mb-4">
                  {['all', 'pending', 'approved', 'rejected'].map((filter) => (
                    <button
                      key={filter}
                      className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                    >
                      {filter === 'all' ? 'Все' : statusLabels[filter]}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      onClick={() => {
                        setSelectedReview(review);
                        setEditingReviewText(review.text);
                      }}
                      className={`bg-gray-800 rounded-xl p-4 cursor-pointer transition hover:bg-gray-750 ${
                        selectedReview?.id === review.id ? 'ring-2 ring-orange-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{review.author}</span>
                          <span className="text-yellow-500">{'⭐'.repeat(review.rating)}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs text-white ${statusColors[review.status]}`}>
                          {statusLabels[review.status]}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{review.text}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(review.createdAt).toLocaleString('ru')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Details */}
              {selectedReview && (
                <div className="w-96 bg-gray-800 rounded-xl p-6 h-fit sticky top-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">Отзыв</h3>
                    <button onClick={() => setSelectedReview(null)} className="text-gray-400 hover:text-white">✕</button>
                  </div>

                  <div className="mb-4">
                    <p className="font-semibold">{selectedReview.author}</p>
                    <p className="text-sm text-gray-400">{selectedReview.phone}</p>
                    <p className="text-yellow-500">{'⭐'.repeat(selectedReview.rating)}</p>
                  </div>

                  <div className="mb-4">
                    <label className="text-sm text-gray-400 block mb-2">Текст отзыва (можно редактировать)</label>
                    <textarea
                      value={editingReviewText}
                      onChange={(e) => setEditingReviewText(e.target.value)}
                      className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm"
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => handleEditReview(selectedReview.id)}
                      className="flex-1 bg-blue-500 py-2 rounded-lg hover:bg-blue-600"
                    >
                      💾 Сохранить
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReviewAction(selectedReview.id, 'approve')}
                      className="flex-1 bg-green-500 py-2 rounded-lg hover:bg-green-600"
                    >
                      ✅ Одобрить
                    </button>
                    <button
                      onClick={() => handleReviewAction(selectedReview.id, 'reject')}
                      className="flex-1 bg-red-500 py-2 rounded-lg hover:bg-red-600"
                    >
                      ❌ Отклонить
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteReview(selectedReview.id)}
                    className="w-full mt-2 bg-gray-700 py-2 rounded-lg hover:bg-gray-600"
                  >
                    🗑️ Удалить
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Banquets */}
          {activeTab === 'banquets' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">🎉 Заявки на банкеты</h2>
              
              <div className="grid gap-4">
                {banquets.map((banquet) => (
                  <div key={banquet.id} className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{banquet.customer.name}</h3>
                        <a href={`tel:${banquet.customer.phone}`} className="text-orange-500">
                          {banquet.customer.phone}
                        </a>
                      </div>
                      <span className={`px-3 py-1 rounded text-sm text-white ${statusColors[banquet.status]}`}>
                        {statusLabels[banquet.status]}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-400">Дата</p>
                        <p className="font-semibold">{new Date(banquet.date).toLocaleDateString('ru')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Гостей</p>
                        <p className="font-semibold">{banquet.guests} чел.</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Пакет</p>
                        <p className="font-semibold capitalize">{banquet.package}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Сумма</p>
                        <p className="font-semibold text-orange-500">{banquet.total.toLocaleString()} ₽</p>
                      </div>
                    </div>

                    {banquet.extras.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-1">Доп. услуги:</p>
                        <div className="flex flex-wrap gap-2">
                          {banquet.extras.map((extra) => (
                            <span key={extra} className="bg-gray-700 px-2 py-1 rounded text-sm">
                              {extra}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <select
                        value={banquet.status}
                        onChange={(e) => handleBanquetStatusChange(banquet.id, e.target.value as BanquetRequest['status'])}
                        className="bg-gray-700 rounded-lg px-3 py-2"
                      >
                        <option value="new">Новая</option>
                        <option value="contacted">Связались</option>
                        <option value="confirmed">Подтверждено</option>
                        <option value="completed">Завершено</option>
                        <option value="cancelled">Отменено</option>
                      </select>
                      
                      <input
                        type="text"
                        placeholder="Добавить заметку..."
                        className="flex-1 bg-gray-700 rounded-lg px-3 py-2"
                        onBlur={(e) => handleBanquetNote(banquet.id, e.target.value)}
                        defaultValue={banquet.notes}
                      />

                      <a
                        href={`tel:${banquet.customer.phone}`}
                        className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600"
                      >
                        📞 Позвонить
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {activeTab === 'messages' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">💬 Сообщения</h2>
              
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="bg-gray-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold">{msg.name}</h3>
                        <a href={`tel:${msg.phone}`} className="text-orange-500 text-sm">
                          {msg.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs text-white ${statusColors[msg.status]}`}>
                          {statusLabels[msg.status]}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(msg.createdAt).toLocaleString('ru')}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-300 mb-4 p-3 bg-gray-700 rounded-lg">{msg.message}</p>

                    {msg.reply && (
                      <div className="mb-4 p-3 bg-orange-500/20 rounded-lg">
                        <p className="text-sm text-gray-400">Ваш ответ:</p>
                        <p>{msg.reply}</p>
                      </div>
                    )}

                    {msg.status !== 'replied' && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Написать ответ..."
                          className="flex-1 bg-gray-700 rounded-lg px-3 py-2"
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                        <button
                          onClick={() => handleMessageReply(msg.id)}
                          className="bg-orange-500 px-4 rounded-lg hover:bg-orange-600"
                        >
                          Ответить
                        </button>
                        {msg.status === 'new' && (
                          <button
                            onClick={() => handleMarkAsRead(msg.id)}
                            className="bg-gray-700 px-4 rounded-lg hover:bg-gray-600"
                          >
                            ✓ Прочитано
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers */}
          {activeTab === 'customers' && (
            <div className="flex gap-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-6">👥 База клиентов</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-400 border-b border-gray-700">
                        <th className="pb-3">Клиент</th>
                        <th className="pb-3">Телефон</th>
                        <th className="pb-3">Заказов</th>
                        <th className="pb-3">Потрачено</th>
                        <th className="pb-3">Баллы</th>
                        <th className="pb-3">Посл. заказ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr
                          key={customer.id}
                          onClick={() => setSelectedCustomer(customer)}
                          className={`border-b border-gray-800 cursor-pointer hover:bg-gray-800 ${
                            selectedCustomer?.id === customer.id ? 'bg-gray-800' : ''
                          }`}
                        >
                          <td className="py-3 font-semibold">{customer.name}</td>
                          <td className="py-3 text-orange-500">{customer.phone}</td>
                          <td className="py-3">{customer.ordersCount}</td>
                          <td className="py-3 text-green-500">{customer.totalSpent.toLocaleString()} ₽</td>
                          <td className="py-3 text-purple-500">{customer.loyaltyPoints}</td>
                          <td className="py-3 text-gray-400">
                            {new Date(customer.lastOrderDate).toLocaleDateString('ru')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Customer Details */}
              {selectedCustomer && (
                <div className="w-80 bg-gray-800 rounded-xl p-6 h-fit sticky top-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">Карточка клиента</h3>
                    <button onClick={() => setSelectedCustomer(null)} className="text-gray-400 hover:text-white">✕</button>
                  </div>

                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-2">
                      {selectedCustomer.name[0]}
                    </div>
                    <h4 className="font-bold text-lg">{selectedCustomer.name}</h4>
                    <a href={`tel:${selectedCustomer.phone}`} className="text-orange-500">
                      {selectedCustomer.phone}
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-green-500">{selectedCustomer.totalSpent.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">₽ потрачено</p>
                    </div>
                    <div className="text-center p-3 bg-gray-700 rounded-lg">
                      <p className="text-2xl font-bold text-purple-500">{selectedCustomer.loyaltyPoints}</p>
                      <p className="text-xs text-gray-400">баллов</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-1">Заказов: {selectedCustomer.ordersCount}</p>
                    <p className="text-sm text-gray-400">Клиент с: {new Date(selectedCustomer.createdAt).toLocaleDateString('ru')}</p>
                    {selectedCustomer.address && (
                      <p className="text-sm text-gray-400 mt-1">📍 {selectedCustomer.address}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="text-sm text-gray-400 block mb-2">Заметки о клиенте</label>
                    <textarea
                      className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm"
                      rows={3}
                      placeholder="Добавить заметку..."
                      defaultValue={selectedCustomer.notes}
                      onBlur={(e) => handleCustomerNote(selectedCustomer.id, e.target.value)}
                    />
                  </div>

                  <a
                    href={`tel:${selectedCustomer.phone}`}
                    className="block w-full bg-green-500 text-center py-2 rounded-lg hover:bg-green-600"
                  >
                    📞 Позвонить
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">⚙️ Настройки</h2>
              
              <div className="max-w-2xl space-y-6">
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="font-semibold mb-4">🤖 Telegram-бот</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Настройте бот для получения уведомлений о заказах
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Bot Token</label>
                      <input
                        type="text"
                        className="w-full bg-gray-700 rounded-lg px-3 py-2 mt-1"
                        placeholder="123456:ABC-DEF..."
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Chat ID</label>
                      <input
                        type="text"
                        className="w-full bg-gray-700 rounded-lg px-3 py-2 mt-1"
                        placeholder="-1001234567890"
                      />
                    </div>
                    <button className="bg-orange-500 px-4 py-2 rounded-lg hover:bg-orange-600">
                      Сохранить
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="font-semibold mb-4">🎁 Программа лояльности</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-400">Кэшбэк (%)</label>
                      <input
                        type="number"
                        className="w-full bg-gray-700 rounded-lg px-3 py-2 mt-1"
                        defaultValue="5"
                      />
                    </div>
                    <button className="bg-orange-500 px-4 py-2 rounded-lg hover:bg-orange-600">
                      Сохранить
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="font-semibold mb-4">📊 Экспорт данных</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const data = {
                          orders: getOrders(),
                          customers: getCustomers(),
                          reviews: getReviews(),
                        };
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `crm-export-${new Date().toISOString().split('T')[0]}.json`;
                        a.click();
                      }}
                      className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                      📥 Экспорт JSON
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
