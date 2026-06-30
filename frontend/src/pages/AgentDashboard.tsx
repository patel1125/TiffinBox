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
    await api.put(`/delivery/agents/${agent._id}/availability`, { isAvailable: !agent.isAvailable });
    loadAgent();
  };

  const updateLocation = async (e: FormEvent) => {
    e.preventDefault();
    const myOrders = orders.filter((o) => o.orderStatus === 'outForDelivery');
    if (myOrders.length === 0 || !agent) return;
    await Promise.all(
      myOrders.map((o) =>
        api.post('/delivery/tracking', {
          orderId: o._id,
          deliveryAgentId: agent._id,
          latitude: Number(lat),
          longitude: Number(lng),
        })
      )
    );
    setLat('');
    setLng('');
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
        <p style={{ color: 'var(--color-muted)' }}>No orders assigned to you yet.</p>
      ) : (
        orders.map((o) => (
          <div key={o._id} className="card" style={{ padding: 16, marginBottom: 10 }}>
            <strong>{o.orderNumber}</strong>
            <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>{o.deliveryAddress}</p>
            <p style={{ fontSize: 13 }}>Status: {o.orderStatus}</p>
          </div>
        ))
      )}

      {orders.some((o) => o.orderStatus === 'outForDelivery') && (
        <form onSubmit={updateLocation} className="card" style={{ padding: 16, marginTop: 20, maxWidth: 360 }}>
          <h3 style={{ marginTop: 0 }}>Update My Location</h3>
          <div className="form-group">
            <label>Latitude</label>
            <input value={lat} onChange={(e) => setLat(e.target.value)} required placeholder="23.0225" />
          </div>
          <div className="form-group">
            <label>Longitude</label>
            <input value={lng} onChange={(e) => setLng(e.target.value)} required placeholder="72.5714" />
          </div>
          <button className="btn btn-primary" type="submit">Send Location</button>
        </form>
      )}
    </div>
  );
};

export default AgentDashboard;
