import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryAttribute, ListingWithRelations } from "@/lib/supabase/types";

const LISTING_SELECT = `
  *,
  listing_images(*),
  categories(id, name, slug, parent_id),
  profiles!listings_seller_id_fkey(id, display_name, district, rating_avg, rating_count, account_type),
  listing_attribute_values(*, category_attributes(*)),
  listing_delivery_options(courier:delivery_couriers(*))
`;

export type ListingFilters = {
  categorySlug?: string;
  search?: string;
  district?: string;
  condition?: "new" | "used";
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc";
  sellerId?: string;
  sellerType?: "individual" | "business";
  limit?: number;
  /** attribute id -> selected value, ANDed together */
  attributeFilters?: Record<string, string>;
};

async function resolveCategoryIds(supabase: SupabaseClient, slug: string): Promise<string[] | null> {
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .single();

  if (!category) return null;

  // Include the category itself plus all descendants at any depth, so
  // browsing a top-level category ("/c/electronics"), a mid-tier group
  // ("/c/phones-accessories"), or a leaf ("/c/smartphones") all resolve to
  // the right set of listings regardless of where they sit in the tree.
  const ids = [category.id];
  let frontier = [category.id];

  while (frontier.length > 0) {
    const { data: children } = await supabase.from("categories").select("id").in("parent_id", frontier);
    const childIds = (children ?? []).map((c) => c.id);
    if (childIds.length === 0) break;
    ids.push(...childIds);
    frontier = childIds;
  }

  return ids;
}

export async function getListings(
  supabase: SupabaseClient,
  filters: ListingFilters = {}
): Promise<ListingWithRelations[]> {
  let query = supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("status", "active");

  if (filters.categorySlug) {
    const categoryIds = await resolveCategoryIds(supabase, filters.categorySlug);
    if (!categoryIds) return [];
    query = query.in("category_id", categoryIds);
  }

  if (filters.attributeFilters && Object.keys(filters.attributeFilters).length > 0) {
    let matchingIds: Set<string> | undefined;

    for (const [attributeId, value] of Object.entries(filters.attributeFilters)) {
      const { data: rows } = await supabase
        .from("listing_attribute_values")
        .select("listing_id")
        .eq("attribute_id", attributeId)
        .eq("value", value);

      const idsForThisFilter = new Set<string>((rows ?? []).map((row) => row.listing_id as string));

      if (matchingIds === undefined) {
        matchingIds = idsForThisFilter;
      } else {
        const intersected = new Set<string>();
        for (const id of matchingIds) {
          if (idsForThisFilter.has(id)) intersected.add(id);
        }
        matchingIds = intersected;
      }
    }

    if (!matchingIds || matchingIds.size === 0) return [];
    query = query.in("id", Array.from(matchingIds));
  }

  if (filters.search) {
    const term = filters.search.replace(/[%,]/g, " ").trim();
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  }

  if (filters.sellerType) {
    const { data: matchingSellers } = await supabase
      .from("profiles")
      .select("id")
      .eq("account_type", filters.sellerType);

    const sellerIds = (matchingSellers ?? []).map((row) => row.id as string);
    if (sellerIds.length === 0) return [];
    query = query.in("seller_id", sellerIds);
  }

  if (filters.district) {
    query = query.eq("district", filters.district);
  }

  if (filters.condition) {
    query = query.eq("condition", filters.condition);
  }

  if (filters.minPrice !== undefined) {
    query = query.gte("price", filters.minPrice);
  }

  if (filters.maxPrice !== undefined) {
    query = query.lte("price", filters.maxPrice);
  }

  if (filters.sellerId) {
    query = query.eq("seller_id", filters.sellerId);
  }

  if (filters.sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (filters.sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  query = query.limit(filters.limit ?? 24);

  const { data, error } = await query;
  if (error) {
    console.error("getListings error:", error.message);
    return [];
  }

  const listings = (data ?? []) as unknown as ListingWithRelations[];
  const now = Date.now();
  const isFeatured = (listing: ListingWithRelations) =>
    listing.featured_until !== null && new Date(listing.featured_until).getTime() > now;

  // Stable sort: featured listings (within this already-fetched page) float
  // to the top, preserving relative order within each group.
  return listings
    .map((listing, index) => ({ listing, index }))
    .sort((a, b) => {
      const featuredDiff = Number(isFeatured(b.listing)) - Number(isFeatured(a.listing));
      return featuredDiff !== 0 ? featuredDiff : a.index - b.index;
    })
    .map(({ listing }) => listing);
}

export async function getListingById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from("listings").select(LISTING_SELECT).eq("id", id).single();
  if (error) return null;
  return data as unknown as ListingWithRelations;
}

export async function getFavoriteListingIds(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from("favorites").select("listing_id").eq("user_id", userId);
  return new Set((data ?? []).map((row) => row.listing_id));
}

export async function getSubcategories(supabase: SupabaseClient, topLevelCategoryId: string) {
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("parent_id", topLevelCategoryId)
    .order("name");
  return data ?? [];
}

export async function getCategoryAttributes(
  supabase: SupabaseClient,
  categoryId: string
): Promise<CategoryAttribute[]> {
  const { data } = await supabase
    .from("category_attributes")
    .select("*")
    .eq("category_id", categoryId)
    .order("sort_order");
  return data ?? [];
}

async function getParentCategoryId(supabase: SupabaseClient, categoryId: string): Promise<string | null> {
  const { data } = await supabase.from("categories").select("parent_id").eq("id", categoryId).single();
  return data?.parent_id ?? null;
}

/**
 * Walks the category tree upward from `categoryId` (self, then parent, then
 * grandparent, ...) and returns the first non-empty set of category
 * attributes found. Lets a specific leaf (e.g. "Desktop Computers") override
 * its department's generic set, while leaves nobody has curated yet (e.g.
 * "Cars") fall back to the nearest ancestor that has attributes defined.
 */
export async function getEffectiveCategoryAttributes(
  supabase: SupabaseClient,
  categoryId: string
): Promise<CategoryAttribute[]> {
  let currentId: string | null = categoryId;

  while (currentId) {
    const attributes = await getCategoryAttributes(supabase, currentId);
    if (attributes.length > 0) return attributes;

    currentId = await getParentCategoryId(supabase, currentId);
  }

  return [];
}
