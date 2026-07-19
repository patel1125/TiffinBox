import { useEffect, useState } from 'react';
import api from '../services/api';
import { Restaurant } from '../types';

interface Stats {
  userCount: number;
  restaurantCount: number;
  orderCount: number;
  agentCount: number;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const AdminPanel = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [tab, setTab] = useState<'users' | 'restaurants'>('users');

  const loadAll = async () => {
    const [s, u, r] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/admin/restaurants'),
    ]);
    setStats(s.data);
    setUsers(u.data);
    setRestaurants(r.data);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const changeRole = async (id: string, role: string) => {
    await api.put(`/admin/users/${id}/role`, { role });
    loadAll();
  };

  const toggleRestaurant = async (id: string) => {
    await api.put(`/admin/restaurants/${id}/toggle-active`);
    loadAll();
  };

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <h1 className="display">Admin Panel</h1>

      {stats && (
        <div className="restaurant-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', marginBottom: 24 }}>
          <div className="card" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{stats.userCount}</div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>User</div>
          </div>
          <div className="card" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{stats.restaurantCount}</div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>Restaurant</div>
          </div>
          <div className="card" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{stats.orderCount}</div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>Order</div>
          </div>
          <div className="card" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{stats.agentCount}</div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>Delivery Agent</div>
          </div>
        </div>
      )}

      <div className="chip-row" style={{ paddingTop: 0 }}>
        <button className={`chip ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Users</button>
        <button className={`chip ${tab === 'restaurants' ? 'active' : ''}`} onClick={() => setTab('restaurants')}>Restaurants</button>
      </div>

      {tab === 'users' && (
        <div style={{ marginTop: 16 }}>
          {users.map((u) => (
            <div key={u._id} className="card" style={{ padding: 14, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{u.name}</strong>
                <p style={{ margin: '2px 0', fontSize: 12, color: 'var(--color-muted)' }}>{u.email}</p>
              </div>
              <select value={u.role} onChange={(e) => changeRole(u._id, e.target.value)}>
                <option value="customer">Customer</option>
                <option value="restaurantOwner">Restaurant Owner</option>
                <option value="deliveryAgent">Delivery Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ))}
        </div>
      )}

      {tab === 'restaurants' && (
        <div style={{ marginTop: 16 }}>
          {restaurants.map((r) => (
            <div key={r._id} className="card" style={{ padding: 14, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{r.restaurantName}</strong>
                <p style={{ margin: '2px 0', fontSize: 12, color: 'var(--color-muted)' }}>{r.address}</p>
              </div>
              <button className="btn btn-outline" onClick={() => toggleRestaurant(r._id)}>
                {r.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
