import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getListings } from "@/lib/queries/listings";
import { ListingCard } from "@/components/listing-card";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-black text-slate-900">Supabase isn&apos;t configured yet</h1>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (!profile) notFound();

  const listings = await getListings(supabase, { sellerId: userId, limit: 40 });

  const isBrandedBusiness =
    profile.account_type === "business" &&
    Boolean(profile.logo_url || profile.cover_image_url || profile.business_description);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        {isBrandedBusiness && (
          <div className="h-40 w-full bg-slate-100 sm:h-56">
            {profile.cover_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.cover_image_url}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
          </div>
        )}

        <div className={`p-6 sm:p-8 ${isBrandedBusiness ? "relative" : ""}`}>
          {isBrandedBusiness && profile.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.logo_url}
              alt={`${profile.display_name} logo`}
              className="absolute -top-12 left-6 h-20 w-20 rounded-2xl border-4 border-white bg-white object-cover shadow-md sm:-top-14 sm:h-24 sm:w-24"
            />
          )}

          <div className={isBrandedBusiness && profile.logo_url ? "sm:pl-28" : ""}>
            <h1 className="text-2xl font-black text-slate-900">{profile.display_name}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {profile.district
                ? `${profile.city ? `${profile.city}, ` : ""}${profile.district}`
                : "Location not set"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {profile.rating_count > 0
                ? `★ ${profile.rating_avg.toFixed(1)} (${profile.rating_count} ratings)`
                : "No ratings yet"}
            </p>
            {profile.account_type === "business" && (
              <span className="mt-3 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                Business seller
              </span>
            )}
            {profile.business_description && (
              <p className="mt-4 whitespace-pre-line text-sm text-slate-700">
                {profile.business_description}
              </p>
            )}
          </div>
        </div>
      </div>

      <h2 className="mt-10 text-xl font-black text-slate-900">Listings from {profile.display_name}</h2>
      {listings.length === 0 ? (
        <p className="mt-4 text-slate-500">No active listings right now.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </main>
  );
}
