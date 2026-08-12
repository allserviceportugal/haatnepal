import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdminOverviewPage() {
  const { supabase } = await requireAdmin();

  // Fetch overview stats
  const [
    { count: totalListings },
    { count: activeListings },
    { count: pendingReports },
    { count: totalUsers },
  ] = await Promise.all([
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("listing_reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Welcome to Admin Dashboard</h2>
        <p className="mt-1 text-slate-600">Manage marketplace content, users, and moderation</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold text-slate-500">Total Listings</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{totalListings ?? 0}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold text-slate-500">Active Listings</p>
          <p className="mt-2 text-3xl font-black text-green-600">{activeListings ?? 0}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold text-slate-500">Pending Reports</p>
          <p className="mt-2 text-3xl font-black text-red-600">{pendingReports ?? 0}</p>
          {(pendingReports ?? 0) > 0 && (
            <Link
              href="/admin/reports"
              className="mt-3 inline-block text-xs font-semibold text-red-600 hover:text-red-700"
            >
              Review →
            </Link>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold text-slate-500">Total Users</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{totalUsers ?? 0}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/admin/listings"
            className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-orange-200 hover:bg-orange-50"
          >
            Manage Listings →
          </Link>
          <Link
            href="/admin/reports"
            className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-orange-200 hover:bg-orange-50"
          >
            Review Reports →
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg border-l-4 border-l-blue-500 bg-blue-50 p-6">
        <h3 className="font-bold text-blue-900">ℹ️ Admin Notes</h3>
        <ul className="mt-3 space-y-2 text-sm text-blue-800">
          <li>• Monitor pending reports and take moderation action</li>
          <li>• Manage listing status, expiry, and featured status</li>
          <li>• View engagement metrics and seller analytics</li>
          <li>• Actions are logged in listing_admin_logs for audit trail</li>
        </ul>
      </div>
    </div>
  );
}
