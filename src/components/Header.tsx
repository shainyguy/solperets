import { useState, useEffect } from 'react';
import { CONTACT_INFO } from '../data/menuData';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '#home', label: 'Главная' },
    { href: '#menu', label: 'Меню' },
    { href: '#about', label: 'О нас' },
    { href: '#banquet-calculator', label: 'Банкеты' },
    { href: '#reviews', label: 'Отзывы' },
    { href: '#contacts', label: 'Контакты' },
  ];

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Логотип */}
          <a href="#home" className="flex items-center gap-2">
            <span className={`text-xl font-bold transition-colors ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
              <span className="text-orange-500">Соль</span> <span className="text-terracotta">Перец</span>
            </span>
          </a>

          {/* Навигация - десктоп */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map(item => (
              <button
                key={item.href}
                onClick={() => scrollTo(item.href)}
                className={`text-sm font-medium transition-colors hover:text-orange-500 ${
                  isScrolled ? 'text-gray-700' : 'text-white/90'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Телефон */}
          <a
            href={CONTACT_INFO.phoneLink}
            className={`hidden md:flex items-center gap-2 text-sm font-medium transition-colors ${
              isScrolled ? 'text-orange-500' : 'text-white'
            }`}
          >
            <span>📞</span>
            <span>{CONTACT_INFO.phone}</span>
          </a>

          {/* Мобильное меню - кнопка */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 ${isScrolled ? 'text-gray-900' : 'text-white'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <nav className="container mx-auto px-4 py-4 space-y-3">
            {navItems.map(item => (
              <button
                key={item.href}
                onClick={() => scrollTo(item.href)}
                className="block w-full text-left py-2 text-gray-700 hover:text-orange-500"
              >
                {item.label}
              </button>
            ))}
            <a
              href={CONTACT_INFO.phoneLink}
              className="block py-2 text-orange-500 font-medium"
            >
              📞 {CONTACT_INFO.phone}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
