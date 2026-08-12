import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { timeAgo } from "@/lib/format";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;

  // Fetch reports
  let query = supabase
    .from("listing_reports")
    .select(
      "id, listing_id, issue_type, message, status, created_at, listings(id, title), profiles!listing_reports_reporter_id_fkey(display_name)"
    )
    .order("created_at", { ascending: false });

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  const { data: reports } = await query;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Reports & Moderation</h2>
        <p className="mt-1 text-slate-600">Review and resolve user reports on listings</p>
      </div>

      {/* Filter */}
      <form className="rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600">Status</label>
          <select
            name="status"
            defaultValue={params.status || "all"}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">All Reports</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
        <button
          type="submit"
          className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Filter
        </button>
      </form>

      {/* Reports Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600">Listing</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600">Issue Type</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600">Reporter</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600">Reported</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {(reports ?? []).length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                  No reports found
                </td>
              </tr>
            ) : (
              (reports ?? []).map((report: any) => (
                <tr key={report.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-3 text-sm text-slate-900">
                    <Link
                      href={`/listing/${report.listing_id}`}
                      target="_blank"
                      className="font-semibold text-orange-600 hover:text-orange-700"
                    >
                      {report.listings?.title}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600">{report.issue_type}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">
                    {report.profiles?.display_name || "Anonymous"}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        report.status === "pending"
                          ? "bg-yellow-100 text-yellow-900"
                          : report.status === "reviewed"
                          ? "bg-blue-100 text-blue-900"
                          : report.status === "resolved"
                          ? "bg-green-100 text-green-900"
                          : "bg-slate-100 text-slate-900"
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600">{timeAgo(report.created_at)}</td>
                  <td className="px-6 py-3">
                    <Link
                      href={`/admin/reports/${report.id}`}
                      className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                    >
                      Review →
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
