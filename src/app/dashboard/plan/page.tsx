import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { PlanCard } from "@/components/plan-card";
import { PLAN_ORDER } from "@/lib/constants/plans";
import { switchPlanAction } from "@/lib/actions/subscriptions";
import type { SubscriptionPlan, SubscriptionTier } from "@/lib/supabase/types";
import { timeAgo } from "@/lib/format";

function startOfCurrentMonthISO() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export default async function DashboardPlanPage() {
  if (!isSupabaseConfigured()) {
    return <p className="text-slate-500">Connect Supabase to manage your plan.</p>;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/plan");

  const [{ data: profile }, { data: plansData }, { count: usedThisMonth }, { data: verificationRequests }] = await Promise.all([
    supabase
      .from("profiles")
      .select("subscription_plan_id, subscription_plans(*)")
      .eq("id", user.id)
      .single(),
    supabase.from("subscription_plans").select("*"),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", user.id)
      .gte("created_at", startOfCurrentMonthISO()),
    supabase
      .from("business_verification_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const currentPlan =
    (profile as unknown as { subscription_plans: SubscriptionPlan | null } | null)
      ?.subscription_plans ?? null;
  const plans = (plansData ?? []).sort(
    (a, b) => PLAN_ORDER.indexOf(a.key) - PLAN_ORDER.indexOf(b.key)
  );

  // Create a map of verification requests by plan key and status
  const verificationsByPlan = (verificationRequests ?? []).reduce(
    (acc, req: any) => {
      acc[req.requested_plan_key] = req;
      return acc;
    },
    {} as Record<string, any>
  );

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-900">Your plan</h1>

      {(currentPlan || true) && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">
            You&apos;re on <span className="font-bold text-slate-900">{currentPlan?.name ?? "Free"}</span>.{" "}
            {(currentPlan?.monthly_listing_quota ?? null) === null
              ? `${usedThisMonth ?? 0} listings posted this month (unlimited).`
              : `${usedThisMonth ?? 0} / ${currentPlan?.monthly_listing_quota} listings used this month.`}
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          // Treat NULL subscription (no plan set) as "on the free plan (normal)"
          const effectiveCurrentPlanKey = currentPlan?.key ?? "normal";
          const isCurrent = plan.key === effectiveCurrentPlanKey;
          const isUpgrade = PLAN_ORDER.indexOf(plan.key) > PLAN_ORDER.indexOf(effectiveCurrentPlanKey);
          const isDowngrade = !isCurrent && !isUpgrade && plan.key !== "custom";
          const verification = verificationsByPlan[plan.key];

          let action: ReactNode = null;

          if (isCurrent) {
            action = (
              <span className="block rounded-full border border-orange-200 px-4 py-2 text-center text-sm font-semibold text-orange-600">
                Current plan
              </span>
            );
          } else if (plan.key === "custom") {
            action = (
              <a
                href="mailto:hello@haatnepal.com?subject=Custom%20plan%20request"
                className="block rounded-full bg-slate-900 px-4 py-2 text-center text-sm font-bold text-white hover:bg-orange-500"
              >
                Contact us
              </a>
            );
          } else if (isUpgrade && ["plus", "pro", "premium"].includes(plan.key)) {
            // Verification-required upgrade
            if (verification) {
              if (verification.status === "pending") {
                action = (
                  <div className="space-y-2">
                    <span className="block rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2 text-center text-sm font-semibold text-yellow-700">
                      Pending review
                    </span>
                    <p className="text-center text-xs text-slate-500">
                      Submitted {timeAgo(verification.created_at)} — admins review within 72 hours
                    </p>
                  </div>
                );
              } else if (verification.status === "rejected") {
                action = (
                  <div className="space-y-2">
                    <Link
                      href={`/dashboard/plan/verify/${plan.key}`}
                      className="block rounded-full bg-orange-500 px-4 py-2 text-center text-sm font-bold text-white hover:bg-orange-600"
                    >
                      Apply again
                    </Link>
                    {verification.rejection_reason && (
                      <p className="text-center text-xs text-red-600">
                        <strong>Reason:</strong> {verification.rejection_reason}
                      </p>
                    )}
                  </div>
                );
              }
            } else {
              action = (
                <Link
                  href={`/dashboard/plan/verify/${plan.key}`}
                  className="block rounded-full bg-orange-500 px-4 py-2 text-center text-sm font-bold text-white hover:bg-orange-600"
                >
                  Apply for {plan.name}
                </Link>
              );
            }
          } else {
            // Downgrade or ungated upgrade (Normal ↔ Business)
            action = (
              <>
                <form action={switchPlanAction.bind(null, plan.key as Exclude<SubscriptionTier, "custom">)}>
                  <button
                    type="submit"
                    className="w-full rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
                  >
                    Switch to {plan.name}
                  </button>
                </form>
                {isDowngrade && (
                  <p className="mt-2 text-center text-[11px] text-slate-500">
                    Downgrading takes effect immediately — any payment already made for your current plan is non-refundable. Your existing listings stay live; new listing/feature limits follow the {plan.name} plan from now on.
                  </p>
                )}
                {!isDowngrade && plan.is_paid && (
                  <p className="mt-2 text-center text-[11px] text-slate-500">
                    Billing isn&apos;t connected yet — this switches your plan without payment for now.
                  </p>
                )}
              </>
            );
          }

          return <PlanCard key={plan.id} plan={plan} isCurrent={isCurrent} action={action} />;
        })}
      </div>
    </div>
  );
}
