import React, { useState, useEffect } from 'react';
import { useInView } from '../hooks/useInView';
import { initialReviews } from '../data/menuData';
import { Review } from '../types';

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

  // Load reviews from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setReviews(JSON.parse(saved));
    } else {
      setReviews(initialReviews);
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

    const updatedReviews = [review, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReviews));

    setIsSubmitting(false);
    setIsModalOpen(false);
    setNewReview({ name: '', text: '', rating: 5 });
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <section id="reviews" className="py-20 bg-orange-50">
      <div ref={ref} className="container mx-auto px-4">
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
              {/* Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                  {review.avatar || '👤'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{review.name}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-lg">
                    {star <= review.rating ? '⭐' : '☆'}
                  </span>
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-600 line-clamp-4">{review.text}</p>
            </div>
          ))}
        </div>

        {/* Load More (if more than 6 reviews) */}
        {reviews.length > 6 && (
          <div className="text-center mt-8">
            <button className="px-6 py-3 bg-white text-orange-500 font-semibold rounded-full border-2 border-orange-500 hover:bg-orange-500 hover:text-white transition-colors">
              Показать ещё ({reviews.length - 6})
            </button>
          </div>
        )}

        {/* Yandex Reviews Widget Hint */}
        <div
          className={`mt-12 bg-white rounded-2xl p-6 text-center transition-all duration-700 delay-500 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-gray-600 mb-4">Читайте также отзывы на Яндекс Картах:</p>
          <a
            href="https://yandex.ru/maps"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-600"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
            Открыть на Яндекс Картах
          </a>
        </div>
      </div>

      {/* Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slideIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="font-display text-xl font-bold text-gray-900">
                ✍️ Оставить отзыв
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ваша оценка</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="text-3xl transition-transform hover:scale-125"
                    >
                      {star <= newReview.rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ваше имя *</label>
                <input
                  type="text"
                  required
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Как вас зовут?"
                />
              </div>

              {/* Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Отзыв *</label>
                <textarea
                  required
                  value={newReview.text}
                  onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  rows={4}
                  placeholder="Расскажите о своих впечатлениях..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-terracotta text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Отправка...' : '📨 Отправить отзыв'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Reviews;
