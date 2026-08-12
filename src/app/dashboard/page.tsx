import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { formatPrice, timeAgo } from "@/lib/format";
import type { OrderWithRelations } from "@/lib/supabase/types";

const ORDER_SELECT = `
  *,
  order_items(*, listings(id, title)),
  buyer:profiles!orders_buyer_id_fkey(id, display_name),
  seller:profiles!orders_seller_id_fkey(id, display_name),
  delivery_couriers(id, name, base_cost_npr)
`;

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-black text-slate-900">Supabase isn't configured yet</h1>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) notFound();

  // Fetch seller stats
  const { data: listings } = await supabase
    .from("listings")
    .select("id")
    .eq("seller_id", user.id)
    .eq("status", "active");

  // Fetch orders as buyer and seller (per-user view for all accounts)
  const [{ data: buyerOrders }, { data: sellerOrders }, { data: recentOrdersData }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, status")
      .eq("buyer_id", user.id),
    supabase
      .from("orders")
      .select("id, status")
      .eq("seller_id", user.id),
    supabase
      .from("orders")
      .select(ORDER_SELECT)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id")
    .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`);

  const activeListings = listings?.length ?? 0;
  const purchaseCount = buyerOrders?.length ?? 0;
  const fulfillCount = sellerOrders?.length ?? 0;
  const pendingFulfillCount = (sellerOrders ?? []).filter((o) => o.status === "pending").length;
  const totalConversations = conversations?.length ?? 0;
  const recentOrders = (recentOrdersData ?? []) as unknown as OrderWithRelations[];

  return (
    <main className="max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900">Seller Dashboard</h1>
        <p className="mt-2 text-slate-600">Manage your listings, orders, and messages</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Active Listings</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{activeListings}</p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
          <Link href="/dashboard/listings" className="mt-4 inline-block text-sm font-semibold text-orange-600 hover:text-orange-700">
            View all →
          </Link>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Purchases</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{purchaseCount}</p>
            </div>
            <div className="text-4xl">🛒</div>
          </div>
          <Link href="/dashboard/orders" className="mt-4 inline-block text-sm font-semibold text-orange-600 hover:text-orange-700">
            View purchases →
          </Link>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">To Fulfill</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{fulfillCount}</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
          <p className="mt-2 text-xs text-slate-500">{pendingFulfillCount} pending</p>
          <Link href="/dashboard/orders" className="mt-4 inline-block text-sm font-semibold text-orange-600 hover:text-orange-700">
            View orders →
          </Link>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Conversations</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{totalConversations}</p>
            </div>
            <div className="text-4xl">💬</div>
          </div>
          <Link href="/dashboard/messages" className="mt-4 inline-block text-sm font-semibold text-orange-600 hover:text-orange-700">
            View messages →
          </Link>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Subscription Plan</p>
              <p className="mt-2 text-lg font-bold text-slate-900">Free</p>
            </div>
            <div className="text-4xl">⭐</div>
          </div>
          <Link href="/pricing" className="mt-4 inline-block text-sm font-semibold text-orange-600 hover:text-orange-700">
            Upgrade plan →
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      {recentOrders && recentOrders.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order) => {
              const isBuyer = order.buyer_id === user.id;
              const otherParty = isBuyer ? order.seller : order.buyer;
              const orderType = isBuyer ? "Purchase" : "To fulfill";
              const total = order.order_items.reduce((sum, item) => sum + item.price_at_order, 0);

              return (
                <div key={order.id} className="border-b border-slate-100 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase text-slate-500">{orderType}</span>
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${
                        order.status === "pending" ? "bg-yellow-100 text-yellow-900" :
                        order.status === "completed" ? "bg-green-100 text-green-900" :
                        "bg-slate-100 text-slate-900"
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{timeAgo(order.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <p className="font-semibold text-slate-900">{otherParty?.display_name ?? "Unknown"}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""} — {formatPrice(total)}
                      </p>
                    </div>
                    <Link
                      href="/dashboard/orders"
                      className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
