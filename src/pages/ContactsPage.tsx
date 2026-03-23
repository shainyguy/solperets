import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';

export default function ContactsPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) return;
    setLoading(true);
    try {
      await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setSent(true);
      setForm({ name: '', phone: '', email: '', message: '' });
    } catch {}
    setLoading(false);
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-white pt-20">
      {/* Header */}
      <div className="py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-orange-400 text-sm font-medium tracking-[0.3em] uppercase mb-4">Мы ждём вас</p>
          <h1 className="text-5xl md:text-6xl font-black mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Контакты</h1>
          <p className="text-white/50 text-lg">Приходите, звоните, пишите — мы всегда рады</p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: <Phone className="text-orange-400" size={28} />,
              title: 'Телефон',
              content: (
                <div>
                  <a href="tel:+79257677778" className="text-white hover:text-orange-400 transition-colors font-medium">+7 (925) 767-77-78</a>
                  <a href="tel:+79257677778" className="mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors md:hidden">
                    <Phone size={18} /> Позвонить
                  </a>
                </div>
              )
            },
            {
              icon: <MapPin className="text-orange-400" size={28} />,
              title: 'Адрес',
              content: (
                <div>
                  <p className="text-white/70 text-sm leading-relaxed">ул. Некрасова, 15<br />Химки, Московская область</p>
                  <p className="text-orange-400 text-xs mt-2">📍 Рядом со станцией МЦД Сходня</p>
                </div>
              )
            },
            {
              icon: <Clock className="text-orange-400" size={28} />,
              title: 'Часы работы',
              content: (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Понедельник – Пятница</span>
                    <span className="text-white font-medium">09:00 – 01:00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Суббота – Воскресенье</span>
                    <span className="text-white font-medium">09:00 – 05:00</span>
                  </div>
                  <p className="text-orange-400 text-xs mt-2">🎵 Пт-Сб: дискотека до закрытия</p>
                </div>
              )
            }
          ].map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-zinc-900 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                {card.icon}
                <h3 className="text-white font-bold">{card.title}</h3>
              </div>
              {card.content}
            </motion.div>
          ))}
        </div>

        {/* Map + Form */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Yandex Map */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="rounded-3xl overflow-hidden border border-white/10 h-96 md:h-auto">
            <iframe
              src="https://yandex.ru/map-widget/v1/?ll=37.356000,55.953000&z=17&pt=37.356000,55.953000,pm2rdm~37.356000,55.953000,pm2rdl&text=%D0%A1%D0%BE%D0%BB%D1%8C%20%D0%B8%20%D0%9F%D0%B5%D1%80%D0%B5%D1%86%2C%20%D1%83%D0%BB.%20%D0%9D%D0%B5%D0%BA%D1%80%D0%B0%D1%81%D0%BE%D0%B2%D0%B0%2015%2C%20%D0%A5%D0%B8%D0%BC%D0%BA%D0%B8"
              width="100%"
              height="100%"
              style={{ minHeight: '384px', border: 'none' }}
              title="Карта — Кафе Соль и Перец"
              allowFullScreen
            />
          </motion.div>

          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            className="bg-zinc-900 rounded-3xl p-8 border border-white/10">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="text-orange-400" size={24} />
              <h3 className="text-xl font-bold">Написать нам</h3>
            </div>
            {sent ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h4 className="text-xl font-bold mb-2">Сообщение отправлено!</h4>
                <p className="text-white/50">Мы ответим вам в ближайшее время</p>
                <button onClick={() => setSent(false)} className="mt-6 px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition-colors">
                  Написать ещё
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <label className="block">
                  <span className="text-white/60 text-sm">Имя *</span>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="Ваше имя" required />
                </label>
                <label className="block">
                  <span className="text-white/60 text-sm">Телефон</span>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="+7 (___) ___-__-__" type="tel" />
                </label>
                <label className="block">
                  <span className="text-white/60 text-sm">Email</span>
                  <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="email@example.com" type="email" />
                </label>
                <label className="block">
                  <span className="text-white/60 text-sm">Сообщение *</span>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                    className="mt-1 w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                    rows={4} placeholder="Ваш вопрос или пожелание..." required />
                </label>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
                  <Send size={18} />
                  {loading ? 'Отправка...' : 'Отправить сообщение'}
                </button>
                <p className="text-white/30 text-xs text-center">
                  Нажимая кнопку, вы соглашаетесь с <a href="/privacy" className="underline hover:text-white/50">политикой конфиденциальности</a>
                </p>
              </form>
            )}
          </motion.div>
        </div>

        {/* Mobile call button */}
        <div className="mt-8 md:hidden">
          <a href="tel:+79257677778" className="flex items-center justify-center gap-3 w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl text-lg transition-colors">
            <Phone size={24} /> Позвонить
          </a>
        </div>
      </div>
    </div>
  );
}
