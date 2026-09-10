import { useEffect, useState } from "react";
import { productsApi } from "../api";
import type { Product } from "../types";
import ProductCard from "../components/ProductCard";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    productsApi
      .getAll()
      .then(setProducts)
      .catch(() => setError("Could not load products."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container empty-state">Loading…</div>;
  if (error) return <div className="container empty-state">{error}</div>;

  return (
    <div className="container" style={{ marginTop: 32 }}>
      <h2>All Products</h2>
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
