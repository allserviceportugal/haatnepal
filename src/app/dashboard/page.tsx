import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import type { Profile } from "@/lib/supabase/types";

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

  // Fetch user profile to check if admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = (profile as any)?.role === "admin";

  // Fetch seller stats
  const { data: listings } = await supabase
    .from("listings")
    .select("id")
    .eq("seller_id", user.id)
    .eq("status", "active");

  // Only fetch orders for admins
  let orders = null;
  let recentOrders = null;
  if (isAdmin) {
    const ordersResult = await supabase
      .from("orders")
      .select("id, status");

    orders = ordersResult.data;

    const recentOrdersResult = await supabase
      .from("orders")
      .select("id, created_at, status, buyer_id, seller_id, profiles!orders_buyer_id_fkey(display_name)")
      .order("created_at", { ascending: false })
      .limit(5);

    recentOrders = recentOrdersResult.data;
  }

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id")
    .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`);

  const activeListings = listings?.length ?? 0;
  const totalOrders = orders?.length ?? 0;
  const pendingOrders = orders?.filter((o) => o.status === "pending").length ?? 0;
  const totalConversations = conversations?.length ?? 0;

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
              <p className="text-sm font-semibold text-slate-500">Total Orders</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{totalOrders}</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
          <p className="mt-2 text-xs text-slate-500">{pendingOrders} pending</p>
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
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-b-0">
                <div>
                  <p className="font-semibold text-slate-900">
                    Order {order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-sm text-slate-500">
                    {(order.profiles as any)?.display_name ?? "Unknown buyer"}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                    order.status === "pending" ? "bg-yellow-100 text-yellow-900" :
                    order.status === "completed" ? "bg-green-100 text-green-900" :
                    "bg-slate-100 text-slate-900"
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
