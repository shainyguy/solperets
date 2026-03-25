import { motion } from 'framer-motion';

export default function TermsPage() {
  return (
    <div className="bg-zinc-950 min-h-screen text-white pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Пользовательское соглашение</h1>
          <p className="text-white/40 text-sm mb-10">Последнее обновление: январь 2025</p>

          <div className="space-y-8 text-white/70 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Принятие условий</h2>
              <p>Используя сайт кафе «Соль и Перец», вы соглашаетесь с настоящим Пользовательским соглашением. Если вы не согласны с условиями, пожалуйста, не используйте сайт.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. Оформление заказов</h2>
              <p className="mb-3">При оформлении заказа пользователь соглашается с тем, что:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Предоставленные данные являются достоверными</li>
                <li>Заказ будет подтверждён звонком оператора</li>
                <li>Доставка осуществляется только по территории Сходни</li>
                <li>Алкогольная продукция не доставляется (в соответствии с ФЗ № 171-ФЗ)</li>
                <li>Минимальная сумма заказа может быть установлена администрацией</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Ограничения по возрасту</h2>
              <p>Алкогольная продукция реализуется исключительно лицам, достигшим 18 лет, в соответствии с Федеральным законом от 22.11.1995 № 171-ФЗ «О государственном регулировании производства и оборота этилового спирта, алкогольной и спиртосодержащей продукции». Кафе оставляет за собой право потребовать документ, удостоверяющий личность.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Бронирование</h2>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Бронирование подтверждается после связи с администратором</li>
                <li>Отмена бронирования возможна не позднее чем за 24 часа</li>
                <li>Расчётная стоимость банкета является приблизительной</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Отзывы</h2>
              <p>Публикуя отзыв, пользователь подтверждает, что отзыв основан на личном опыте, не содержит недостоверной информации, оскорблений и нарушений законодательства РФ. Администрация вправе отклонить отзыв, не соответствующий данным требованиям.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Ответственность</h2>
              <p>Кафе «Соль и Перец» не несёт ответственности за технические сбои, а также за ущерб, причинённый в результате использования или невозможности использования сайта.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">7. Изменение условий</h2>
              <p>Администрация вправе изменять настоящее Соглашение в любое время. Актуальная версия всегда доступна на сайте.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">8. Применимое право</h2>
              <p>Настоящее Соглашение регулируется законодательством Российской Федерации.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
