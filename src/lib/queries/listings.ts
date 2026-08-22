import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryAttribute, ListingWithRelations } from "@/lib/supabase/types";

// Public listing select — safe for anonymous users.
// Columns are listed explicitly rather than using `*`: anonymous users no longer
// hold SELECT on listings.contact_phone (migration 0067), and `*` would fail for
// them. Add a new column here for it to appear publicly; a new *contact* column
// must also be revoked from anon in a migration.
const LISTING_SELECT = `
  id, seller_id, category_id, title, description, price, currency, condition, listing_type, status, district, city, created_at, updated_at, expires_at, pickup_available, featured_at, featured_until, province, municipality, ward_number, tole, land_unit_system, land_ropani, land_aana, land_paisa, land_daam, land_bigha, land_kattha, land_dhur, land_area_sqft, listing_number, view_count, bluebook_status, registration_year, manufacturing_year, import_status, owner_count, is_modified, accident_history, service_history, food_freshness, best_before_date, manufacturing_date, ingredients, storage_instructions, allergen_info, is_food, is_agriculture, harvest_date, unit_of_sale, min_order_quantity, farm_location, for_rent, rental_rate_period, price_on_request, transaction_mode, allow_offers, allow_checkout, allow_contact, allow_messaging, company_name, salary_min, salary_max, salary_period, salary_negotiable, vacancies_count, application_deadline, external_apply_url,
  listing_images(*),
  categories(id, name, slug, parent_id),
  profiles!listings_seller_id_fkey(id, display_name, district, rating_avg, rating_count, account_type),
  listing_attribute_values(*, category_attributes(*)),
  listing_delivery_options(courier:delivery_couriers(*))
`;

// Contact info select — only for authenticated users viewing a specific listing
const LISTING_CONTACT_SELECT = `
  phone,
  email
`;

