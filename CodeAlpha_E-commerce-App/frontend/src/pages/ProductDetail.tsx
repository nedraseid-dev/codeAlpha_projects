import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { productsApi } from "../api";
import type { Product } from "../types";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addItem } = useCart();

  useEffect(() => {
    if (!id) return;
    productsApi
      .getById(id)
      .then(setProduct)
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="container empty-state">Loading…</div>;
  if (error || !product) return <div className="container empty-state">{error}</div>;

  return (
    <div className="container" style={{ marginTop: 40, maxWidth: 700 }}>
      <img
        src={product.image_url}
        alt={product.name}
        style={{ width: "100%", borderRadius: 10, maxHeight: 360, objectFit: "cover" }}
      />
      <h2 style={{ marginTop: 24 }}>{product.name}</h2>
      <p style={{ color: "#4a4a44", margin: "12px 0" }}>{product.description}</p>
      <div style={{ fontWeight: 600, fontSize: "1.3rem", marginBottom: 20 }}>
        ${product.price.toFixed(2)}
      </div>
      <button
        className="btn"
        disabled={product.stock === 0}
        onClick={() => addItem(product)}
      >
        {product.stock === 0 ? "Out of stock" : "Add to cart"}
      </button>
    </div>
  );
}
