'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { StarRating } from '@/components/star-rating';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { EditReviewModal } from '@/components/edit-review-modal';
import toast from 'react-hot-toast';
import { Trash2, Edit3, ExternalLink } from 'lucide-react';

export default function MyReviewsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<any>(null);

  const fetchReviews = async () => {
    const res = await api<any>('/reviews/my');
    if (res.success && res.data) setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await api(`/reviews/${deleteId}`, { method: 'DELETE' });
    if (res.success) {
      toast.success('Review deleted');
      fetchReviews();
    } else {
      toast.error(res.error || 'Failed to delete');
    }
    setDeleteId(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-8">My Reviews</h1>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="skeleton h-24" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon="star"
          title="No reviews yet"
          description="Start reviewing listings to help the community!"
          action={
            <Link href="/categories" className="btn-primary">
              Browse Categories
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {data.items.map((review: any) => (
            <div key={review.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Link
                    href={`/listings/${review.listing?.slug}`}
                    className="text-primary hover:text-primary-light font-semibold flex items-center gap-2"
                  >
                    {review.listing?.name} <ExternalLink className="w-3 h-3" />
                  </Link>
                  <span className="text-xs text-text-muted">{review.listing?.category?.name}</span>
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating rating={Number(review.overallRating)} size="sm" />
                    <span className="text-sm font-medium text-text-primary">
                      {Number(review.overallRating).toFixed(1)}
                    </span>
                  </div>
                  {review.title && (
                    <h3 className="font-medium text-text-primary mt-2">{review.title}</h3>
                  )}
                  <p className="text-sm text-text-secondary mt-1 line-clamp-2">{review.content}</p>
                  <span className="text-xs text-text-muted mt-2 block">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setEditingReview(review)}
                    className="p-2 rounded-lg hover:bg-surface-light text-text-muted hover:text-primary transition-colors"
                    title="Edit Review & Ratings"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(review.id)}
                    className="p-2 rounded-lg hover:bg-surface-light text-text-muted hover:text-accent-red transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Review"
        message="This will permanently delete your review."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <EditReviewModal
        review={editingReview}
        open={!!editingReview}
        onClose={() => setEditingReview(null)}
        onUpdated={fetchReviews}
      />
    </div>
  );
}
