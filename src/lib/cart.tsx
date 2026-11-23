"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  customizationKey,
  type Customization,
} from "./customization";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  priceCents: number; // preço base
  extraCents: number; // adicionais de personalização
  customization?: Customization;
  lineId: string; // identifica a linha (slug + tamanho + personalização)
  quantity: number;
};

export type AddItemInput = Omit<CartItem, "quantity" | "lineId" | "extraCents"> & {
  extraCents?: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  addItem: (item: AddItemInput, quantity?: number) => void;
  removeItem: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "acervo-cart-v2";

function makeLineId(slug: string, size: string, c?: Customization) {
  return `${slug}|${size}|${customizationKey(c)}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignora
    }
    setLoaded(true);
  }, []);

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
      (n, i) => n + (i.priceCents + i.extraCents) * i.quantity,
      0,
    );
    return {
      items,
      count,
      subtotalCents,
      addItem: (item, quantity = 1) =>
        setItems((prev) => {
          const lineId = makeLineId(item.slug, item.size, item.customization);
          const idx = prev.findIndex((p) => p.lineId === lineId);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = {
              ...next[idx],
              quantity: next[idx].quantity + quantity,
            };
            return next;
          }
          return [
            ...prev,
            { ...item, extraCents: item.extraCents ?? 0, lineId, quantity },
          ];
        }),
      removeItem: (lineId) =>
        setItems((prev) => prev.filter((p) => p.lineId !== lineId)),
      setQuantity: (lineId, quantity) =>
        setItems((prev) =>
          prev
            .map((p) =>
              p.lineId === lineId
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
