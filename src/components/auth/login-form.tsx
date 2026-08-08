"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction } from "@/lib/actions/auth";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, isPending] = useActionState(signInAction, {});

  return (
    <form action={formAction} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}

      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700">Email</label>
        <input
          type="email"
          name="email"
          required
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">Password</label>
        <input
          type="password"
          name="password"
          required
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:opacity-60"
      >
        {isPending ? "Signing in..." : "Log in"}
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
