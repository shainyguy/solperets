// CRM Service - управление данными
// Использует localStorage, в продакшене подключить к базе данных

export interface Order {
  id: string;
  number: number;
  customer: {
    name: string;
    phone: string;
    address?: string;
  };
  items: Array<{
    id: number | string;
    name: string;
    price: number;
    quantity: number;
  }>;
  deliveryType: 'delivery' | 'pickup';
  paymentMethod: string;
  total: number;
  status: 'new' | 'confirmed' | 'cooking' | 'ready' | 'delivering' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  notes: string;
  messages: Array<{
    id: string;
    text: string;
    from: 'admin' | 'customer';
    timestamp: string;
  }>;
}

export interface Review {
  id: string;
  author: string;
  phone: string;
  rating: number;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  adminComment?: string;
}

export interface BanquetRequest {
  id: string;
  customer: {
    name: string;
    phone: string;
  };
  date: string;
  guests: number;
  package: string;
  extras: string[];
  total: number;
  status: 'new' | 'contacted' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  notes: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
  reply?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  ordersCount: number;
  totalSpent: number;
  loyaltyPoints: number;
  lastOrderDate: string;
  createdAt: string;
  notes: string;
}

// Генерация ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// ================== ORDERS ==================

export const getOrders = (): Order[] => {
  const data = localStorage.getItem('crm_orders');
  return data ? JSON.parse(data) : [];
};

export const saveOrders = (orders: Order[]) => {
  localStorage.setItem('crm_orders', JSON.stringify(orders));
};

export const addOrder = (orderData: Omit<Order, 'id' | 'number' | 'status' | 'createdAt' | 'updatedAt' | 'messages'>): Order => {
  const orders = getOrders();
  const newOrder: Order = {
    ...orderData,
    id: generateId(),
    number: orders.length + 1001,
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
  };
  orders.unshift(newOrder);
  saveOrders(orders);
  return newOrder;
};

export const updateOrderStatus = (orderId: string, status: Order['status']): Order | null => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index === -1) return null;
  
  orders[index].status = status;
  orders[index].updatedAt = new Date().toISOString();
  saveOrders(orders);
  return orders[index];
};

export const addOrderNote = (orderId: string, note: string): Order | null => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index === -1) return null;
  
  orders[index].notes = note;
  orders[index].updatedAt = new Date().toISOString();
  saveOrders(orders);
  return orders[index];
};

export const addOrderMessage = (orderId: string, text: string, from: 'admin' | 'customer'): Order | null => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index === -1) return null;
  
  orders[index].messages.push({
    id: generateId(),
    text,
    from,
    timestamp: new Date().toISOString(),
  });
  orders[index].updatedAt = new Date().toISOString();
  saveOrders(orders);
  return orders[index];
};

export const deleteOrder = (orderId: string): boolean => {
  const orders = getOrders();
  const filtered = orders.filter(o => o.id !== orderId);
  if (filtered.length === orders.length) return false;
  saveOrders(filtered);
  return true;
};

// ================== REVIEWS ==================

export const getReviews = (): Review[] => {
  const data = localStorage.getItem('crm_reviews');
  return data ? JSON.parse(data) : [];
};

export const saveReviews = (reviews: Review[]) => {
  localStorage.setItem('crm_reviews', JSON.stringify(reviews));
};

