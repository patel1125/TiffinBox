import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DeliveryLocation = () => {
  const [address, setAddress] = useState(() => localStorage.getItem('tiffinbox_delivery_address') || '');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const saveLocation = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.put('/users/profile', { address });
      localStorage.setItem('tiffinbox_delivery_address', address.trim());
      setMessage('Delivery location saved. It will be used at checkout.');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Unable to save your delivery location.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 32, maxWidth: 560 }}>
      <h1 className="display">Set Delivery Location</h1>
      <p style={{ color: 'var(--color-muted)' }}>Enter the complete address where you want your food delivered.</p>
      <form onSubmit={saveLocation} className="card" style={{ padding: 20 }}>
        <div className="form-group">
          <label>Delivery address</label>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={4} placeholder="House/flat number, street, area, city, PIN code" required />
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Location'}</button>
          <button className="btn btn-outline" type="button" onClick={() => navigate('/cart')}>Go to Cart</button>
        </div>
        {message && <p style={{ marginBottom: 0, color: 'var(--color-muted)' }}>{message}</p>}
      </form>
    </div>
  );
};

export default DeliveryLocation;
