import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { timeAgo } from "@/lib/format";

export default async function AdminVerificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;

  // Fetch verification requests, defaulting to pending
  let query = supabase
    .from("business_verification_requests")
    .select("id, user_id, requested_plan_key, business_name, status, created_at, profiles(display_name)")
    .order("created_at", { ascending: false });

  const statusParam = params.status || "pending";
  if (statusParam !== "all") {
    query = query.eq("status", statusParam);
  }

  const { data: verifications } = await query;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900">Business Verifications</h2>
        <p className="mt-1 text-slate-600">Review and approve business verification requests for plan upgrades</p>
      </div>

      {/* Filter */}
      <form className="rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600">Status</label>
          <select
            name="status"
            defaultValue={statusParam}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>
        <button
          type="submit"
          className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Filter
        </button>
      </form>

      {/* Verifications Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600">User</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600">Business</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600">Submitted</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {(verifications ?? []).length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                  No verification requests found
                </td>
              </tr>
            ) : (
              (verifications ?? []).map((request: any) => (
                <tr key={request.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-3 text-sm text-slate-900">
                    <span className="font-semibold">{request.profiles?.display_name || "Unknown"}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600">{request.business_name}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">
                    <span className="capitalize">{request.requested_plan_key}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        request.status === "pending"
                          ? "bg-yellow-100 text-yellow-900"
                          : request.status === "approved"
                            ? "bg-green-100 text-green-900"
                            : "bg-red-100 text-red-900"
                      }`}
                    >
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600">{timeAgo(request.created_at)}</td>
                  <td className="px-6 py-3">
                    <Link
                      href={`/admin/verifications/${request.id}`}
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
