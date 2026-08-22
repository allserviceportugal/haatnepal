"use client";

import { useActionState, useState } from "react";
import { featureListingAction, purchaseFeatureBoostAction } from "@/lib/actions/listings";
import {
  PAID_FEATURED_PACKAGES,
  PAID_FEATURING_ENABLED,
  FEATURED_PACKAGES,
} from "@/lib/constants/featured";

export function FeatureListingButton({
  listingId,
  featuredUntil,
  canFeatureFree,
  featuredMessage,
  compact = false,
}: {
  listingId: string;
  featuredUntil?: string | null;
  canFeatureFree: boolean;
  featuredMessage?: string;
  /** Dense variant for dashboard cards. */
  compact?: boolean;
}) {
  const [freeState, freeAction, freePending] = useActionState(
    featureListingAction.bind(null, listingId),
    {}
  );
  const [paidState, paidAction, paidPending] = useActionState(
    purchaseFeatureBoostAction.bind(null, listingId),
    {}
  );
  const [showPaid, setShowPaid] = useState(false);

  const isFeatured = featuredUntil ? new Date(featuredUntil) > new Date() : false;

  if (isFeatured) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
        ⭐ Featured until {new Date(featuredUntil as string).toLocaleDateString()}
      </span>
    );
  }

  const error = freeState.error || paidState.error;
  const success = freeState.success;

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {canFeatureFree ? (
        <form action={freeAction}>
          <button
            type="submit"
            disabled={freePending}
            className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-600 disabled:opacity-60"
          >
            {freePending
              ? "Featuring..."
              : `⭐ Feature free for ${FEATURED_PACKAGES.free_14.days} days`}
          </button>
        </form>
      ) : (
        <p className="text-xs text-slate-500">
          {featuredMessage ?? "No featured boosts remaining on your plan."}
        </p>
      )}

      {!compact && (
        <div>
          <button
            type="button"
            onClick={() => setShowPaid((v) => !v)}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700"
          >
            {showPaid ? "Hide paid boosts" : "See paid boost options →"}
          </button>

          {showPaid && (
            <div className="mt-2 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              {PAID_FEATURED_PACKAGES.map((pkg) => (
                <form action={paidAction} key={pkg.key} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-700">
                    <span className="font-semibold">{pkg.label}</span> — NPR {pkg.priceNpr}
                  </span>
                  <input type="hidden" name="packageKey" value={pkg.key} />
                  <button
                    type="submit"
                    disabled={!PAID_FEATURING_ENABLED || paidPending}
                    title={
                      PAID_FEATURING_ENABLED ? undefined : "Online payment isn't available yet"
                    }
                    className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {PAID_FEATURING_ENABLED ? "Buy" : "Coming soon"}
                  </button>
                </form>
              ))}
              {!PAID_FEATURING_ENABLED && (
                <p className="text-xs text-slate-500">
                  Online payment is being set up. Boosts included with your plan work today.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
      {success && <p className="text-xs font-semibold text-green-700">{success}</p>}
    </div>
  );
}
