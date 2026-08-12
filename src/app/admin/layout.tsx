import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-slate-900">Admin Dashboard</h1>
            <Link href="/" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
              ← Back to Site
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Nav */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="flex gap-8 py-4">
            <Link
              href="/admin"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Overview
            </Link>
            <Link
              href="/admin/listings"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Listings
            </Link>
            <Link
              href="/admin/reports"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Reports
            </Link>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {children}
      </div>
    </div>
  );
}
