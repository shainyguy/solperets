import { useState } from 'react';
import { LEGAL_INFO, CONTACT_INFO } from '../data/menuData';

type LegalDocType = 'privacy' | 'terms' | 'offer' | null;

interface LegalProps {
  isOpen: boolean;
  docType: LegalDocType;
  onClose: () => void;
}

export default function Legal({ isOpen, docType, onClose }: LegalProps) {
  if (!isOpen || !docType) return null;

  const getDocumentContent = () => {
    switch (docType) {
      case 'privacy':
        return <PrivacyPolicy />;
      case 'terms':
        return <TermsOfUse />;
      case 'offer':
        return <PublicOffer />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (docType) {
      case 'privacy':
        return 'Политика конфиденциальности';
      case 'terms':
        return 'Пользовательское соглашение';
      case 'offer':
        return 'Публичная оферта';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 prose prose-sm max-w-none">
          {getDocumentContent()}
        </div>
      </div>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
      <p className="text-gray-500">Редакция от {new Date().toLocaleDateString('ru-RU')}</p>
      
      <h3 className="text-lg font-semibold text-gray-900">1. Общие положения</h3>
      <p>
        Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки 
        и защиты {LEGAL_INFO.companyName} (далее — «Оператор») информации о физических лицах 
        (далее — «Пользователи»), которая может быть получена Оператором при использовании 
        Пользователем сайта, сервисов, служб, программ и продуктов Оператора.
      </p>
      <p>
        ИНН: {LEGAL_INFO.inn}<br />
        ОГРН: {LEGAL_INFO.ogrn}<br />
        Адрес: {LEGAL_INFO.legalAddress}<br />
        Email: {LEGAL_INFO.email}
      </p>

      <h3 className="text-lg font-semibold text-gray-900">2. Персональные данные Пользователей</h3>
      <p>К персональным данным Пользователей, которые обрабатывает Оператор, относятся:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Фамилия, имя, отчество</li>
        <li>Номер телефона</li>
        <li>Адрес электронной почты</li>
        <li>Адрес доставки</li>
        <li>История заказов</li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-900">3. Цели обработки персональных данных</h3>
      <p>Оператор обрабатывает персональные данные Пользователей в следующих целях:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Оформление и исполнение заказов</li>
        <li>Обратная связь с Пользователем</li>
        <li>Направление уведомлений о статусе заказа</li>
        <li>Проведение маркетинговых акций (с согласия Пользователя)</li>
        <li>Улучшение качества обслуживания</li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-900">4. Правовые основания обработки</h3>
      <p>
        Обработка персональных данных осуществляется на основании:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных»</li>
        <li>Согласия Пользователя на обработку персональных данных</li>
        <li>Договора, стороной которого является субъект персональных данных</li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-900">5. Срок хранения данных</h3>
      <p>
        Персональные данные хранятся в течение срока, необходимого для достижения целей обработки, 
        но не более 3 (трёх) лет с момента последнего заказа. По истечении указанного срока данные 
        подлежат уничтожению.
      </p>

      <h3 className="text-lg font-semibold text-gray-900">6. Права Пользователя</h3>
      <p>Пользователь имеет право:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Получать информацию о своих персональных данных</li>
        <li>Требовать уточнения, блокирования или уничтожения данных</li>
        <li>Отозвать согласие на обработку персональных данных</li>
        <li>Обжаловать действия Оператора в Роскомнадзор</li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-900">7. Меры по защите данных</h3>
      <p>
        Оператор принимает необходимые правовые, организационные и технические меры для защиты 
        персональных данных от неправомерного или случайного доступа, уничтожения, изменения, 
        блокирования, копирования, распространения, а также от иных неправомерных действий.
      </p>

      <h3 className="text-lg font-semibold text-gray-900">8. Использование cookies</h3>
      <p>
        Сайт использует файлы cookies для улучшения работы сервиса. Продолжая использование сайта, 
        Пользователь соглашается с использованием cookies. Пользователь может отключить cookies 
        в настройках браузера.
      </p>

      <h3 className="text-lg font-semibold text-gray-900">9. Контактная информация</h3>
      <p>
        По вопросам, связанным с обработкой персональных данных, Пользователь может обратиться:<br />
        Email: {LEGAL_INFO.email}<br />
        Телефон: {LEGAL_INFO.phone}<br />
        Адрес: {LEGAL_INFO.actualAddress}
      </p>
    </div>
  );
}

function TermsOfUse() {
  return (
    <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
      <p className="text-gray-500">Редакция от {new Date().toLocaleDateString('ru-RU')}</p>
      
      <h3 className="text-lg font-semibold text-gray-900">1. Общие положения</h3>
      <p>
        Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между 
        {LEGAL_INFO.companyName} (далее — «Администрация») и посетителем сайта (далее — «Пользователь»).
      </p>
      <p>
        Использование сайта означает безоговорочное согласие Пользователя с настоящим Соглашением 
        и указанными в нём условиями.
      </p>

      <h3 className="text-lg font-semibold text-gray-900">2. Предмет соглашения</h3>
      <p>
        Администрация предоставляет Пользователю право использовать сайт для:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Просмотра меню и цен</li>
        <li>Оформления заказов на доставку и самовывоз</li>
        <li>Бронирования столов и банкетов</li>
        <li>Отправки обратной связи и отзывов</li>
        <li>Участия в программе лояльности</li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-900">3. Возрастные ограничения</h3>
      <p className="font-semibold text-red-600">
        ⚠️ Заказ и приобретение алкогольной продукции разрешены только лицам, достигшим 18 лет. 
        Продажа алкоголя несовершеннолетним запрещена (ФЗ №171-ФЗ).
      </p>
      <p>
        Доставка алкогольной продукции не осуществляется в соответствии с законодательством РФ. 
        Алкогольные напитки доступны только при посещении кафе с предъявлением документа, 
        удостоверяющего возраст.
      </p>

      <h3 className="text-lg font-semibold text-gray-900">4. Права и обязанности сторон</h3>
      <h4 className="font-medium text-gray-800 mt-3">Администрация обязуется:</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>Обеспечивать работоспособность сайта</li>
        <li>Предоставлять актуальную информацию о меню и ценах</li>
        <li>Выполнять заказы в установленные сроки</li>
        <li>Защищать персональные данные Пользователей</li>
      </ul>
      <h4 className="font-medium text-gray-800 mt-3">Пользователь обязуется:</h4>
      <ul className="list-disc pl-6 space-y-1">
        <li>Предоставлять достоверную информацию при оформлении заказа</li>
        <li>Не использовать сайт в противоправных целях</li>
        <li>Соблюдать условия настоящего Соглашения</li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-900">5. Ответственность</h3>
      <p>
        Администрация не несёт ответственности за технические сбои, вызванные действиями третьих лиц, 
        форс-мажорными обстоятельствами или действиями Пользователя.
      </p>

      <h3 className="text-lg font-semibold text-gray-900">6. Разрешение споров</h3>
      <p>
        Все споры разрешаются путём переговоров. При невозможности достижения соглашения — 
        в суде по месту нахождения Администрации в соответствии с законодательством РФ.
      </p>

      <h3 className="text-lg font-semibold text-gray-900">7. Изменение условий</h3>
      <p>
        Администрация вправе в одностороннем порядке изменять условия Соглашения. 
        Изменения вступают в силу с момента публикации на сайте.
      </p>
    </div>
  );
}

function PublicOffer() {
  return (
    <div className="space-y-4 text-gray-700 text-sm leading-relaxed">
      <p className="text-gray-500">Редакция от {new Date().toLocaleDateString('ru-RU')}</p>
      
      <h3 className="text-lg font-semibold text-gray-900">ДОГОВОР ПУБЛИЧНОЙ ОФЕРТЫ</h3>
      <p>
        {LEGAL_INFO.companyName}, именуемое в дальнейшем «Исполнитель», в лице генерального директора 
        {LEGAL_INFO.ceo}, действующего на основании Устава, публикует настоящую публичную оферту.
      </p>

      <h3 className="text-lg font-semibold text-gray-900">1. Предмет договора</h3>
      <p>
        1.1. Исполнитель обязуется оказать услуги общественного питания и/или доставить готовые 
        блюда (далее — «Услуги»), а Заказчик обязуется оплатить эти услуги.
      </p>
      <p>
        1.2. Ассортимент, цены и условия приведены на сайте и могут изменяться Исполнителем в 
        одностороннем порядке.
      </p>

      <h3 className="text-lg font-semibold text-gray-900">2. Оформление заказа</h3>
      <p>
        2.1. Заказ оформляется через сайт или по телефону {CONTACT_INFO.phone}.<br />
        2.2. Минимальная сумма заказа для доставки — 1000 рублей.<br />
        2.3. Доставка осуществляется в пределах 10 км от кафе.
      </p>

      <h3 className="text-lg font-semibold text-gray-900">3. Оплата</h3>
      <p>
        3.1. Оплата производится одним из способов:<br />
        — Наличными при получении<br />
        — Банковской картой при получении<br />
        — Онлайн через ЮKassa (Visa, MasterCard, МИР)
      </p>
      <p>
        3.2. Чек направляется на email или в виде SMS в соответствии с 54-ФЗ.
      </p>

      <h3 className="text-lg font-semibold text-gray-900">4. Доставка</h3>
      <p>
        4.1. Срок доставки — 40-60 минут с момента подтверждения заказа.<br />
        4.2. При задержке более 30 минут — скидка 10% на следующий заказ.<br />
        4.3. <strong className="text-red-600">Доставка алкогольной продукции не осуществляется</strong> 
        (ФЗ №171-ФЗ). Алкоголь доступен только в заведении при предъявлении документа.
      </p>

      <h3 className="text-lg font-semibold text-gray-900">5. Качество и рекламации</h3>
      <p>
        5.1. Исполнитель гарантирует свежесть и качество продукции.<br />
        5.2. Претензии по качеству принимаются в течение 24 часов с фото/видео подтверждением.<br />
        5.3. При обоснованной претензии — возврат средств или замена блюда.
      </p>

      <h3 className="text-lg font-semibold text-gray-900">6. Возврат средств</h3>
      <p>
        6.1. Возврат при отмене заказа до начала приготовления — 100%.<br />
        6.2. Возврат после начала приготовления — не производится.<br />
        6.3. Возврат при оплате онлайн — в течение 3-10 рабочих дней на карту плательщика.
      </p>

      <h3 className="text-lg font-semibold text-gray-900">7. Реквизиты Исполнителя</h3>
      <p>
        {LEGAL_INFO.companyName}<br />
        ИНН: {LEGAL_INFO.inn}<br />
        ОГРН: {LEGAL_INFO.ogrn}<br />
        КПП: {LEGAL_INFO.kpp}<br />
        Юридический адрес: {LEGAL_INFO.legalAddress}<br />
        Фактический адрес: {LEGAL_INFO.actualAddress}<br />
        Телефон: {LEGAL_INFO.phone}<br />
        Email: {LEGAL_INFO.email}
      </p>

      <h3 className="text-lg font-semibold text-gray-900">8. Заключительные положения</h3>
      <p>
        8.1. Оформление заказа означает полное принятие условий настоящей оферты.<br />
        8.2. Договор считается заключённым с момента подтверждения заказа Исполнителем.<br />
        8.3. Все споры решаются в соответствии с законодательством Российской Федерации.
      </p>
    </div>
  );
}

// Hook для использования в других компонентах
export function useLegalModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [docType, setDocType] = useState<LegalDocType>(null);

  const openDoc = (type: LegalDocType) => {
    setDocType(type);
    setIsOpen(true);
  };

  const closeDoc = () => {
    setIsOpen(false);
    setDocType(null);
  };

  return { isOpen, docType, openDoc, closeDoc };
}

export { type LegalDocType };
