import React, { useState, useEffect } from 'react';
import { useInView } from '../hooks/useInView';
import { initialReviews } from '../data/menuData';
import { Review } from '../types';
import { saveReviewForModeration, getApprovedReviews } from '../services/telegramBot';
import { addReview } from '../services/crmService';

const STORAGE_KEY = 'salt_pepper_reviews';

const Reviews: React.FC = () => {
  const { ref, isInView } = useInView(0.1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    text: '',
    rating: 5,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Load reviews from localStorage (approved + initial)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const approved = getApprovedReviews();
    
    if (saved) {
      // Объединяем сохранённые и одобренные
      const savedReviews = JSON.parse(saved);
      const allReviews = [...approved, ...savedReviews];
      // Удаляем дубликаты по id
      const unique = allReviews.filter((review, index, self) =>
        index === self.findIndex(r => r.id === review.id)
      );
      setReviews(unique);
    } else {
      setReviews([...approved, ...initialReviews]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialReviews));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const review: Review = {
      id: Date.now().toString(),
      name: newReview.name,
      text: newReview.text,
      rating: newReview.rating,
      date: new Date().toISOString().split('T')[0],
      avatar: ['👨', '👩', '👨‍💼', '👩‍💼', '🧑', '👨‍🦱', '👩‍🦰'][Math.floor(Math.random() * 7)],
    };

    // Отправляем на модерацию в Telegram
    saveReviewForModeration(review);

    // Сохраняем в CRM
    addReview({
      author: newReview.name,
      phone: '', // В форме нет телефона, можно добавить
      rating: newReview.rating,
      text: newReview.text,
    });

    setIsSubmitting(false);
    setIsModalOpen(false);
    setSubmitSuccess(true);
    setNewReview({ name: '', text: '', rating: 5 });

    // Скрываем уведомление через 5 секунд
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <section id="reviews" className="py-20 bg-orange-50">
      <div ref={ref} className="container mx-auto px-4">
        {/* Success Notification */}
        {submitSuccess && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg animate-bounce">
            ✅ Спасибо! Ваш отзыв отправлен на модерацию
          </div>
        )}

        {/* Section Header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="text-orange-500 font-medium tracking-wider uppercase">
            Отзывы
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-4">
            Что говорят гости? 💬
          </h2>
          
          {/* Rating Summary */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="text-2xl">
                  {star <= Math.round(Number(avgRating)) ? '⭐' : '☆'}
                </span>
              ))}
            </div>
            <span className="text-3xl font-bold text-gray-900">{avgRating}</span>
            <span className="text-gray-500">({reviews.length} отзывов)</span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-terracotta text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all"
          >
            ✍️ Оставить отзыв
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.slice(0, 6).map((review, index) => (
            <div
              key={review.id}
              className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 ${
                isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                  {review.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{review.name}</h4>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <span className="ml-auto text-sm text-gray-400">{review.date}</span>
              </div>
              <p className="text-gray-600 leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>

        {/* Show More */}
        {reviews.length > 6 && (
          <div className="text-center mt-8">
            <p className="text-gray-500">
              И ещё {reviews.length - 6} отзывов на Яндекс Картах
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Ваш отзыв</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Ваше имя *
                </label>
                <input
                  type="text"
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  placeholder="Иван"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Оценка *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className={`text-3xl transition-transform hover:scale-110 ${
                        star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Text */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Ваш отзыв *
                </label>
                <textarea
                  value={newReview.text}
                  onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition resize-none"
                  placeholder="Расскажите о вашем впечатлении..."
                />
              </div>

              {/* Info */}
              <div className="bg-blue-50 text-blue-600 p-4 rounded-xl text-sm">
                ℹ️ Отзыв будет опубликован после проверки модератором
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-terracotta text-white font-semibold rounded-xl hover:shadow-lg transition disabled:opacity-50"
              >
                {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Reviews;
