import { FormEvent, useEffect, useState } from 'react';
import api from '../services/api';
import { Restaurant } from '../types';

interface Reservation {
  _id: string;
  restaurantId: string;
  reservationDate: string;
  reservationTime: string;
  numberOfGuests: number;
  status: string;
}

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [form, setForm] = useState({ restaurantId: '', reservationDate: '', reservationTime: '', numberOfGuests: '2' });
  const [message, setMessage] = useState('');

  const loadReservations = async () => {
    const { data } = await api.get('/reservations/my-reservations');
    setReservations(data);
  };

  useEffect(() => {
    loadReservations().catch(() => setMessage('Unable to load reservations. Please log in again.'));
    api.get('/restaurants', { params: { limit: 50 } }).then(({ data }) => setRestaurants(data));
  }, []);

  const createReservation = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api.post('/reservations', { ...form, numberOfGuests: Number(form.numberOfGuests) });
      setMessage('Table reservation created successfully.');
      setForm({ restaurantId: '', reservationDate: '', reservationTime: '', numberOfGuests: '2' });
      await loadReservations();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Unable to create the reservation.');
    }
  };

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <h1 className="display">My Reservations</h1>
      <form onSubmit={createReservation} className="card" style={{ padding: 20, maxWidth: 520, marginBottom: 24 }}>
        <h3 style={{ marginTop: 0 }}>Reserve a Table</h3>
        <div className="form-group">
          <label>Restaurant</label>
          <select value={form.restaurantId} onChange={(e) => setForm({ ...form, restaurantId: e.target.value })} required>
            <option value="">Choose a restaurant</option>
            {restaurants.map((restaurant) => <option key={restaurant._id} value={restaurant._id}>{restaurant.restaurantName}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="date" value={form.reservationDate} onChange={(e) => setForm({ ...form, reservationDate: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Time</label>
          <input type="time" value={form.reservationTime} onChange={(e) => setForm({ ...form, reservationTime: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Guests</label>
          <input type="number" min="1" value={form.numberOfGuests} onChange={(e) => setForm({ ...form, numberOfGuests: e.target.value })} required />
        </div>
        <button className="btn btn-primary" type="submit">Reserve Table</button>
        {message && <p style={{ marginBottom: 0, color: 'var(--color-muted)' }}>{message}</p>}
      </form>

      {reservations.length === 0 && <div className="empty-state">No table reservations yet.</div>}
      {reservations.map((res) => (
        <div key={res._id} className="card" style={{ padding: 16, marginBottom: 12 }}>
          <p>{new Date(res.reservationDate).toLocaleDateString()} at {res.reservationTime}</p>
          <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
            Guests: {res.numberOfGuests} • Status: {res.status}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Reservations;
