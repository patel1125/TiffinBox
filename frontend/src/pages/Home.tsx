import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { Restaurant } from '../types';
import RestaurantCard from '../components/RestaurantCard';

const Home = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState('');
  const [activeCuisine, setActiveCuisine] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const { data } = await api.get('/restaurants', { params: { search } });
        setRestaurants(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, [search]);

  const cuisines = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach((r) => r.cuisineType?.forEach((c) => set.add(c)));
    return ['All', ...Array.from(set)];
  }, [restaurants]);

  const filtered = useMemo(() => {
    if (activeCuisine === 'All') return restaurants;
    return restaurants.filter((r) => r.cuisineType?.includes(activeCuisine));
  }, [restaurants, activeCuisine]);

  return (
    <div>
      <section className="hero">
        <div className="container">
          <h1 className="display">Homestyle food, delivered.</h1>
          <p className="sub">Browse local kitchens, order delivery, or reserve a table — all in one place.</p>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Search restaurants or cuisines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="container" style={{ paddingBottom: 60 }}>
        {cuisines.length > 1 && (
          <div className="chip-row">
            {cuisines.map((c) => (
              <button
                key={c}
                className={`chip ${activeCuisine === c ? 'active' : ''}`}
                onClick={() => setActiveCuisine(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p style={{ marginTop: 24 }}>Loading restaurants...</p>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No restaurants found. Try a different search.</div>
        ) : (
          <div className="restaurant-grid">
            {filtered.map((r) => (
              <RestaurantCard key={r._id} restaurant={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