export type ListingFilters = {
  categorySlug?: string;
  search?: string;
  district?: string;
  condition?: "new" | "used";
  minPrice?: number;
  maxPrice?: number;
  minSalary?: number;
  maxSalary?: number;
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

export async function isDescendantOfSlug(
  supabase: SupabaseClient,
  categoryId: string,
  ancestorSlug: string
): Promise<boolean> {
  const categoryMap = new Map<string, { id: string; slug: string; parent_id: string | null }>();
  const { data: allCategories } = await supabase.from("categories").select("id, slug, parent_id");

  if (allCategories) {
    allCategories.forEach(
      (c: { id: string; slug: string; parent_id: string | null }) =>
        categoryMap.set(c.id, c)
    );
  }

  let current = categoryMap.get(categoryId);
  while (current) {
    if (current.slug === ancestorSlug) return true;
    if (!current.parent_id) break;
    current = categoryMap.get(current.parent_id) || undefined;
  }

  return false;
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

  if (filters.minSalary !== undefined) {
    query = query.or(`salary_max.gte.${filters.minSalary},salary_min.gte.${filters.minSalary}`);
  }

  if (filters.maxSalary !== undefined) {
    query = query.or(`salary_min.lte.${filters.maxSalary},salary_max.lte.${filters.maxSalary}`);
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

  // Fetch favorite counts for all listings
  const listingIds = listings.map((l) => l.id);
  const favoriteCounts = await getFavoriteCounts(supabase, listingIds);

  // Attach favorite counts to listings
  listings.forEach((listing) => {
    (listing as any).favorite_count = favoriteCounts[listing.id] ?? 0;
  });

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

// Fetch seller contact info (phone/email) — only for authenticated users
export async function getSellerContact(supabase: SupabaseClient, sellerId: string) {
  const { data } = await supabase.from("profiles").select(LISTING_CONTACT_SELECT).eq("id", sellerId).single();
  return data as { phone: string; email: string } | null;
}

export async function getListingById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from("listings").select(LISTING_SELECT).eq("id", id).single();
  if (error) return null;

  // Lazy expiry check: if listing is active and past expiry, mark as expired
  // This ensures correctness even if pg_cron is delayed
  if (
    data.status === "active" &&
    data.expires_at &&
    new Date(data.expires_at) < new Date()
  ) {
    await supabase
      .from("listings")
      .update({ status: "expired", status_reason: "auto: lazily detected on read" })
      .eq("id", id);
    // Update the local object to reflect the change
    data.status = "expired";
  }

  const listing = data as unknown as ListingWithRelations;
  const [favCounts, shareCounts] = await Promise.all([
    getFavoriteCounts(supabase, [id]),
    getShareCounts(supabase, [id]),
  ]);
  (listing as any).favorite_count = favCounts[id] ?? 0;
  (listing as any).share_count = shareCounts[id] ?? 0;

  return listing;
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

export async function getFavoriteCounts(
  supabase: SupabaseClient,
  listingIds: string[]
): Promise<Record<string, number>> {
  if (listingIds.length === 0) return {};

  const { data } = await supabase
    .from("listing_favorite_counts")
    .select("listing_id, favorite_count")
    .in("listing_id", listingIds);

  const counts: Record<string, number> = {};
  (data ?? []).forEach((row) => {
    counts[row.listing_id] = row.favorite_count;
  });

  return counts;
}

export async function getShareCounts(
  supabase: SupabaseClient,
  listingIds: string[]
): Promise<Record<string, number>> {
  if (listingIds.length === 0) return {};

  const { data } = await supabase
    .from("listing_share_counts")
    .select("listing_id, share_count")
    .in("listing_id", listingIds);

  const counts: Record<string, number> = {};
  (data ?? []).forEach((row) => {
    counts[row.listing_id] = row.share_count;
  });

  return counts;
}

export async function getFeaturedListings(
  supabase: SupabaseClient,
  limit: number = 12
): Promise<ListingWithRelations[]> {
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("status", "active")
    .not("featured_until", "is", null)
    .gt("featured_until", new Date().toISOString())
    .order("featured_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getFeaturedListings error:", error.message);
    return [];
  }

  const listings = (data ?? []) as unknown as ListingWithRelations[];
  const listingIds = listings.map((l) => l.id);
  const favoriteCounts = await getFavoriteCounts(supabase, listingIds);

  listings.forEach((listing) => {
    (listing as any).favorite_count = favoriteCounts[listing.id] ?? 0;
  });

  return listings;
}

export async function getPopularListings(
  supabase: SupabaseClient,
  limit: number = 12
): Promise<ListingWithRelations[]> {
  const { data, error } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .eq("status", "active")
    .gt("view_count", 0)
    .order("view_count", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getPopularListings error:", error.message);
    return [];
  }

  const listings = (data ?? []) as unknown as ListingWithRelations[];
  const listingIds = listings.map((l) => l.id);
  const favoriteCounts = await getFavoriteCounts(supabase, listingIds);

  listings.forEach((listing) => {
    (listing as any).favorite_count = favoriteCounts[listing.id] ?? 0;
  });

  return listings;
}

export async function getTopSellingListings(
  supabase: SupabaseClient,
  limit: number = 12
): Promise<ListingWithRelations[]> {
  // Get top selling listings by counting order items per listing
  const { data: soldListings, error } = await supabase
    .from("order_items")
    .select("listing_id")
    .not("listing_id", "is", null);

  if (error) {
    console.error("getTopSellingListings error:", error.message);
    return [];
  }

  // Count sales per listing
  const salesMap = new Map<string, number>();
  (soldListings ?? []).forEach((item: any) => {
    const count = salesMap.get(item.listing_id) ?? 0;
    salesMap.set(item.listing_id, count + 1);
  });

  // Sort by sales count and get top listing IDs
  const topListingIds = Array.from(salesMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (topListingIds.length === 0) return [];

  const { data, error: listingError } = await supabase
    .from("listings")
    .select(LISTING_SELECT)
    .in("id", topListingIds)
    .eq("status", "active");

  if (listingError) {
    console.error("getTopSellingListings - fetch listings error:", listingError.message);
    return [];
  }

  const listings = (data ?? []) as unknown as ListingWithRelations[];
  const favoriteCounts = await getFavoriteCounts(supabase, topListingIds);

  listings.forEach((listing) => {
    (listing as any).favorite_count = favoriteCounts[listing.id] ?? 0;
  });

  // Return in sales order
  return listings.sort((a, b) => (salesMap.get(b.id) ?? 0) - (salesMap.get(a.id) ?? 0));
}

export async function getTopRatedSellers(
  supabase: SupabaseClient,
  limit: number = 6
): Promise<any[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, district, rating_avg, rating_count, account_type")
    .gt("rating_count", 0)
    .order("rating_avg", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getTopRatedSellers error:", error.message);
    return [];
  }

  return data ?? [];
}
