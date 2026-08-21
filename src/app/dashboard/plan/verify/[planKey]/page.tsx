import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { PLAN_ORDER } from "@/lib/constants/plans";
import { VerificationRequestForm } from "@/components/verification-request-form";
import type { SubscriptionPlan, SubscriptionTier } from "@/lib/supabase/types";

export default async function VerifyPlanPage({ params }: { params: Promise<{ planKey: string }> }) {
  const resolvedParams = await params;

  if (!isSupabaseConfigured()) {
    return <p className="text-slate-500">Connect Supabase to manage your plan.</p>;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/plan");

  // Validate planKey is one of the verification-gated tiers
  if (!["plus", "pro", "premium"].includes(resolvedParams.planKey)) {
    redirect("/dashboard/plan");
  }

  const planKey = resolvedParams.planKey as Extract<SubscriptionTier, "plus" | "pro" | "premium">;

  // Get current plan and check for pending request
  const [{ data: profile }, { data: plansData }, { data: verificationRequests }] = await Promise.all([
    supabase
      .from("profiles")
      .select("account_type, subscription_plan_id, subscription_plans(*)")
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
          your details. This typically takes up to 72 hours.
        </p>
      </div>

      <VerificationRequestForm
        planKey={planKey}
        userId={user.id}
        accountType={((profile as unknown as { account_type?: string } | null)?.account_type === "business" ? "business" : "individual")}
      />
    </div>
  );
}
