"use client";

import { useActionState } from "react";
import { republishListingAction } from "@/lib/actions/listings";
import { FeatureListingButton } from "@/components/feature-listing-button";

/**
 * Per-card seller controls on /dashboard/listings.
 *
 * The feature control previously existed only on the listing detail page, which
 * is why sellers reported not being able to find it.
 */
export function DashboardListingActions({
  listingId,
  status,
  featuredUntil,
  canFeatureFree,
  featuredMessage,
  durationDays,
}: {
  listingId: string;
  status: string;
  featuredUntil?: string | null;
  canFeatureFree: boolean;
  featuredMessage?: string;
  durationDays: number;
}) {
  const [state, action, pending] = useActionState(
    republishListingAction.bind(null, listingId),
    {}
  );

  const canRepublish = status === "archived" || status === "expired" || status === "sold";

  return (
    <div className="space-y-2 border-t border-slate-100 px-2.5 pb-2.5 pt-2">
      {canRepublish ? (
        <form action={action}>
          <input type="hidden" name="durationDays" value={durationDays} />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-orange-500 disabled:opacity-60"
          >
            {pending ? "Republishing..." : `↻ Republish for ${durationDays} days`}
          </button>
        </form>
      ) : status === "active" ? (
        <FeatureListingButton
          listingId={listingId}
          featuredUntil={featuredUntil}
          canFeatureFree={canFeatureFree}
          featuredMessage={featuredMessage}
          compact
        />
      ) : null}

      {state.error && <p className="text-[11px] font-semibold text-red-600">{state.error}</p>}
      {state.success && <p className="text-[11px] font-semibold text-green-700">{state.success}</p>}
    </div>
  );
}
