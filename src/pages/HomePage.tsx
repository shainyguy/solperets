import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Star, ChevronRight, Calendar, MapPin, Phone, Clock, Flame, Award, Users } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  old_price?: number;
  image_url: string;
  category: string;
  type: string;
  is_featured: boolean;
  is_day_special: boolean;
  calories?: number;
  cook_time?: number;
  allergens?: string[];
}

interface Review {
  id: number;
  author_name: string;
  rating: number;
  text: string;
  created_at: string;
}

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }} className={className}>
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const [featured, setFeatured] = useState<MenuItem[]>([]);
  const [daySpecial, setDaySpecial] = useState<MenuItem | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewForm, setReviewForm] = useState({ author_name: '', rating: 5, text: '' });
  const [reviewSent, setReviewSent] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    fetch('/api/menu?featured=true').then(r => r.json()).then(d => setFeatured(Array.isArray(d) ? d.slice(0, 6) : []));
    fetch('/api/menu?day_special=true').then(r => r.json()).then(d => { if (Array.isArray(d) && d[0]) setDaySpecial(d[0]); });
    fetch('/api/reviews?approved=true').then(r => r.json()).then(d => setReviews(Array.isArray(d) ? d.slice(0, 6) : []));
  }, []);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.author_name || !reviewForm.text) return;
    await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reviewForm) });
    setReviewSent(true);
    setReviewForm({ author_name: '', rating: 5, text: '' });
  };

  return (
    <div className="bg-zinc-950 text-white">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/hero-bg.jpg" alt="Шашлык" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-zinc-950" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
            <p className="text-orange-400 text-sm font-medium tracking-[0.3em] uppercase mb-4">Кафе в Сходне · рядом с МЦД</p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              <span style={{ color: '#E8631A' }}>Соль</span> <span className="text-white">&</span> <span style={{ color: '#E8631A' }}>Перец</span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/80 font-light mb-2">Вкусная еда и уютная атмосфера в Сходне</p>
            <p className="text-white/50 text-base mb-10">Домашняя кухня и комфортная атмосфера</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/menu" className="px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all hover:scale-105 text-lg">
                Посмотреть меню
              </Link>
              <Link to="/events" className="px-8 py-4 border border-white/30 hover:border-orange-400 text-white font-medium rounded-xl transition-all hover:scale-105 text-lg backdrop-blur-sm flex items-center gap-2 justify-center">
                🪑 Забронировать стол
              </Link>
            </div>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-gradient-to-b from-orange-400 to-transparent animate-pulse" />
        </motion.div>
      </section>

      {/* STATS */}
      <AnimatedSection>
        <div className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: <Flame className="text-orange-400" size={28} />, value: '15+', label: 'Видов шашлыка' },
            { icon: <Award className="text-orange-400" size={28} />, value: '8 лет', label: 'Работаем' },
            { icon: <Users className="text-orange-400" size={28} />, value: '200+', label: 'Мест в зале' },
            { icon: <Star className="text-orange-400" size={28} />, value: '4.8', label: 'Рейтинг' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
              <div className="flex justify-center mb-3">{s.icon}</div>
              <p className="text-3xl font-black text-white mb-1">{s.value}</p>
              <p className="text-white/50 text-sm">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* БЛЮДО ДНЯ */}
      {daySpecial && (
        <AnimatedSection>
          <div className="max-w-7xl mx-auto px-4 pb-12">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-900/40 to-zinc-900 border border-orange-500/30">
              <div className="flex flex-col md:flex-row items-center gap-0">
                <div className="md:w-1/2 relative">
                  <img src={daySpecial.image_url || '/images/dish-1.jpg'} alt={daySpecial.name} className="w-full h-64 md:h-80 object-cover" />
                  <div className="absolute top-4 left-4 bg-orange-600 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                    <Flame size={16} /> Блюдо дня
                  </div>
                </div>
                <div className="md:w-1/2 p-8">
                  <p className="text-orange-400 text-sm font-medium tracking-widest uppercase mb-2">Специальное предложение</p>
                  <h2 className="text-3xl font-black mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>{daySpecial.name}</h2>
                  <p className="text-white/60 mb-6">{daySpecial.description}</p>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-4xl font-black text-orange-400">{daySpecial.price}₽</span>
                    {daySpecial.old_price && <span className="text-xl text-white/30 line-through">{daySpecial.old_price}₽</span>}
                    {daySpecial.old_price && <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-lg font-bold">
                      -{Math.round((1 - daySpecial.price / daySpecial.old_price) * 100)}%
                    </span>}
                  </div>
                  <button onClick={() => addItem({ id: daySpecial.id, name: daySpecial.name, price: daySpecial.price, image_url: daySpecial.image_url, type: daySpecial.type })}
                    className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all hover:scale-105">
                    В корзину
                  </button>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* FEATURED MENU */}
      <AnimatedSection>
        <div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="text-center mb-12">
            <p className="text-orange-400 text-sm font-medium tracking-widest uppercase mb-3">Наши блюда</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Популярные позиции</h2>
            <p className="text-white/50 max-w-xl mx-auto">Лучшее из нашего меню — свежие ингредиенты, домашние рецепты</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            {featured.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                className="group bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 hover:border-orange-500/40 transition-all hover:-translate-y-1">
                <div className="relative overflow-hidden">
                  <img src={item.image_url || '/images/dish-1.jpg'} alt={item.name}
                    className="w-full h-36 md:h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
                  {item.is_day_special && (
                    <div className="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                      <Flame size={10} /> Спец.
                    </div>
                  )}
                </div>
                <div className="p-3 md:p-4">
                  <h3 className="font-bold text-white text-sm md:text-base mb-1 line-clamp-1">{item.name}</h3>
                  <p className="text-white/50 text-xs mb-2 line-clamp-2 hidden md:block">{item.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.cook_time && <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">⏱ {item.cook_time} мин</span>}
                    {item.calories && <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">{item.calories} ккал</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-orange-400 font-black text-lg">{item.price}₽</span>
                    <button onClick={() => addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image_url, type: item.type })}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg transition-colors">
                      + В корзину
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/menu" className="inline-flex items-center gap-2 px-8 py-4 border border-orange-500/50 hover:bg-orange-600 text-white font-medium rounded-xl transition-all hover:scale-105">
              Всё меню <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </AnimatedSection>

      {/* ABOUT */}
      <AnimatedSection>
        <div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-orange-400 text-sm font-medium tracking-widest uppercase mb-3">О нас</p>
              <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Кафе с душой<br />и вкусом
              </h2>
              <p className="text-white/60 mb-4 leading-relaxed">
                «Соль и Перец» — это место, где каждый гость чувствует себя как дома. Мы открылись в Сходне и сразу стали любимым местом жителей района.
              </p>
              <p className="text-white/60 mb-8 leading-relaxed">
                Наши повара готовят из свежих продуктов, мясо для шашлыка маринуется по авторским рецептам. Уютный зал, живая музыка по выходным и дискотеки в пятницу и субботу.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3">
                  <MapPin className="text-orange-400 shrink-0" size={20} />
                  <span className="text-white/70 text-sm">ул. Некрасова, 15, Химки</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-orange-400 shrink-0" size={20} />
                  <span className="text-white/70 text-sm">Пн–Пт 09:00–01:00</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src="/images/interior.jpg" alt="Интерьер" className="rounded-2xl object-cover h-48 md:h-64 w-full" />
              <img src="/images/team.jpg" alt="Команда" className="rounded-2xl object-cover h-48 md:h-64 w-full mt-8" />
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* EVENTS TEASER */}
      <AnimatedSection>
        <div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="relative rounded-3xl overflow-hidden">
            <img src="/images/banquet.jpg" alt="Банкеты" className="w-full h-64 md:h-96 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/30 flex items-center">
              <div className="p-8 md:p-12 max-w-lg">
                <p className="text-orange-400 text-sm font-medium tracking-widest uppercase mb-3">Мероприятия</p>
                <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Банкеты, свадьбы<br />и дни рождения
                </h2>
                <p className="text-white/70 mb-6">Организуем любые праздники — от камерных ужинов до корпоративов на 200 человек</p>
                <Link to="/events" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all hover:scale-105">
                  <Calendar size={18} /> Забронировать
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* REVIEWS */}
      <AnimatedSection>
        <div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="text-center mb-12">
            <p className="text-orange-400 text-sm font-medium tracking-widest uppercase mb-3">Отзывы</p>
            <h2 className="text-4xl font-black" style={{ fontFamily: 'Playfair Display, serif' }}>Что говорят гости</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {reviews.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="bg-zinc-900 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map(s => <Star key={s} size={16} className={s <= r.rating ? 'text-orange-400 fill-orange-400' : 'text-white/20'} />)}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-4">"{r.text}"</p>
                <p className="text-white font-semibold text-sm">{r.author_name}</p>
                <p className="text-white/30 text-xs">{new Date(r.created_at).toLocaleDateString('ru-RU')}</p>
              </motion.div>
            ))}
          </div>

          {/* Review Form */}
          <div className="max-w-xl mx-auto bg-zinc-900 rounded-2xl p-8 border border-white/10">
            <h3 className="text-xl font-bold mb-6 text-center">Оставить отзыв</h3>
            {reviewSent ? (
              <div className="text-center py-4">
                <p className="text-green-400 font-medium">✅ Спасибо! Отзыв отправлен на модерацию.</p>
              </div>
            ) : (
              <form onSubmit={submitReview} className="space-y-4">
                <input value={reviewForm.author_name} onChange={e => setReviewForm({ ...reviewForm, author_name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500"
                  placeholder="Ваше имя" required />
                <div className="flex items-center gap-3">
                  <span className="text-white/60 text-sm">Оценка:</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                        <Star size={24} className={s <= reviewForm.rating ? 'text-orange-400 fill-orange-400' : 'text-white/20'} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea value={reviewForm.text} onChange={e => setReviewForm({ ...reviewForm, text: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 resize-none"
                  rows={4} placeholder="Расскажите о вашем визите..." required />
                <button type="submit" className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors">
                  Отправить отзыв
                </button>
                <p className="text-white/30 text-xs text-center">Отзыв будет опубликован после проверки модератором</p>
              </form>
            )}
          </div>
        </div>
      </AnimatedSection>

      {/* CONTACTS QUICK */}
      <AnimatedSection>
        <div className="max-w-7xl mx-auto px-4 pb-20">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Phone className="text-orange-400" size={28} />, title: 'Позвонить', desc: '+7 (925) 767-77-78', href: 'tel:+79257677778', btn: 'Позвонить' },
              { icon: <MapPin className="text-orange-400" size={28} />, title: 'Адрес', desc: 'ул. Некрасова, 15, Химки. Рядом МЦД Сходня', href: '/contacts', btn: 'На карте' },
              { icon: <Clock className="text-orange-400" size={28} />, title: 'Часы работы', desc: 'Пн–Пт 09:00–01:00\nСб–Вс 09:00–05:00', href: '/contacts', btn: 'Подробнее' },
            ].map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="bg-zinc-900 rounded-2xl p-6 border border-white/10 text-center">
                <div className="flex justify-center mb-4">{c.icon}</div>
                <h3 className="text-white font-bold mb-2">{c.title}</h3>
                <p className="text-white/50 text-sm mb-4 whitespace-pre-line">{c.desc}</p>
                <a href={c.href} className="inline-block px-6 py-2 border border-orange-500/50 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors">
                  {c.btn}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* MOBILE CALL BUTTON */}
      <div className="fixed bottom-6 right-6 md:hidden z-40">
        <a href="tel:+79257677778" className="flex items-center gap-2 px-5 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-full shadow-lg shadow-orange-900/50 transition-all hover:scale-105">
          <Phone size={20} /> Позвонить
        </a>
      </div>
    </div>
  );
}
