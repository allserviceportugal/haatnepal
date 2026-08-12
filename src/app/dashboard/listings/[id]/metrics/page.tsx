import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getListingById } from "@/lib/queries/listings";
import { getListingLeadMetrics } from "@/lib/queries/transaction_config";
import { formatPrice } from "@/lib/format";
import { ViewsChart } from "@/components/analytics/views-chart";
import { PerformanceSummary } from "@/components/analytics/performance-summary";

export default async function ListingMetricsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

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

  const listing = await getListingById(supabase, id);
  if (!listing || listing.seller_id !== user.id) notFound();

  // Fetch metrics from the RPC (now works because listing_views exists)
  const metrics = await getListingLeadMetrics(supabase, id);

  // Fetch time-series data for the chart
  const { data: viewTimeseries } = await supabase.rpc("get_listing_view_timeseries", {
    p_listing_id: id,
    p_days: 30, // Default to 30 days
  });

  // Fetch performance summary for period-over-period comparison
  const { data: performanceSummary } = await supabase.rpc("get_listing_performance_summary", {
    p_listing_id: id,
  });

  // Calculate conversion rate (leads that resulted in action / views)
  const conversionRate = metrics && metrics.total_views > 0
    ? ((metrics.phone_clicks + metrics.messages + metrics.offers) / metrics.total_views * 100).toFixed(1)
    : "0.0";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <Link href="/dashboard/listings" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            ← Back to listings
          </Link>
          <h1 className="mt-2 text-3xl font-black text-slate-900">{listing.title}</h1>
          <p className="mt-1 text-slate-600">{formatPrice(listing.price, listing.currency, listing.price_on_request)}</p>
        </div>
        <Link
          href={`/listing/${listing.id}/edit`}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-orange-200 hover:text-orange-600"
        >
          Edit listing
        </Link>
      </div>

      {/* Key Metrics Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold text-slate-500">Total Views</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{metrics?.total_views ?? 0}</p>
          <p className="mt-1 text-xs text-slate-500">Unique viewers: {metrics?.unique_viewers ?? 0}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold text-slate-500">Contact Actions</p>
          <p className="mt-2 text-3xl font-black text-slate-900">
            {(metrics?.phone_clicks ?? 0) + (metrics?.whatsapp_clicks ?? 0) + (metrics?.email_clicks ?? 0)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            📞 {metrics?.phone_clicks ?? 0} · 💬 {metrics?.whatsapp_clicks ?? 0} · ✉️ {metrics?.email_clicks ?? 0}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold text-slate-500">Messages & Offers</p>
          <p className="mt-2 text-3xl font-black text-slate-900">
            {(metrics?.messages ?? 0) + (metrics?.offers ?? 0)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            💬 {metrics?.messages ?? 0} messages · 💰 {metrics?.offers ?? 0} offers
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold text-slate-500">Engagement</p>
          <p className="mt-2 text-3xl font-black text-orange-600">{conversionRate}%</p>
          <p className="mt-1 text-xs text-slate-500">Conversion rate</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold text-slate-500">Saves</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{metrics?.favorites ?? 0}</p>
          <p className="mt-1 text-xs text-slate-500">Favorites</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold text-slate-500">Shares</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{metrics?.shares ?? 0}</p>
          <p className="mt-1 text-xs text-slate-500">Shared via social</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold text-slate-500">Lead Score</p>
          <p className="mt-2 text-3xl font-black text-orange-600">
            {metrics ? Math.round(((metrics.contact_reveals + metrics.phone_clicks + (metrics.whatsapp_clicks ?? 0)) / Math.max(metrics.total_views, 1)) * 100) : 0}%
          </p>
          <p className="mt-1 text-xs text-slate-500">Contact interest</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold text-slate-500">Status</p>
          <p className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${
            listing.status === "active" ? "bg-green-100 text-green-900" :
            listing.status === "sold" ? "bg-slate-100 text-slate-900" :
            listing.status === "expired" ? "bg-red-100 text-red-900" :
            "bg-yellow-100 text-yellow-900"
          }`}>
            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
          </p>
        </div>
      </div>

      {/* Period-over-Period Performance */}
      {performanceSummary && performanceSummary.length > 0 && (
        <PerformanceSummary summary={performanceSummary[0]} />
      )}

      {/* Views Over Time Chart */}
      <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Views Over Time (Last 30 Days)</h2>
        {viewTimeseries && viewTimeseries.length > 0 ? (
          <ViewsChart data={viewTimeseries} />
        ) : (
          <div className="flex h-64 items-center justify-center text-slate-500">
            No view data yet
          </div>
        )}
      </div>

      {/* Activity Summary */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-6 text-lg font-bold text-slate-900">Activity Summary</h2>
        <div className="space-y-4 text-sm text-slate-600">
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span>Posted</span>
            <span className="font-semibold text-slate-900">
              {new Date(listing.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span>Last Updated</span>
            <span className="font-semibold text-slate-900">
              {new Date(listing.updated_at).toLocaleDateString()}
            </span>
          </div>
          {listing.expires_at && (
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span>Expires</span>
              <span className="font-semibold text-slate-900">
                {new Date(listing.expires_at).toLocaleDateString()}
              </span>
            </div>
          )}
          {listing.featured_until && new Date(listing.featured_until) > new Date() && (
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span>Featured Until</span>
              <span className="font-semibold text-slate-900">
                {new Date(listing.featured_until).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 rounded-lg border-l-4 border-l-blue-500 bg-blue-50 p-6">
        <h3 className="font-bold text-blue-900">💡 Tips to increase interest</h3>
        <ul className="mt-3 space-y-2 text-sm text-blue-800">
          <li>• Use high-quality photos (first photo gets the most views)</li>
          <li>• Write a clear, detailed description</li>
          <li>• Add all relevant attributes and specifications</li>
          <li>• Respond quickly to messages and offers</li>
          <li>• Feature your listing during peak hours to boost visibility</li>
          <li>• Share on social media to drive external traffic</li>
        </ul>
      </div>
    </main>
  );
}
