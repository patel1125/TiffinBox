import { useEffect, useState, FormEvent } from 'react';
import api from '../services/api';
import { Order } from '../types';

interface Agent {
  _id: string;
  vehicleType: string;
  licenseNumber: string;
  isAvailable: boolean;
}

const AgentDashboard = () => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [regForm, setRegForm] = useState({ vehicleType: 'bike', licenseNumber: '' });
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [locationMessage, setLocationMessage] = useState('');
  const [savingLocation, setSavingLocation] = useState(false);

  const loadAgent = async () => {
    try {
      const { data } = await api.get('/delivery/agents/me');
      setAgent(data);
      if (data) {
        const { data: ordersData } = await api.get('/delivery/agents/me/orders');
        setOrders(ordersData);
      }
    } catch {
      setAgent(null);
    }
  };

  useEffect(() => {
    loadAgent();
  }, []);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/delivery/agents', regForm);
    loadAgent();
  };

  const toggleAvailability = async () => {
    if (!agent) return;
    await api.put('/delivery/agents/me/availability', { isAvailable: !agent.isAvailable });
    loadAgent();
  };

  const updateLocation = async (e: FormEvent) => {
    e.preventDefault();
    const latitude = Number(lat);
    const longitude = Number(lng);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setLocationMessage('Enter valid latitude and longitude values.');
      return;
    }
    setSavingLocation(true);
    try {
      await api.put('/delivery/agents/me/location', { latitude, longitude });
      const myOrders = orders.filter((o) => o.orderStatus === 'outForDelivery');
      if (myOrders.length > 0 && agent) {
        await Promise.all(myOrders.map((o) => api.post('/delivery/tracking', { orderId: o._id, latitude, longitude })));
      }
      setLat('');
      setLng('');
      setLocationMessage(myOrders.length > 0 ? 'Location shared with your active delivery.' : 'Your delivery location has been saved.');
    } catch (error: any) {
      setLocationMessage(error.response?.data?.message || 'Unable to save location. Please log in as a delivery agent and try again.');
    } finally {
      setSavingLocation(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Your browser does not support location services.');
      return;
    }
    setLocationMessage('Getting your current location...');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLat(coords.latitude.toFixed(6));
        setLng(coords.longitude.toFixed(6));
        setLocationMessage('Location found. Select Save Location to send it.');
      },
      () => setLocationMessage('Location access was blocked. Allow location access in your browser or enter coordinates manually.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (!agent) {
    return (
      <div className="container" style={{ paddingTop: 32, maxWidth: 420 }}>
        <h1 className="display">Become a Delivery Agent</h1>
        <form onSubmit={handleRegister} className="card" style={{ padding: 20 }}>
          <div className="form-group">
            <label>Vehicle type</label>
            <select value={regForm.vehicleType} onChange={(e) => setRegForm({ ...regForm, vehicleType: e.target.value })}>
              <option value="bike">Bike</option>
              <option value="scooter">Scooter</option>
              <option value="bicycle">Bicycle</option>
              <option value="car">Car</option>
            </select>
          </div>
          <div className="form-group">
            <label>License number</label>
            <input value={regForm.licenseNumber} onChange={(e) => setRegForm({ ...regForm, licenseNumber: e.target.value })} required />
          </div>
          <button className="btn btn-primary" type="submit">Register as Agent</button>
        </form>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <h1 className="display">Delivery Dashboard</h1>
      <div className="card" style={{ padding: 16, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Status: <strong>{agent.isAvailable ? 'Available' : 'Offline'}</strong></span>
        <button className="btn btn-outline" onClick={toggleAvailability}>
          {agent.isAvailable ? 'Go Offline' : 'Go Available'}
        </button>
      </div>

      <h3>Assigned Orders</h3>
      {orders.length === 0 ? (
        <p style={{ color: 'var(--color-muted)' }}>No orders assigned yet.</p>
      ) : (
        orders.map((o) => (
          <div key={o._id} className="card" style={{ padding: 16, marginBottom: 10 }}>
            <strong>{o.orderNumber}</strong>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: 6 }}>
              <strong style={{ color: 'inherit' }}>Customer delivery location:</strong> {o.deliveryAddress}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.deliveryAddress)}`}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 13 }}
            >
              Open customer location in Google Maps →
            </a>
            <p style={{ fontSize: 13 }}>Status: {o.orderStatus}</p>
          </div>
        ))
      )}

      <form onSubmit={updateLocation} className="card" style={{ padding: 16, marginTop: 20, maxWidth: 360 }}>
        <h3 style={{ marginTop: 0 }}>Set My Location</h3>
        <div className="form-group">
          <label>Latitude</label>
          <input value={lat} onChange={(e) => setLat(e.target.value)} required placeholder="23.0225" />
        </div>
        <div className="form-group">
          <label>Longitude</label>
          <input value={lng} onChange={(e) => setLng(e.target.value)} required placeholder="72.5714" />
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-outline" type="button" onClick={useCurrentLocation}>Use My Current Location</button>
          <button className="btn btn-primary" type="submit" disabled={savingLocation}>{savingLocation ? 'Saving...' : 'Save Location'}</button>
        </div>
        {locationMessage && <p style={{ marginBottom: 0, color: 'var(--color-muted)' }}>{locationMessage}</p>}
      </form>

    </div>
  );
};

export default AgentDashboard;
