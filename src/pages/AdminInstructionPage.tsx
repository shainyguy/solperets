import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit3, Trash2, Image, Tag, Star, Flame, AlertCircle } from 'lucide-react';

export default function AdminInstructionPage() {
  return (
    <div className="bg-zinc-950 min-h-screen text-white pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/admin" className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 mb-8 transition-colors">
            <ArrowLeft size={18} /> Назад в панель управления
          </Link>

          <div className="bg-orange-600/10 border border-orange-500/30 rounded-2xl p-6 mb-10">
            <h1 className="text-3xl font-black mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              📋 Инструкция по управлению меню
            </h1>
            <p className="text-white/60">Как добавлять, редактировать и удалять позиции меню</p>
          </div>

          <div className="space-y-8">

            {/* Добавление блюда */}
            <section className="bg-zinc-900 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center">
                  <Plus className="text-green-400" size={20} />
                </div>
                <h2 className="text-xl font-bold">Как добавить новое блюдо</h2>
              </div>
              <ol className="space-y-3 text-white/70">
                <li className="flex gap-3"><span className="text-orange-400 font-bold shrink-0">1.</span> Перейдите в раздел <strong className="text-white">«Меню»</strong> в левом меню панели управления</li>
                <li className="flex gap-3"><span className="text-orange-400 font-bold shrink-0">2.</span> Нажмите кнопку <strong className="text-white">«+ Добавить блюдо»</strong> в правом верхнем углу</li>
                <li className="flex gap-3"><span className="text-orange-400 font-bold shrink-0">3.</span> Заполните форму (обязательные поля отмечены *)</li>
                <li className="flex gap-3"><span className="text-orange-400 font-bold shrink-0">4.</span> Нажмите <strong className="text-white">«Сохранить»</strong></li>
              </ol>
            </section>

            {/* Поля формы */}
            <section className="bg-zinc-900 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                  <Edit3 className="text-blue-400" size={20} />
                </div>
                <h2 className="text-xl font-bold">Поля при добавлении блюда</h2>
              </div>
              <div className="space-y-4">
                {[
                  { field: 'Название *', desc: 'Название блюда на русском языке', example: 'Шашлык из баранины' },
                  { field: 'Описание', desc: 'Краткое описание состава и вкуса', example: 'Нежная баранина, маринованная в специях...' },
                  { field: 'Цена (₽) *', desc: 'Цена в рублях, только цифры', example: '450' },
                  { field: 'Старая цена', desc: 'Зачёркнутая цена для показа скидки (необязательно)', example: '600' },
                  { field: 'URL изображения', desc: 'Ссылка на фото. Загрузите фото на любой хостинг и вставьте ссылку', example: 'https://example.com/photo.jpg' },
                  { field: 'Тип', desc: '"Еда" — для основного меню, "Бар" — для барного меню', example: 'Еда' },
                  { field: 'Категория', desc: 'Ключ категории (см. таблицу ниже)', example: 'mangal' },
                  { field: 'Ккал', desc: 'Калорийность на порцию (необязательно)', example: '380' },
                  { field: 'Время (мин)', desc: 'Время приготовления в минутах', example: '25' },
                  { field: 'Вес/объём', desc: 'Вес или объём порции', example: '300г или 500мл' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row gap-2 p-3 bg-white/5 rounded-xl">
                    <div className="sm:w-40 shrink-0">
                      <span className="text-orange-400 font-semibold text-sm">{item.field}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white/70 text-sm">{item.desc}</p>
                      <p className="text-white/40 text-xs mt-1">Пример: {item.example}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Категории */}
            <section className="bg-zinc-900 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex items-center justify-center">
                  <Tag className="text-orange-400" size={20} />
                </div>
                <h2 className="text-xl font-bold">Категории меню (ключи)</h2>
              </div>
              <p className="text-white/50 text-sm mb-4">При добавлении блюда введите точный ключ категории в поле «Категория»:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'mangal', label: '🔥 Блюда с мангала', type: 'food' },
                  { key: 'shashlik_bones', label: '🍖 Шашлык на костях', type: 'food' },
                  { key: 'shashlik', label: '🥩 Шашлык', type: 'food' },
                  { key: 'sadj', label: '🫕 Садж на мангале', type: 'food' },
                  { key: 'fish_mangal', label: '🐟 Рыба на мангале', type: 'food' },
                  { key: 'vegetables_mangal', label: '🥦 Овощи на мангале', type: 'food' },
                  { key: 'grill', label: '🥩 Гриль', type: 'food' },
                  { key: 'hot', label: '🍽️ Горячие блюда', type: 'food' },
                  { key: 'soups', label: '🍲 Супы', type: 'food' },
                  { key: 'plov', label: '🍚 Шах-плов', type: 'food' },
                  { key: 'caucasian', label: '🫕 Кавказская кухня', type: 'food' },
                  { key: 'salads', label: '🥗 Салаты', type: 'food' },
                  { key: 'cold_appetizers', label: '🥗 Холодные закуски', type: 'food' },
                  { key: 'sides', label: '🥔 Гарниры', type: 'food' },
                  { key: 'beer_snacks', label: '🍺 Закуски к пиву', type: 'food' },
                  { key: 'sauces', label: '🫙 Соусы', type: 'food' },
                  { key: 'desserts', label: '🍰 Десерты', type: 'food' },
                  { key: 'ice_cream', label: '🍦 Мороженое', type: 'food' },
                  { key: 'drinks', label: '🥤 Напитки', type: 'food' },
                  { key: 'cocktails', label: '🍸 Коктейли', type: 'bar' },
                  { key: 'beer', label: '🍺 Пиво', type: 'bar' },
                  { key: 'wine', label: '🍷 Вино', type: 'bar' },
                  { key: 'whiskey', label: '🥃 Виски', type: 'bar' },
                  { key: 'vodka', label: '🫙 Водка', type: 'bar' },
                  { key: 'cognac', label: '🥃 Коньяк', type: 'bar' },
                  { key: 'champagne', label: '🥂 Шампанское', type: 'bar' },
                  { key: 'shots', label: '🔥 Шоты', type: 'bar' },
                  { key: 'soft', label: '🥤 Безалкогольные', type: 'bar' },
                ].map((cat) => (
                  <div key={cat.key} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white text-sm font-medium">{cat.label}</p>
                      <code className="text-orange-400 text-xs">{cat.key}</code>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${cat.type === 'bar' ? 'bg-purple-600/20 text-purple-400' : 'bg-green-600/20 text-green-400'}`}>
                      {cat.type === 'bar' ? 'Бар' : 'Еда'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-blue-900/20 border border-blue-600/20 rounded-xl">
                <p className="text-blue-300 text-sm">
                  💡 <strong>Хотите добавить новую категорию?</strong> Просто введите любой новый ключ в поле «Категория» при создании блюда, 
                  а затем добавьте её в список категорий на странице меню (файл <code className="bg-white/10 px-1 rounded">src/pages/MenuPage.tsx</code>, массив <code className="bg-white/10 px-1 rounded">FOOD_CATEGORIES</code>).
                </p>
              </div>
            </section>

            {/* Чекбоксы */}
            <section className="bg-zinc-900 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-yellow-600/20 rounded-xl flex items-center justify-center">
                  <Star className="text-yellow-400" size={20} />
                </div>
                <h2 className="text-xl font-bold">Специальные отметки</h2>
              </div>
              <div className="space-y-3">
                {[
                  { icon: <Flame size={16} className="text-orange-400" />, label: 'Блюдо дня', desc: 'Выделяет блюдо как специальное предложение дня. Показывается на главной странице с баннером.' },
                  { icon: <Star size={16} className="text-yellow-400" />, label: 'Рекомендуем', desc: 'Блюдо попадает в раздел «Популярные позиции» на главной странице.' },
                  { icon: <span className="text-green-400 text-sm font-bold">✓</span>, label: 'Активно', desc: 'Блюдо отображается в меню. Снимите галочку, чтобы временно скрыть позицию.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                    <div className="w-6 h-6 flex items-center justify-center mt-0.5 shrink-0">{item.icon}</div>
                    <div>
                      <p className="text-white font-medium text-sm">{item.label}</p>
                      <p className="text-white/50 text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Фото */}
            <section className="bg-zinc-900 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-pink-600/20 rounded-xl flex items-center justify-center">
                  <Image className="text-pink-400" size={20} />
                </div>
                <h2 className="text-xl font-bold">Как добавить фото блюда</h2>
              </div>
              <div className="space-y-4 text-white/70 text-sm">
                <p>Фото хранятся по URL-ссылке. Есть несколько способов получить ссылку:</p>
                <div className="space-y-3">
                  {[
                    {
                      title: '1. Загрузить на Яндекс Диск',
                      steps: ['Загрузите фото на Яндекс Диск', 'Нажмите «Поделиться» → «Получить ссылку»', 'Вставьте ссылку в поле «URL изображения»']
                    },
                    {
                      title: '2. Использовать Imgur (бесплатно)',
                      steps: ['Откройте imgur.com', 'Перетащите фото на страницу', 'Скопируйте прямую ссылку (Direct link)']
                    },
                    {
                      title: '3. Загрузить в папку public/images/',
                      steps: ['Добавьте файл в папку public/images/ проекта', 'Используйте путь /images/название-файла.jpg', 'Пример: /images/shashlik-baranina.jpg']
                    },
                  ].map((method, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-xl">
                      <p className="text-white font-medium mb-2">{method.title}</p>
                      <ol className="space-y-1">
                        {method.steps.map((step, j) => (
                          <li key={j} className="text-white/50 text-xs flex gap-2">
                            <span className="text-orange-400">{j + 1}.</span> {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-amber-900/20 border border-amber-600/20 rounded-xl flex gap-2">
                  <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-amber-300 text-xs">Рекомендуемый размер фото: 800×600 пикселей или больше. Формат: JPG или PNG.</p>
                </div>
              </div>
            </section>

            {/* Удаление */}
            <section className="bg-zinc-900 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center">
                  <Trash2 className="text-red-400" size={20} />
                </div>
                <h2 className="text-xl font-bold">Удаление и скрытие позиций</h2>
              </div>
              <div className="space-y-3 text-white/70 text-sm">
                <p><strong className="text-white">Скрыть временно:</strong> Откройте редактирование блюда → снимите галочку «Активно» → сохраните. Блюдо исчезнет из меню, но останется в базе.</p>
                <p><strong className="text-white">Удалить навсегда:</strong> В карточке блюда нажмите красную кнопку с иконкой корзины. Удаление необратимо.</p>
              </div>
            </section>

            {/* Быстрые действия */}
            <section className="bg-gradient-to-r from-orange-900/20 to-zinc-900 rounded-2xl p-6 border border-orange-500/20">
              <h2 className="text-xl font-bold mb-4">🚀 Быстрые действия</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link to="/admin" className="flex items-center gap-3 p-4 bg-white/10 hover:bg-orange-600/20 rounded-xl transition-colors">
                  <Plus size={20} className="text-orange-400" />
                  <div>
                    <p className="text-white font-medium text-sm">Добавить блюдо</p>
                    <p className="text-white/40 text-xs">Перейти в раздел «Меню»</p>
                  </div>
                </Link>
                <Link to="/menu" className="flex items-center gap-3 p-4 bg-white/10 hover:bg-orange-600/20 rounded-xl transition-colors" target="_blank">
                  <Star size={20} className="text-orange-400" />
                  <div>
                    <p className="text-white font-medium text-sm">Посмотреть меню</p>
                    <p className="text-white/40 text-xs">Открыть страницу меню</p>
                  </div>
                </Link>
              </div>
            </section>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
