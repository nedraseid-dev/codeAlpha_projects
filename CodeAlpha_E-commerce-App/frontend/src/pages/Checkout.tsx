import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ordersApi } from "../api";
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const placeOrder = async () => {
    setLoading(true);
    setError("");
    try {
      await ordersApi.create();
      clear();
      navigate("/orders");
    } catch {
      setError("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: 40, maxWidth: 560 }}>
      <h2>Checkout</h2>
      {items.map(({ product, quantity }) => (
        <div className="cart-row" key={product.id}>
          <img src={product.image_url} alt={product.name} />
          <div style={{ flex: 1 }}>{product.name}</div>
          <div>x{quantity}</div>
          <div>${(product.price * quantity).toFixed(2)}</div>
        </div>
      ))}
      <div className="cart-summary">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
      {error && <p className="form-error" style={{ marginTop: 12 }}>{error}</p>}
      <button className="btn" style={{ marginTop: 20 }} onClick={placeOrder} disabled={loading}>
        {loading ? "Placing order…" : "Place order"}
      </button>
    </div>
  );
}
