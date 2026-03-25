import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Phone, CalendarCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count, setIsOpen } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const links = [
    { to: '/', label: 'Главная' },
    { to: '/menu', label: 'Меню' },
    { to: '/bar', label: 'Бар' },
    { to: '/events', label: 'Банкеты' },
    { to: '/about', label: 'О нас' },
    { to: '/contacts', label: 'Контакты' },
  ];

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight" style={{ fontFamily: 'Playfair Display, serif', color: '#E8631A' }}>Соль</span>
          <span className="text-white text-xl font-light">&</span>
          <span className="text-2xl font-black tracking-tight" style={{ fontFamily: 'Playfair Display, serif', color: '#E8631A' }}>Перец</span>
        </Link>

        <div className="hidden md:flex items-center gap-5">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors hover:text-orange-400 ${
                location.pathname === l.to ? 'text-orange-400' : 'text-white/80'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a href="tel:+79257677778" className="hidden lg:flex items-center gap-2 text-white/70 hover:text-orange-400 transition-colors text-sm">
            <Phone size={16} />
            <span>+7 (925) 767-77-78</span>
          </a>
          <Link
            to="/booking"
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-orange-600/30 border border-white/20 hover:border-orange-500/50 text-white text-sm font-medium rounded-xl transition-all"
          >
            <CalendarCheck size={16} className="text-orange-400" />
            Забронировать стол
          </Link>
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 rounded-full bg-orange-600 hover:bg-orange-500 transition-colors"
          >
            <ShoppingCart size={20} className="text-white" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {count}
              </span>
            )}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white p-2">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/98 border-t border-white/10"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {links.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === l.to ? 'bg-orange-600/20 text-orange-400' : 'text-white/80 hover:bg-white/5'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/booking"
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex items-center gap-2 py-3 px-4 bg-white/10 border border-white/20 rounded-lg text-white font-medium"
              >
                <CalendarCheck size={16} className="text-orange-400" />
                Забронировать стол
              </Link>
              <a href="tel:+79257677778" className="mt-2 flex items-center gap-2 py-3 px-4 bg-orange-600 rounded-lg text-white font-medium">
                <Phone size={16} />
                +7 (925) 767-77-78
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
