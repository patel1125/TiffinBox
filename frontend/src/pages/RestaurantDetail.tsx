import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Restaurant, MenuCategory, MenuItem } from '../types';
import MenuItemCard from '../components/MenuItemCard';
import ReviewsSection from '../components/ReviewsSection';
import { useAuth } from '../context/AuthContext';

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

const RestaurantDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [message, setMessage] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [cartSummary, setCartSummary] = useState<{ count: number; total: number; restaurantId?: string }>({
    count: 0,
    total: 0,
  });

  useEffect(() => {
    const load = async () => {
      const [r, c, i] = await Promise.all([
        api.get(`/restaurants/${id}`),
        api.get(`/menu/categories/${id}`),
        api.get(`/menu/items/${id}`),
      ]);
      setRestaurant(r.data);
      setCategories(c.data);
      setItems(i.data);
    };
    load();
  }, [id]);

  const refreshCart = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/cart');
      const map: Record<string, number> = {};
      let count = 0;
      (data.items || []).forEach((it: any) => {
        const mid = typeof it.menuItemId === 'string' ? it.menuItemId : it.menuItemId._id;
        map[mid] = it.quantity;
        count += it.quantity;
      });
      setQuantities(map);
      setCartSummary({ count, total: data.totalAmount || 0, restaurantId: data.restaurantId });
    } catch {
      setQuantities({});
      setCartSummary({ count: 0, total: 0 });
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const handleAdd = async (item: MenuItem) => {
    if (!user) {
      setMessage('Please log in to add items to your cart.');
      return;
    }
    await api.post('/cart/add', { restaurantId: id, menuItemId: item._id, quantity: 1 });
    setMessage('');
    refreshCart();
  };

  const handleIncrement = async (item: MenuItem) => {
    const newQty = (quantities[item._id] || 0) + 1;
    await api.put('/cart/update', { menuItemId: item._id, quantity: newQty });
    refreshCart();
  };

  const handleDecrement = async (item: MenuItem) => {
    const newQty = (quantities[item._id] || 0) - 1;
    if (newQty <= 0) {
      await api.delete(`/cart/remove/${item._id}`);
    } else {
      await api.put('/cart/update', { menuItemId: item._id, quantity: newQty });
    }
    refreshCart();
  };

  const scrollToCategory = (catId: string) => {
    document.getElementById(`cat-${catId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!restaurant) return <div className="container" style={{ paddingTop: 32 }}>Loading...</div>;

  const showCartBar = cartSummary.count > 0 && cartSummary.restaurantId === id;

  return (
    <div>
      <section className="restaurant-hero">
        <div className="container">
          <div className="emoji-badge">{getEmoji(restaurant.cuisineType)}</div>
          <h1>{restaurant.restaurantName}</h1>
          <p className="desc">{restaurant.description}</p>
          <div className="meta-row">
            <span className="rating-tag">★ {restaurant.rating ? restaurant.rating.toFixed(1) : 'New'}</span>
            <span className="status-pill">{restaurant.isActive ? 'Open' : 'Closed'}</span>
            <span>📍 {restaurant.address}</span>
            <span>🕒 {restaurant.openingTime} - {restaurant.closingTime}</span>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <div className="category-nav">
          <div className="container">
            <div className="chip-row" style={{ paddingTop: 0 }}>
              {categories.map((cat) => (
                <button key={cat._id} className="chip" onClick={() => scrollToCategory(cat._id)}>
                  {cat.categoryName}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container" style={{ paddingTop: 20, paddingBottom: showCartBar ? 100 : 60 }}>
        {message && <p style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>{message}</p>}
        {categories.map((cat) => (
          <div key={cat._id} id={`cat-${cat._id}`} style={{ marginBottom: 28, paddingTop: 8 }}>
            <h3>{cat.categoryName}</h3>
            {items
              .filter((it) => it.categoryId === cat._id)
              .map((it) => (
                <MenuItemCard
                  key={it._id}
                  item={it}
                  quantity={quantities[it._id] || 0}
                  onAdd={handleAdd}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                />
              ))}
          </div>
        ))}

        <ReviewsSection restaurantId={id!} />
      </div>

      {showCartBar && (
        <div className="cart-bar">
          <div className="container">
            <span>{cartSummary.count} item{cartSummary.count > 1 ? 's' : ''} • ₹{cartSummary.total}</span>
            <button className="btn btn-view" onClick={() => navigate('/cart')}>View Cart</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;
