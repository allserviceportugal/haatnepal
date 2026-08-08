import type { ReactNode } from "react";
import type { SubscriptionPlan } from "@/lib/supabase/types";

export function PlanCard({
  plan,
  isCurrent,
  action,
}: {
  plan: SubscriptionPlan;
  isCurrent?: boolean;
  action?: ReactNode;
}) {
  return (
    <div
      className={`rounded-md border p-6 shadow-sm ${
        isCurrent ? "border-orange-300 bg-orange-50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
        {isCurrent && (
          <span className="rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Current
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-black text-slate-900">
        {plan.price_npr === null
          ? "Custom"
          : plan.price_npr === 0
            ? "Free"
            : `NPR ${plan.price_npr}/mo`}
      </p>
      <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        <li>
          {plan.monthly_listing_quota === null
            ? "Unlimited listings"
            : `${plan.monthly_listing_quota} listings/month`}
        </li>
        <li>
          {plan.monthly_featured_quota === null
            ? "Unlimited featured listings"
            : plan.monthly_featured_quota === 0
              ? "No featured listings"
              : `${plan.monthly_featured_quota} featured listings/month`}
        </li>
        <li>{plan.allows_promoted_listings ? "Promoted/boosted listings" : "Standard listing visibility"}</li>
        <li>{plan.allows_storefront_branding ? "Branded storefront page" : "Standard profile page"}</li>
      </ul>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
