"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { useCart, type CartItem } from "@/lib/cart/cart-context";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { checkoutAction, type CheckoutActionState } from "@/lib/actions/orders";
import { formatPrice } from "@/lib/format";
import type { DeliveryCourier } from "@/lib/supabase/types";

type SellerGroup = { sellerId: string; sellerName: string; items: CartItem[] };
type DeliveryChoice = { courierId: string | null; pickup: boolean };

export default function CheckoutPage() {
  const { state: cartState, clearCart } = useCart();
  const router = useRouter();
  const configured = isSupabaseConfigured();

  const [authChecked, setAuthChecked] = useState(!configured);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authTab, setAuthTab] = useState<"signup" | "login">("signup");
  const [couriers, setCouriers] = useState<DeliveryCourier[]>([]);
  const [deliveryChoices, setDeliveryChoices] = useState<Record<string, DeliveryChoice>>({});

  const [orderState, formAction, isPending] = useActionState<CheckoutActionState, FormData>(
    checkoutAction,
    {}
  );

  useEffect(() => {
    if (!configured) return;

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsAuthenticated(Boolean(data.user));
      setAuthChecked(true);
    });
    supabase
      .from("delivery_couriers")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => setCouriers((data as DeliveryCourier[]) ?? []));
  }, [configured]);

  useEffect(() => {
    if (orderState.success) {
      clearCart();
      router.push("/dashboard/orders");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderState.success]);

  const groups: SellerGroup[] = Object.values(
    cartState.items.reduce<Record<string, SellerGroup>>((acc: Record<string, SellerGroup>, item: CartItem) => {
      if (!acc[item.sellerId]) {
        acc[item.sellerId] = { sellerId: item.sellerId, sellerName: item.sellerName, items: [] };
      }
      acc[item.sellerId].items.push(item);
      return acc;
    }, {})
  );

  if (!authChecked) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-slate-500">Loading...</p>
      </main>
    );
  }

  if (cartState.items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-black text-slate-900">Your cart is empty</h1>
        <Link
          href="/search"
          className="mt-6 inline-flex rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
        >
          Browse listings
        </Link>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">Sign in to complete your order</h1>
          <p className="mt-2 text-sm text-slate-600">
            Your cart ({cartState.items.length} item{cartState.items.length === 1 ? "" : "s"}) will be waiting.
          </p>

          <div className="mt-6 flex gap-1 rounded-full bg-slate-100 p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setAuthTab("signup")}
              className={`flex-1 rounded-full py-2 transition ${
                authTab === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Create account
            </button>
            <button
              type="button"
              onClick={() => setAuthTab("login")}
              className={`flex-1 rounded-full py-2 transition ${
                authTab === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              Log in
            </button>
          </div>

          <div className="mt-6">
            {authTab === "signup" ? <SignupForm next="/checkout" /> : <LoginForm next="/checkout" />}
          </div>
        </div>
      </main>
    );
  }

  const cartPayload = JSON.stringify(cartState.items.map((item) => ({ listingId: item.listingId })));
  const deliveryPayload = JSON.stringify(
    groups.map((group) => ({
      sellerId: group.sellerId,
      courierId: deliveryChoices[group.sellerId]?.courierId ?? null,
      pickup: deliveryChoices[group.sellerId]?.pickup ?? false,
    }))
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-black text-slate-900">Checkout</h1>

      <form action={formAction} className="mt-6 space-y-6">
        <input type="hidden" name="cartPayload" value={cartPayload} />
        <input type="hidden" name="deliveryPayload" value={deliveryPayload} />

        {orderState.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {orderState.error}
          </div>
        )}

        {groups.map((group) => {
          const subtotal = group.items.reduce((sum, item) => sum + item.price, 0);
          const currency = group.items[0]?.currency ?? "NPR";
          const choice = deliveryChoices[group.sellerId];

          return (
            <div key={group.sellerId} className="rounded-md border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-500">Sold by {group.sellerName}</p>
              <ul className="mt-3 space-y-1 text-sm text-slate-700">
                {group.items.map((item) => (
                  <li key={item.listingId} className="flex justify-between gap-3">
                    <span>{item.title}</span>
                    <span className="shrink-0 font-semibold">
                      {formatPrice(item.price, item.currency)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-bold text-slate-900">{formatPrice(subtotal, currency)}</span>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Delivery
                </label>
                <select
                  value={choice?.pickup ? "pickup" : (choice?.courierId ?? "")}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDeliveryChoices((prev) => ({
                      ...prev,
                      [group.sellerId]:
                        value === "pickup"
                          ? { courierId: null, pickup: true }
                          : { courierId: value || null, pickup: false },
                    }));
                  }}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-300"
                >
                  <option value="">Arrange with seller</option>
                  <option value="pickup">Pickup in person</option>
                  {couriers.map((courier) => (
                    <option key={courier.id} value={courier.id}>
                      {courier.name} — NPR {courier.base_cost_npr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:opacity-60"
        >
          {isPending ? "Placing order..." : "Place order"}
        </button>
        <p className="text-center text-xs text-slate-500">
          No payment is collected now — the seller will confirm payment and delivery details with
          you directly.
        </p>
      </form>
    </main>
  );
}
