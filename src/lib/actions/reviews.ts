'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const reviewSchema = z.object({
  listingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1).max(1000),
});

export async function createReviewAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Must be logged in to leave a review' };
  }

  try {
    const listingId = formData.get('listingId') as string;
    const rating = parseInt(formData.get('rating') as string);
    const comment = formData.get('comment') as string;

    const validated = reviewSchema.parse({ listingId, rating, comment });

    const { error } = await supabase.from('listing_reviews').insert({
      listing_id: validated.listingId,
      reviewer_id: user.id,
      rating: validated.rating,
      comment: validated.comment,
    });

    if (error) {
      if (error.code === '23505') {
        return { error: 'You already have a review for this listing' };
      }
      return { error: error.message };
    }

    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { error: (err as any).errors[0]?.message || 'Invalid input' };
    }
    return { error: 'Failed to create review' };
  }
}

export async function updateReviewAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Must be logged in to update a review' };
  }

  try {
    const reviewId = formData.get('reviewId') as string;
    const rating = parseInt(formData.get('rating') as string);
    const comment = formData.get('comment') as string;

    const validated = reviewSchema.parse({
      listingId: 'dummy',
      rating,
      comment,
    });

    // First check if review belongs to current user
    const { data: review, error: checkError } = await supabase
      .from('listing_reviews')
      .select('reviewer_id')
      .eq('id', reviewId)
      .single();

    if (checkError || review?.reviewer_id !== user.id) {
      return { error: 'Unauthorized' };
    }

    const { error } = await supabase
      .from('listing_reviews')
      .update({
        rating: validated.rating,
        comment: validated.comment,
      })
      .eq('id', reviewId)
      .eq('reviewer_id', user.id);

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { error: (err as any).errors[0]?.message || 'Invalid input' };
    }
    return { error: 'Failed to update review' };
  }
}

export async function deleteReviewAction(reviewId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Must be logged in to delete a review' };
  }

  const { error } = await supabase
    .from('listing_reviews')
    .delete()
    .eq('id', reviewId)
    .eq('reviewer_id', user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
