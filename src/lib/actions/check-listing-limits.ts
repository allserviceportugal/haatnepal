"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * The single source of truth for listing and featured quotas.
 *
 * This previously existed twice — here and as `checkListingQuota` in
 * listings.ts — and the two disagreed in ways that were user-visible:
 *   - on a missing plan, listings.ts failed *open* (allow) and this file failed
 *     *closed* (block), so the create page and the create action could contradict
 *     each other;
 *   - `plan.monthly_listing_quota || -1` turned a legitimate quota of 0 into
 *     "unlimited".
 *
 * Quota is a *live-slot* model: it counts listings currently occupying a slot,
 * not listings created this month. Archived, sold and draft listings therefore
 * free their slot up, which is what makes republishing meaningful. (The old
 * created-this-month count also meant deleting a listing silently refunded quota
 * while archiving or selling one did not.)
 */

// Statuses that occupy one of the seller's paid slots. Not exported: this file
// carries "use server", which permits only async function exports.
const SLOT_CONSUMING_STATUSES = ["active", "sold"] as const;

export type PlanLimits = {
  planKey: string | null;
  planName: string;
  isAdmin: boolean;
  listingsUsed: number;
  /** null = unlimited */
  listingsLimit: number | null;
  listingsRemaining: number | null;
  canCreate: boolean;
  listingMessage?: string;
  featuredUsed: number;
  /** null = unlimited */
  featuredLimit: number | null;
  featuredRemaining: number | null;
  canFeatureFree: boolean;
  featuredMessage?: string;
  listingDurationDays: number;
};

function startOfCurrentMonthISO() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

/**
 * Resolve a user's quota state. Pass an admin/service client when calling from a
 * context where RLS would hide what we need to count.
 */
export async function getPlanLimits(
  supabase: SupabaseClient,
  userId: string
): Promise<PlanLimits> {
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "role, subscription_plan_id, subscription_plans(key, name, monthly_listing_quota, monthly_featured_quota, listing_duration_days)"
    )
    .eq("id", userId)
    .single();

  const isAdmin = (profile as any)?.role === "admin";
  const plan = (profile as any)?.subscription_plans as
    | {
        key: string;
        name: string;
        monthly_listing_quota: number | null;
        monthly_featured_quota: number | null;
        listing_duration_days: number | null;
      }
    | null;

  // Count slots currently occupied.
  const { count: listingsUsedRaw } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", userId)
    .in("status", SLOT_CONSUMING_STATUSES as unknown as string[]);
  const listingsUsed = listingsUsedRaw ?? 0;

  // Count feature *events* this month, not listings carrying a featured_at.
  // Counting listings meant re-featuring the same listing twice consumed a single
  // slot, and overwriting featured_at moved the count between months.
  const { count: featuredUsedRaw } = await supabase
    .from("listing_feature_purchases")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", userId)
    .eq("source", "plan")
    .neq("status", "failed")
    .gte("created_at", startOfCurrentMonthISO());
  const featuredUsed = featuredUsedRaw ?? 0;

  // Every profile now references a plan (migration 0071). This fallback only
  // covers a transient lookup failure, so it uses the free-tier cap rather than
  // the more generous 60 days the old code assumed.
  const listingDurationDays = plan?.listing_duration_days ?? 30;

  // Admins are unlimited on both axes.
  if (isAdmin) {
    return {
      planKey: plan?.key ?? null,
      planName: plan?.name ?? "Admin",
      isAdmin: true,
      listingsUsed,
      listingsLimit: null,
      listingsRemaining: null,
      canCreate: true,
      featuredUsed,
      featuredLimit: null,
      featuredRemaining: null,
      canFeatureFree: true,
      listingDurationDays,
    };
  }

  // A user with no resolvable plan is treated as the free tier rather than
  // unlimited. The old code branched both ways depending on which copy ran.
  const listingsLimit = plan ? plan.monthly_listing_quota : 5;
  const featuredLimit = plan ? plan.monthly_featured_quota : 0;
  const planName = plan?.name ?? "Normal";

  const listingsRemaining =
    listingsLimit === null ? null : Math.max(0, listingsLimit - listingsUsed);
  const canCreate = listingsLimit === null || listingsUsed < listingsLimit;

  const featuredRemaining =
    featuredLimit === null ? null : Math.max(0, featuredLimit - featuredUsed);
  const canFeatureFree = featuredLimit === null || featuredUsed < featuredLimit;

  return {
    planKey: plan?.key ?? null,
    planName,
    isAdmin: false,
    listingsUsed,
    listingsLimit,
    listingsRemaining,
    canCreate,
    listingMessage: canCreate
      ? undefined
      : `You have ${listingsUsed} of your ${listingsLimit} listing slots in use on the ${planName} plan. Archive or delete a listing, or upgrade on the Plan page.`,
    featuredUsed,
    featuredLimit,
    featuredRemaining,
    canFeatureFree,
    featuredMessage: canFeatureFree
      ? undefined
      : featuredLimit === 0
        ? `The ${planName} plan doesn't include featured listings.`
        : `You've used all ${featuredLimit} featured boosts included with the ${planName} plan this month.`,
    listingDurationDays,
  };
}

/** Convenience wrapper for the signed-in user, for use in server components. */
export async function checkListingLimits(): Promise<PlanLimits | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return getPlanLimits(supabase, user.id);
}
