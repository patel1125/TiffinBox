import { useEffect, useState } from "react";
import axios from "axios";
import api from "../services/api";
import { Order, DeliveryTrackingPoint } from "../types";

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tracking, setTracking] = useState<Record<string, DeliveryTrackingPoint | null>>({});
  const [trackingOpen, setTrackingOpen] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [trackingLoading, setTrackingLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/orders/my-orders");


      setOrders(data.data ?? data);

      setError("");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Unable to load orders."
        );
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleTrack = async (orderId: string) => {

    if (trackingOpen === orderId) {
      setTrackingOpen(null);
      return;
    }

    // Use cached tracking if already fetched
    if (tracking[orderId]) {
      setTrackingOpen(orderId);
      return;
    }

    try {
      setTrackingLoading(orderId);

      const { data } = await api.get(
        `/delivery/tracking/${orderId}`
      );

      setTracking((prev) => ({
        ...prev,
        [orderId]: data.data ?? data,
      }));

      setTrackingOpen(orderId);
    } catch {
      alert("Unable to fetch tracking.");
    } finally {
      setTrackingLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#ff9800";

      case "preparing":
        return "#2196f3";

      case "outForDelivery":
        return "#9c27b0";

      case "delivered":
        return "#4caf50";

      case "cancelled":
        return "#f44336";

      default:
        return "#777";
    }
  };

  if (loading) {
    return (
      <div className="container">
        <h2>Loading your orders...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <p style={{ color: "crimson" }}>{error}</p>

        <button
          className="btn btn-primary"
          onClick={fetchOrders}
        >
          Retry
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container empty-state">
        <h2>🍽️</h2>
        <h3>No Orders Yet</h3>
        <p>
          Your order history will appear here.
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
      <h1 className="display">
        My Orders
      </h1>

      {orders.map((order) => {

        const point = tracking[order._id];

        return (
          <div
            key={order._id}
            className="card"
            style={{
              padding: 20,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
              }}
            >
              <div>

                <strong>
                  #{order.orderNumber}
                </strong>

                <p>
                  ₹{order.totalAmount}
                </p>

                <span
                  style={{
                    background:
                      getStatusColor(
                        order.orderStatus
                      ),
                    color: "#fff",
                    padding:
                      "5px 12px",
                    borderRadius: 20,
                    fontSize: 12,
                  }}
                >
                  {order.orderStatus}
                </span>

              </div>

              <div>

                <small>
                  Payment:
                  {" "}
                  {order.paymentStatus}
                </small>

                <br />

                {order.createdAt && (
                  <small>
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString()}
                  </small>
                )}

              </div>
            </div>

            {order.orderStatus ===
              "outForDelivery" && (
              <div
                style={{
                  marginTop: 20,
                }}
              >
                <button
                  className="btn btn-outline"
                  onClick={() =>
                    handleTrack(order._id)
                  }
                  disabled={
                    trackingLoading ===
                    order._id
                  }
                >
                  {trackingLoading ===
                  order._id
                    ? "Loading..."
                    : trackingOpen ===
                      order._id
                    ? "Hide Tracking"
                    : "Track Order"}
                </button>
              </div>
            )}

            {trackingOpen ===
              order._id && (
              <div
                className="tracking-box"
              >
                {point ? (
                  <>

                    <p>
                      📍
                      {" "}
                      {point.latitude.toFixed(
                        4
                      )}
                      ,
                      {" "}
                      {point.longitude.toFixed(
                        4
                      )}
                    </p>

                    <p>
                      Updated:
                      {" "}
                      {new Date(
                        point.timestamp
                      ).toLocaleTimeString()}
                    </p>

                    <a
                      href={`https://www.google.com/maps?q=${point.latitude},${point.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in Google Maps →
                    </a>

                  </>
                ) : (
                  <p>
                    Delivery partner
                    hasn't shared
                    location yet.
                  </p>
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