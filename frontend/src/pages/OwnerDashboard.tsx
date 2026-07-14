import { useEffect, useState, FormEvent } from 'react';
import api from '../services/api';
import { Restaurant, MenuCategory, MenuItem, Order } from '../types';

const OwnerDashboard = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<'menu' | 'orders' | 'new'>('menu');

  const [restForm, setRestForm] = useState({
    restaurantName: '', description: '', cuisineType: '', address: '', openingTime: '', closingTime: '',
  });

  const [catName, setCatName] = useState('');
  const [itemForm, setItemForm] = useState({ categoryId: '', itemName: '', description: '', price: '', preparationTime: '' });
  const [itemImage, setItemImage] = useState<File | null>(null);

  const loadRestaurants = async () => {
    const { data } = await api.get('/owner/my-restaurants');
    setRestaurants(data);
    if (data.length > 0 && !selectedId) setSelectedId(data[0]._id);
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadMenu = async (restaurantId: string) => {
    const [c, i] = await Promise.all([
      api.get(`/menu/categories/${restaurantId}`),
      api.get(`/menu/items/${restaurantId}`),
    ]);
    setCategories(c.data);
    setItems(i.data);
  };

  const loadOrders = async (restaurantId: string) => {
    const { data } = await api.get(`/owner/orders/${restaurantId}`);
    setOrders(data);
  };

  useEffect(() => {
    if (selectedId) {
      loadMenu(selectedId);
      loadOrders(selectedId);
    }
  }, [selectedId]);

  const handleCreateRestaurant = async (e: FormEvent) => {
    e.preventDefault();
    const { data } = await api.post('/restaurants', {
      ...restForm,
      cuisineType: restForm.cuisineType.split(',').map((c) => c.trim()).filter(Boolean),
    });
    setRestaurants([...restaurants, data]);
    setSelectedId(data._id);
    setTab('menu');
    setRestForm({ restaurantName: '', description: '', cuisineType: '', address: '', openingTime: '', closingTime: '' });
  };

  const handleAddCategory = async () => {
    if (!catName) return;
    await api.post('/menu/categories', { restaurantId: selectedId, categoryName: catName });
    setCatName('');
    loadMenu(selectedId);
  };

  const handleAddItem = async (e: FormEvent) => {
    e.preventDefault();
    let imageUrl = '';
    if (itemImage) {
      const formData = new FormData();
      formData.append('image', itemImage);
      const { data } = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      imageUrl = data.imageUrl;
    }
    await api.post('/menu/items', {
      restaurantId: selectedId,
      categoryId: itemForm.categoryId,
      itemName: itemForm.itemName,
      description: itemForm.description,
      price: Number(itemForm.price),
      preparationTime: Number(itemForm.preparationTime) || undefined,
      image: imageUrl,
    });
    setItemForm({ categoryId: '', itemName: '', description: '', price: '', preparationTime: '' });
    setItemImage(null);
    loadMenu(selectedId);
  };

  const updateOrderStatus = async (orderId: string, orderStatus: string) => {
    await api.put(`/orders/${orderId}/status`, { orderStatus });
    loadOrders(selectedId);
  };

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <h1 className="display">Owner Dashboard</h1>

      {restaurants.length > 0 && (
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} style={{ marginBottom: 16, maxWidth: 300 }}>
          {restaurants.map((r) => (
            <option key={r._id} value={r._id}>{r.restaurantName}</option>
          ))}
        </select>
      )}

      <div className="chip-row" style={{ paddingTop: 0 }}>
        <button className={`chip ${tab === 'menu' ? 'active' : ''}`} onClick={() => setTab('menu')}>Menu</button>
        <button className={`chip ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>Orders</button>
        <button className={`chip ${tab === 'new' ? 'active' : ''}`} onClick={() => setTab('new')}>+ New Restaurant</button>
      </div>

      {tab === 'new' && (
        <form onSubmit={handleCreateRestaurant} className="card" style={{ padding: 20, marginTop: 16, maxWidth: 480 }}>
          <h3 style={{ marginTop: 0 }}>Create Restaurant</h3>
          <div className="form-group">
            <label>Name</label>
            <input value={restForm.restaurantName} onChange={(e) => setRestForm({ ...restForm, restaurantName: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input value={restForm.description} onChange={(e) => setRestForm({ ...restForm, description: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Cuisine types (comma separated)</label>
            <input value={restForm.cuisineType} onChange={(e) => setRestForm({ ...restForm, cuisineType: e.target.value })} placeholder="Gujarati, Vegetarian" />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input value={restForm.address} onChange={(e) => setRestForm({ ...restForm, address: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Opening time</label>
            <input value={restForm.openingTime} onChange={(e) => setRestForm({ ...restForm, openingTime: e.target.value })} placeholder="10:00 AM" />
          </div>
          <div className="form-group">
            <label>Closing time</label>
            <input value={restForm.closingTime} onChange={(e) => setRestForm({ ...restForm, closingTime: e.target.value })} placeholder="10:00 PM" />
          </div>
          <button className="btn btn-primary" type="submit">Create</button>
        </form>
      )}

      {tab === 'menu' && selectedId && (
        <div style={{ marginTop: 16 }}>
          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <h3 style={{ marginTop: 0 }}>Add Category</h3>
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="e.g. Starters" style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid var(--color-border)' }} />
              <button className="btn btn-primary" onClick={handleAddCategory}>Add</button>
            </div>
          </div>

          <form onSubmit={handleAddItem} className="card" style={{ padding: 20, marginBottom: 24, maxWidth: 480 }}>
            <h3 style={{ marginTop: 0 }}>Add Menu Item</h3>
            <div className="form-group">
              <label>Category</label>
              <select value={itemForm.categoryId} onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })} required>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.categoryName}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Item name</label>
              <input value={itemForm.itemName} onChange={(e) => setItemForm({ ...itemForm, itemName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Price (₹)</label>
              <input type="number" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Preparation time (minutes)</label>
              <input type="number" value={itemForm.preparationTime} onChange={(e) => setItemForm({ ...itemForm, preparationTime: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Image</label>
              <input type="file" accept="image/*" onChange={(e) => setItemImage(e.target.files?.[0] || null)} />
            </div>
            <button className="btn btn-primary" type="submit">Add Item</button>
          </form>

          <h3>Current Menu</h3>
          {items.length === 0 ? (
            <p style={{ color: 'var(--color-muted)' }}>No items yet.</p>
          ) : (
            items.map((it) => (
              <div key={it._id} className="menu-item-row">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {it.image && <img src={`${api.defaults.baseURL?.replace('/api', '')}${it.image}`} alt={it.itemName} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />}
                  <div>
                    <strong>{it.itemName}</strong>
                    <p style={{ margin: '2px 0', fontSize: 13 }}>₹{it.price}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'orders' && (
        <div style={{ marginTop: 16 }}>
          {orders.length === 0 ? (
            <p style={{ color: 'var(--color-muted)' }}>No orders yet.</p>
          ) : (
            orders.map((o) => (
              <div key={o._id} className="card" style={{ padding: 16, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{o.orderNumber}</strong>
                  <span>₹{o.totalAmount}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>{o.deliveryAddress}</p>
                <select value={o.orderStatus} onChange={(e) => updateOrderStatus(o._id, e.target.value)}>
                  <option value="placed">Placed</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing!</option>
                  <option value="outForDelivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
