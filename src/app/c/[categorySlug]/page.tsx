import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getListings, getSubcategories } from "@/lib/queries/listings";
import { ListingCard } from "@/components/listing-card";
import { ListingFilters } from "@/components/listing-filters";

type SearchParams = {
  q?: string;
  subcategory?: string;
  district?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
};

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { categorySlug } = await params;
  const sp = await searchParams;

  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-black text-slate-900">Supabase isn&apos;t configured yet</h1>
      </main>
    );
  }

  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", categorySlug)
    .single();

  if (!category) notFound();

  const subcategories = await getSubcategories(supabase, category.id);

  const listings = await getListings(supabase, {
    categorySlug: sp.subcategory || categorySlug,
    search: sp.q,
    district: sp.district,
    condition: sp.condition === "new" || sp.condition === "used" ? sp.condition : undefined,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    sort: sp.sort === "price_asc" || sp.sort === "price_desc" ? sp.sort : "newest",
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-slate-900">{category.name}</h1>
      <p className="mt-2 text-slate-600">
        {listings.length} active listing{listings.length === 1 ? "" : "s"}
      </p>

      {subcategories.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/c/${categorySlug}`}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              !sp.subcategory
                ? "border-orange-300 bg-orange-50 text-orange-600"
                : "border-slate-200 text-slate-600 hover:border-orange-200 hover:text-orange-600"
            }`}
          >
            All {category.name}
          </Link>
          {subcategories.map((subcategory) => (
            <Link
              key={subcategory.id}
              href={`/c/${categorySlug}?subcategory=${subcategory.slug}`}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                sp.subcategory === subcategory.slug
                  ? "border-orange-300 bg-orange-50 text-orange-600"
                  : "border-slate-200 text-slate-600 hover:border-orange-200 hover:text-orange-600"
              }`}
            >
              {subcategory.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6">
        <ListingFilters formAction={`/c/${categorySlug}`} defaultValues={sp} />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {listings.length === 0 && (
        <div className="mt-16 text-center text-slate-500">No listings match your filters yet.</div>
      )}
    </main>
  );
}
