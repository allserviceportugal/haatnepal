import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = {
  title: "Forgot Password - Haat Nepal",
  description: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block mb-8">
            <div className="text-4xl font-black">🏪 Haat Nepal</div>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Reset your password</h1>
          <p className="text-slate-600">
            Enter your email and we'll send you a link to reset your password
          </p>
        </div>

        <ForgotPasswordForm />

        <p className="text-center text-sm text-slate-600">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-orange-600 hover:text-orange-700">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
