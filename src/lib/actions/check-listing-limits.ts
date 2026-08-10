"use server";

import { createClient } from "@/lib/supabase/server";

export type ListingLimitCheckResult = {
  canCreate: boolean;
  canFeature: boolean;
  listingsUsed: number;
  listingsLimit: number;
  listingsRemaining: number;
  featuredUsed: number;
  featuredLimit: number;
  featuredRemaining: number;
  currentPlan: string;
  message?: string;
  featuredMessage?: string;
};

export async function checkListingLimits(): Promise<ListingLimitCheckResult> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        canCreate: false,
        canFeature: false,
        listingsUsed: 0,
        listingsLimit: 0,
        listingsRemaining: 0,
        featuredUsed: 0,
        featuredLimit: 0,
        featuredRemaining: 0,
        currentPlan: "none",
        message: "You must be logged in to create listings",
      };
    }

    // Get user's subscription plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_plans(key, monthly_listing_quota, monthly_featured_quota)")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.subscription_plans) {
      return {
        canCreate: false,
        canFeature: false,
        listingsUsed: 0,
        listingsLimit: 0,
        listingsRemaining: 0,
        featuredUsed: 0,
        featuredLimit: 0,
        featuredRemaining: 0,
        currentPlan: "none",
        message: "Unable to load your subscription plan",
      };
    }

    const plan = profile.subscription_plans as any;
    const currentMonth = new Date().toISOString().split("T")[0].substring(0, 7); // YYYY-MM

    // Get current month's usage
    const { data: usage } = await supabase
      .from("user_monthly_usage")
      .select("listings_created, featured_listings_created")
      .eq("user_id", user.id)
      .gte("month_year", `${currentMonth}-01`)
      .single();

    const listingsUsed = usage?.listings_created || 0;
    const featuredUsed = usage?.featured_listings_created || 0;
    const listingsLimit = plan.monthly_listing_quota || -1; // -1 = unlimited
    const featuredLimit = plan.monthly_featured_quota || -1;

    // Calculate remaining
    const listingsRemaining = listingsLimit === -1 ? -1 : Math.max(0, listingsLimit - listingsUsed);
    const featuredRemaining = featuredLimit === -1 ? -1 : Math.max(0, featuredLimit - featuredUsed);

    // Check if can create
    const canCreate =
      listingsLimit === -1 || listingsUsed < listingsLimit;
    const canFeature =
      featuredLimit !== 0 && (featuredLimit === -1 || featuredUsed < featuredLimit);

    let message: string | undefined;
    if (!canCreate) {
      message = `You've reached your monthly limit of ${listingsLimit} listings. Upgrade your plan to continue.`;
    }

    let featuredMessage: string | undefined;
    if (!canFeature) {
      if (featuredLimit === 0) {
        featuredMessage = "Your plan doesn't support featured listings. Upgrade to Pro or above.";
      } else {
        featuredMessage = `You've reached your monthly featured listing limit. Upgrade your plan for more.`;
      }
    }

    return {
      canCreate,
      canFeature,
      listingsUsed,
      listingsLimit: listingsLimit === -1 ? 999 : listingsLimit,
      listingsRemaining,
      featuredUsed,
      featuredLimit: featuredLimit === -1 ? 999 : featuredLimit,
      featuredRemaining,
      currentPlan: plan.key,
      message,
      featuredMessage,
    };
  } catch (error) {
    console.error("Error checking listing limits:", error);
    return {
      canCreate: false,
      canFeature: false,
      listingsUsed: 0,
      listingsLimit: 0,
      listingsRemaining: 0,
      featuredUsed: 0,
      featuredLimit: 0,
      featuredRemaining: 0,
      currentPlan: "none",
      message: "Error checking your limits. Please try again.",
    };
  }
}

export async function incrementListingUsage(isFeatured: boolean = false): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const currentMonth = new Date().toISOString().split("T")[0].substring(0, 7);
  const monthYear = `${currentMonth}-01`;

  // Upsert usage record
  await supabase.from("user_monthly_usage").upsert(
    {
      user_id: user.id,
      month_year: monthYear,
      listings_created: 1,
      featured_listings_created: isFeatured ? 1 : 0,
    },
    {
      onConflict: "user_id,month_year",
    }
  );
}
