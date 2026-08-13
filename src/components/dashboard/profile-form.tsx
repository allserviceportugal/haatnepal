"use client";

import { useActionState, useState } from "react";
import { NEPAL_DISTRICTS } from "@/lib/constants/locations";
import { updateProfileAction } from "@/lib/actions/profile";
import { changePasswordAction } from "@/lib/actions/auth";
import { BrandingUploader } from "@/components/branding-uploader";
import type { Profile } from "@/lib/supabase/types";

export function ProfileForm({ profile, canBrand }: { profile: Profile; canBrand: boolean }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, {});
  const [passwordState, passwordFormAction, isPasswordPending] = useActionState(changePasswordAction, {});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
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
        <label className="block text-sm font-semibold text-slate-700">Email</label>
        <input
          value={profile.email ?? ""}
          disabled
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
        />
        <p className="mt-1 text-xs text-slate-500">Your email is verified and cannot be changed after registration.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700">Phone</label>
        <input
          name="phone"
          type="tel"
          defaultValue={profile.phone}
          required
          pattern="[0-9\-]{7,11}"
          maxLength={11}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
          placeholder="Mobile: 98XXXXXXXX or Landline: 01-XXXXXXX"
        />
        <p className="mt-1 text-xs text-slate-500">Mobile (7-10 digits) or Landline with area code (e.g., 9841234567 or 01-4123456)</p>
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

      <div className="border-t border-slate-200 pt-5">
        <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-slate-500">
          Storefront branding
        </h2>

          {!canBrand && (
            <p className="mt-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
              Logo, cover photo, and a business description are available on the Pro plan and above.{" "}
              <a href="/dashboard/plan" className="font-semibold underline">
                Upgrade your plan
              </a>{" "}
              to set up your storefront.
            </p>
          )}

          <fieldset disabled={!canBrand} className="mt-4 space-y-4 disabled:opacity-50">
            <div className="grid gap-4 sm:grid-cols-2">
              <BrandingUploader
                userId={profile.id}
                folder="profile/logo"
                fieldName="logoUrl"
                initialUrl={profile.logo_url}
                label="Logo"
                aspectClassName="aspect-square"
              />
              <BrandingUploader
                userId={profile.id}
                folder="profile/cover"
                fieldName="coverImageUrl"
                initialUrl={profile.cover_image_url}
                label="Cover photo"
                aspectClassName="aspect-video"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700">Business description</label>
              <textarea
                name="businessDescription"
                defaultValue={profile.business_description ?? ""}
                maxLength={500}
                rows={4}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
                placeholder="Tell buyers about your business..."
              />
            </div>
          </fieldset>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600 disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save changes"}
      </button>
    </form>

    <div className="mt-8 border-t border-slate-200 pt-8">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Change password</h2>
      <form action={passwordFormAction} className="space-y-4">
        {passwordState.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {passwordState.error}
          </div>
        )}
        {passwordState.success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Password changed successfully. You can log in with your new password next time.
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700">Current password</label>
          <div className="relative mt-2">
            <input
              name="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-3 text-sm text-slate-500 hover:text-slate-700"
            >
              {showCurrentPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">New password</label>
          <div className="relative mt-2">
            <input
              name="password"
              type={showNewPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-3 text-sm text-slate-500 hover:text-slate-700"
            >
              {showNewPassword ? "Hide" : "Show"}
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">At least 8 characters</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">Confirm new password</label>
          <div className="relative mt-2">
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-sm text-slate-500 hover:text-slate-700"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPasswordPending}
          className="rounded-full bg-slate-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-200 transition hover:bg-slate-700 disabled:opacity-60"
        >
          {isPasswordPending ? "Updating..." : "Change password"}
        </button>
      </form>
    </div>
    </>
  );
}
