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
import { Breadcrumbs, BreadcrumbItem } from '@/components/breadcrumbs';
import { UserAvatar } from '@/components/user-avatar';
import ReviewImagesUploader from '@/components/review-images-uploader';
import toast from 'react-hot-toast';
import {
  MapPin,
  Globe,
  Tag,
  Calendar,
  User,
  Edit3,
  Trash2,
  Star,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  X,
} from 'lucide-react';

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
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [criterionScores, setCriterionScores] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  // Voting loading map
  const [votingReviewId, setVotingReviewId] = useState<string | null>(null);

  // Image lightbox preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Delete dialog
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);

  const isAdmin = appUser?.role === 'ADMIN';

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
    if (!listing || !supabaseUser || isAdmin) return;
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

    if (isAdmin) {
      toast.error('Administrators cannot submit reviews or ratings.');
      return;
    }

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
        images: reviewImages.length > 0 ? reviewImages : undefined,
        ratings,
      }),
    });

    if (res.success) {
      toast.success('Review submitted!');
      setShowReviewForm(false);
      setReviewTitle('');
      setReviewContent('');
      setReviewImages([]);
      setCriterionScores({});
      fetchListing();
      fetchReviews();
      setHasReviewed(true);
    } else {
      toast.error(res.error || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  const handleVote = async (reviewId: string, voteType: 'HELPFUL' | 'UNHELPFUL') => {
    if (!supabaseUser) {
      toast.error('Please sign in to vote on reviews');
      return;
    }

    if (isAdmin) {
      toast.error('Administrators cannot vote on reviews.');
      return;
    }

    setVotingReviewId(reviewId);
    const res = await api<any>(`/reviews/${reviewId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    });

    const resData = res.data || (res as any);

    if (res.success && (res.data || (res as any).userVote !== undefined)) {
      const voteData = resData;
      // Optimistically update review in state
      setReviews((prev: any) => {
        if (!prev || !prev.items) return prev;
        return {
          ...prev,
          items: prev.items.map((r: any) => {
            if (r.id === reviewId) {
              return {
                ...r,
                userVote: voteData.userVote,
                helpfulCount: voteData.helpfulCount,
                unhelpfulCount: voteData.unhelpfulCount,
              };
            }
            return r;
          }),
        };
      });
    } else {
      toast.error(res.error || 'Failed to vote');
    }
    setVotingReviewId(null);
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
  const canReview = supabaseUser && !isAdmin && appUser?.status === 'ACTIVE' && !hasReviewed;

  // Construct Breadcrumbs Trail:
  // e.g. Home > Categories > Education > Colleges > Stanford University
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Categories', href: '/categories' },
  ];

  if (listing.category?.parent) {
    breadcrumbItems.push({
      label: listing.category.parent.name,
      href: `/categories/${listing.category.parent.slug}`,
    });
  }

  if (listing.category) {
    breadcrumbItems.push({
      label: listing.category.name,
      href: `/categories/${listing.category.slug}`,
    });
  }

  breadcrumbItems.push({
    label: listing.name,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Tracking Breadcrumb */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-12">
        <div className="md:w-1/3">
          <div className="aspect-square bg-surface rounded-2xl flex items-center justify-center overflow-hidden border border-surface-border">
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
              {listing.createdBy?.displayName || listing.createdBy?.username || 'Admin'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(listing.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Rating Breakdown */}
      {criteria.length > 0 && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Rating Breakdown</h2>
            <span className="text-xs text-text-muted">
              Based on {listing.reviewCount || 0} {listing.reviewCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Criteria Breakdown */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                Criteria Scores (1-5)
              </h3>
              {listing.criterionAverages && listing.criterionAverages.length > 0
                ? listing.criterionAverages.map((ca: any) => (
                    <RatingBar key={ca.criterionId} label={ca.criterionName} value={ca.average} />
                  ))
                : criteria.map((c: any) => (
                    <RatingBar key={c.id} label={c.name} value={0} />
                  ))}
            </div>

            {/* Star Distribution */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
                Rating Distribution
              </h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = listing.ratingDistribution?.[star] || 0;
                  const total = listing.reviewCount || 0;
                  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

                  return (
                    <div key={star} className="flex items-center gap-2.5">
                      <span className="text-xs font-medium text-text-secondary w-3">{star}</span>
                      <Star className="w-3.5 h-3.5 fill-star text-star shrink-0" />
                      <div className="flex-1 h-2.5 bg-surface rounded-full overflow-hidden border border-surface-border/50">
                        <div
                          className="h-full bg-gradient-to-r from-accent-yellow to-star rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-muted w-14 text-right font-mono">
                        {count} <span className="text-[10px] text-text-muted">({percentage}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Notice Banner */}
      {isAdmin && (
        <div className="mb-8 p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Administrator View</h3>
            <p className="text-xs text-text-secondary mt-0.5">
              You are logged in as an Administrator. Admins can create and manage listings, but are restricted from rating, writing reviews, or voting.
            </p>
          </div>
        </div>
      )}

      {/* Review Form for Regular Users */}
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
                  <h3 className="label mb-3">Rate each criterion (1-5 stars) *</h3>
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
                    placeholder="Share your detailed experience with this product..."
                    required
                    minLength={10}
                    maxLength={5000}
                  />
                </div>

                {/* Upload Product Images */}
                <ReviewImagesUploader
                  images={reviewImages}
                  onChange={setReviewImages}
                  maxImages={5}
                />

                <div className="flex gap-3 pt-2">
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

      {hasReviewed && !isAdmin && (
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
              <div key={review.id} className="card space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={review.user} size="md" />
                    <div>
                      <div className="flex items-center gap-2.5 mb-0.5">
                        <span className="font-bold text-sm text-text-primary">
                          {review.user?.displayName || review.user?.username || 'Anonymous'}
                        </span>
                        <StarRating rating={Number(review.overallRating)} size="sm" />
                        <span className="text-xs font-bold text-text-primary">
                          {Number(review.overallRating).toFixed(1)}
                        </span>
                      </div>
                      <span className="text-xs text-text-muted">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {appUser?.id === review.userId && !isAdmin && (
                    <button
                      onClick={() => setDeleteReviewId(review.id)}
                      className="p-1.5 rounded-lg hover:bg-surface-light text-text-muted hover:text-accent-red transition-colors shrink-0"
                      title="Delete review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {review.title && (
                  <h3 className="font-semibold text-text-primary">{review.title}</h3>
                )}

                <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                  {review.content}
                </p>

                {/* Review Product Photos */}
                {review.images && review.images.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {review.images.map((imgUrl: string, idx: number) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPreviewImage(imgUrl)}
                        className="relative rounded-xl overflow-hidden aspect-square w-20 h-20 border border-surface-border hover:border-primary/50 transition-all hover:scale-105"
                      >
                        <img
                          src={imgUrl}
                          alt={`Review photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Criterion scores */}
                {review.ratings && review.ratings.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-3 border-t border-surface-border">
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

                {/* Voting Actions Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-surface-border/60 text-xs">
                  <span className="text-text-muted">Was this review helpful?</span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isAdmin || votingReviewId === review.id}
                      onClick={() => handleVote(review.id, 'HELPFUL')}
                      title={isAdmin ? 'Admins cannot vote' : 'Mark as helpful'}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                        review.userVote === 'HELPFUL'
                          ? 'bg-accent-green/15 border-accent-green/30 text-accent-green font-semibold'
                          : 'border-surface-border text-text-muted hover:text-text-primary hover:bg-surface-light'
                      } ${isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Helpful ({review.helpfulCount || 0})</span>
                    </button>

                    <button
                      type="button"
                      disabled={isAdmin || votingReviewId === review.id}
                      onClick={() => handleVote(review.id, 'UNHELPFUL')}
                      title={isAdmin ? 'Admins cannot vote' : 'Mark as unhelpful'}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                        review.userVote === 'UNHELPFUL'
                          ? 'bg-accent-red/15 border-accent-red/30 text-accent-red font-semibold'
                          : 'border-surface-border text-text-muted hover:text-text-primary hover:bg-surface-light'
                      } ${isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>({review.unhelpfulCount || 0})</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal for Review Images */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] bg-surface rounded-2xl overflow-hidden border border-surface-border p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 hover:bg-black text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Review attachment enlarged"
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

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
