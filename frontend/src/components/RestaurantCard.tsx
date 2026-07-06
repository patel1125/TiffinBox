import { Link } from 'react-router-dom';
import { Restaurant } from '../types';

const cuisineEmoji: Record<string, string> = {
  Gujarati: '🥘',
  Punjabi: '🍛',
  'North Indian': '🍲',
  'South Indian': '🥥',
  Vegetarian: '🥗',
  Chinese: '🥡',
  Italian: '🍕',
  Bakery: '🥐',
  Dessert: '🍮',
};

const getEmoji = (cuisineType: string[] = []) => {
  for (const c of cuisineType) {
    if (cuisineEmoji[c]) return cuisineEmoji[c];
  }
  return '🍽️';
};

const RestaurantCard = ({ restaurant }: { restaurant: Restaurant }) => {
  return (
    <Link to={`/restaurants/${restaurant._id}`} className="card restaurant-card">
      <div className="img-placeholder">
        {getEmoji(restaurant.cuisineType)}
        <span className={`status-pill ${restaurant.isActive ? '' : 'closed'}`}>
          {restaurant.isActive ? 'Open' : 'Closed'}
        </span>
      </div>
      <div className="body">
        <div className="name-row">
          <h3 style={{ margin: 0, fontSize: 17 }}>{restaurant.restaurantName}</h3>
          <span className="rating-tag">★ {restaurant.rating ? restaurant.rating.toFixed(1) : 'New'}</span>
        </div>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--color-muted)' }}>
          {restaurant.cuisineType?.join(' • ')}
        </p>
        <p className="address-line">📍 {restaurant.address}</p>
      </div>
    </Link>
  );
};

export default RestaurantCard;
