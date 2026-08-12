import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { formatPrice, timeAgo } from "@/lib/format";

export default async function AdminListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;

  const { data: listing } = await supabase
    .from("listings")
    .select(
      `
      id, title, price, currency, status, description, created_at, updated_at,
      view_count, featured_until, expires_at,
      profiles!listings_seller_id_fkey(id, display_name, email, phone)
    `
    )
    .eq("id", id)
    .single();

  if (!listing) notFound();

  // Fetch engagement metrics
  const { data: metrics } = await supabase.rpc("get_listing_lead_metrics", {
    p_listing_id: id,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/listings" className="text-sm font-semibold text-orange-600">
            ← Back to listings
          </Link>
          <h2 className="mt-2 text-2xl font-black text-slate-900">{listing.title}</h2>
          <p className="mt-1 text-slate-600">{formatPrice(listing.price, listing.currency)}</p>
        </div>
      </div>

      {/* Listing Info */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Dates */}
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Status & Dates</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Status</span>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                    listing.status === "active"
                      ? "bg-green-100 text-green-900"
                      : listing.status === "sold"
                      ? "bg-slate-100 text-slate-900"
                      : "bg-red-100 text-red-900"
                  }`}
                >
                  {listing.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Created</span>
                <span className="font-semibold text-slate-900">{timeAgo(listing.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Expires</span>
                <span className="font-semibold text-slate-900">
                  {listing.expires_at ? new Date(listing.expires_at).toLocaleDateString() : "Never"}
                </span>
              </div>
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Engagement</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">Views</p>
                <p className="text-2xl font-black text-slate-900">{metrics?.total_views || 0}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Contacts</p>
                <p className="text-2xl font-black text-slate-900">
                  {(metrics?.phone_clicks || 0) + (metrics?.messages || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Offers</p>
                <p className="text-2xl font-black text-slate-900">{metrics?.offers || 0}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Favorites</p>
                <p className="text-2xl font-black text-slate-900">{metrics?.favorites || 0}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Description</h3>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{listing.description}</p>
          </div>
        </div>

        {/* Seller Info */}
        <div>
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Seller</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">Name</p>
                <p className="font-semibold text-slate-900">{listing.profiles?.display_name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-semibold text-slate-900">{listing.profiles?.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="font-semibold text-slate-900">{listing.profiles?.phone || "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Note */}
      <div className="rounded-lg border-l-4 border-l-blue-500 bg-blue-50 p-6">
        <p className="text-sm text-blue-800">
          Admin controls for status changes, expiry extension, and suspension are not yet implemented.
          This page displays listing information for review.
        </p>
      </div>
    </div>
  );
}
