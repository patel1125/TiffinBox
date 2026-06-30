import { useEffect, useState } from 'react';
import api from '../services/api';
import { Review } from '../types';
import { useAuth } from '../context/AuthContext';

const ReviewsSection = ({ restaurantId }: { restaurantId: string }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    const { data } = await api.get(`/reviews/restaurant/${restaurantId}`);
    setReviews(data);
  };

  useEffect(() => {
    fetchReviews();
  }, [restaurantId]);

  const handleSubmit = async () => {
    if (!user || !reviewText) return;
    setSubmitting(true);
    try {
      await api.post('/reviews', { restaurantId, rating, reviewText });
      setReviewText('');
      setRating(5);
      fetchReviews();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: 36 }}>
      <h3>Reviews & Ratings</h3>

      {user ? (
        <div className="card" style={{ padding: 16, marginBottom: 20 }}>
          <div className="star-select" style={{ marginBottom: 10 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={n <= rating ? 'filled' : ''} onClick={() => setRating(n)}>★</span>
            ))}
          </div>
          <textarea
            placeholder="Share your experience..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={2}
            style={{
              width: '100%',
              padding: 10,
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              fontFamily: 'inherit',
              marginBottom: 10,
            }}
          />
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || !reviewText}>
            Post Review
          </button>
        </div>
      ) : (
        <p style={{ color: 'var(--color-muted)', fontSize: 13 }}>Log in to leave a review.</p>
      )}

      {reviews.length === 0 ? (
        <p style={{ color: 'var(--color-muted)', fontSize: 13 }}>No reviews yet — be the first!</p>
      ) : (
        reviews.map((r) => {
          const reviewer = typeof r.userId === 'object' ? r.userId.name : 'Anonymous';
          return (
            <div key={r._id} className="review-card">
              <div className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
              <strong style={{ fontSize: 13 }}>{reviewer}</strong>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-muted)' }}>{r.reviewText}</p>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ReviewsSection;
