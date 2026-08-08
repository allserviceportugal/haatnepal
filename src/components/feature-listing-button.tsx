"use client";

import { useActionState } from "react";
import { featureListingAction } from "@/lib/actions/listings";

export function FeatureListingButton({
  listingId,
  featuredUntil,
  canFeature,
}: {
  listingId: string;
  featuredUntil: string | null;
  canFeature: boolean;
}) {
  const boundAction = featureListingAction.bind(null, listingId);
  const [state, formAction, isPending] = useActionState(boundAction, {});

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
          disabled={isPending || !canFeature}
          title={canFeature ? undefined : "Your plan doesn't include featured listings"}
          className="rounded-full border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {canFeature ? "Feature this listing" : "Feature this listing (upgrade required)"}
        </button>
      </form>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
    </div>
  );
}