export const addReview = (reviewData: { author: string; phone: string; rating: number; text: string }): Review => {
  const reviews = getReviews();
  const newReview: Review = {
    ...reviewData,
    id: generateId(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  reviews.unshift(newReview);
  saveReviews(reviews);
  return newReview;
};

export const updateReviewStatus = (reviewId: string, status: Review['status'], adminComment?: string): Review | null => {
  const reviews = getReviews();
  const index = reviews.findIndex(r => r.id === reviewId);
  if (index === -1) return null;
  
  reviews[index].status = status;
  if (adminComment) reviews[index].adminComment = adminComment;
  saveReviews(reviews);
  return reviews[index];
};

export const editReview = (reviewId: string, text: string): Review | null => {
  const reviews = getReviews();
  const index = reviews.findIndex(r => r.id === reviewId);
  if (index === -1) return null;
  
  reviews[index].text = text;
  saveReviews(reviews);
  return reviews[index];
};

export const deleteReview = (reviewId: string): boolean => {
  const reviews = getReviews();
  const filtered = reviews.filter(r => r.id !== reviewId);
  if (filtered.length === reviews.length) return false;
  saveReviews(filtered);
  return true;
};

export const getApprovedReviews = (): Review[] => {
  return getReviews().filter(r => r.status === 'approved');
};

// ================== BANQUETS ==================

export const getBanquets = (): BanquetRequest[] => {
  const data = localStorage.getItem('crm_banquets');
  return data ? JSON.parse(data) : [];
};

export const saveBanquets = (banquets: BanquetRequest[]) => {
  localStorage.setItem('crm_banquets', JSON.stringify(banquets));
};

export const addBanquet = (banquetData: Omit<BanquetRequest, 'id' | 'status' | 'createdAt' | 'notes'>): BanquetRequest => {
  const banquets = getBanquets();
  const newBanquet: BanquetRequest = {
    ...banquetData,
    id: generateId(),
    status: 'new',
    createdAt: new Date().toISOString(),
    notes: '',
  };
  banquets.unshift(newBanquet);
  saveBanquets(banquets);
  return newBanquet;
};

export const updateBanquetStatus = (banquetId: string, status: BanquetRequest['status']): BanquetRequest | null => {
  const banquets = getBanquets();
  const index = banquets.findIndex(b => b.id === banquetId);
  if (index === -1) return null;
  
  banquets[index].status = status;
  saveBanquets(banquets);
  return banquets[index];
};

export const addBanquetNote = (banquetId: string, note: string): BanquetRequest | null => {
  const banquets = getBanquets();
  const index = banquets.findIndex(b => b.id === banquetId);
  if (index === -1) return null;
  
  banquets[index].notes = note;
  saveBanquets(banquets);
  return banquets[index];
};

// ================== MESSAGES ==================

export const getMessages = (): ContactMessage[] => {
  const data = localStorage.getItem('crm_messages');
  return data ? JSON.parse(data) : [];
};

export const saveMessages = (messages: ContactMessage[]) => {
  localStorage.setItem('crm_messages', JSON.stringify(messages));
};

export const addMessage = (messageData: { name: string; phone: string; message: string }): ContactMessage => {
  const messages = getMessages();
  const newMessage: ContactMessage = {
    ...messageData,
    id: generateId(),
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  messages.unshift(newMessage);
  saveMessages(messages);
  return newMessage;
};

export const updateMessageStatus = (messageId: string, status: ContactMessage['status'], reply?: string): ContactMessage | null => {
  const messages = getMessages();
  const index = messages.findIndex(m => m.id === messageId);
  if (index === -1) return null;
  
  messages[index].status = status;
  if (reply) messages[index].reply = reply;
  saveMessages(messages);
  return messages[index];
};

// ================== CUSTOMERS ==================

export const getCustomers = (): Customer[] => {
  const data = localStorage.getItem('crm_customers');
  return data ? JSON.parse(data) : [];
};

export const saveCustomers = (customers: Customer[]) => {
  localStorage.setItem('crm_customers', JSON.stringify(customers));
};

export const addOrUpdateCustomer = (phone: string, name: string, orderTotal: number, address?: string): Customer => {
  const customers = getCustomers();
  const existingIndex = customers.findIndex(c => c.phone === phone);
  
  if (existingIndex !== -1) {
    customers[existingIndex].ordersCount += 1;
    customers[existingIndex].totalSpent += orderTotal;
    customers[existingIndex].loyaltyPoints += Math.floor(orderTotal * 0.05);
    customers[existingIndex].lastOrderDate = new Date().toISOString();
    if (address) customers[existingIndex].address = address;
    if (name) customers[existingIndex].name = name;
    saveCustomers(customers);
    return customers[existingIndex];
  }
  
  const newCustomer: Customer = {
    id: generateId(),
    name,
    phone,
    address,
    ordersCount: 1,
    totalSpent: orderTotal,
    loyaltyPoints: Math.floor(orderTotal * 0.05),
    lastOrderDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    notes: '',
  };
  customers.unshift(newCustomer);
  saveCustomers(customers);
  return newCustomer;
};

export const updateCustomerNotes = (customerId: string, notes: string): Customer | null => {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === customerId);
  if (index === -1) return null;
  
  customers[index].notes = notes;
  saveCustomers(customers);
  return customers[index];
};

export const addLoyaltyPoints = (phone: string, points: number): Customer | null => {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.phone === phone);
  if (index === -1) return null;
  
  customers[index].loyaltyPoints += points;
  saveCustomers(customers);
  return customers[index];
};

// ================== STATISTICS ==================

export const getStatistics = () => {
  const orders = getOrders();
  const reviews = getReviews();
  const customers = getCustomers();
  const banquets = getBanquets();
  const messages = getMessages();
  
  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
  
  const thisMonth = new Date().getMonth();
  const monthOrders = orders.filter(o => new Date(o.createdAt).getMonth() === thisMonth);
  
  return {
    orders: {
      total: orders.length,
      new: orders.filter(o => o.status === 'new').length,
      inProgress: orders.filter(o => ['confirmed', 'cooking', 'ready', 'delivering'].includes(o.status)).length,
      completed: orders.filter(o => o.status === 'completed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      today: todayOrders.length,
      todayRevenue: todayOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0),
      monthRevenue: monthOrders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0),
    },
    reviews: {
      total: reviews.length,
      pending: reviews.filter(r => r.status === 'pending').length,
      approved: reviews.filter(r => r.status === 'approved').length,
      avgRating: reviews.length > 0 
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '0',
    },
    customers: {
      total: customers.length,
      totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
      avgOrderValue: customers.length > 0
        ? Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.reduce((sum, c) => sum + c.ordersCount, 0))
        : 0,
    },
    banquets: {
      total: banquets.length,
      new: banquets.filter(b => b.status === 'new').length,
      confirmed: banquets.filter(b => b.status === 'confirmed').length,
    },
    messages: {
      total: messages.length,
      new: messages.filter(m => m.status === 'new').length,
    },
  };
};

