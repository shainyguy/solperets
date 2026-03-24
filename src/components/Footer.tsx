import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-1 mb-4">
              <span className="text-3xl font-black" style={{ fontFamily: 'Playfair Display, serif', color: '#E8631A' }}>Соль</span>
              <span className="text-white text-2xl mx-1">&</span>
              <span className="text-3xl font-black" style={{ fontFamily: 'Playfair Display, serif', color: '#E8631A' }}>Перец</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">Домашняя кухня и комфортная атмосфера в Сходне</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Навигация</h4>
            <ul className="space-y-2">
              {[['/', 'Главная'], ['/menu', 'Меню'], ['/bar', 'Бар'], ['/booking', '🪑 Забронировать стол'], ['/events', 'Банкеты'], ['/about', 'О нас'], ['/contacts', 'Контакты']].map(([to, label]) => (
              <li key={to}><Link to={to} className="text-white/50 hover:text-orange-400 transition-colors text-sm">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Контакты</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/50 text-sm">
                <MapPin size={16} className="text-orange-400 mt-0.5 shrink-0" />
                <span>ул. Некрасова, 15, Химки, Московская область</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-orange-400 shrink-0" />
                <a href="tel:+79257677778" className="text-white/50 hover:text-orange-400 transition-colors text-sm">+7 (925) 767-77-78</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Часы работы</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Clock size={16} className="text-orange-400 mt-0.5 shrink-0" />
                <div className="text-white/50 text-sm">
                  <p>Пн – Пт: 09:00 – 01:00</p>
                  <p>Сб – Вс: 09:00 – 05:00</p>
                </div>
              </li>
            </ul>
            <div className="mt-4 flex gap-3">
              <a href="#" className="w-9 h-9 bg-white/10 hover:bg-orange-600 rounded-full flex items-center justify-center transition-colors">
                <Instagram size={16} className="text-white" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">© 2025 Кафе «Соль и Перец». Все права защищены.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="text-white/30 hover:text-white/60 text-xs transition-colors">Политика конфиденциальности</Link>
            <Link to="/terms" className="text-white/30 hover:text-white/60 text-xs transition-colors">Пользовательское соглашение</Link>
            <Link to="/legal" className="text-white/30 hover:text-white/60 text-xs transition-colors">Правовая информация</Link>
          </div>
        </div>
        <p className="text-white/20 text-xs mt-4 text-center">Алкогольная продукция продаётся только лицам, достигшим 18 лет. Чрезмерное употребление алкоголя вредит вашему здоровью. Лицензия на розничную продажу алкогольной продукции.</p>
      </div>
    </footer>
  );
}
