import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryAttribute, ListingWithRelations } from "@/lib/supabase/types";

const LISTING_SELECT = `
  *,
  listing_images(*),
  categories(id, name, slug, parent_id),
  profiles(id, display_name, district, rating_avg, rating_count),
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
  limit?: number;
};

async function resolveCategoryIds(supabase: SupabaseClient, slug: string): Promise<string[] | null> {
  const { data: category } = await supabase
    .from("categories")
    .select("id, parent_id")
    .eq("slug", slug)
    .single();

  if (!category) return null;

  // Top-level category: include the category itself plus all of its
  // subcategories, so browsing "/c/vehicles" shows Cars, Motorcycles, etc.
  if (!category.parent_id) {
    const { data: children } = await supabase
      .from("categories")
      .select("id")
      .eq("parent_id", category.id);
    return [category.id, ...(children ?? []).map((c) => c.id)];
  }

  // Subcategory: exact match only.
  return [category.id];
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

  if (filters.search) {
    const term = filters.search.replace(/[%,]/g, " ").trim();
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
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

  return (data ?? []) as unknown as ListingWithRelations[];
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
