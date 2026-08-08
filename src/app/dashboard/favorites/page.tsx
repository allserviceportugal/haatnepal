import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { ListingCard } from "@/components/listing-card";
import type { ListingWithRelations } from "@/lib/supabase/types";

export default async function DashboardFavoritesPage() {
  if (!isSupabaseConfigured()) {
    return <p className="text-slate-500">Connect Supabase to see your favorites.</p>;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard/favorites");

  const { data } = await supabase
    .from("favorites")
    .select(
      "listings(*, listing_images(*), categories(id, name, slug), profiles!listings_seller_id_fkey(id, display_name, district, rating_avg, rating_count))"
    )
    .eq("user_id", user.id);

  const listings = ((data ?? []) as unknown as { listings: ListingWithRelations | null }[])
    .map((row) => row.listings)
    .filter((listing): listing is ListingWithRelations => Boolean(listing));

  return (
    <div>
      <h1 className="text-2xl font-black text-slate-900">Favorites</h1>
      {listings.length === 0 ? (
        <p className="mt-8 text-slate-500">You haven&apos;t saved any listings yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
