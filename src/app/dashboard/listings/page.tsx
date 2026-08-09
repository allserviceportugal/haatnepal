import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { ListingCard } from "@/components/listing-card";

export default async function DashboardListingsPage() {
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
      "*, listing_images(*), categories(id, name, slug, parent_id), profiles!listings_seller_id_fkey(id, display_name, district, rating_avg, rating_count)"
    )
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const listings = data ?? [];

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
        <h1 className="text-2xl font-black text-slate-900">My listings</h1>
        <Link
          href="/listing/new"
          className="rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
        >
          + New listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <p className="mt-8 text-slate-500">You haven&apos;t posted anything yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              applicantCount={applicationCounts[listing.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
