import { useEffect, useState } from 'react';
import api from '../services/api';
import { Order, DeliveryTrackingPoint } from '../types';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tracking, setTracking] = useState<Record<string, DeliveryTrackingPoint | null>>({});
  const [trackingOpen, setTrackingOpen] = useState<string | null>(null);

  useEffect(() => {
    api.get('/orders/my-orders').then(({ data }) => setOrders(data));
  }, []);

  const handleTrack = async (orderId: string) => {
    if (trackingOpen === orderId) {
      setTrackingOpen(null);
      return;
    }
    const { data } = await api.get(`/delivery/tracking/${orderId}`);
    setTracking((prev) => ({ ...prev, [orderId]: data }));
    setTrackingOpen(orderId);
  };

  if (orders.length === 0) {
    return <div className="container empty-state">You haven't placed any orders yet.</div>;
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <h1 className="display">My Orders</h1>
      {orders.map((order) => {
        const point = tracking[order._id];
        return (
          <div key={order._id} className="card" style={{ padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <strong>{order.orderNumber}</strong>
                <p style={{ margin: '4px 0', fontSize: 13, color: 'var(--color-muted)' }}>
                  Status: {order.orderStatus} • Payment: {order.paymentStatus}
                </p>
                <p style={{ fontWeight: 600 }}>₹{order.totalAmount}</p>
              </div>
              {order.orderStatus === 'outForDelivery' && (
                <button className="btn btn-outline" onClick={() => handleTrack(order._id)}>
                  {trackingOpen === order._id ? 'Hide' : 'Track'}
                </button>
              )}
            </div>
            {trackingOpen === order._id && (
              <div className="tracking-box">
                {point ? (
                  <>
                    <p style={{ margin: 0 }}>
                      Last known location: {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                    </p>
                    <p style={{ margin: '4px 0' }}>Updated: {new Date(point.timestamp).toLocaleTimeString()}</p>
                    <a
                      href={`https://www.google.com/maps?q=${point.latitude},${point.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: 'var(--color-secondary)', fontWeight: 600 }}
                    >
                      Open in Google Maps →
                    </a>
                  </>
                ) : (
                  <p style={{ margin: 0 }}>No tracking data yet — the delivery agent hasn't started sharing location.</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Orders;
