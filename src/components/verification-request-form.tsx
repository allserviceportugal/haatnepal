"use client";

import { useActionState } from "react";
import { VerificationDocumentUploader } from "@/components/verification-document-uploader";
import {
  submitVerificationRequestAction,
  type VerificationFormState,
} from "@/lib/actions/verifications";
import type { SubscriptionTier } from "@/lib/supabase/types";

const input =
  "mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500";
const label = "block text-sm font-semibold text-slate-700";

function Field({
  name, labelText, hint, placeholder, type = "text", defaultValue,
}: {
  name: string; labelText: string; hint?: string; placeholder?: string; type?: string; defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className={label}>{labelText}</label>
      <input id={name} name={name} type={type} required className={input}
        placeholder={placeholder} defaultValue={defaultValue} />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function TextAreaField({
  name, labelText, hint, placeholder, defaultValue,
}: { name: string; labelText: string; hint?: string; placeholder?: string; defaultValue?: string }) {
  return (
    <div>
      <label htmlFor={name} className={label}>{labelText}</label>
      <textarea id={name} name={name} required rows={5} maxLength={2000}
        className={input} placeholder={placeholder} defaultValue={defaultValue} />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function VerificationRequestForm({
  planKey,
  userId,
  accountType,
}: {
  planKey: Extract<SubscriptionTier, "plus" | "pro" | "premium">;
  userId: string;
  accountType: "individual" | "business";
}) {
  const [state, formAction, pending] = useActionState<VerificationFormState, FormData>(
    submitVerificationRequestAction.bind(null, planKey),
    {}
  );
  const v = state.values ?? {};
  const isBusiness = accountType === "business";

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {state.error}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="font-semibold text-slate-900">
          {isBusiness ? "Business information" : "Personal information"}
        </h2>

        {isBusiness ? (
          <>
            <Field name="businessName" labelText="Business name"
              placeholder="Your registered business name" defaultValue={v.businessName} />
            <Field name="businessRegistrationNumber" labelText="Business registration certificate number"
              placeholder="e.g. 123456/078/079" defaultValue={v.businessRegistrationNumber} />
            <Field name="panNumber" labelText="Business PAN number"
              placeholder="9-digit PAN" defaultValue={v.panNumber} />
            <Field name="businessAddress" labelText="Registered business address"
              placeholder="Street, city, district, province" defaultValue={v.businessAddress} />
          </>
        ) : (
          <>
            <Field name="citizenshipNumber" labelText="Citizenship card number"
              placeholder="e.g. 12-01-70-12345" defaultValue={v.citizenshipNumber} />
            <Field name="panNumber" labelText="PAN number"
              placeholder="9-digit PAN" defaultValue={v.panNumber} />
            <Field name="businessAddress" labelText="Address"
              placeholder="Street, city, district, province" defaultValue={v.businessAddress} />
          </>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-slate-900">
          {isBusiness ? "Authorised representative" : "Contact details"}
        </h2>
        <Field name="contactPersonName"
          labelText={isBusiness ? "Representative name" : "Full name"}
          placeholder="Full name" defaultValue={v.contactPersonName} />
        <Field name="contactEmail" labelText="Email" type="email"
          placeholder="contact@example.com" defaultValue={v.contactEmail} />
        <Field name="contactPhone" labelText="Phone" type="tel"
          placeholder="98XXXXXXXX" defaultValue={v.contactPhone} />
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-slate-900">
          {isBusiness ? "Business description" : "Profile description"}
        </h2>
        <TextAreaField
          name="businessDescription"
          labelText={isBusiness ? "Describe your business" : "Describe what you sell"}
          hint="Shown publicly on your profile page. Up to 2000 characters."
          placeholder={isBusiness
            ? "What your business sells, where you operate, what makes you a trusted seller..."
            : "What you sell, where you're based, anything buyers should know..."}
          defaultValue={v.businessDescription}
        />
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-slate-900">
          {isBusiness ? "Registration certificate" : "Identity document"}
        </h2>
        <p className="text-sm text-slate-600">
          {isBusiness
            ? "Upload a copy of your business registration certificate, license, or similar proof of business legitimacy."
            : "Upload a copy of your citizenship card or PAN card."}
        </p>
        <VerificationDocumentUploader userId={userId} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs text-slate-600">
          Billing isn&apos;t connected yet — submitting this request reserves your upgrade pending
          verification; no charge is made yet.
        </p>
      </div>

      <button type="submit" disabled={pending}
        className="w-full rounded-full bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50">
        {pending ? "Submitting..." : "Submit verification request"}
      </button>
    </form>
  );
}
