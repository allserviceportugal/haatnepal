"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";
import { VerifyCodeForm } from "@/components/auth/verify-code-form";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, {
    step: 'email',
  });
  const [verified, setVerified] = useState(false);

  // Verify step (unconfirmed email)
  if (state.step === 'verify' && state.email && !verified) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify your email</h2>
          <p className="text-slate-600">
            Your email isn't verified yet. We've sent a 6-digit code to <strong className="break-all">{state.email}</strong>
          </p>
        </div>
        <VerifyCodeForm email={state.email} onVerified={() => setVerified(true)} />
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}

      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">
          Password
        </label>
        <input
          type="password"
          name="password"
          required
          placeholder="Your password"
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="rememberMe"
            defaultChecked
            className="h-4 w-4 rounded border-slate-300"
          />
          <span className="text-sm text-slate-700">Keep me logged in</span>
        </label>
        <Link
          href={next ? `/forgot-password?next=${encodeURIComponent(next)}` : "/forgot-password"}
          className="text-sm font-semibold text-orange-600 hover:text-orange-700"
        >
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:opacity-60"
      >
        {isPending ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-center text-sm text-slate-600">
        New here?{" "}
        <Link
          href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}
          className="font-semibold text-orange-600"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
