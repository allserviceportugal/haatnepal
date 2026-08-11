"use client";

import { useActionState } from "react";
import { setPasswordAction } from "@/lib/actions/auth";
import type { AuthActionState } from "@/lib/actions/auth";

type SetPasswordFormProps = {
  email: string;
  mode: "signup" | "reset";
  next?: string;
  showRememberMe?: boolean;
};

export function SetPasswordForm({
  email,
  mode,
  next,
  showRememberMe = true,
}: SetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(setPasswordAction, {
    step: 'set-password',
    mode,
    email,
  });

  return (
    <form action={formAction} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="mode" value={mode} />

      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700">
          Password
        </label>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
        />
        <p className="mt-1 text-xs text-slate-500">
          Must be at least 8 characters long
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">
          Confirm Password
        </label>
        <input
          type="password"
          name="confirmPassword"
          required
          minLength={8}
          placeholder="Repeat your password"
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
        />
      </div>

      {showRememberMe && (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="rememberMe"
            defaultChecked
            className="h-4 w-4 rounded border-slate-300"
          />
          <span className="text-sm text-slate-700">Keep me logged in on this device</span>
        </label>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:opacity-60"
      >
        {isPending ? "Setting password..." : "Set Password"}
      </button>
    </form>
  );
}
