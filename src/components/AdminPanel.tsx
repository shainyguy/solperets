import { useState, useEffect } from 'react';
import { 
  getPendingReviews, 
  getApprovedReviews, 
  approveReview, 
  rejectReview,
  SALES_FUNNELS,
  AUTO_MESSAGES,
  BOT_SETTINGS,
} from '../services/telegramBot';
import { DAILY_PROMO, menuItems, STATS } from '../data/menuData';

// ============================================
// АДМИН-ПАНЕЛЬ
// ============================================
// Доступ: добавьте ?admin=ваш_секретный_ключ к URL
// Пример: https://site.ru/?admin=secret123

const ADMIN_PASSWORD = 'solperecadmin2024'; // Измените на свой пароль!

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: any[];
  total: number;
  status: 'pending' | 'confirmed' | 'cooking' | 'delivery' | 'done' | 'cancelled';
  createdAt: number;
  deliveryType: 'delivery' | 'pickup';
  address?: string;
}

export default function AdminPanel() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'reviews' | 'menu' | 'funnels' | 'settings'>('dashboard');
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [approvedReviews, setApprovedReviews] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingReview, setEditingReview] = useState<any>(null);

  useEffect(() => {
    // Проверяем URL параметр
    const params = new URLSearchParams(window.location.search);
    const adminKey = params.get('admin');
    if (adminKey === ADMIN_PASSWORD) {
      setIsAuthorized(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized]);

  const loadData = () => {
    setPendingReviews(getPendingReviews());
    setApprovedReviews(getApprovedReviews());
    
    // Загружаем заказы из localStorage (демо)
    const savedOrders = localStorage.getItem('sol_perec_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthorized(true);
    } else {
      alert('Неверный пароль');
    }
  };

  const handleApproveReview = (reviewId: string) => {
    approveReview(reviewId);
    loadData();
  };

  const handleRejectReview = (reviewId: string) => {
    if (confirm('Отклонить этот отзыв?')) {
      rejectReview(reviewId);
      loadData();
    }
  };

  const handleEditReview = (review: any) => {
    setEditingReview({ ...review });
  };

  const handleSaveReview = () => {
    if (editingReview) {
      // Обновляем отзыв в pending
      const pending = getPendingReviews();
      const index = pending.findIndex((r: any) => r.id === editingReview.id);
      if (index !== -1) {
        pending[index] = editingReview;
        localStorage.setItem('sol_perec_pending_reviews', JSON.stringify(pending));
      }
      setEditingReview(null);
      loadData();
    }
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const updated = orders.map(o => 
      o.id === orderId ? { ...o, status } : o
    );
    setOrders(updated);
    localStorage.setItem('sol_perec_orders', JSON.stringify(updated));
  };

  // Форма входа
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-2xl max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            🔐 Админ-панель
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg mb-4"
          />
          <button
            type="submit"
            className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            Войти
          </button>
          <p className="text-gray-500 text-sm mt-4 text-center">
            Или используйте URL: ?admin=пароль
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            🍖 Соль и Перец — Админ-панель
          </h1>
          <button
            onClick={() => window.location.href = '/'}
            className="text-gray-400 hover:text-white transition"
          >
            ← На сайт
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 min-h-[calc(100vh-73px)] p-4">
          <nav className="space-y-2">
            {[
              { id: 'dashboard', icon: '📊', label: 'Дашборд' },
              { id: 'orders', icon: '📋', label: 'Заказы', badge: orders.filter(o => o.status === 'pending').length },
              { id: 'reviews', icon: '⭐', label: 'Отзывы', badge: pendingReviews.length },
              { id: 'menu', icon: '🍽️', label: 'Меню' },
              { id: 'funnels', icon: '📈', label: 'Воронки' },
              { id: 'settings', icon: '⚙️', label: 'Настройки' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition ${
                  activeTab === item.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span>{item.icon} {item.label}</span>
                {item.badge ? (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">📊 Дашборд</h2>
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="text-gray-400 text-sm">Заказов сегодня</div>
                  <div className="text-3xl font-bold text-orange-500">{STATS.ordersToday}</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="text-gray-400 text-sm">Всего клиентов</div>
                  <div className="text-3xl font-bold text-green-500">{STATS.happyClients.toLocaleString()}</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="text-gray-400 text-sm">Рейтинг</div>
                  <div className="text-3xl font-bold text-yellow-500">⭐ {STATS.avgRating}</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="text-gray-400 text-sm">Отзывов на модерации</div>
                  <div className="text-3xl font-bold text-blue-500">{pendingReviews.length}</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">⚡ Быстрые действия</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="bg-orange-500/20 text-orange-500 p-4 rounded-lg hover:bg-orange-500/30 transition">
                    📢 Создать рассылку
                  </button>
                  <button className="bg-green-500/20 text-green-500 p-4 rounded-lg hover:bg-green-500/30 transition">
                    🎁 Новая акция
                  </button>
                  <button className="bg-blue-500/20 text-blue-500 p-4 rounded-lg hover:bg-blue-500/30 transition">
                    🍽️ Добавить блюдо
                  </button>
                  <button className="bg-purple-500/20 text-purple-500 p-4 rounded-lg hover:bg-purple-500/30 transition">
                    📊 Выгрузить отчёт
                  </button>
                </div>
              </div>

              {/* Promo Status */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">🎁 Текущая акция</h3>
                <div className={`p-4 rounded-lg ${DAILY_PROMO.enabled ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{DAILY_PROMO.title}</div>
                      <div className="text-sm text-gray-400">{DAILY_PROMO.description}</div>
                      <div className="text-sm mt-1">Промокод: <code className="bg-gray-700 px-2 py-1 rounded">{DAILY_PROMO.promoCode}</code></div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm ${DAILY_PROMO.enabled ? 'bg-green-500' : 'bg-red-500'}`}>
                      {DAILY_PROMO.enabled ? 'Активна' : 'Выключена'}
                    </div>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  Редактируйте в файле: src/data/menuData.ts → DAILY_PROMO
                </p>
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">📋 Заказы</h2>
              
              {orders.length === 0 ? (
                <div className="bg-gray-800 rounded-xl p-12 text-center text-gray-400">
                  Заказов пока нет
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-gray-800 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="font-semibold">Заказ #{order.id}</div>
                          <div className="text-gray-400 text-sm">
                            {new Date(order.createdAt).toLocaleString('ru-RU')}
                          </div>
                        </div>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                          className="bg-gray-700 text-white px-3 py-2 rounded-lg"
                        >
                          <option value="pending">⏳ Ожидает</option>
                          <option value="confirmed">✅ Подтверждён</option>
                          <option value="cooking">👨‍🍳 Готовится</option>
                          <option value="delivery">🚗 В пути</option>
                          <option value="done">✅ Выполнен</option>
                          <option value="cancelled">❌ Отменён</option>
                        </select>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-gray-400 text-sm">Клиент</div>
                          <div>{order.customerName}</div>
                          <div>{order.customerPhone}</div>
                          {order.address && <div className="text-sm text-gray-400">{order.address}</div>}
                        </div>
                        <div>
                          <div className="text-gray-400 text-sm">Заказ</div>
                          {order.items.map((item: any, i: number) => (
                            <div key={i}>{item.name} x{item.quantity}</div>
                          ))}
                          <div className="font-bold text-orange-500 mt-2">{order.total}₽</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">⭐ Модерация отзывов</h2>
              
              {/* Pending */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-yellow-500">
                  ⏳ На модерации ({pendingReviews.length})
                </h3>
                
                {pendingReviews.length === 0 ? (
                  <div className="bg-gray-800 rounded-xl p-8 text-center text-gray-400">
                    Нет отзывов на модерации
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingReviews.map((review) => (
                      <div key={review.id} className="bg-gray-800 rounded-xl p-6">
                        {editingReview?.id === review.id ? (
                          // Edit mode
                          <div className="space-y-4">
                            <input
                              type="text"
                              value={editingReview.name}
                              onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value })}
                              className="w-full px-4 py-2 bg-gray-700 rounded-lg"
                              placeholder="Имя"
                            />
                            <textarea
                              value={editingReview.text}
                              onChange={(e) => setEditingReview({ ...editingReview, text: e.target.value })}
                              className="w-full px-4 py-2 bg-gray-700 rounded-lg resize-none"
                              rows={3}
                              placeholder="Текст отзыва"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveReview}
                                className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition"
                              >
                                Сохранить
                              </button>
                              <button
                                onClick={() => setEditingReview(null)}
                                className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition"
                              >
                                Отмена
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View mode
                          <>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="font-semibold">{review.name}</div>
                                <div className="text-yellow-500">{'⭐'.repeat(review.rating)}</div>
                              </div>
                              <div className="text-gray-500 text-sm">
                                {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                              </div>
                            </div>
                            <p className="text-gray-300 mb-4">{review.text}</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveReview(review.id)}
                                className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition"
                              >
                                ✅ Одобрить
                              </button>
                              <button
                                onClick={() => handleEditReview(review)}
                                className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
                              >
                                ✏️ Редактировать
                              </button>
                              <button
                                onClick={() => handleRejectReview(review.id)}
                                className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition"
                              >
                                ❌ Отклонить
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Approved */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-green-500">
                  ✅ Одобренные ({approvedReviews.length})
                </h3>
                
                <div className="space-y-4">
                  {approvedReviews.slice(0, 10).map((review) => (
                    <div key={review.id} className="bg-gray-800 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold">{review.name}</span>
                          <span className="text-yellow-500 ml-2">{'⭐'.repeat(review.rating)}</span>
                        </div>
                        <span className="text-green-500 text-sm">Опубликован</span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1 truncate">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Menu */}
          {activeTab === 'menu' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">🍽️ Управление меню</h2>
              
              <div className="bg-gray-800 rounded-xl p-6">
                <p className="text-gray-400 mb-4">
                  Всего позиций в меню: <span className="text-white font-bold">{menuItems.length}</span>
                </p>
                
                <div className="bg-yellow-500/20 text-yellow-500 p-4 rounded-lg mb-6">
                  <p className="font-semibold">📝 Как редактировать меню:</p>
                  <p className="text-sm mt-1">
                    Откройте файл <code className="bg-gray-700 px-2 py-1 rounded">src/data/menuData.ts</code> 
                    и измените массив <code className="bg-gray-700 px-2 py-1 rounded">menuItems</code>
                  </p>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {menuItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-sm text-gray-400">{item.category}</div>
                        </div>
                      </div>
                      <div className="text-orange-500 font-bold">{item.price}₽</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Funnels */}
          {activeTab === 'funnels' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">📈 Воронки продаж</h2>
              
              {/* Auto Messages */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">🤖 Автоматические сообщения</h3>
                <div className="space-y-3">
                  {AUTO_MESSAGES.map((msg) => (
                    <div key={msg.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div>
                        <div className="font-semibold capitalize">{msg.trigger.replace(/_/g, ' ')}</div>
                        <div className="text-sm text-gray-400 truncate max-w-md">{msg.message.slice(0, 60)}...</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm ${msg.enabled ? 'bg-green-500' : 'bg-gray-600'}`}>
                        {msg.enabled ? 'Вкл' : 'Выкл'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sales Funnels */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">🎯 Воронки продаж</h3>
                <div className="space-y-6">
                  {SALES_FUNNELS.map((funnel, index) => (
                    <div key={index}>
                      <h4 className="font-semibold text-orange-500 mb-3">
                        Воронка {index + 1}: {funnel[0].condition === 'cart_abandoned' ? 'Брошенная корзина' : 'После заказа'}
                      </h4>
                      <div className="space-y-2">
                        {funnel.map((step, stepIndex) => (
                          <div key={step.id} className="flex items-center gap-4 p-3 bg-gray-700 rounded-lg">
                            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
                              {stepIndex + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold">{step.name}</div>
                              <div className="text-sm text-gray-400">
                                Через {step.delay < 60 ? `${step.delay} мин` : `${Math.round(step.delay / 60)} ч`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <p className="text-gray-500 text-sm mt-4">
                  Редактируйте воронки в файле: src/services/telegramBot.ts → SALES_FUNNELS
                </p>
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">⚙️ Настройки</h2>
              
              {/* Telegram Settings */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">📱 Telegram интеграция</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Bot Token</label>
                    <input
                      type="text"
                      value={BOT_SETTINGS.BOT_TOKEN}
                      readOnly
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Chat ID для заказов</label>
                    <input
                      type="text"
                      value={BOT_SETTINGS.CHAT_ID}
                      readOnly
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Admin IDs</label>
                    <input
                      type="text"
                      value={BOT_SETTINGS.ADMIN_IDS.join(', ')}
                      readOnly
                      className="w-full px-4 py-2 bg-gray-700 rounded-lg text-gray-400"
                    />
                  </div>
                </div>

                <div className="bg-blue-500/20 text-blue-400 p-4 rounded-lg mt-4">
                  <p className="font-semibold">📝 Как настроить:</p>
                  <ol className="text-sm mt-2 space-y-1 list-decimal list-inside">
                    <li>Создайте бота через @BotFather</li>
                    <li>Получите токен бота</li>
                    <li>Узнайте свой chat_id через @userinfobot</li>
                    <li>Укажите данные в src/data/menuData.ts и src/services/telegramBot.ts</li>
                  </ol>
                </div>
              </div>

              {/* Bot Commands */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">🤖 Команды для бота</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Добавьте эти команды в вашего бота через @BotFather → /setcommands
                </p>
                <pre className="bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
{`start - Главное меню
orders - Список заказов
reviews - Отзывы на модерацию
stats - Статистика
broadcast - Рассылка
promo - Управление акциями
menu - Редактировать меню
settings - Настройки`}
                </pre>
              </div>

              {/* Password */}
              <div className="bg-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">🔐 Безопасность</h3>
                <div className="bg-red-500/20 text-red-400 p-4 rounded-lg">
                  <p className="font-semibold">⚠️ Важно!</p>
                  <p className="text-sm mt-1">
                    Измените пароль админки в файле src/components/AdminPanel.tsx → ADMIN_PASSWORD
                  </p>
                  <p className="text-sm mt-1">
                    Текущий пароль: <code className="bg-gray-700 px-2 py-1 rounded">solperecadmin2024</code>
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
