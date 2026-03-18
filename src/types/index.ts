// Типы для меню
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  weight: string;
  image: string;
  category: string;
  isHit?: boolean;
  isNew?: boolean;
  isAlcohol?: boolean;
  isSpicy?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// Типы для корзины
export interface CartItem extends MenuItem {
  quantity: number;
}

// Типы для заказа
export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customer: {
    name: string;
    phone: string;
    address?: string;
  };
  deliveryType: 'delivery' | 'pickup';
  paymentMethod: 'cash' | 'card' | 'online';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'completed';
  createdAt: string;
}

// Типы для отзывов
export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
  status?: 'pending' | 'approved' | 'rejected';
}

// Типы для банкетов
export interface BanquetPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  includes: string[];
  color: string;
}

export interface BanquetExtra {
  id: string;
  name: string;
  price: number;
  unit: string;
}