// ================== DEMO DATA ==================

export const initDemoData = () => {
  // Добавляем демо-данные только если база пустая
  if (getOrders().length === 0) {
    const demoOrders: Order[] = [
      {
        id: 'demo1',
        number: 1001,
        customer: { name: 'Александр Петров', phone: '+7 (999) 123-45-67', address: 'ул. Ленина, д. 15, кв. 42' },
        items: [
          { id: 1, name: 'Шашлык из свинины', price: 450, quantity: 2 },
          { id: 5, name: 'Лимонад домашний', price: 150, quantity: 2 },
        ],
        deliveryType: 'delivery',
        paymentMethod: 'card',
        total: 1200,
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: '',
        messages: [],
      },
      {
        id: 'demo2',
        number: 1002,
        customer: { name: 'Мария Иванова', phone: '+7 (999) 987-65-43' },
        items: [
          { id: 2, name: 'Люля-кебаб', price: 380, quantity: 3 },
          { id: 4, name: 'Салат Цезарь', price: 320, quantity: 1 },
        ],
        deliveryType: 'pickup',
        paymentMethod: 'cash',
        total: 1460,
        status: 'cooking',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
        notes: 'Постоянный клиент',
        messages: [
          { id: 'm1', text: 'Когда будет готов заказ?', from: 'customer', timestamp: new Date(Date.now() - 1800000).toISOString() },
          { id: 'm2', text: 'Через 15 минут будет готов!', from: 'admin', timestamp: new Date(Date.now() - 1200000).toISOString() },
        ],
      },
    ];
    saveOrders(demoOrders);
  }
  
  if (getReviews().length === 0) {
    const demoReviews: Review[] = [
      {
        id: 'rev1',
        author: 'Дмитрий К.',
        phone: '+7 (999) 111-22-33',
        rating: 5,
        text: 'Отличный шашлык! Приезжаем всей семьёй каждые выходные.',
        status: 'approved',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'rev2',
        author: 'Елена М.',
        phone: '+7 (999) 444-55-66',
        rating: 4,
        text: 'Вкусно, но долго ждали. В остальном всё супер!',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ];
    saveReviews(demoReviews);
  }
  
  if (getCustomers().length === 0) {
    const demoCustomers: Customer[] = [
      {
        id: 'cust1',
        name: 'Александр Петров',
        phone: '+7 (999) 123-45-67',
        address: 'ул. Ленина, д. 15, кв. 42',
        ordersCount: 5,
        totalSpent: 8500,
        loyaltyPoints: 425,
        lastOrderDate: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        notes: 'VIP клиент',
      },
      {
        id: 'cust2',
        name: 'Мария Иванова',
        phone: '+7 (999) 987-65-43',
        ordersCount: 12,
        totalSpent: 18900,
        loyaltyPoints: 945,
        lastOrderDate: new Date(Date.now() - 3600000).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
        notes: 'Постоянный клиент, любит люля-кебаб',
      },
    ];
    saveCustomers(demoCustomers);
  }
  
  if (getBanquets().length === 0) {
    const demoBanquets: BanquetRequest[] = [
      {
        id: 'banq1',
        customer: { name: 'Сергей Николаев', phone: '+7 (999) 777-88-99' },
        date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
        guests: 25,
        package: 'standard',
        extras: ['dj', 'photo'],
        total: 62500,
        status: 'new',
        createdAt: new Date().toISOString(),
        notes: '',
      },
    ];
    saveBanquets(demoBanquets);
  }
  
  if (getMessages().length === 0) {
    const demoMessages: ContactMessage[] = [
      {
        id: 'msg1',
        name: 'Ольга',
        phone: '+7 (999) 333-22-11',
        message: 'Здравствуйте! Можно ли заказать торт на день рождения?',
        status: 'new',
        createdAt: new Date().toISOString(),
      },
    ];
    saveMessages(demoMessages);
  }
};
