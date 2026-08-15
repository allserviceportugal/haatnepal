'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createReviewAction, updateReviewAction } from '@/lib/actions/reviews';
import type { Review } from '@/lib/queries/reviews';

interface ReviewFormProps {
  listingId: string;
  existingReview?: Review;
  onSuccess?: () => void;
}

export function ReviewForm({ listingId, existingReview, onSuccess }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      if (existingReview?.id) {
        formData.append('reviewId', existingReview.id);
        formData.append('rating', rating.toString());
        formData.append('comment', comment);
        const result = await updateReviewAction(formData);
        if (result.error) {
          setError(result.error);
          return;
        }
      } else {
        formData.append('listingId', listingId);
        formData.append('rating', rating.toString());
        formData.append('comment', comment);
        const result = await createReviewAction(formData);
        if (result.error) {
          setError(result.error);
          return;
        }
      }

      setRating(5);
      setComment('');
      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">
        {existingReview ? 'Edit your review' : 'Leave a review'}
      </h3>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Star Rating */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-3xl transition ${
                star <= rating ? 'text-yellow-400' : 'text-slate-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-500">{rating} out of 5 stars</p>
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <label htmlFor="comment" className="block text-sm font-semibold text-slate-700">
          Comment
        </label>
        <textarea
          id="comment"
          name="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this listing..."
          maxLength={1000}
          rows={4}
          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          required
        />
        <p className="text-xs text-slate-500">{comment.length}/1000 characters</p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || !comment.trim()}
        className="w-full rounded-full bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition disabled:opacity-50 hover:bg-orange-600"
      >
        {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Post Review'}
      </button>
    </form>
  );
}
