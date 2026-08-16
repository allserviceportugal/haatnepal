"use client";

import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUpAction } from "@/lib/actions/auth";
import { VerifyCodeForm } from "@/components/auth/verify-code-form";

export function SignupForm({ next }: { next?: string }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signUpAction, {
    step: 'email',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auto-redirect to homepage after success
  useEffect(() => {
    if (state.success && state.step === 'success') {
      const timer = setTimeout(() => {
        router.push('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.success, state.step, router]);

  // Verify email step
  if (state.step === 'verify' && state.email) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify your email</h2>
          <p className="text-slate-600">
            We've sent a 6-digit code to <strong className="break-all">{state.email}</strong>
          </p>
        </div>
        <VerifyCodeForm email={state.email} onVerified={() => router.push(next || '/')} />
      </div>
    );
  }

  // Signup form
  return (
    <form action={formAction} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}

      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="displayName" className="block text-sm font-semibold text-slate-700">Full Name</label>
        <input
          id="displayName"
          name="displayName"
          required
          minLength={2}
          maxLength={50}
          placeholder="Your name"
          autoComplete="name"
          defaultValue={state.formValues?.displayName || ""}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Email Address</label>
        <input
          id="email"
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
          defaultValue={state.formValues?.email || ""}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label>
        <div className="relative mt-2">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-10 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-500">Minimum 8 characters</p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">Confirm Password</label>
        <div className="relative mt-2">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            required
            minLength={8}
            placeholder="Repeat your password"
            autoComplete="new-password"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-10 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
          >
            {showConfirmPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">Phone Number</label>
        <input
          id="phone"
          type="tel"
          name="phone"
          required
          inputMode="numeric"
          pattern="[0-9\-]{7,11}"
          maxLength={11}
          placeholder="Mobile: 98XXXXXXXX or Landline: 01-XXXXXXX"
          autoComplete="tel"
          defaultValue={state.formValues?.phone || ""}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
        />
        <p className="mt-1 text-xs text-slate-500">Mobile (7-10 digits) or Landline with area code (e.g., 9841234567 or 01-4123456)</p>
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
                defaultChecked={state.formValues?.accountType !== "business"}
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
                defaultChecked={state.formValues?.accountType === "business"}
                className="h-4 w-4"
              />
              Business
            </span>
            <span className="mt-1 text-xs text-slate-500">10 free listings/month</span>
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 px-4 py-3 text-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-700">Free Plan (included with your account type)</p>
            <p className="mt-1 text-xs text-slate-500">{state.formValues?.accountType === "business" ? "10" : "5"} free listings/month</p>
          </div>
          <div className="text-lg">✓</div>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Need Plus, Pro, or Premium? Apply after signup from your dashboard — business verification required.
        </p>
      </div>

      <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="acceptTerms"
            required
            defaultChecked={state.formValues?.acceptTerms === 'on'}
            className="mt-1 h-4 w-4 rounded border-slate-300"
          />
          <span className="flex-1 text-sm text-slate-700">
            I agree to Haat Nepal's{" "}
            <Link href="/terms" target="_blank" className="font-semibold text-orange-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" target="_blank" className="font-semibold text-orange-600 hover:underline">
              Privacy Policy
            </Link>
            <span className="text-red-600"> *</span>
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="subscribeNewsletter"
            defaultChecked={state.formValues?.subscribeNewsletter === 'on'}
            className="mt-1 h-4 w-4 rounded border-slate-300"
          />
          <span className="flex-1 text-sm text-slate-700">
            Send me tips, deals, and updates about Haat Nepal (optional)
          </span>
        </label>
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
          className="font-semibold text-orange-600 hover:text-orange-700"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
