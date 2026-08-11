"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  priceCents: number;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (slug: string, size: string) => void;
  setQuantity: (slug: string, size: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "acervo-cart-v1";

function sameLine(a: CartItem, slug: string, size: string) {
  return a.slug === slug && a.size === size;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Carrega do localStorage no cliente
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignora
    }
    setLoaded(true);
  }, []);

  // Persiste
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignora
    }
  }, [items, loaded]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.quantity, 0);
    const subtotalCents = items.reduce(
      (n, i) => n + i.priceCents * i.quantity,
      0,
    );
    return {
      items,
      count,
      subtotalCents,
      addItem: (item, quantity = 1) =>
        setItems((prev) => {
          const idx = prev.findIndex((p) => sameLine(p, item.slug, item.size));
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
            return next;
          }
          return [...prev, { ...item, quantity }];
        }),
      removeItem: (slug, size) =>
        setItems((prev) => prev.filter((p) => !sameLine(p, slug, size))),
      setQuantity: (slug, size, quantity) =>
        setItems((prev) =>
          prev
            .map((p) =>
              sameLine(p, slug, size)
                ? { ...p, quantity: Math.max(1, quantity) }
                : p,
            )
            .filter((p) => p.quantity > 0),
        ),
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return ctx;
}
