"use client";

import { useActionState, useEffect } from "react";
import { verifyCodeAction, resendOtpAction } from "@/lib/actions/auth";
import { ErrorBanner } from "@/components/error-banner";

interface VerifyCodeFormProps {
  email: string;
  onVerified?: () => void;
}

export function VerifyCodeForm({ email, onVerified }: VerifyCodeFormProps) {
  const [state, formAction] = useActionState(verifyCodeAction, {});
  const [resendState, resendAction] = useActionState(resendOtpAction, {});

  // Call onVerified callback after successful verification
  useEffect(() => {
    if (state.step === "success" && state.success && onVerified) {
      const timer = setTimeout(onVerified, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.step, state.success, onVerified]);

  if (state.step === "success" && state.success) {
    return (
      <div className="w-full max-w-sm mx-auto rounded-lg border border-slate-200 bg-white p-8 text-center">
        <div className="mb-4 text-4xl">✓</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Email verified!</h2>
        <p className="text-slate-600">
          {state.requireLogin
            ? "Your email is verified. Please log in to continue."
            : "Welcome to Haat Nepal! Redirecting you..."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-4">
      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-1.5">
            Email
          </label>
          <input
            name="email"
            type="hidden"
            value={email}
          />
          <div className="text-slate-700 bg-slate-50 rounded-lg border border-slate-200 px-3 py-2">
            {email}
          </div>
        </div>

        <div>
          <label htmlFor="code" className="block text-sm font-medium text-slate-900 mb-1.5">
            Verification Code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            placeholder="000000"
            maxLength={6}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-2xl tracking-widest text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            required
          />
        </div>

        {state.error && <ErrorBanner message={state.error} />}

        <button
          type="submit"
          className="w-full rounded-lg bg-orange-600 px-4 py-2.5 font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          Verify email
        </button>
      </form>

      <form action={resendAction} className="text-center">
        <input type="hidden" name="email" value={email} />
        <button
          type="submit"
          className="text-sm font-semibold text-orange-600 hover:text-orange-700"
        >
          Resend code
        </button>
      </form>

      {resendState.success && (
        <p className="text-center text-sm text-green-600">
          Code resent to {email}
        </p>
      )}
    </div>
  );
}
