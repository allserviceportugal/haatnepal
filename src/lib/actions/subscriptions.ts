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

  // Get current plan to enforce upgrade-only
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_plans(key)")
    .eq("id", user.id)
    .single();

  const currentPlanKey = (profile as any)?.subscription_plans?.key as SubscriptionTier | null;

  // Check upgrade-only: reject if trying to downgrade
  if (currentPlanKey && PLAN_ORDER.indexOf(planKey) < PLAN_ORDER.indexOf(currentPlanKey)) {
    // User tried to downgrade; don't allow, just redirect back
    revalidatePath("/dashboard/plan");
    redirect("/dashboard/plan");
  }

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
