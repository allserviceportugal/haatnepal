import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { PlanCard } from "@/components/plan-card";
import { PLAN_ORDER } from "@/lib/constants/plans";
import type { SubscriptionPlan } from "@/lib/supabase/types";

export default async function PricingPage() {
  let plans: SubscriptionPlan[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.from("subscription_plans").select("*");
    plans = (data ?? []).sort(
      (a, b) => PLAN_ORDER.indexOf(a.key) - PLAN_ORDER.indexOf(b.key)
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">Pricing</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">
          Choose the right plan to sell on Haat Nepal
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">
          Individuals start on Normal, businesses start on Business — both free. Upgrade to Pro or
          Custom anytime for more listings and visibility.
        </p>
      </div>

      {plans.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-slate-500">
          Connect Supabase to see live pricing plans here.
        </p>
      )}

      <div className="mt-10 text-center">
        <Link
          href="/signup"
          className="rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
        >
          Get started free
        </Link>
      </div>
    </main>
  );
}
