import { motion } from 'framer-motion';

export default function LegalPage() {
  return (
    <div className="bg-zinc-950 min-h-screen text-white pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>Правовая информация</h1>
          <p className="text-white/40 text-sm mb-10">Реквизиты и правовые сведения</p>

          <div className="space-y-8 text-white/70 leading-relaxed">
            <section className="bg-zinc-900 rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Сведения об организации</h2>
              <div className="space-y-2 text-sm">
                <div className="flex gap-3"><span className="text-white/40 w-32 shrink-0">Наименование:</span><span>Кафе «Соль и Перец»</span></div>
                <div className="flex gap-3"><span className="text-white/40 w-32 shrink-0">Адрес:</span><span>ул. Некрасова, 15, г. Химки, Московская область</span></div>
                <div className="flex gap-3"><span className="text-white/40 w-32 shrink-0">Телефон:</span><span>+7 (925) 767-77-78</span></div>
                <div className="flex gap-3"><span className="text-white/40 w-32 shrink-0">Режим работы:</span><span>Пн–Пт 09:00–01:00, Сб–Вс 09:00–05:00</span></div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Лицензии и разрешения</h2>
              <p>Деятельность кафе осуществляется в соответствии с действующим законодательством Российской Федерации. Реализация алкогольной продукции осуществляется на основании лицензии, выданной в установленном порядке.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Информация о реализации алкогольной продукции</h2>
              <div className="bg-amber-900/20 border border-amber-600/20 rounded-xl p-4">
                <p className="text-amber-200/80 text-sm">
                  В соответствии с Федеральным законом от 22.11.1995 № 171-ФЗ:<br />
                  • Алкогольная продукция продаётся только лицам, достигшим 18 лет<br />
                  • Продажа алкоголя несовершеннолетним запрещена<br />
                  • Дистанционная продажа алкогольной продукции запрещена<br />
                  • Доставка алкоголя не осуществляется<br /><br />
                  Чрезмерное употребление алкоголя вредит вашему здоровью.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Защита прав потребителей</h2>
              <p>Деятельность кафе регулируется Законом РФ от 07.02.1992 № 2300-1 «О защите прав потребителей». По вопросам качества услуг обращайтесь по телефону +7 (925) 767-77-78 или в Роспотребнадзор.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">Санитарные нормы</h2>
              <p>Кафе работает в соответствии с санитарными нормами и правилами, установленными СанПиН. Регулярно проводятся санитарные проверки.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
