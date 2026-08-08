"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";

export function CartIcon() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      aria-label="Cart"
      className="relative hidden rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-orange-600 sm:inline-flex"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M3 4h2l1.6 10.6a2 2 0 0 0 2 1.7h8.2a2 2 0 0 0 2-1.6L20 8H6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9.5" cy="20" r="1.4" fill="currentColor" />
        <circle cx="17" cy="20" r="1.4" fill="currentColor" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
