import type { SupabaseClient } from '@supabase/supabase-js';

export interface Review {
  id: string;
  listing_id: string;
  reviewer_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export async function getListingReviews(
  supabase: SupabaseClient,
  listingId: string
): Promise<Review[]> {
  const { data, error } = await supabase
    .from('listing_reviews')
    .select(`
      id,
      listing_id,
      reviewer_id,
      rating,
      comment,
      created_at,
      updated_at,
      reviewer_id(id, display_name, avatar_url)
    `)
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }

  return (data as any)?.map((row: any) => ({
    ...row,
    profiles: row.reviewer_id,
  })) || [];
}

export async function getListingAverageRating(
  supabase: SupabaseClient,
  listingId: string
): Promise<{ average: number; count: number } | null> {
  const { data, error } = await supabase.rpc('get_listing_average_rating', {
    p_listing_id: listingId,
  });

  if (error) {
    console.error('Error fetching average rating:', error);
    return null;
  }

  return data?.[0] || null;
}

export async function getUserReviewForListing(
  supabase: SupabaseClient,
  listingId: string,
  userId: string
): Promise<Review | null> {
  const { data, error } = await supabase
    .from('listing_reviews')
    .select('*')
    .eq('listing_id', listingId)
    .eq('reviewer_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user review:', error);
    return null;
  }

  return data;
}
