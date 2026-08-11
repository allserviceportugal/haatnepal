"use client";

import { useActionState, useState, useTransition } from "react";
import { resendCodeAction } from "@/lib/actions/auth";
import type { AuthActionState } from "@/lib/actions/auth";

type VerifyCodeFormProps = {
  email: string;
  action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  actionName: "verifySignupCodeAction" | "verifyResetCodeAction";
  next?: string;
};

export function VerifyCodeForm({ email, action, actionName, next }: VerifyCodeFormProps) {
  const [state, formAction, isPending] = useActionState(action, {
    step: 'verify',
    email,
  });

  return (
    <form action={formAction} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}
      <input type="hidden" name="email" value={email} />

      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700">
          Enter 6-digit code
        </label>
        <input
          type="text"
          name="code"
          inputMode="numeric"
          placeholder="000000"
          maxLength={6}
          pattern="\d{6}"
          required
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-2xl tracking-widest font-mono outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:opacity-60"
      >
        {isPending ? "Verifying..." : "Verify Code"}
      </button>

      <ResendCodeButton email={email} />
    </form>
  );
}

function ResendCodeButton({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition();
  const [cooldown, setCooldown] = useState(0);

  const handleResend = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("email", email);
      await resendCodeAction({}, fd);

      setCooldown(30);
      const timer = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) clearInterval(timer);
          return c - 1;
        });
      }, 1000);
    });
  };

  return (
    <button
      onClick={handleResend}
      disabled={isPending || cooldown > 0}
      className="text-center text-sm font-semibold text-orange-600 hover:text-orange-700 disabled:text-slate-400"
    >
      {cooldown > 0 ? `Resend in ${cooldown}s` : "Didn't receive code? Resend"}
    </button>
  );
}
