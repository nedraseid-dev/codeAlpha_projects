import { useEffect, useState } from "react";
import { ordersApi } from "../api";
import type { Order } from "../types";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    ordersApi
      .getMine()
      .then(setOrders)
      .catch(() => setError("Could not load orders."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container empty-state">Loading…</div>;
  if (error) return <div className="container empty-state">{error}</div>;
  if (orders.length === 0)
    return <div className="container empty-state">You have no orders yet.</div>;

  return (
    <div className="container" style={{ marginTop: 32 }}>
      <h2>Your orders</h2>
      {orders.map((order) => (
        <div className="order-card" key={order.id}>
          <h4>Order #{order.id}</h4>
          <p style={{ color: "#4a4a44", fontSize: "0.9rem" }}>
            {new Date(order.created_at).toLocaleDateString()}
          </p>
          <p style={{ marginTop: 8 }}>
            Total: <strong>${Number(order.total).toFixed(2)}</strong>
          </p>
          <span className="order-status">{order.status}</span>
        </div>
      ))}
    </div>
  );
}
