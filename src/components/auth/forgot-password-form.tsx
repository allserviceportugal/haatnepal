"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction, verifyResetCodeAction } from "@/lib/actions/auth";
import { VerifyCodeForm } from "./verify-code-form";
import { SetPasswordForm } from "./set-password-form";

export function ForgotPasswordForm({ next }: { next?: string }) {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, {
    step: 'email',
  });

  // Step 1: Email
  if (state.step !== 'verify' && state.step !== 'set-password' && !state.codeSent) {
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

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:opacity-60"
        >
          {isPending ? "Sending code..." : "Send Reset Code"}
        </button>

        <p className="text-center text-sm text-slate-600">
          <Link
            href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
            className="font-semibold text-orange-600"
          >
            Back to login
          </Link>
        </p>
      </form>
    );
  }

  // Step 2: Verify Code
  if (state.codeSent && state.step === 'verify') {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
          <p className="font-semibold">✓ Check your email!</p>
          <p className="mt-2">
            We sent a 6-digit code to{" "}
            <strong className="break-all">{state.email}</strong>
          </p>
          <p className="mt-1 text-xs">The code expires in 10 minutes.</p>
        </div>

        <VerifyCodeForm
          email={state.email || ""}
          action={verifyResetCodeAction}
          actionName="verifyResetCodeAction"
          next={next}
        />
      </div>
    );
  }

  // Step 3: Set New Password
  if (state.step === 'set-password' && state.mode === 'reset') {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 text-sm text-blue-800">
          <p className="font-semibold">Set Your New Password</p>
          <p className="mt-2">
            Enter a strong password to secure your account
          </p>
        </div>

        <SetPasswordForm
          email={state.email || ""}
          mode="reset"
          next={next}
          showRememberMe={true}
        />
      </div>
    );
  }

  return null;
}
