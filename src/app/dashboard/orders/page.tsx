import Link from "next/link";
import { redirect } from "next/navigation";
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

export default async function DashboardOrdersPage() {
  if (!isSupabaseConfigured()) {
    return <p className="text-slate-500">Connect Supabase to see your orders.</p>;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/orders");

  const [{ data: asBuyer }, { data: asSeller }] = await Promise.all([
    supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const buyerOrders = (asBuyer ?? []) as unknown as OrderWithRelations[];
  const sellerOrders = (asSeller ?? []) as unknown as OrderWithRelations[];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Your orders</h1>
        {buyerOrders.length === 0 ? (
          <p className="mt-4 text-slate-500">You haven&apos;t placed any orders yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {buyerOrders.map((order) => (
              <OrderCard key={order.id} order={order} otherPartyLabel="Seller" otherParty={order.seller} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-black text-slate-900">Orders to fulfill</h2>
        {sellerOrders.length === 0 ? (
          <p className="mt-4 text-slate-500">No incoming orders yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {sellerOrders.map((order) => (
              <OrderCard key={order.id} order={order} otherPartyLabel="Buyer" otherParty={order.buyer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  otherPartyLabel,
  otherParty,
}: {
  order: OrderWithRelations;
  otherPartyLabel: string;
  otherParty: { display_name: string } | null;
}) {
  const total = order.order_items.reduce((sum, item) => sum + item.price_at_order, 0);

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
          {order.status}
        </span>
        <span className="text-xs text-slate-400">{timeAgo(order.created_at)}</span>
      </div>
      <ul className="mt-3 space-y-1 text-sm text-slate-700">
        {order.order_items.map((item) => (
          <li key={item.id} className="flex justify-between gap-3">
            <Link href={`/listing/${item.listing_id}`} className="hover:text-orange-600">
              {item.listings?.title ?? "Listing"}
            </Link>
            <span className="shrink-0 font-semibold">{formatPrice(item.price_at_order)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
        <span className="text-slate-500">
          {otherPartyLabel}: {otherParty?.display_name ?? "User"}
        </span>
        <span className="font-bold text-slate-900">{formatPrice(total)}</span>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {order.pickup_selected
          ? "Pickup in person"
          : order.delivery_couriers
            ? `${order.delivery_couriers.name} — NPR ${order.delivery_couriers.base_cost_npr}`
            : "Delivery to be arranged"}
      </p>
    </div>
  );
}
