import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Award, Heart, Leaf, Users } from 'lucide-react';

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className={className}>
      {children}
    </motion.div>
  );
}

export default function AboutPage() {
  return (
    <div className="bg-zinc-950 min-h-screen text-white pt-20">
      {/* Hero */}
      <div className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/interior.jpg" alt="О нас" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 to-zinc-950" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-orange-400 text-sm font-medium tracking-[0.3em] uppercase mb-4">История</p>
            <h1 className="text-5xl md:text-6xl font-black mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              О нас
            </h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Место, где рождаются вкусные воспоминания
            </p>
          </motion.div>
        </div>
      </div>

      {/* Story */}
      <AnimatedSection>
        <div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-orange-400 text-sm font-medium tracking-widest uppercase mb-3">Наша история</p>
              <h2 className="text-4xl font-black mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Рождённые из любви<br />к настоящей еде
              </h2>
              <p className="text-white/60 mb-4 leading-relaxed">
                Кафе «Соль и Перец» открылось в Сходне с одной простой идеей: готовить так, как готовят дома — с душой, из свежих продуктов и по проверенным рецептам.
              </p>
              <p className="text-white/60 mb-4 leading-relaxed">
                Мы расположены в самом сердце Сходни, рядом со станцией МЦД, что делает нас доступными для всех жителей района. За годы работы мы стали любимым местом встреч для сотен семей.
              </p>
              <p className="text-white/60 leading-relaxed">
                Наш шеф-повар специализируется на кавказской кухне — шашлыки, плов, хинкали готовятся по традиционным рецептам. Мы гордимся каждым блюдом, которое выходит из нашей кухни.
              </p>
            </div>
            <div className="relative">
              <img src="/images/interior.jpg" alt="Интерьер" className="rounded-3xl object-cover w-full h-80 md:h-96" />
              <div className="absolute -bottom-6 -left-6 bg-orange-600 rounded-2xl p-6 shadow-xl">
                <p className="text-3xl font-black text-white">8+</p>
                <p className="text-orange-200 text-sm">лет в Сходне</p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Values */}
      <AnimatedSection>
        <div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black" style={{ fontFamily: 'Playfair Display, serif' }}>Наши ценности</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Heart className="text-orange-400" size={32} />, title: 'С душой', desc: 'Каждое блюдо готовится с любовью и заботой о госте' },
              { icon: <Leaf className="text-orange-400" size={32} />, title: 'Свежесть', desc: 'Только свежие продукты от проверенных поставщиков' },
              { icon: <Award className="text-orange-400" size={32} />, title: 'Качество', desc: 'Строгий контроль качества на каждом этапе приготовления' },
              { icon: <Users className="text-orange-400" size={32} />, title: 'Команда', desc: 'Опытные повара с многолетним стажем работы' },
            ].map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="bg-zinc-900 rounded-2xl p-6 text-center border border-white/10">
                <div className="flex justify-center mb-4">{v.icon}</div>
                <h3 className="text-white font-bold mb-2">{v.title}</h3>
                <p className="text-white/50 text-sm">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Team */}
      <AnimatedSection>
        <div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <img src="/images/team.jpg" alt="Команда" className="rounded-3xl object-cover w-full h-80" />
            <div>
              <p className="text-orange-400 text-sm font-medium tracking-widest uppercase mb-3">Наша команда</p>
              <h2 className="text-4xl font-black mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Люди, которые<br />создают вкус
              </h2>
              <p className="text-white/60 mb-4 leading-relaxed">
                Наша команда — это профессионалы, которые любят своё дело. Шеф-повар с 15-летним опытом, бармен-миксолог, внимательные официанты — каждый вносит свой вклад в создание незабываемого опыта.
              </p>
              <p className="text-white/60 leading-relaxed">
                Мы постоянно учимся и совершенствуемся: посещаем кулинарные мастер-классы, изучаем новые техники и следим за мировыми трендами, чтобы удивлять вас снова и снова.
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
