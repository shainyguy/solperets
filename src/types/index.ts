export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: MenuCategory;
  isHit?: boolean;
  isNew?: boolean;
  isSpicy?: boolean;
  isAlcohol?: boolean; // 18+ товар, нельзя доставлять
  weight?: string;
}

export type MenuCategory = 'shashlik' | 'grill' | 'salads' | 'drinks' | 'desserts' | 'bar';

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Review {
  id: string;
  name: string;
  text: string;
  rating: number;
  date: string;
  avatar?: string;
}

export interface OrderData {
  items: CartItem[];
  total: number;
  customerName: string;
  phone: string;
  address: string;
  comment?: string;
  deliveryType: 'delivery' | 'pickup';
  paymentMethod: 'cash' | 'card' | 'online';
}

export interface YooKassaPayment {
  id: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  amount: {
    value: string;
    currency: string;
  };
  confirmation?: {
    type: string;
    confirmation_url: string;
  };
}

export interface Stats {
  ordersToday: number;
  happyClients: number;
  yearsWorking: number;
  avgRating: number;
}

// Настраиваемая акция дня
export interface DailyPromo {
  id: string;
  enabled: boolean; // Включить/выключить акцию
  title: string;
  description: string;
  discount: number;
  // Время работы акции
  schedule: {
    type: 'always' | 'daily' | 'custom';
    startTime?: string; // "11:00"
    endTime?: string; // "23:00"
    startDate?: string; // "2024-01-01"
    endDate?: string; // "2024-12-31"
    daysOfWeek?: number[]; // [1,2,3,4,5] - пн-пт
  };
  itemIds?: string[]; // Товары, на которые действует акция
  promoCode?: string; // Промокод
  bannerImage?: string;
}

export interface Booking {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  comment?: string;
  eventType: 'birthday' | 'corporate' | 'wedding' | 'other';
}

// Программа лояльности
export interface LoyaltyProgram {
  enabled: boolean;
  pointsPerRuble: number; // Баллов за 1 рубль
  rublePerPoint: number; // Рублей за 1 балл при списании
  levels: LoyaltyLevel[];
  bonuses: LoyaltyBonus[];
}

export interface LoyaltyLevel {
  name: string;
  minPoints: number;
  cashbackPercent: number;
  icon: string;
}

export interface LoyaltyBonus {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'freeItem' | 'upgrade';
  value: number | string;
}

export interface LoyaltyUser {
  oderId: string;
  odername: string;
  phone: string;
  points: number;
  totalSpent: number;
  level: string;
  ordersCount: number;
  registeredAt: string;
}

// Калькулятор банкета
export interface BanquetPackage {
  id: string;
  name: string;
  description: string;
  pricePerPerson: number;
  minGuests: number;
  includes: string[];
  image: string;
  isPopular?: boolean;
}

export interface BanquetCalculation {
  package: BanquetPackage;
  guests: number;
  duration: number;
  extras: BanquetExtra[];
  totalPrice: number;
}

export interface BanquetExtra {
  id: string;
  name: string;
  price: number;
  priceType: 'fixed' | 'perPerson' | 'perHour';
  selected?: boolean;
}

// Трекинг заказа
export type OrderStatus = 
  | 'pending'      // Ожидает подтверждения
  | 'confirmed'    // Подтверждён
  | 'preparing'    // Готовится
  | 'ready'        // Готов
  | 'delivering'   // В пути (для доставки)
  | 'delivered'    // Доставлен
  | 'completed'    // Завершён
  | 'cancelled';   // Отменён

export interface OrderTracking {
  orderId: string;
  status: OrderStatus;
  statusHistory: OrderStatusEvent[];
  estimatedTime?: string;
  courierName?: string;
  courierPhone?: string;
  currentLocation?: {
    lat: number;
    lng: number;
  };
}

export interface OrderStatusEvent {
  status: OrderStatus;
  timestamp: string;
  message: string;
}

export interface TrackedOrder {
  id: string;
  orderNumber: string;
  items: CartItem[];
  total: number;
  customerName: string;
  phone: string;
  address?: string;
  deliveryType: 'delivery' | 'pickup';
  paymentMethod: string;
  tracking: OrderTracking;
  createdAt: string;
}
