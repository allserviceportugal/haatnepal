"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PLAN_ORDER } from "@/lib/constants/plans";
import type { SubscriptionTier } from "@/lib/supabase/types";

// "custom" is intentionally excluded — that tier is negotiated via a
// contact request, not a self-serve switch (see /dashboard/plan).
export async function switchPlanAction(planKey: Exclude<SubscriptionTier, "custom">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/plan");
  }

  // Get current plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plans(key)")
    .eq("id", user.id)
    .single();

  const currentPlanKey = (profile as any)?.subscription_plans?.key as SubscriptionTier | null;

  // Check if this is an upgrade to a verification-gated tier
  const VERIFICATION_REQUIRED_TIERS: SubscriptionTier[] = ["plus", "pro", "premium"];
  const isUpgrade = !currentPlanKey || PLAN_ORDER.indexOf(planKey) > PLAN_ORDER.indexOf(currentPlanKey);

  if (isUpgrade && VERIFICATION_REQUIRED_TIERS.includes(planKey)) {
    // Must go through the verification flow instead — refuse the direct switch
    revalidatePath("/dashboard/plan");
    redirect("/dashboard/plan");
  }
  // Otherwise: downgrades to any tier, lateral moves, and upgrades to Business
  // (free, ungated) all proceed exactly as before — just update subscription_plan_id

  const { data: plan } = await supabase
    .from("subscription_plans")
    .select("id")
    .eq("key", planKey)
    .single();

  if (plan) {
    await supabase.from("profiles").update({ subscription_plan_id: plan.id }).eq("id", user.id);
  }

  revalidatePath("/dashboard/plan");
  redirect("/dashboard/plan");
}
