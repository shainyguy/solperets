import React from 'react';
import { CONTACT_INFO, LEGAL_INFO } from '../data/menuData';
import { LegalDocType } from './Legal';

interface FooterProps {
  onOpenLegal: (type: LegalDocType) => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl font-bold mb-4">
              <span className="text-orange-500">Соль</span> & <span className="text-terracotta">Перец</span>
            </h3>
            <p className="text-gray-400 mb-4">
              Кафе настоящего шашлыка и гриля рядом с МЦД Сходня. Готовим с любовью на живом огне!
            </p>
            <div className="flex gap-3">
              <a
                href={CONTACT_INFO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href={CONTACT_INFO.vk}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.626 4 8.14c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.847 2.455 2.267 4.607 2.847 4.607.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.27-1.422 2.18-3.61 2.18-3.61.119-.254.322-.491.762-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/>
                </svg>
              </a>
              <a
                href={CONTACT_INFO.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-orange-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Меню</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#menu" className="hover:text-orange-500 transition-colors">Шашлык</a></li>
              <li><a href="#menu" className="hover:text-orange-500 transition-colors">Гриль</a></li>
              <li><a href="#menu" className="hover:text-orange-500 transition-colors">Салаты</a></li>
              <li><a href="#menu" className="hover:text-orange-500 transition-colors">Бар (18+)</a></li>
              <li><a href="#menu" className="hover:text-orange-500 transition-colors">Десерты</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Услуги</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#banquet-calculator" className="hover:text-orange-500 transition-colors">Банкеты</a></li>
              <li><a href="#events" className="hover:text-orange-500 transition-colors">Дни рождения</a></li>
              <li><a href="#events" className="hover:text-orange-500 transition-colors">Корпоративы</a></li>
              <li><a href="#menu" className="hover:text-orange-500 transition-colors">Доставка</a></li>
              <li><a href="#contacts" className="hover:text-orange-500 transition-colors">Самовывоз</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Контакты</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-3">
                <span className="text-orange-500">📍</span>
                <span>{CONTACT_INFO.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-orange-500">📞</span>
                <a href={CONTACT_INFO.phoneLink} className="hover:text-orange-500 transition-colors">
                  {CONTACT_INFO.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-500">🕐</span>
                <div>
                  <p>Пн-Пт: {CONTACT_INFO.workHours.weekdays}</p>
                  <p>Сб-Вс: {CONTACT_INFO.workHours.weekends}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Legal Links */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-400">
            <button
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-orange-500 transition-colors"
            >
              Политика конфиденциальности
            </button>
            <button
              onClick={() => onOpenLegal('terms')}
              className="hover:text-orange-500 transition-colors"
            >
              Пользовательское соглашение
            </button>
            <button
              onClick={() => onOpenLegal('offer')}
              className="hover:text-orange-500 transition-colors"
            >
              Публичная оферта
            </button>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
            <div>
              <p>{LEGAL_INFO.companyName}</p>
              <p>ИНН: {LEGAL_INFO.inn} | ОГРН: {LEGAL_INFO.ogrn}</p>
              <p>Адрес: {LEGAL_INFO.actualAddress}</p>
            </div>
            <div className="md:text-right">
              <p className="text-red-400 font-medium mb-1">
                ⚠️ Продажа алкоголя лицам до 18 лет запрещена
              </p>
              <p>Доставка алкогольной продукции не осуществляется (ФЗ №171-ФЗ)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {currentYear} Кафе «Соль и Перец». Все права защищены.
            </p>
            <div className="flex items-center gap-4 text-gray-500 text-sm">
              <span>Принимаем оплату:</span>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-white/10 rounded text-xs">VISA</span>
                <span className="px-2 py-1 bg-white/10 rounded text-xs">MasterCard</span>
                <span className="px-2 py-1 bg-white/10 rounded text-xs">МИР</span>
                <span className="px-2 py-1 bg-white/10 rounded text-xs">СБП</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
