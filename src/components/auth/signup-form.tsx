"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signUpAction, verifyCodeAction, resendCodeAction } from "@/lib/actions/auth";

export function SignupForm({ next }: { next?: string }) {
  const [state, formAction, isPending] = useActionState(signUpAction, {
    step: 'email',
  });

  // Step 1: Email + Name + Phone + Account Type
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
          <label className="block text-sm font-semibold text-slate-700">Full Name</label>
          <input
            name="displayName"
            required
            minLength={2}
            maxLength={50}
            placeholder="Your name"
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">Email Address</label>
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">Phone Number</label>
          <input
            type="tel"
            name="phone"
            required
            inputMode="numeric"
            placeholder="98XXXXXXXX"
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
          />
          <p className="mt-1 text-xs text-slate-500">
            Used for seller contact on classified listings. Compulsory.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">Account Type</label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <label className="flex cursor-pointer flex-col rounded-xl border border-slate-200 px-4 py-3 text-sm has-[:checked]:border-orange-300 has-[:checked]:bg-orange-50">
              <span className="flex items-center gap-2 font-semibold text-slate-700">
                <input
                  type="radio"
                  name="accountType"
                  value="individual"
                  defaultChecked
                  className="h-4 w-4"
                />
                Individual
              </span>
              <span className="mt-1 text-xs text-slate-500">5 free listings/month</span>
            </label>
            <label className="flex cursor-pointer flex-col rounded-xl border border-slate-200 px-4 py-3 text-sm has-[:checked]:border-orange-300 has-[:checked]:bg-orange-50">
              <span className="flex items-center gap-2 font-semibold text-slate-700">
                <input
                  type="radio"
                  name="accountType"
                  value="business"
                  className="h-4 w-4"
                />
                Business
              </span>
              <span className="mt-1 text-xs text-slate-500">10 free listings/month</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:opacity-60"
        >
          {isPending ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
            className="font-semibold text-orange-600"
          >
            Log in
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
  const [, formAction, isPending] = useActionState(resendCodeAction, {});
  const [cooldown, setCooldown] = useState(0);

  const handleResend = () => {
    const fd = new FormData();
    fd.set("email", email);
    formAction(fd);

    setCooldown(30);
    const timer = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) clearInterval(timer);
        return c - 1;
      });
    }, 1000);
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
