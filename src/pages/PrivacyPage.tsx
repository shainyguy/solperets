import { motion } from 'framer-motion';

export default function PrivacyPage() {
  return (
    <div className="bg-zinc-950 min-h-screen text-white pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Политика конфиденциальности</h1>
          <p className="text-white/40 text-sm mb-10">Последнее обновление: январь 2025</p>

          <div className="space-y-8 text-white/70 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Общие положения</h2>
              <p>Настоящая Политика конфиденциальности регулирует порядок обработки и использования персональных данных пользователей сайта кафе «Соль и Перец» (далее — «Оператор»). Обработка персональных данных осуществляется в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. Сбор персональных данных</h2>
              <p className="mb-3">Мы собираем следующие персональные данные:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Имя и фамилия</li>
                <li>Номер телефона</li>
                <li>Адрес электронной почты</li>
                <li>Адрес доставки (при оформлении заказа)</li>
                <li>Данные о заказах и бронированиях</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Цели обработки данных</h2>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Оформление и исполнение заказов</li>
                <li>Бронирование столов и залов</li>
                <li>Связь с клиентом по вопросам заказа</li>
                <li>Улучшение качества обслуживания</li>
                <li>Информирование об акциях (с согласия пользователя)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Хранение и защита данных</h2>
              <p>Персональные данные хранятся на защищённых серверах. Мы принимаем все необходимые организационные и технические меры для защиты персональных данных от несанкционированного доступа, изменения, раскрытия или уничтожения.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Передача третьим лицам</h2>
              <p>Мы не передаём персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством РФ, а также для исполнения заказа (служба доставки).</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Права пользователей</h2>
              <p>Вы вправе запросить доступ к своим персональным данным, их исправление или удаление, направив запрос по телефону +7 (925) 767-77-78.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">7. Cookies</h2>
              <p>Сайт использует cookies для улучшения работы. Продолжая использование сайта, вы соглашаетесь с использованием cookies.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">8. Контакты</h2>
              <p>По вопросам обработки персональных данных: <br />
              Телефон: +7 (925) 767-77-78<br />
              Адрес: ул. Некрасова, 15, Химки, Московская область</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
