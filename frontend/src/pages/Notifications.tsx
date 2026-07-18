import { useEffect, useState } from "react";
import axios from "axios";
import api from "../services/api";
import { AppNotification } from "../types";


const Notifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/notifications");

      // If your backend returns { success, data }
      setNotifications(data.data ?? data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Unable to load notifications."
        );
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id: string) => {
    try {
      setProcessingId(id);

      await api.patch(`/notifications/${id}/read`);

      // Update only the clicked notification
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch {
      alert("Failed to update notification.");
    } finally {
      setProcessingId(null);
    }
  };

  
  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  if (loading) {
    return (
      <div className="container">
        <h2>Loading notifications...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <p style={{ color: "crimson" }}>{error}</p>

        <button
          className="btn btn-primary"
          onClick={fetchNotifications}
        >
          Retry
        </button>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="container empty-state">
        <h2>🔔</h2>
        <h3>No Notifications</h3>
        <p>
          You're all caught up.
        </p>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{
        paddingTop: 30,
        paddingBottom: 50,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 25,
        }}
      >
        <h1 className="display">
          Notifications
        </h1>

        <span
          className="badge"
        >
          {unreadCount} unread
        </span>
      </div>

      {notifications.map((notification) => (
        <div
          key={notification._id}
          className={`notification-item ${
            !notification.isRead
              ? "unread"
              : ""
          }`}
          style={{
            cursor: notification.isRead
              ? "default"
              : "pointer",
            opacity:
              processingId ===
              notification._id
                ? 0.6
                : 1,
          }}
          onClick={() =>
            !notification.isRead &&
            processingId !==
              notification._id &&
            markRead(notification._id)
          }
        >
          <div>

            <strong>
              {notification.title}
            </strong>

            <p
              style={{
                marginTop: 5,
                color:
                  "var(--color-muted)",
              }}
            >
              {notification.message}
            </p>

            {notification.createdAt && (
              <small
                style={{
                  color:
                    "var(--color-muted)",
                }}
              >
                {new Date(
                  notification.createdAt
                ).toLocaleString()}
              </small>
            )}

          </div>

          {!notification.isRead && (
            <span className="dot" />
          )}
        </div>
      ))}
    </div>
  );
};

export default Notifications;