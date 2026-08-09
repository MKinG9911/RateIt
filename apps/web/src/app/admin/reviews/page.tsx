'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminReviewsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const fetchReviews = async () => {
    const res = await api<any>('/admin/reviews', {
      params: { page: String(page), limit: '20', status: status || undefined },
    });
    if (res.success && res.data) setData(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [page, status]);

  const handleModerate = async (reviewId: string, newStatus: string) => {
    const reason = prompt('Enter moderation reason:');
    if (!reason) return;
    const res = await api(`/admin/reviews/${reviewId}/moderate`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus, moderationReason: reason }),
    });
    if (res.success) {
      toast.success('Review moderated');
      fetchReviews();
    } else toast.error(res.error || 'Failed');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-8">Review Moderation</h1>

      <div className="mb-6">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="input w-40"
        >
          <option value="">All Status</option>
          <option value="VISIBLE">Visible</option>
          <option value="HIDDEN">Hidden</option>
          <option value="REMOVED">Removed</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="skeleton h-14" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {data?.items?.map((review: any) => (
            <div key={review.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-text-primary">{review.listing?.name}</p>
                  <p className="text-xs text-text-muted">
                    by {review.user?.email} · Rating: {Number(review.overallRating).toFixed(1)} ·{' '}
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={
                    review.status === 'VISIBLE'
                      ? 'badge-green text-xs'
                      : review.status === 'HIDDEN'
                        ? 'badge-yellow text-xs'
                        : 'badge-red text-xs'
                  }
                >
                  {review.status}
                </span>
              </div>
              {review.title && (
                <h4 className="font-medium text-text-primary text-sm mb-1">{review.title}</h4>
              )}
              <p className="text-sm text-text-secondary line-clamp-3 mb-3">{review.content}</p>
              {review.moderationReason && (
                <p className="text-xs text-accent-yellow mb-3">
                  Moderation reason: {review.moderationReason}
                </p>
              )}
              <div className="flex gap-2">
                {review.status !== 'VISIBLE' && (
                  <button
                    onClick={() => handleModerate(review.id, 'VISIBLE')}
                    className="text-xs btn-ghost text-accent-green"
                  >
                    Restore
                  </button>
                )}
                {review.status !== 'HIDDEN' && (
                  <button
                    onClick={() => handleModerate(review.id, 'HIDDEN')}
                    className="text-xs btn-ghost text-accent-yellow"
                  >
                    Hide
                  </button>
                )}
                {review.status !== 'REMOVED' && (
                  <button
                    onClick={() => handleModerate(review.id, 'REMOVED')}
                    className="text-xs btn-ghost text-accent-red"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
