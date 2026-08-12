import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatPrice } from "@/lib/format";

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;

  // Fetch listings with optional filters
  let query = supabase
    .from("listings")
    .select(
      "id, title, price, currency, status, seller_id, created_at, featured_until, profiles!listings_seller_id_fkey(display_name)"
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  if (params.search) {
    query = query.ilike("title", `%${params.search}%`);
  }

  const { data: listings } = await query;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Listings Management</h2>
        <p className="mt-1 text-slate-600">View, edit, and moderate marketplace listings</p>
      </div>

      {/* Filters */}
      <form className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600">Status</label>
            <select
              name="status"
              defaultValue={params.status || "all"}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="expired">Expired</option>
              <option value="suspended">Suspended</option>
              <option value="removed">Removed</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600">Search Title</label>
            <input
              type="text"
              name="search"
              defaultValue={params.search || ""}
              placeholder="Search listings..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Filter
        </button>
      </form>

      {/* Listings Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600">Title</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600">Seller</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600">Status</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-slate-600">Price</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {(listings ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                  No listings found
                </td>
              </tr>
            ) : (
              (listings ?? []).map((listing: any) => (
                <tr key={listing.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-3 text-sm text-slate-900">{listing.title}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">
                    {listing.profiles?.display_name || "Unknown"}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        listing.status === "active"
                          ? "bg-green-100 text-green-900"
                          : listing.status === "sold"
                          ? "bg-slate-100 text-slate-900"
                          : listing.status === "expired"
                          ? "bg-red-100 text-red-900"
                          : "bg-yellow-100 text-yellow-900"
                      }`}
                    >
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                    {formatPrice(listing.price, listing.currency)}
                  </td>
                  <td className="px-6 py-3">
                    <Link
                      href={`/admin/listings/${listing.id}`}
                      className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                    >
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
