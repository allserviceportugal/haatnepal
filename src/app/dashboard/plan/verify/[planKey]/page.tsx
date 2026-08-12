import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { PLAN_ORDER } from "@/lib/constants/plans";
import { VerificationDocumentUploader } from "@/components/verification-document-uploader";
import { submitVerificationRequestAction } from "@/lib/actions/verifications";
import type { SubscriptionPlan, SubscriptionTier } from "@/lib/supabase/types";

export default async function VerifyPlanPage({ params }: { params: { planKey: string } }) {
  if (!isSupabaseConfigured()) {
    return <p className="text-slate-500">Connect Supabase to manage your plan.</p>;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/plan");

  // Validate planKey is one of the verification-gated tiers
  if (!["plus", "pro", "premium"].includes(params.planKey)) {
    redirect("/dashboard/plan");
  }

  const planKey = params.planKey as Extract<SubscriptionTier, "plus" | "pro" | "premium">;

  // Get current plan and check for pending request
  const [{ data: profile }, { data: plansData }, { data: verificationRequests }] = await Promise.all([
    supabase
      .from("profiles")
      .select("subscription_plan_id, subscription_plans(*)")
      .eq("id", user.id)
      .single(),
    supabase.from("subscription_plans").select("*").eq("key", planKey).single(),
    supabase
      .from("business_verification_requests")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  const currentPlan = (profile as unknown as { subscription_plans: SubscriptionPlan | null } | null)
    ?.subscription_plans ?? null;
  const requestedPlan = plansData as SubscriptionPlan | null;

  // If user already has equal or higher plan, redirect
  if (currentPlan) {
    if (PLAN_ORDER.indexOf(planKey) <= PLAN_ORDER.indexOf(currentPlan.key as SubscriptionTier)) {
      redirect("/dashboard/plan");
    }
  }

  // Check if user has a pending request for any plan
  const hasPendingRequest = (verificationRequests ?? []).length > 0;

  if (hasPendingRequest) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-black text-slate-900">Verify business details</h1>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-900">
            You already have a pending verification request.
          </p>
          <p className="mt-2 text-sm text-amber-800">
            Our admins review requests within 72 hours. You&apos;ll receive an email once we&apos;ve reviewed your
            submission.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Verify business details</h1>
        <p className="mt-2 text-sm text-slate-600">
          To upgrade to <span className="font-semibold text-slate-900">{requestedPlan?.name}</span>, we need to verify
          your business information. This typically takes up to 72 hours.
        </p>
      </div>

      <form action={submitVerificationRequestAction.bind(null, planKey)} className="space-y-6">
        {/* Business Information */}
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-900">Business information</h2>

          <div>
            <label htmlFor="businessName" className="block text-sm font-semibold text-slate-700">
              Business name
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="Your registered business name"
            />
          </div>

          <div>
            <label htmlFor="businessAddress" className="block text-sm font-semibold text-slate-700">
              Business address
            </label>
            <input
              id="businessAddress"
              name="businessAddress"
              type="text"
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="Street, city, district, province"
            />
          </div>
        </div>

        {/* Contact Person */}
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-900">Contact person</h2>

          <div>
            <label htmlFor="contactPersonName" className="block text-sm font-semibold text-slate-700">
              Name
            </label>
            <input
              id="contactPersonName"
              name="contactPersonName"
              type="text"
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="Full name"
            />
          </div>

          <div>
            <label htmlFor="contactEmail" className="block text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="contact@example.com"
            />
          </div>

          <div>
            <label htmlFor="contactPhone" className="block text-sm font-semibold text-slate-700">
              Phone
            </label>
            <input
              id="contactPhone"
              name="contactPhone"
              type="tel"
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              placeholder="+977-..."
            />
          </div>
        </div>

        {/* Registration Certificate */}
        <div className="space-y-3">
          <h2 className="font-semibold text-slate-900">Registration certificate</h2>
          <p className="text-sm text-slate-600">Upload a copy of your business registration certificate, license, or similar proof of business legitimacy.</p>
          <VerificationDocumentUploader userId={user.id} />
        </div>

        {/* Billing Note */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs text-slate-600">
            Billing isn&apos;t connected yet — submitting this request reserves your upgrade pending verification; no charge is made yet.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full rounded-full bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          Submit verification request
        </button>
      </form>
    </div>
  );
}
