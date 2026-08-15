'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteReviewAction } from '@/lib/actions/reviews';
import type { Review } from '@/lib/queries/reviews';

interface ReviewListProps {
  reviews: Review[];
  currentUserId?: string;
  averageRating?: number;
  totalReviews?: number;
}

export function ReviewList({ reviews, currentUserId, averageRating, totalReviews }: ReviewListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setDeletingId(reviewId);
    setError('');

    try {
      const result = await deleteReviewAction(reviewId);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Reviews</h2>
          {averageRating !== undefined && totalReviews !== undefined && totalReviews > 0 && (
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900">{averageRating}</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${
                        star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-slate-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-500">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>
        {totalReviews === 0 && (
          <p className="mt-2 text-sm text-slate-500">No reviews yet. Be the first to review!</p>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">Be the first to leave a review</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const isOwnReview = currentUserId === review.reviewer_id;
            const reviewerName = review.profiles?.display_name || 'Anonymous';

            return (
              <div key={review.id} className="border-b border-slate-100 pb-4 last:border-0">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{reviewerName}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-sm ${
                              star <= review.rating ? 'text-yellow-400' : 'text-slate-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  {isOwnReview && (
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={deletingId === review.id}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      {deletingId === review.id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-700">{review.comment}</p>
                {review.updated_at !== review.created_at && (
                  <p className="mt-1 text-xs text-slate-500">
                    (edited {new Date(review.updated_at).toLocaleDateString()})
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
