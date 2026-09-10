import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { count } = useCart();
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <Link to="/" className="brand">Souk</Link>
      <nav>
        <Link to="/products">Shop</Link>
        <Link to="/cart">
          Cart{count > 0 && <span className="cart-badge">{count}</span>}
        </Link>
        {user ? (
          <>
            <Link to="/orders">Orders</Link>
            <Link to="/profile">Profile</Link>
            <button className="btn btn-outline" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <Link to="/login">Log in</Link>
        )}
      </nav>
    </header>
  );
}