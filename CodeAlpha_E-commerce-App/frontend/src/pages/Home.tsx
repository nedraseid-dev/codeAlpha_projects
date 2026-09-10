import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container" style={{ padding: "80px 24px" }}>
      <h1 style={{ fontSize: "2.6rem", maxWidth: 560 }}>
        Goods worth traveling for, delivered to your door.
      </h1>
      <p style={{ maxWidth: 480, color: "#4a4a44", margin: "16px 0 28px" }}>
        A small, honest catalogue — built for the CodeAlpha internship project.
      </p>
      <Link to="/products" className="btn">Browse the shop</Link>
    </div>
  );
}