import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Cart() {
  const { items, updateQuantity, removeItem, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container empty-state">
        Your cart is empty. <Link to="/products">Go find something.</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: 32, maxWidth: 640 }}>
      <h2>Your cart</h2>
      {items.map(({ product, quantity }) => (
        <div className="cart-row" key={product.id}>
          <img src={product.image_url} alt={product.name} />
          <div>
            <div>{product.name}</div>
            <div style={{ color: "#8a8a80", fontSize: "0.9rem" }}>
              ${product.price.toFixed(2)} each
            </div>
          </div>
          <input
            type="number"
            min={1}
            className="qty-input"
            value={quantity}
            onChange={(e) => updateQuantity(product.id, Number(e.target.value))}
          />
          <button className="btn btn-outline" onClick={() => removeItem(product.id)}>
            Remove
          </button>
        </div>
      ))}

      <div className="cart-summary">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      <button
        className="btn"
        style={{ marginTop: 20 }}
        onClick={() => navigate(user ? "/checkout" : "/login")}
      >
        Checkout
      </button>
    </div>
  );
}
