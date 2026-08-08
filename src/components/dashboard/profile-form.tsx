"use client";

import { useActionState } from "react";
import { NEPAL_DISTRICTS } from "@/lib/constants/locations";
import { updateProfileAction } from "@/lib/actions/profile";
import type { Profile } from "@/lib/supabase/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, {});

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Profile updated.
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700">Full name</label>
        <input
          name="displayName"
          defaultValue={profile.display_name}
          required
          minLength={2}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">Phone</label>
        <input
          value={profile.phone}
          disabled
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
        />
        <p className="mt-1 text-xs text-slate-500">Contact support to change your phone number.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">Account type</label>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold capitalize text-slate-700">
            {profile.account_type}
          </span>
          <span className="text-xs text-slate-500">Contact support to change your account type.</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">District</label>
        <select
          name="district"
          defaultValue={profile.district ?? ""}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
        >
          <option value="">Select a district</option>
          {NEPAL_DISTRICTS.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">City / area</label>
        <input
          name="city"
          defaultValue={profile.city ?? ""}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
