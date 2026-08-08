"use client";

import Link from "next/link";
import { useCart, type CartItem } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/format";

type SellerGroup = { sellerId: string; sellerName: string; items: CartItem[] };

export default function CartPage() {
  const { items, removeItem } = useCart();

  const groups = Object.values(
    items.reduce<Record<string, SellerGroup>>((acc, item) => {
      if (!acc[item.sellerId]) {
        acc[item.sellerId] = { sellerId: item.sellerId, sellerName: item.sellerName, items: [] };
      }
      acc[item.sellerId].items.push(item);
      return acc;
    }, {})
  );

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-black text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-slate-600">Browse fixed-price listings and add them here.</p>
        <Link
          href="/search"
          className="mt-6 inline-flex rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
        >
          Browse listings
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-black text-slate-900">Your cart</h1>

      <div className="mt-6 space-y-6">
        {groups.map((group) => {
          const subtotal = group.items.reduce((sum, item) => sum + item.price, 0);
          const currency = group.items[0]?.currency ?? "NPR";

          return (
            <div key={group.sellerId} className="rounded-md border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-500">Sold by {group.sellerName}</p>

              <div className="mt-3 space-y-3">
                {group.items.map((item) => (
                  <div key={item.listingId} className="flex items-center gap-3">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-16 w-16 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-md bg-slate-100" />
                    )}
                    <div className="flex-1">
                      <Link
                        href={`/listing/${item.listingId}`}
                        className="text-sm font-semibold text-slate-900 hover:text-orange-600"
                      >
                        {item.title}
                      </Link>
                      <p className="text-xs text-slate-500">{item.district}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {formatPrice(item.price, item.currency)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.listingId)}
                      className="text-xs font-semibold text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-bold text-slate-900">{formatPrice(subtotal, currency)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <Link
          href="/checkout"
          className="rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
        >
          Proceed to checkout
        </Link>
      </div>
    </main>
  );
}
