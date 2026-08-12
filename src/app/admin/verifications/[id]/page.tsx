import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { timeAgo } from "@/lib/format";
import AdminVerificationActions from "@/components/admin-verification-actions";

export default async function AdminVerificationDetailPage({ params }: { params: { id: string } }) {
  const { supabase } = await requireAdmin();

  const { data: request } = await supabase
    .from("business_verification_requests")
    .select("*, profiles(display_name, email, phone)")
    .eq("id", params.id)
    .single();

  if (!request) {
    redirect("/admin/verifications");
  }

  // Generate signed URL for the certificate
  let certificateUrl = null;
  try {
    const { data: signedUrl } = await supabase.storage
      .from("verification-documents")
      .createSignedUrl(request.registration_certificate_path, 3600);
    certificateUrl = signedUrl?.signedUrl || null;
  } catch (error) {
    console.error("Failed to generate signed URL:", error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/verifications" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            ← Back to verifications
          </Link>
          <h2 className="mt-2 text-2xl font-black text-slate-900">Verification Request</h2>
        </div>
        <span
          className={`inline-block rounded-full px-4 py-2 text-sm font-bold ${
            request.status === "pending"
              ? "bg-yellow-100 text-yellow-900"
              : request.status === "approved"
                ? "bg-green-100 text-green-900"
                : "bg-red-100 text-red-900"
          }`}
        >
          {request.status}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Business Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Business Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Business Name</p>
                <p className="mt-1 text-slate-900">{request.business_name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Business Address</p>
                <p className="mt-1 text-slate-900">{request.business_address}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Requested Plan</p>
                <p className="mt-1 capitalize text-slate-900">{request.requested_plan_key}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Contact Person</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Name</p>
                <p className="mt-1 text-slate-900">{request.contact_person_name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Email</p>
                <p className="mt-1 text-slate-900">{request.contact_email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Phone</p>
                <p className="mt-1 text-slate-900">{request.contact_phone}</p>
              </div>
            </div>
          </div>

          {/* Registration Certificate */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Registration Certificate</h3>
            {certificateUrl ? (
              <div className="space-y-4">
                {request.registration_certificate_path.endsWith(".pdf") ? (
                  <a
                    href={certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg bg-slate-50 px-4 py-3 text-sm font-semibold text-orange-600 hover:bg-slate-100"
                  >
                    📄 View PDF Certificate
                  </a>
                ) : (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <img
                      src={certificateUrl}
                      alt="Registration certificate"
                      className="max-h-96 max-w-full rounded-lg"
                    />
                  </div>
                )}
                <p className="text-xs text-slate-500">File: {request.registration_certificate_path.split("/").pop()}</p>
              </div>
            ) : (
              <p className="text-slate-600">Certificate file not found</p>
            )}
          </div>

          {/* Rejection Reason (if rejected) */}
          {request.status === "rejected" && request.rejection_reason && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <h3 className="mb-4 text-lg font-bold text-red-900">Rejection Reason</h3>
              <p className="text-red-800">{request.rejection_reason}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-900">User</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Name</p>
                <p className="mt-1 text-slate-900">{request.profiles?.display_name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Email</p>
                <p className="mt-1 text-slate-900 break-all">{request.profiles?.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Phone</p>
                <p className="mt-1 text-slate-900">{request.profiles?.phone}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Timeline</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Submitted</p>
                <p className="mt-1 text-sm text-slate-900">{timeAgo(request.created_at)}</p>
              </div>
              {request.reviewed_at && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Reviewed</p>
                  <p className="mt-1 text-sm text-slate-900">{timeAgo(request.reviewed_at)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions (only show for pending) */}
          {request.status === "pending" && <AdminVerificationActions requestId={params.id} />}
        </div>
      </div>
    </div>
  );
}
