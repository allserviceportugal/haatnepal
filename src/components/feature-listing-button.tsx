"use client";

import { useActionState } from "react";
import { featureListingAction, purchaseFeatureBoostAction } from "@/lib/actions/listings";

export function FeatureListingButton({
  listingId,
  featuredUntil,
  canFeatureFree,
}: {
  listingId: string;
  featuredUntil: string | null;
  canFeatureFree: boolean;
}) {
  const boundFreeAction = featureListingAction.bind(null, listingId);
  const boundPaidAction = purchaseFeatureBoostAction.bind(null, listingId);
  const [state, formAction, isPending] = useActionState(canFeatureFree ? boundFreeAction : boundPaidAction, {});

  const isActive = featuredUntil && new Date(featuredUntil) > new Date();

  if (isActive) {
    return (
      <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
        Featured until {new Date(featuredUntil).toLocaleDateString()}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <form action={formAction}>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {canFeatureFree ? "Feature this listing" : "Feature this listing — NPR 44"}
        </button>
      </form>
      {!canFeatureFree && (
        <p className="text-xs text-slate-500">Payment collection isn't connected yet — this instantly features your listing for now.</p>
      )}
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
    </div>
  );
}
