"use client";

import { useActionState, useState } from "react";
import { resetPasswordAction } from "@/lib/actions/auth";
import { ErrorBanner } from "@/components/error-banner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const [state, formAction] = useActionState(resetPasswordAction, {});

  useEffect(() => {
    if (state.step === "success" && state.success) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state, router]);

  if (state.step === "success" && state.success) {
    return (
      <div className="w-full max-w-sm mx-auto rounded-lg border border-slate-200 bg-white p-8 text-center">
        <div className="mb-4 text-4xl">✓</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Password reset successful</h2>
        <p className="text-slate-600">
          Redirecting you to login...
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-900 mb-1.5">
          New Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-900 mb-1.5">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-700"
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {state.error && <ErrorBanner message={state.error} />}

      <button
        type="submit"
        className="w-full rounded-lg bg-orange-600 px-4 py-2.5 font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        Reset password
      </button>

      <p className="text-center text-sm text-slate-600">
        Remember your password?{" "}
        <Link href="/login" className="font-semibold text-orange-600 hover:text-orange-700">
          Log in
        </Link>
      </p>
    </form>
  );
}
