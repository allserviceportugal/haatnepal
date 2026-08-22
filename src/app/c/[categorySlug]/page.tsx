import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getEffectiveCategoryAttributes, getListings, getSubcategories, getCategoryPath } from "@/lib/queries/listings";
import { ListingCard } from "@/components/listing-card";
import { CategoryFilterSidebar } from "@/components/category-filter-sidebar";
import { CategoryBreadcrumb } from "@/components/category-breadcrumb";

type SearchParams = {
  q?: string;
  subcategory?: string;
  district?: string;
  condition?: string;
  sellerType?: string;
  minPrice?: string;
  maxPrice?: string;
  minSalary?: string;
  maxSalary?: string;
  sort?: string;
  [key: string]: string | undefined;
};

function extractAttributeFilters(sp: SearchParams): Record<string, string> {
  const filters: Record<string, string> = {};
  for (const [key, value] of Object.entries(sp)) {
    if (key.startsWith("attr_") && value) {
      filters[key.slice("attr_".length)] = value;
    }
  }
  return filters;
}

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

  const [subcategories, attributes, categoryPath] = await Promise.all([
    getSubcategories(supabase, category.id),
    getEffectiveCategoryAttributes(supabase, category.id),
    getCategoryPath(supabase, category.id),
  ]);

  const isJobsCategory = category.slug === "jobs";

  const listings = await getListings(supabase, {
    categorySlug: sp.subcategory || categorySlug,
    search: sp.q,
    district: sp.district,
    condition: sp.condition === "new" || sp.condition === "used" ? sp.condition : undefined,
    sellerType: sp.sellerType === "individual" || sp.sellerType === "business" ? sp.sellerType : undefined,
    minPrice: isJobsCategory ? undefined : (sp.minPrice ? Number(sp.minPrice) : undefined),
    maxPrice: isJobsCategory ? undefined : (sp.maxPrice ? Number(sp.maxPrice) : undefined),
    minSalary: isJobsCategory ? (sp.minSalary ? Number(sp.minSalary) : undefined) : undefined,
    maxSalary: isJobsCategory ? (sp.maxSalary ? Number(sp.maxSalary) : undefined) : undefined,
    sort: sp.sort === "price_asc" || sp.sort === "price_desc" ? sp.sort : "newest",
    attributeFilters: extractAttributeFilters(sp),
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <CategoryBreadcrumb path={categoryPath} currentIsLeaf className="mb-4" />
      <h1 className="text-3xl font-black text-slate-900">{category.name}</h1>
      <p className="mt-2 text-slate-600">
        {listings.length} active listing{listings.length === 1 ? "" : "s"}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <CategoryFilterSidebar
          formAction={`/c/${categorySlug}`}
          defaultValues={{
            ...sp,
            // Map salary params to price for sidebar UI
            minPrice: isJobsCategory ? sp.minSalary : sp.minPrice,
            maxPrice: isJobsCategory ? sp.maxSalary : sp.maxPrice,
          }}
          categorySlug={categorySlug}
          categoryName={category.name}
          subcategories={subcategories}
          attributes={attributes}
          isJobsCategory={isJobsCategory}
        />

        <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {listings.length === 0 && (
            <div className="mt-16 text-center text-slate-500">No listings match your filters yet.</div>
          )}
        </div>
      </div>
    </main>
  );
}
