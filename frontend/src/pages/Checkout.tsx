import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Checkout = () => {
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    const { data: order } = await api.post('/orders', { deliveryAddress: address });
    await api.post('/payments', {
      orderId: order._id,
      amount: order.totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'success',
    });
    navigate('/orders');
  };

  return (
    <div className="container" style={{ paddingTop: 32, maxWidth: 480 }}>
      <h1 className="display">Checkout</h1>
      <div className="form-group">
        <label>Delivery Address</label>
        <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} />
      </div>
      <div className="form-group">
        <label>Payment Method</label>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="cod">Cash on Delivery</option>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
          <option value="wallet">Wallet</option>
        </select>
      </div>
      <button className="btn btn-primary" onClick={handlePlaceOrder} disabled={!address}>
        Place Order
      </button>
    </div>
  );
};

export default Checkout;
