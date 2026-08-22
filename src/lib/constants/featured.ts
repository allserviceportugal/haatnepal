/**
 * Featured-listing packages.
 *
 * Previously the duration was hardcoded as `7 * 24 * 60 * 60 * 1000` in both
 * featureListingAction and purchaseFeatureBoostAction, and the NPR 44 amount was
 * duplicated across the SQL default, the insert and the button label. Everything
 * lives here now so the price and duration can only be changed in one place.
 */

export type FeaturedPackageKey = "free_14" | "paid_14" | "paid_30" | "paid_45";

export type FeaturedPackage = {
  key: FeaturedPackageKey;
  label: string;
  days: number;
  priceNpr: number;
  /** 'plan' consumes the subscription's monthly quota; 'paid' requires money. */
  source: "plan" | "paid";
};

export const FEATURED_PACKAGES: Record<FeaturedPackageKey, FeaturedPackage> = {
  free_14: { key: "free_14", label: "14 days", days: 14, priceNpr: 0, source: "plan" },
  paid_14: { key: "paid_14", label: "14 days", days: 14, priceNpr: 44, source: "paid" },
  paid_30: { key: "paid_30", label: "30 days", days: 30, priceNpr: 74, source: "paid" },
  paid_45: { key: "paid_45", label: "45 days", days: 45, priceNpr: 99, source: "paid" },
};

export const PAID_FEATURED_PACKAGES: FeaturedPackage[] = [
  FEATURED_PACKAGES.paid_14,
  FEATURED_PACKAGES.paid_30,
  FEATURED_PACKAGES.paid_45,
];

export function getFeaturedPackage(key: string): FeaturedPackage | null {
  return (FEATURED_PACKAGES as Record<string, FeaturedPackage>)[key] ?? null;
}

/**
 * No payment gateway is integrated (no SDK, no merchant credentials, no callback
 * route). Until one exists the paid packages are shown but cannot be purchased —
 * the previous implementation featured the listing instantly and recorded NPR 44
 * as collected, so free users got unlimited paid boosts and the ledger asserted
 * revenue that was never received.
 */
export const PAID_FEATURING_ENABLED = false;

export const PAID_FEATURING_UNAVAILABLE_MESSAGE =
  "Paid boosts aren't available yet — online payment is being set up. Plan-included boosts still work.";

/** Listing duration options offered to sellers, filtered by their plan's cap. */
export const LISTING_DURATION_OPTIONS = [7, 15, 30, 60, 90, 365] as const;

export function durationOptionsForPlan(maxDays: number | null | undefined): number[] {
  // A missing plan duration means the fallback used at creation time (60 days).
  const cap = maxDays ?? 60;
  const options = LISTING_DURATION_OPTIONS.filter((d) => d <= cap);
  return options.length > 0 ? [...options] : [cap];
}
