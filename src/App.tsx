import { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import { menuItems, menuCategories, barItems, barCategories, CONTACT_INFO, LEGAL_INFO, DAILY_PROMO, STATS, advantages, galleryImages, newsItems, initialReviews, eventServices, BANQUET_PACKAGES, BANQUET_EXTRAS, TELEGRAM_CONFIG, DELIVERY_CONFIG } from './data/menuData';

// ========================================
// TYPES
// ========================================

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  weight: string;
  image: string;
  isAlcohol?: boolean;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: any) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

// ========================================
// CART CONTEXT
// ========================================

const CartContext = createContext<CartContextType | null>(null);

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addItem = useCallback((item: any) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, weight: item.weight, image: item.image, isAlcohol: item.isAlcohol }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, quantity } : i));
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
}

// ========================================
// TELEGRAM SERVICE
// ========================================

async function sendToTelegram(message: string) {
  if (TELEGRAM_CONFIG.BOT_TOKEN === 'ВАШ_ТОКЕН_БОТА') {
    console.log('Telegram message:', message);
    return true;
  }
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CONFIG.CHAT_ID, text: message, parse_mode: 'HTML' }),
    });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

// ========================================
// HEADER
// ========================================

function Header({ onNavigate, currentPage }: { onNavigate: (page: string) => void; currentPage: string }) {
  const { itemCount, setIsCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const phoneLink = CONTACT_INFO.phone.replace(/[^\d+]/g, '');

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || currentPage !== 'home' ? 'bg-white shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <button onClick={() => onNavigate('home')} className={`text-2xl font-bold ${isScrolled || currentPage !== 'home' ? 'text-gray-900' : 'text-white'}`}>
          <span className="text-orange-500">Соль</span> & Перец
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {[
            { href: 'menu', label: 'Меню' },
            { href: 'about', label: 'О нас' },
            { href: 'events', label: 'Банкеты' },
            { href: 'reviews', label: 'Отзывы' },
            { href: 'contacts', label: 'Контакты' },
          ].map((item) => (
            <a key={item.href} href={`#${item.href}`} onClick={(e) => { if (currentPage !== 'home') { e.preventDefault(); onNavigate('home'); setTimeout(() => document.getElementById(item.href)?.scrollIntoView({ behavior: 'smooth' }), 100); }}}
              className={`font-medium hover:text-orange-500 transition-colors ${isScrolled || currentPage !== 'home' ? 'text-gray-700' : 'text-white'}`}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <a href={`tel:${phoneLink}`} className={`hidden md:flex items-center gap-2 font-medium ${isScrolled || currentPage !== 'home' ? 'text-gray-700' : 'text-white'}`}>
            <span>📞</span> {CONTACT_INFO.phone}
          </a>
          <button onClick={() => setIsCartOpen(true)} className="relative w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors">
            🛒
            {itemCount > 0 && <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{itemCount}</span>}
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden w-10 h-10 flex items-center justify-center">
            <span className={`text-2xl ${isScrolled || currentPage !== 'home' ? 'text-gray-900' : 'text-white'}`}>{isMobileMenuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <nav className="flex flex-col p-4">
            {['Меню', 'О нас', 'Банкеты', 'Отзывы', 'Контакты'].map((label) => (
              <a key={label} href={`#${label.toLowerCase()}`} onClick={() => setIsMobileMenuOpen(false)} className="py-3 text-gray-700 font-medium border-b">{label}</a>
            ))}
            <a href={`tel:${phoneLink}`} className="py-3 text-orange-500 font-bold">📞 {CONTACT_INFO.phone}</a>
          </nav>
        </div>
      )}
    </header>
  );
}

// ========================================
// HERO
// ========================================

function Hero({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [promoTimeLeft, setPromoTimeLeft] = useState('');

  useEffect(() => {
    setIsVisible(true);
    if (DAILY_PROMO.enabled) {
      const updateTimer = () => {
        const now = new Date();
        const end = new Date(now);
        end.setHours(23, 0, 0, 0);
        const diff = end.getTime() - now.getTime();
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setPromoTimeLeft(`${hours}ч ${minutes}м`);
        }
      };
      updateTimer();
      const interval = setInterval(updateTimer, 60000);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920" alt="Шашлык" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
        {DAILY_PROMO.enabled && (
          <div className={`mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3 rounded-full text-sm font-medium shadow-lg">
              <span className="animate-pulse">🔥</span>
              <span>{DAILY_PROMO.title} — скидка {DAILY_PROMO.discount}%</span>
              {promoTimeLeft && <span className="bg-white/20 px-3 py-1 rounded-full text-xs">{promoTimeLeft}</span>}
            </div>
          </div>
        )}

        <h1 className={`text-5xl md:text-7xl lg:text-8xl font-bold mb-6 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="text-orange-500">Соль</span> & <span className="text-white">Перец</span>
        </h1>

        <p className={`text-xl md:text-2xl text-gray-200 mb-4 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          Настоящий шашлык и гриль рядом с МЦД Сходня
        </p>

        <p className={`text-lg text-green-400 font-medium mb-8 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          🚚 Бесплатная доставка по Сходне
        </p>

        <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <button onClick={() => onNavigate('menu')} className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-full hover:shadow-lg hover:shadow-orange-500/30 transition-all hover:scale-105">
            Смотреть меню
          </button>
          <a href="#events" className="px-8 py-4 bg-white/10 backdrop-blur text-white font-bold rounded-full border border-white/30 hover:bg-white/20 transition-all">
            Забронировать стол
          </a>
        </div>

        {newsItems.length > 0 && (
          <div className={`flex flex-wrap justify-center gap-3 mb-12 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {newsItems.map((news) => (
              <div key={news.id} className="bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm flex items-center gap-2">
                <span>{news.icon}</span>
                <span>{news.title}</span>
                {news.isNew && <span className="bg-green-500 text-xs px-2 py-0.5 rounded-full">Скоро</span>}
              </div>
            ))}
          </div>
        )}

        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {[
            { value: `${STATS.years}+`, label: 'Лет работы' },
            { value: `${(STATS.clients / 1000).toFixed(0)}K+`, label: 'Гостей' },
            { value: STATS.rating, label: 'Рейтинг' },
            { value: `${STATS.dishes}+`, label: 'Блюд' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange-500">{stat.value}</div>
              <div className="text-gray-300 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <a href="#menu" className="text-white/70 hover:text-white">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </a>
      </div>
    </section>
  );
}

// ========================================
// MENU SECTION (HOME PAGE)
// ========================================

function MenuSection({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [activeCategory, setActiveCategory] = useState('mangal');
  const { addItem } = useCart();

  const filteredItems = menuItems.filter(item => item.category === activeCategory);
  const activeCateg = menuCategories.find(c => c.id === activeCategory);

  return (
    <section id="menu" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Наше <span className="text-orange-500">меню</span></h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">Более 170 блюд кавказской и европейской кухни</p>
          <button onClick={() => onNavigate('menu')} className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-colors">
            Смотреть полное меню →
          </button>
        </div>

        <div className="flex overflow-x-auto pb-4 mb-8 gap-3 scrollbar-hide">
          {menuCategories.slice(0, 8).map((category) => (
            <button key={category.id} onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap transition-all ${activeCategory === category.id ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-orange-100'}`}>
              <span>{category.icon}</span>
              <span className="font-medium">{category.name}</span>
            </button>
          ))}
        </div>

        {activeCateg && <p className="text-center text-gray-600 mb-8">{activeCateg.description}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.slice(0, 8).map((item) => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
              <div className="relative aspect-square overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                {item.isHit && <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">ХИТ</span>}
                {item.isNew && <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">NEW</span>}
                {item.isSpicy && <span className="absolute top-3 right-3 text-2xl">🌶️</span>}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                <p className="text-gray-500 text-sm mb-3">{item.weight}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-orange-500">{item.price} ₽</span>
                  <button onClick={() => addItem(item)} className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button onClick={() => onNavigate('menu')} className="inline-flex items-center gap-2 px-8 py-4 border-2 border-orange-500 text-orange-500 font-bold rounded-full hover:bg-orange-500 hover:text-white transition-all">
            Показать все {menuItems.length} блюд →
          </button>
        </div>
      </div>
    </section>
  );
}

// ========================================
// ABOUT SECTION
// ========================================

function About() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsVisible(true); }, { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="py-20 bg-gradient-to-b from-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">О <span className="text-orange-500">нас</span></h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Кафе «Соль и Перец» — место, где традиции кавказской кухни встречаются с уютной атмосферой</p>
        </div>

        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {advantages.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </div>
          ))}
        </div>

        {newsItems.length > 0 && (
          <div className={`mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h3 className="text-2xl font-bold mb-6 text-center">Скоро у нас</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {newsItems.map((news) => (
                <div key={news.id} className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{news.icon}</span>
                    {news.isNew && <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Скоро</span>}
                  </div>
                  <h4 className="font-bold text-lg mb-2">{news.title}</h4>
                  <p className="text-gray-600 text-sm">{news.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h3 className="text-2xl font-bold mb-6 text-center">Наша атмосфера</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((img, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden group">
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ========================================
// EVENTS SECTION
// ========================================

function Events() {
  const [selectedPackage, setSelectedPackage] = useState('standard');
  const [guests, setGuests] = useState(10);
  const [extras, setExtras] = useState<string[]>([]);
  const [formData, setFormData] = useState({ name: '', phone: '', date: '', comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pkg = BANQUET_PACKAGES.find(p => p.id === selectedPackage);
  const discount = guests >= 20 ? 0.1 : 0;
  const basePrice = (pkg?.price || 0) * guests * (1 - discount);
  const extrasPrice = BANQUET_EXTRAS.filter(e => extras.includes(e.id)).reduce((sum, e) => sum + e.price, 0);
  const totalPrice = basePrice + extrasPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const message = `🎉 ЗАЯВКА НА БАНКЕТ\n\n👤 ${formData.name}\n📞 ${formData.phone}\n📅 ${formData.date}\n\n📦 Пакет: ${pkg?.name}\n👥 Гостей: ${guests}\n💰 Сумма: ${totalPrice.toLocaleString()} ₽\n\n${formData.comment ? `💬 ${formData.comment}` : ''}`;
    await sendToTelegram(message);
    alert('Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
    setFormData({ name: '', phone: '', date: '', comment: '' });
    setIsSubmitting(false);
  };

  return (
    <section id="events" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Банкеты и <span className="text-orange-500">мероприятия</span></h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Организуем праздники любого масштаба: дни рождения, свадьбы, корпоративы, поминки</p>
        </div>

        {/* Services */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {eventServices.slice(0, 10).map((service) => (
            <div key={service.id} className="bg-white rounded-xl p-4 text-center shadow hover:shadow-lg transition-all">
              <div className="text-3xl mb-2">{service.icon}</div>
              <h4 className="font-bold text-sm mb-1">{service.name}</h4>
              {service.price && <p className="text-orange-500 text-xs">{service.price}</p>}
            </div>
          ))}
        </div>

        {/* Calculator */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
          <h3 className="text-2xl font-bold mb-6 text-center">🧮 Калькулятор банкета</h3>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {BANQUET_PACKAGES.map((p) => (
              <button key={p.id} onClick={() => setSelectedPackage(p.id)}
                className={`p-6 rounded-2xl border-2 transition-all ${selectedPackage === p.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}>
                <h4 className="font-bold text-xl mb-2">{p.name}</h4>
                <p className="text-orange-500 font-bold text-2xl mb-2">{p.price.toLocaleString()} ₽/чел</p>
                <p className="text-gray-600 text-sm mb-4">{p.description}</p>
                <ul className="text-sm text-gray-500">
                  {p.includes.slice(0, 4).map((item, i) => <li key={i}>✓ {item}</li>)}
                </ul>
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block font-bold mb-2">Количество гостей: {guests}</label>
              <input type="range" min="5" max="100" value={guests} onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              {guests >= 20 && <p className="text-green-500 text-sm mt-2">🎉 Скидка 10% от 20 гостей!</p>}
              
              <h4 className="font-bold mt-6 mb-4">Дополнительные услуги:</h4>
              <div className="grid grid-cols-2 gap-3">
                {BANQUET_EXTRAS.map((extra) => (
                  <label key={extra.id} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${extras.includes(extra.id) ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                    <input type="checkbox" checked={extras.includes(extra.id)} onChange={(e) => setExtras(e.target.checked ? [...extras, extra.id] : extras.filter(id => id !== extra.id))} className="accent-orange-500" />
                    <span className="text-sm">{extra.name} — {extra.price.toLocaleString()} ₽</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 rounded-2xl p-6">
              <h4 className="font-bold text-xl mb-4">Итого:</h4>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between"><span>Пакет "{pkg?.name}"</span><span>{pkg?.price.toLocaleString()} ₽ × {guests}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>Скидка 10%</span><span>-{((pkg?.price || 0) * guests * discount).toLocaleString()} ₽</span></div>}
                {extrasPrice > 0 && <div className="flex justify-between"><span>Доп. услуги</span><span>+{extrasPrice.toLocaleString()} ₽</span></div>}
                <div className="border-t pt-4 flex justify-between font-bold text-xl">
                  <span>ИТОГО:</span>
                  <span className="text-orange-500">{totalPrice.toLocaleString()} ₽</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Ваше имя" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none" />
                <input type="tel" placeholder="Телефон" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none" />
                <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none" />
                <textarea placeholder="Комментарий (пожелания)" value={formData.comment} onChange={(e) => setFormData({...formData, comment: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none" rows={2} />
                <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Отправка...' : 'Оставить заявку'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========================================
// REVIEWS SECTION
// ========================================

function Reviews() {
  const [reviews, setReviews] = useState(initialReviews);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const review = { id: Date.now().toString(), ...newReview, date: new Date().toISOString().split('T')[0] };
    await sendToTelegram(`⭐ НОВЫЙ ОТЗЫВ\n\n👤 ${newReview.name}\n⭐ ${newReview.rating}/5\n\n"${newReview.text}"`);
    setReviews([review, ...reviews]);
    setNewReview({ name: '', rating: 5, text: '' });
    setIsSubmitting(false);
    alert('Спасибо за отзыв!');
  };

  return (
    <section id="reviews" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Отзывы <span className="text-orange-500">гостей</span></h2>
          <p className="text-gray-600">Что говорят о нас посетители</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {reviews.slice(0, 6).map((review) => (
            <div key={review.id} className="bg-gray-50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  {review.name[0]}
                </div>
                <div>
                  <h4 className="font-bold">{review.name}</h4>
                  <div className="flex">{Array.from({ length: 5 }).map((_, i) => <span key={i}>{i < review.rating ? '⭐' : '☆'}</span>)}</div>
                </div>
              </div>
              <p className="text-gray-600">{review.text}</p>
              <p className="text-sm text-gray-400 mt-4">{review.date}</p>
            </div>
          ))}
        </div>

        <div className="max-w-lg mx-auto bg-gray-50 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 text-center">Оставить отзыв</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Ваше имя" required value={newReview.name} onChange={(e) => setNewReview({...newReview, name: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none" />
            <div className="flex items-center gap-4">
              <span>Оценка:</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setNewReview({...newReview, rating: star})}
                    className={`text-2xl ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                ))}
              </div>
            </div>
            <textarea placeholder="Ваш отзыв" required value={newReview.text} onChange={(e) => setNewReview({...newReview, text: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none" rows={4} />
            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50">
              {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

// ========================================
// CONTACTS SECTION
// ========================================

function Contacts() {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await sendToTelegram(`📩 СООБЩЕНИЕ С САЙТА\n\n👤 ${formData.name}\n📞 ${formData.phone}\n\n💬 ${formData.message}`);
    alert('Сообщение отправлено!');
    setFormData({ name: '', phone: '', message: '' });
    setIsSubmitting(false);
  };

  const phoneLink = CONTACT_INFO.phone.replace(/[^\d+]/g, '');

  return (
    <section id="contacts" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Контакты</h2>
          <p className="text-gray-600">Ждём вас в гости!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
              <h3 className="text-xl font-bold mb-6">Как нас найти</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">📍</span>
                  <div>
                    <h4 className="font-bold">Адрес</h4>
                    <p className="text-gray-600">{CONTACT_INFO.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-2xl">🕐</span>
                  <div>
                    <h4 className="font-bold">Режим работы</h4>
                    <p className="text-gray-600">{CONTACT_INFO.workHours}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-2xl">📞</span>
                  <div>
                    <h4 className="font-bold">Телефон</h4>
                    <a href={`tel:${phoneLink}`} className="text-orange-500 font-bold text-lg">{CONTACT_INFO.phone}</a>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <a href={CONTACT_INFO.telegram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl hover:scale-110 transition-transform">📱</a>
                <a href={CONTACT_INFO.whatsapp} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-xl hover:scale-110 transition-transform">💬</a>
                <a href={CONTACT_INFO.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center text-xl hover:scale-110 transition-transform">📷</a>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold mb-6">Напишите нам</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Ваше имя" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none" />
                <input type="tel" placeholder="Телефон" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none" />
                <textarea placeholder="Сообщение" required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none" rows={4} />
                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Отправка...' : 'Отправить'}
                </button>
              </form>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-lg h-[600px]">
            <iframe
              src={`https://yandex.ru/map-widget/v1/?pt=${CONTACT_INFO.coordinates[1]},${CONTACT_INFO.coordinates[0]},pm2rdm&z=15&l=map`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Яндекс Карта"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ========================================
// CART
// ========================================

function Cart() {
  const { items, removeItem, updateQuantity, clearCart, isCartOpen, setIsCartOpen } = useCart();
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableItems = deliveryType === 'delivery' ? items.filter(item => !item.isAlcohol) : items;
  const alcoholItems = deliveryType === 'delivery' ? items.filter(item => item.isAlcohol) : [];
  const finalTotal = availableItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { alert('Необходимо согласиться с условиями'); return; }
    setIsSubmitting(true);

    const itemsList = availableItems.map(i => `• ${i.name} × ${i.quantity} = ${i.price * i.quantity} ₽`).join('\n');
    const message = `🛒 НОВЫЙ ЗАКАЗ\n\n👤 ${formData.name}\n📞 ${formData.phone}\n${deliveryType === 'delivery' ? `📍 ${formData.address}` : '🏪 Самовывоз'}\n💳 ${paymentMethod === 'cash' ? 'Наличные' : 'Картой'}\n\n${itemsList}\n\n💰 ИТОГО: ${finalTotal.toLocaleString()} ₽${DELIVERY_CONFIG.freeDeliveryMinOrder === 0 ? '\n🚚 Доставка: БЕСПЛАТНО' : ''}`;
    
    await sendToTelegram(message);
    alert('Заказ оформлен! Мы свяжемся с вами в ближайшее время.');
    clearCart();
    setIsCartOpen(false);
    setFormData({ name: '', phone: '', address: '' });
    setIsSubmitting(false);
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={() => setIsCartOpen(false)} />
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Корзина ({items.length})</h2>
          <button onClick={() => setIsCartOpen(false)} className="text-2xl">✕</button>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-6xl mb-4">🛒</div>
            <p>Корзина пуста</p>
          </div>
        ) : (
          <div className="p-4">
            {/* Delivery type */}
            <div className="flex gap-2 mb-4">
              <button onClick={() => setDeliveryType('delivery')} className={`flex-1 py-3 rounded-lg font-medium transition-all ${deliveryType === 'delivery' ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}>
                🚚 Доставка
              </button>
              <button onClick={() => setDeliveryType('pickup')} className={`flex-1 py-3 rounded-lg font-medium transition-all ${deliveryType === 'pickup' ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}>
                🏪 Самовывоз
              </button>
            </div>

            {deliveryType === 'delivery' && (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">
                🚚 Бесплатная доставка по {DELIVERY_CONFIG.freeDeliveryZone}
              </div>
            )}

            {alcoholItems.length > 0 && deliveryType === 'delivery' && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg mb-4 text-sm text-red-700">
                ⚠️ Алкоголь ({alcoholItems.length} поз.) недоступен для доставки по ФЗ №171
              </div>
            )}

            {/* Items */}
            <div className="space-y-3 mb-6">
              {availableItems.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.weight}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 bg-white rounded-full border flex items-center justify-center">−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 bg-white rounded-full border flex items-center justify-center">+</button>
                      </div>
                      <span className="font-bold text-orange-500">{item.price * item.quantity} ₽</span>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-red-400">✕</button>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-xl font-bold">
                <span>Итого:</span>
                <span className="text-orange-500">{finalTotal.toLocaleString()} ₽</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Ваше имя" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none" />
              <input type="tel" placeholder="Телефон" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none" />
              {deliveryType === 'delivery' && (
                <input type="text" placeholder="Адрес доставки" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none" />
              )}

              <div className="flex gap-2">
                <button type="button" onClick={() => setPaymentMethod('cash')} className={`flex-1 py-3 rounded-lg font-medium ${paymentMethod === 'cash' ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}>
                  💵 Наличные
                </button>
                <button type="button" onClick={() => setPaymentMethod('card')} className={`flex-1 py-3 rounded-lg font-medium ${paymentMethod === 'card' ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}>
                  💳 Картой
                </button>
              </div>

              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 accent-orange-500" />
                <span className="text-gray-600">Я согласен с публичной офертой и даю согласие на обработку персональных данных</span>
              </label>

              <button type="submit" disabled={isSubmitting || !agreed} className="w-full py-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50">
                {isSubmitting ? 'Оформление...' : `Оформить заказ на ${finalTotal.toLocaleString()} ₽`}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ========================================
// FOOTER
// ========================================

function Footer() {
  const phoneLink = CONTACT_INFO.phone.replace(/[^\d+]/g, '');

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4"><span className="text-orange-500">Соль</span> & Перец</h3>
            <p className="text-gray-400 mb-4">Настоящий шашлык и гриль рядом с МЦД Сходня</p>
            <div className="flex gap-4">
              <a href={CONTACT_INFO.telegram} className="text-2xl hover:text-orange-500 transition-colors">📱</a>
              <a href={CONTACT_INFO.whatsapp} className="text-2xl hover:text-orange-500 transition-colors">💬</a>
              <a href={CONTACT_INFO.instagram} className="text-2xl hover:text-orange-500 transition-colors">📷</a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Навигация</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#menu" className="hover:text-orange-500">Меню</a></li>
              <li><a href="#about" className="hover:text-orange-500">О нас</a></li>
              <li><a href="#events" className="hover:text-orange-500">Банкеты</a></li>
              <li><a href="#contacts" className="hover:text-orange-500">Контакты</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Контакты</h4>
            <ul className="space-y-2 text-gray-400">
              <li>📍 {CONTACT_INFO.address}</li>
              <li>📞 <a href={`tel:${phoneLink}`} className="hover:text-orange-500">{CONTACT_INFO.phone}</a></li>
              <li>🕐 {CONTACT_INFO.workHours}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Реквизиты</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>{LEGAL_INFO.companyName}</li>
              <li>ИНН: {LEGAL_INFO.inn}</li>
              <li>ОГРН: {LEGAL_INFO.ogrn}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Кафе «Соль и Перец». Все права защищены.</p>
          <p className="mt-2">⚠️ Чрезмерное употребление алкоголя вредит вашему здоровью. 18+</p>
        </div>
      </div>
    </footer>
  );
}

// ========================================
// MENU PAGE
// ========================================

function MenuPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'food' | 'bar'>('food');
  const { addItem } = useCart();

  const categories = activeTab === 'food' ? menuCategories : barCategories;
  const items = activeTab === 'food' ? menuItems : barItems;

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <button onClick={() => onNavigate('home')} className="mb-6 text-white/80 hover:text-white flex items-center gap-2 mx-auto">
            ← Вернуться на главную
          </button>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Наше меню</h1>
          <p className="text-xl text-white/80 mb-8">Более 170 блюд кавказской и европейской кухни</p>
          <div className="max-w-md mx-auto">
            <input type="text" placeholder="🔍 Поиск блюд..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full px-6 py-4 rounded-full text-gray-900 focus:outline-none shadow-lg" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button onClick={() => { setActiveTab('food'); setActiveCategory('all'); }}
            className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'food' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'}`}>
            🍖 Еда
          </button>
          <button onClick={() => { setActiveTab('bar'); setActiveCategory('all'); }}
            className={`px-8 py-3 rounded-full font-bold transition-all ${activeTab === 'bar' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'}`}>
            🍺 Бар 18+
          </button>
        </div>

        {activeTab === 'bar' && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-8 text-center">
            <p className="text-red-700 font-medium">⚠️ Продажа алкогольной продукции лицам младше 18 лет запрещена</p>
            <p className="text-red-600 text-sm mt-1">Алкоголь недоступен для доставки (ФЗ №171-ФЗ)</p>
          </div>
        )}

        {/* Categories */}
        <div className="flex overflow-x-auto pb-4 gap-3 mb-8">
          <button onClick={() => setActiveCategory('all')}
            className={`px-5 py-3 rounded-full whitespace-nowrap font-medium transition-all ${activeCategory === 'all' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-orange-100'}`}>
            Все
          </button>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap font-medium transition-all ${activeCategory === cat.id ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-orange-100'}`}>
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>

        {/* Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
              <div className="relative aspect-square overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                {item.isHit && <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">ХИТ</span>}
                {item.isNew && <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">NEW</span>}
                {item.isAlcohol && <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">18+</span>}
                {item.isSpicy && <span className="absolute top-3 right-3 text-2xl">🌶️</span>}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                <p className="text-gray-500 text-sm mb-1">{item.description}</p>
                <p className="text-gray-400 text-sm mb-3">{item.weight}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-orange-500">{item.price} ₽</span>
                  <button onClick={() => addItem(item)} className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors text-xl">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🔍</div>
            <p>Ничего не найдено</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ========================================
// MAIN APP
// ========================================

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'menu'>('home');

  const handleNavigate = (page: string) => {
    if (page === 'home' || page === 'menu') {
      setCurrentPage(page as 'home' | 'menu');
      window.scrollTo(0, 0);
    }
  };

  return (
    <CartProvider>
      <div className="min-h-screen">
        <Header onNavigate={handleNavigate} currentPage={currentPage} />
        
        {currentPage === 'home' ? (
          <>
            <Hero onNavigate={handleNavigate} />
            <MenuSection onNavigate={handleNavigate} />
            <About />
            <Events />
            <Reviews />
            <Contacts />
          </>
        ) : (
          <MenuPage onNavigate={handleNavigate} />
        )}
        
        <Footer />
        <Cart />
      </div>
    </CartProvider>
  );
}
