import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { ListingCard } from "@/components/listing-card";
import { DashboardListingActions } from "@/components/dashboard-listing-actions";
import { getPlanLimits } from "@/lib/actions/check-listing-limits";

const TABS = [
  { key: "active", label: "Active", statuses: ["active"] },
  { key: "archived", label: "Archived", statuses: ["archived", "expired"] },
  { key: "sold", label: "Sold", statuses: ["sold"] },
  { key: "draft", label: "Drafts", statuses: ["draft"] },
] as const;

export default async function DashboardListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  if (!isSupabaseConfigured()) {
    return <p className="text-slate-500">Connect Supabase to manage your listings.</p>;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/listings");

  const { data } = await supabase
    .from("listings")
    .select(
      "*, listing_images(*), categories(id, name, slug, parent_id), profiles!listings_seller_id_fkey(id, display_name, district, rating_avg, rating_count), listing_attribute_values(*, category_attributes(*))"
    )
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const allListings = data ?? [];
  const limits = await getPlanLimits(supabase, user.id);

  const { status: statusParam } = await searchParams;
  const activeTab = TABS.find((t) => t.key === statusParam) ?? TABS[0];
  const counts = Object.fromEntries(
    TABS.map((t) => [t.key, allListings.filter((l) => t.statuses.includes(l.status as never)).length])
  ) as Record<string, number>;

  // The page previously dumped every status into one grid with no filter and no
  // badge, so an archived listing looked identical to a live one.
  const listings = allListings.filter((l) => activeTab.statuses.includes(l.status as never));

  // Fetch application counts for jobs listings
  const jobsListingIds = listings
    .filter((l) => l.categories?.slug === "jobs" || (l.categories?.parent_id && l.categories?.slug?.includes("-")))
    .map((l) => l.id);

  let applicationCounts: Record<string, number> = {};
  if (jobsListingIds.length > 0) {
    const { data: appCounts } = await supabase
      .from("job_applications")
      .select("listing_id")
      .in("listing_id", jobsListingIds);

    appCounts?.forEach((app) => {
      applicationCounts[app.listing_id] = (applicationCounts[app.listing_id] ?? 0) + 1;
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My listings</h1>
          {limits.listingsLimit !== null && (
            <p className="mt-1 text-sm text-slate-500">
              {limits.listingsUsed} of {limits.listingsLimit} slots in use on the {limits.planName}{" "}
              plan — archived and sold listings don&apos;t use a slot.
            </p>
          )}
        </div>
        <Link
          href="/listing/new"
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
        >
          + New listing
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/dashboard/listings?status=${tab.key}`}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              tab.key === activeTab.key
                ? "bg-slate-900 text-white"
                : "border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label} ({counts[tab.key] ?? 0})
          </Link>
        ))}
      </div>

      {listings.length === 0 ? (
        <p className="mt-8 text-slate-500">
          {activeTab.key === "active"
            ? "You have no active listings."
            : `No ${activeTab.label.toLowerCase()} listings.`}
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing) => (
            <div key={listing.id} className="overflow-hidden rounded-[18px] border border-slate-200 bg-white">
              <ListingCard listing={listing} applicantCount={applicationCounts[listing.id]} />
              <DashboardListingActions
                listingId={listing.id}
                status={listing.status}
                featuredUntil={listing.featured_until}
                canFeatureFree={limits.canFeatureFree}
                featuredMessage={limits.featuredMessage}
                durationDays={limits.listingDurationDays}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
