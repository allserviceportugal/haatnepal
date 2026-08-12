import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = {
  title: "Reset Password - Haat Nepal",
  description: "Set your new password",
};

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block mb-8">
            <div className="text-4xl font-black">🏪 Haat Nepal</div>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Set new password</h1>
          <p className="text-slate-600">
            Create a strong password for your account
          </p>
        </div>

        <ResetPasswordForm />
      </div>
    </main>
  );
}
