import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Cart as CartType, MenuItem } from '../types';

const CartPage = () => {
  const [cart, setCart] = useState<CartType | null>(null);
  const navigate = useNavigate();

  const fetchCart = async () => {
    const { data } = await api.get('/cart');
    setCart(data);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (menuItemId: string, quantity: number) => {
    if (quantity < 1) return;
    await api.put('/cart/update', { menuItemId, quantity });
    fetchCart();
  };

  const removeItem = async (menuItemId: string) => {
    await api.delete(`/cart/remove/${menuItemId}`);
    fetchCart();
  };

  if (!cart || cart.items.length === 0) {
    return <div className="container empty-state">Your cart is empty.</div>;
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <h1 className="display">Your Cart</h1>
      {cart.items.map((item) => {
        const menuItem = item.menuItemId as MenuItem;
        return (
          <div key={menuItem._id} className="menu-item-row">
            <div>
              <strong>{menuItem.itemName}</strong>
              <p style={{ margin: '4px 0', fontSize: 13 }}>
                ₹{item.price} x {item.quantity}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn btn-outline" onClick={() => updateQuantity(menuItem._id, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button className="btn btn-outline" onClick={() => updateQuantity(menuItem._id, item.quantity + 1)}>+</button>
              <button className="btn btn-outline" onClick={() => removeItem(menuItem._id)}>Remove</button>
            </div>
          </div>
        );
      })}
      <h3 style={{ marginTop: 24 }}>Total: ₹{cart.totalAmount}</h3>
      <button className="btn btn-primary" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
    </div>
  );
};

export default CartPage;
