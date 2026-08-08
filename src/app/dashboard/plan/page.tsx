import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { PlanCard } from "@/components/plan-card";
import { PLAN_ORDER } from "@/lib/constants/plans";
import { switchPlanAction } from "@/lib/actions/subscriptions";
import type { SubscriptionPlan } from "@/lib/supabase/types";

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

  const [{ data: profile }, { data: plansData }, { count: usedThisMonth }] = await Promise.all([
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
  ]);

  const currentPlan =
    (profile as unknown as { subscription_plans: SubscriptionPlan | null } | null)
      ?.subscription_plans ?? null;
  const plans = (plansData ?? []).sort(
    (a, b) => PLAN_ORDER.indexOf(a.key) - PLAN_ORDER.indexOf(b.key)
  );

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-900">Your plan</h1>

      {currentPlan && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">
            You&apos;re on <span className="font-bold text-slate-900">{currentPlan.name}</span>.{" "}
            {currentPlan.monthly_listing_quota === null
              ? `${usedThisMonth ?? 0} listings posted this month (unlimited).`
              : `${usedThisMonth ?? 0} / ${currentPlan.monthly_listing_quota} listings used this month.`}
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan?.id;
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
          } else {
            action = (
              <form action={switchPlanAction.bind(null, plan.key as "normal" | "pro" | "business")}>
                <button
                  type="submit"
                  className="w-full rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
                >
                  Switch to {plan.name}
                </button>
                {plan.is_paid && (
                  <p className="mt-2 text-center text-[11px] text-slate-500">
                    Billing isn&apos;t connected yet — this switches your plan without payment for
                    now.
                  </p>
                )}
              </form>
            );
          }

          return <PlanCard key={plan.id} plan={plan} isCurrent={isCurrent} action={action} />;
        })}
      </div>
    </div>
  );
}
