'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { StarRating } from '@/components/star-rating';
import { RatingBar } from '@/components/rating-bar';
import { EmptyState } from '@/components/empty-state';
import { ConfirmDialog } from '@/components/confirm-dialog';
import toast from 'react-hot-toast';
import { MapPin, Globe, Tag, Calendar, User, Edit3, Trash2, Star } from 'lucide-react';

export default function ListingDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { appUser, supabaseUser } = useAuth();

  const [listing, setListing] = useState<any>(null);
  const [reviews, setReviews] = useState<any>(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewPage, setReviewPage] = useState(1);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [criterionScores, setCriterionScores] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  // Delete dialog
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);

  const fetchListing = async () => {
    const res = await api<any>(`/listings/${slug}`);
    if (res.success && res.data) setListing(res.data);
  };

  const fetchReviews = async () => {
    if (!listing) return;
    const res = await api<any>(`/listings/${listing.id}/reviews`, {
      params: { page: String(reviewPage), limit: '10' },
    });
    if (res.success && res.data) setReviews(res.data);
  };

  const checkReviewed = async () => {
    if (!listing || !supabaseUser) return;
    const res = await api<any>(`/listings/${listing.id}/reviews/check`);
    if (res.success && res.data) setHasReviewed(res.data.hasReviewed);
  };

  useEffect(() => {
    fetchListing().then(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (listing) {
      fetchReviews();
      checkReviewed();
    }
  }, [listing, reviewPage, supabaseUser]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;

    const criteria = listing.category?.ratingCriteria || [];
    const ratings = criteria.map((c: any) => ({
      criterionId: c.id,
      score: criterionScores[c.id] || 0,
    }));

    // Validate all criteria rated
    const missing = ratings.filter((r: any) => r.score === 0);
    if (missing.length > 0) {
      toast.error('Please rate all criteria');
      return;
    }

    setSubmitting(true);
    const res = await api(`/listings/${listing.id}/reviews`, {
      method: 'POST',
      body: JSON.stringify({
        title: reviewTitle || undefined,
        content: reviewContent,
        ratings,
      }),
    });

    if (res.success) {
      toast.success('Review submitted!');
      setShowReviewForm(false);
      setReviewTitle('');
      setReviewContent('');
      setCriterionScores({});
      fetchListing();
      fetchReviews();
      setHasReviewed(true);
    } else {
      toast.error(res.error || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  const handleDeleteReview = async () => {
    if (!deleteReviewId) return;
    const res = await api(`/reviews/${deleteReviewId}`, { method: 'DELETE' });
    if (res.success) {
      toast.success('Review deleted');
      fetchListing();
      fetchReviews();
      setHasReviewed(false);
    } else {
      toast.error(res.error || 'Failed to delete');
    }
    setDeleteReviewId(null);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="skeleton h-8 w-2/3 mb-4" />
        <div className="skeleton h-4 w-1/3 mb-8" />
        <div className="skeleton h-64 w-full mb-8" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EmptyState
          icon="alert"
          title="Listing not found"
          description="This listing doesn't exist or has been removed."
        />
      </div>
    );
  }

  const criteria = listing.category?.ratingCriteria || [];
  const canReview = supabaseUser && appUser?.status === 'ACTIVE' && !hasReviewed;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="md:w-1/3">
          <div className="aspect-square bg-surface rounded-2xl flex items-center justify-center overflow-hidden">
            {listing.imageUrl ? (
              <img
                src={listing.imageUrl}
                alt={listing.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <Tag className="w-16 h-16 text-text-muted" />
            )}
          </div>
        </div>

        <div className="md:w-2/3">
          <Link
            href={`/categories/${listing.category?.slug}`}
            className="badge-purple mb-3 inline-block"
          >
            {listing.category?.name}
          </Link>
          <h1 className="text-3xl font-bold text-text-primary mb-3">{listing.name}</h1>

          {listing.brand && (
            <p className="text-text-secondary mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" /> {listing.brand}
            </p>
          )}
          {listing.location && (
            <p className="text-text-secondary mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {listing.location}
            </p>
          )}
          {listing.websiteUrl && (
            <a
              href={listing.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-light mb-2 flex items-center gap-2 text-sm"
            >
              <Globe className="w-4 h-4" /> Visit Website
            </a>
          )}

          {listing.description && (
            <p className="text-text-secondary mt-4 leading-relaxed">{listing.description}</p>
          )}

          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <StarRating rating={listing.averageRating || 0} size="lg" />
              <span className="text-2xl font-bold text-text-primary">
                {listing.averageRating ? listing.averageRating.toFixed(1) : 'N/A'}
              </span>
            </div>
            <span className="text-text-muted">
              {listing.reviewCount} {listing.reviewCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-4 text-xs text-text-muted">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {listing.createdBy?.displayName || listing.createdBy?.username || 'Anonymous'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(listing.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Rating Breakdown */}
      {listing.criterionAverages && listing.criterionAverages.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Rating Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {listing.criterionAverages.map((ca: any) => (
                <RatingBar key={ca.criterionId} label={ca.criterionName} value={ca.average} />
              ))}
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-3">Rating Distribution</h3>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = listing.ratingDistribution?.[star] || 0;
                const total = listing.reviewCount || 1;
                return (
                  <div key={star} className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-text-muted w-3">{star}</span>
                    <Star className="w-3 h-3 fill-star text-star" />
                    <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-star rounded-full"
                        style={{ width: `${(count / total) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-text-muted w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      {canReview && (
        <div className="mb-8">
          {!showReviewForm ? (
            <button onClick={() => setShowReviewForm(true)} className="btn-primary">
              <Edit3 className="w-4 h-4 mr-2" /> Write a Review
            </button>
          ) : (
            <div className="card">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Write Your Review</h2>
              <form onSubmit={handleSubmitReview} className="space-y-5">
                {/* Criterion Scores */}
                <div>
                  <h3 className="label mb-3">Rate each criterion (1-5 stars)</h3>
                  <div className="space-y-3">
                    {criteria.map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between">
                        <span className="text-sm text-text-secondary">{c.name}</span>
                        <StarRating
                          rating={criterionScores[c.id] || 0}
                          interactive
                          onChange={(score) =>
                            setCriterionScores({ ...criterionScores, [c.id]: score })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="reviewTitle" className="label">
                    Title (optional)
                  </label>
                  <input
                    id="reviewTitle"
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="input"
                    placeholder="Summarize your experience"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label htmlFor="reviewContent" className="label">
                    Your Review *
                  </label>
                  <textarea
                    id="reviewContent"
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    className="input min-h-[120px] resize-y"
                    placeholder="Share your detailed experience..."
                    required
                    minLength={10}
                    maxLength={5000}
                  />
                </div>

                <div className="flex gap-3">
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {hasReviewed && (
        <p className="text-sm text-text-muted mb-6 flex items-center gap-2">
          <Star className="w-4 h-4 fill-star text-star" /> You have already reviewed this listing.
        </p>
      )}

      {/* Reviews List */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-6">
          Reviews ({listing.reviewCount})
        </h2>

        {!reviews || reviews.items.length === 0 ? (
          <EmptyState
            icon="star"
            title="No reviews yet"
            description="Be the first to review this listing!"
          />
        ) : (
          <div className="space-y-4">
            {reviews.items.map((review: any) => (
              <div key={review.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-text-primary">
                        {review.user?.displayName || review.user?.email || 'Anonymous'}
                      </span>
                      <StarRating rating={Number(review.overallRating)} size="sm" />
                      <span className="text-sm font-medium text-text-primary">
                        {Number(review.overallRating).toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-text-muted">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {appUser?.id === review.userId && (
                    <button
                      onClick={() => setDeleteReviewId(review.id)}
                      className="p-1.5 rounded-lg hover:bg-surface-light text-text-muted hover:text-accent-red transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {review.title && (
                  <h3 className="font-semibold text-text-primary mb-2">{review.title}</h3>
                )}
                <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                  {review.content}
                </p>

                {/* Criterion scores */}
                {review.ratings && review.ratings.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-surface-border">
                    {review.ratings
                      .sort(
                        (a: any, b: any) =>
                          (a.criterion?.displayOrder || 0) - (b.criterion?.displayOrder || 0),
                      )
                      .map((r: any) => (
                        <div key={r.id} className="flex items-center gap-1.5 text-xs">
                          <span className="text-text-muted">{r.criterion?.name}:</span>
                          <span className="font-medium text-text-primary">{r.score}/5</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteReviewId}
        title="Delete Review"
        message="Are you sure you want to delete your review? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDeleteReview}
        onCancel={() => setDeleteReviewId(null)}
      />
    </div>
  );
}
