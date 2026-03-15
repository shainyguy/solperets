import React, { useState, useEffect } from 'react';
import { useInView } from '../hooks/useInView';
import { Review } from '../types';
import { initialReviews } from '../data/menuData';

const Reviews: React.FC = () => {
  const { ref, isInView } = useInView(0.2);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    name: '',
    text: '',
    rating: 5,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Загружаем отзывы из localStorage или используем начальные
  useEffect(() => {
    const stored = localStorage.getItem('salt-pepper-reviews');
    if (stored) {
      setReviews(JSON.parse(stored));
    } else {
      setReviews(initialReviews);
    }
  }, []);

  // Сохраняем отзывы в localStorage
  useEffect(() => {
    if (reviews.length > 0) {
      localStorage.setItem('salt-pepper-reviews', JSON.stringify(reviews));
    }
  }, [reviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const review: Review = {
      id: `r-${Date.now()}`,
      name: newReview.name,
      text: newReview.text,
      rating: newReview.rating,
      date: new Date().toISOString().split('T')[0],
    };

    setReviews((prev) => [review, ...prev]);
    setNewReview({ name: '', text: '', rating: 5 });
    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderStars = (rating: number, interactive = false, onChange?: (r: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <svg
              className={`w-5 h-5 ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  return (
    <section id="reviews" className="py-20 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Отзывы <span className="text-orange-500">гостей</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            {renderStars(Math.round(parseFloat(averageRating)))}
            <span className="text-lg font-semibold text-gray-700">
              {averageRating} из 5
            </span>
            <span className="text-gray-500">({reviews.length} отзывов)</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Оставить отзыв
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.slice(0, 6).map((review, index) => (
            <div
              key={review.id}
              className={`bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-500 ${
                isInView
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${100 + index * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {review.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{review.name}</h4>
                  <p className="text-sm text-gray-500">
                    {formatDate(review.date)}
                  </p>
                </div>
              </div>
              {renderStars(review.rating)}
              <p className="mt-4 text-gray-600 leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>

        {reviews.length > 6 && (
          <div className="text-center mt-8">
            <button className="text-orange-500 hover:text-orange-600 font-medium">
              Показать все отзывы ({reviews.length})
            </button>
          </div>
        )}
      </div>

      {/* Add Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-2xl font-bold text-gray-900">
                  Ваш отзыв
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ваше имя *
                  </label>
                  <input
                    type="text"
                    required
                    value={newReview.name}
                    onChange={(e) =>
                      setNewReview({ ...newReview, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Как вас зовут?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Оценка *
                  </label>
                  {renderStars(newReview.rating, true, (r) =>
                    setNewReview({ ...newReview, rating: r })
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Отзыв *
                  </label>
                  <textarea
                    required
                    value={newReview.text}
                    onChange={(e) =>
                      setNewReview({ ...newReview, text: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                    rows={4}
                    placeholder="Поделитесь впечатлениями о нашем кафе..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all duration-300"
                >
                  {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Reviews;
