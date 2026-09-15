import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import type { CartItem, Product } from "../types";
import api from "../api";
import { useAuth } from "./AuthContext";

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function storageKeyFor(userId: string | null) {
  return userId ? `cart_${userId}` : "cart_guest";
}

function loadCart(key: string): CartItem[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(key: string, items: CartItem[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const storageKey = storageKeyFor(user?.id ?? null);
  const [items, setItems] = useState<CartItem[]>(() => loadCart(storageKey));

  // Whenever the logged-in user changes (login, logout, switching accounts),
  // swap to that user's own cart instead of whatever was left behind before.
  useEffect(() => {
    setItems(loadCart(storageKey));
  }, [storageKey]);

  const set = useCallback(
    (updater: (prev: CartItem[]) => CartItem[]) => {
      setItems((prev) => {
        const next = updater(prev);
        saveCart(storageKey, next);
        return next;
      });
    },
    [storageKey]
  );

  const addItem = useCallback(
    (product: Product, quantity = 1) => {
      set((prev) => {
        const existing = prev.find((i) => i.product.id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [...prev, { product, quantity }];
      });

      api.post("/cart", { productId: product.id, quantity }).catch((err) => {
        console.error("Failed to sync add-to-cart with server:", err);
      });
    },
    [set]
  );

  const removeItem = useCallback(
    (productId: string) => {
      set((prev) => prev.filter((i) => i.product.id !== productId));

      api.delete(`/cart/${productId}`).catch((err) => {
        console.error("Failed to sync cart removal with server:", err);
      });
    },
    [set]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      set((prev) =>
        quantity <= 0
          ? prev.filter((i) => i.product.id !== productId)
          : prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
      );

      if (quantity <= 0) {
        api.delete(`/cart/${productId}`).catch((err) => {
          console.error("Failed to sync cart removal with server:", err);
        });
      } else {
        api.put(`/cart/${productId}`, { quantity }).catch((err) => {
          console.error("Failed to sync quantity update with server:", err);
        });
      }
    },
    [set]
  );

  const clear = useCallback(() => {
    setItems([]);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items]
  );
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}