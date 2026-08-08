import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getListings } from "@/lib/queries/listings";
import { ListingCard } from "@/components/listing-card";
import { CategoryFilterSidebar } from "@/components/category-filter-sidebar";

type SearchParams = {
  q?: string;
  category?: string;
  district?: string;
  condition?: string;
  sellerType?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  [key: string]: string | undefined;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-black text-slate-900">Supabase isn&apos;t configured yet</h1>
      </main>
    );
  }

  const supabase = await createClient();
  const listings = await getListings(supabase, {
    search: sp.q,
    categorySlug: sp.category || undefined,
    district: sp.district,
    condition: sp.condition === "new" || sp.condition === "used" ? sp.condition : undefined,
    sellerType: sp.sellerType === "individual" || sp.sellerType === "business" ? sp.sellerType : undefined,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    sort: sp.sort === "price_asc" || sp.sort === "price_desc" ? sp.sort : "newest",
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-slate-900">
        {sp.q ? `Results for "${sp.q}"` : "Search listings"}
      </h1>
      <p className="mt-2 text-slate-600">
        {listings.length} active listing{listings.length === 1 ? "" : "s"}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <CategoryFilterSidebar formAction="/search" defaultValues={sp} />

        <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {listings.length === 0 && (
            <div className="mt-16 text-center text-slate-500">No listings match your search yet.</div>
          )}
        </div>
      </div>
    </main>
  );
}
