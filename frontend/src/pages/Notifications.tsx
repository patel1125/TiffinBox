import { useEffect, useState } from 'react';
import api from '../services/api';
import { AppNotification } from '../types';

const Notifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const fetchNotifications = async () => {
    const { data } = await api.get('/notifications');
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id: string) => {
    await api.put(`/notifications/${id}/read`);
    fetchNotifications();
  };

  if (notifications.length === 0) {
    return <div className="container empty-state">No notifications yet.</div>;
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <h1 className="display">Notifications</h1>
      {notifications.map((n) => (
        <div
          key={n._id}
          className={`notification-item ${!n.isRead ? 'unread' : ''}`}
          onClick={() => !n.isRead && markRead(n._id)}
          style={{ cursor: n.isRead ? 'default' : 'pointer' }}
        >
          <div>
            <strong style={{ fontSize: 14 }}>{n.title}</strong>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-muted)' }}>{n.message}</p>
          </div>
          {!n.isRead && <span className="dot" />}
        </div>
      ))}
    </div>
  );
};

export default Notifications;
