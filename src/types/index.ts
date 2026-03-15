export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  // Замените на реальные URL изображений
  image: string;
  category: MenuCategory;
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
}

export interface OrderData {
  items: CartItem[];
  total: number;
  customerName: string;
  phone: string;
  address: string;
  comment?: string;
  deliveryType: 'delivery' | 'pickup';
}
