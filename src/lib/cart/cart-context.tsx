"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface CartItem {
  listingId: string;
  title: string;
  price: number;
  currency: string;
  image: string | null;
  sellerId: string;
  sellerName: string;
  district: string;
  quantity: number;
  deliveryMethod?: string;
  price_on_request?: boolean;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

type CartContextValue = {
  state: CartState;
  addItem: (item: CartItem) => void;
  updateQuantity: (listingId: string, quantity: number) => void;
  removeFromCart: (listingId: string) => void;
  clearCart: () => void;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "mn_cart";

function calculateTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 5000 ? 0 : 100; // Free shipping above NPR 5000
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>({
    items: [],
    subtotal: 0,
    shipping: 0,
    total: 0,
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const items = JSON.parse(raw);
        const totals = calculateTotals(items);
        setState({ items, ...totals });
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items, hydrated]);

  function addItem(item: CartItem) {
    setState((prev) => {
      const existing = prev.items.find((i) => i.listingId === item.listingId);
      let newItems;

      if (existing) {
        newItems = prev.items.map((i) =>
          i.listingId === item.listingId
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      } else {
        newItems = [...prev.items, { ...item, quantity: item.quantity || 1 }];
      }

      const totals = calculateTotals(newItems);
      return { items: newItems, ...totals };
    });
  }

  function updateQuantity(listingId: string, quantity: number) {
    setState((prev) => {
      const newItems = prev.items.map((i) =>
        i.listingId === listingId ? { ...i, quantity: Math.max(1, quantity) } : i
      );
      const totals = calculateTotals(newItems);
      return { items: newItems, ...totals };
    });
  }

  function removeFromCart(listingId: string) {
    setState((prev) => {
      const newItems = prev.items.filter((i) => i.listingId !== listingId);
      const totals = calculateTotals(newItems);
      return { items: newItems, ...totals };
    });
  }

  function clearCart() {
    setState({ items: [], subtotal: 0, shipping: 0, total: 0 });
  }

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        updateQuantity,
        removeFromCart,
        clearCart,
        count: state.items.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
