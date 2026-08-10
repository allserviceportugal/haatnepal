"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signInAction, verifyCodeAction, resendCodeAction } from "@/lib/actions/auth";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, isPending] = useActionState(signInAction, {
    step: 'email',
  });

  // Step 1: Email only
  if (state.step !== 'verify' && !state.codeSent) {
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
          {isPending ? "Sending code..." : "Send Login Code"}
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

  // Step 2: Verify Code
  if (state.codeSent) {
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

        <VerifyCodeForm email={state.email || ""} next={next} />
      </div>
    );
  }

  return null;
}

function VerifyCodeForm({ email, next }: { email: string; next?: string }) {
  const [state, formAction, isPending] = useActionState(verifyCodeAction, {
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
  const [state, formAction, isPending] = useActionState(resendCodeAction, {});
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async () => {
    setCooldown(30);
    const timer = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) clearInterval(timer);
        return c - 1;
      });
    }, 1000);
  };

  return (
    <form
      action={async (fd) => {
        await formAction(fd);
        handleResend();
      }}
    >
      <input type="hidden" name="email" value={email} />
      <button
        type="submit"
        disabled={isPending || cooldown > 0}
        className="text-center text-sm font-semibold text-orange-600 hover:text-orange-700 disabled:text-slate-400"
      >
        {cooldown > 0 ? `Resend in ${cooldown}s` : "Didn't receive code? Resend"}
      </button>
    </form>
  );
}
