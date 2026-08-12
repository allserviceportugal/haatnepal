"use client";

import { useActionState, useEffect, useState } from "react";
import { verifyCodeAction, resendOtpAction } from "@/lib/actions/auth";
import { ErrorBanner } from "@/components/error-banner";

interface VerifyCodeFormProps {
  email: string;
  onVerified?: () => void;
}

export function VerifyCodeForm({ email, onVerified }: VerifyCodeFormProps) {
  const [state, formAction, isVerifyPending] = useActionState(verifyCodeAction, {});
  const [resendState, resendAction, isResendPending] = useActionState(resendOtpAction, {});
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessageTime, setResendMessageTime] = useState(0);

  // Call onVerified callback after successful verification
  useEffect(() => {
    if (state.step === "success" && state.success && onVerified) {
      const timer = setTimeout(onVerified, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.step, state.success, onVerified]);

  // Manage resend cooldown countdown (60 seconds)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Auto-hide resend success message after 3 seconds
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (resendState.success && resendMessageTime === 0) {
      setResendMessageTime(Date.now());
      timeout = setTimeout(() => {
        setResendMessageTime(0);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [resendState.success, resendMessageTime]);

  // Start cooldown when resend succeeds
  useEffect(() => {
    if (resendState.success) {
      setResendCooldown(60);
    }
  }, [resendState.success]);

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
            autoComplete="one-time-code"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-center text-2xl tracking-widest text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            required
            disabled={isVerifyPending}
          />
        </div>

        {state.error && (
          <div>
            <ErrorBanner message={state.error} />
            {state.attemptsRemaining !== undefined && state.attemptsRemaining > 0 && (
              <p className="mt-2 text-center text-xs text-slate-600">
                {state.attemptsRemaining} attempt{state.attemptsRemaining === 1 ? '' : 's'} remaining
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isVerifyPending}
          className="w-full rounded-lg bg-orange-600 px-4 py-2.5 font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isVerifyPending ? "Verifying..." : "Verify email"}
        </button>
      </form>

      <form action={resendAction} className="text-center">
        <input type="hidden" name="email" value={email} />
        <button
          type="submit"
          disabled={isResendPending || resendCooldown > 0}
          className="text-sm font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {resendCooldown > 0
            ? `Resend available in ${resendCooldown}s`
            : isResendPending
            ? "Sending..."
            : "Resend code"}
        </button>
      </form>

      {resendMessageTime > 0 && resendState.success && (
        <p className="text-center text-sm text-green-600">
          Code resent to {email}
        </p>
      )}
    </div>
  );
}
