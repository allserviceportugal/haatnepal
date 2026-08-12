"use client";

import { useActionState } from "react";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { ErrorBanner } from "@/components/error-banner";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, {});

  if (state.step === "success" && state.success) {
    return (
      <div className="w-full max-w-sm mx-auto rounded-lg border border-slate-200 bg-white p-8 text-center">
        <div className="mb-4 text-4xl">✓</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Check your email</h2>
        <p className="text-slate-600 mb-6">
          We've sent a password reset link to your email address. Click the link in the email to set a new password.
        </p>
        <Link href="/login" className="inline-block text-sm font-semibold text-orange-600 hover:text-orange-700">
          Back to login →
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-1.5">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          required
        />
      </div>

      {state.error && <ErrorBanner message={state.error} />}

      <button
        type="submit"
        className="w-full rounded-lg bg-orange-600 px-4 py-2.5 font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        Send reset link
      </button>
    </form>
  );
}
