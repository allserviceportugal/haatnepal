import { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset Password | Haat Nepal",
  description: "Reset your Haat Nepal account password",
};

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white shadow-2xl shadow-orange-200">
          <div className="border-b border-slate-200 px-6 py-6">
            <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
            <p className="mt-2 text-sm text-slate-600">
              Enter your email to receive a password reset code
            </p>
          </div>

          <div className="p-6">
            <ForgotPasswordForm next={searchParams.next} />
          </div>
        </div>
      </div>
    </main>
  );
}
