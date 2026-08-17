'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { X, Edit3, Save, Loader2, Star } from 'lucide-react';
import ReviewImagesUploader from '@/components/review-images-uploader';

interface EditReviewModalProps {
  review: any;
  open: boolean;
  onClose: () => void;
  onUpdated: (updated: any) => void;
}

export function EditReviewModal({
  review,
  open,
  onClose,
  onUpdated,
}: EditReviewModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [criterionScores, setCriterionScores] = useState<Record<string, number>>({});
  const [criteria, setCriteria] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingCriteria, setLoadingCriteria] = useState(false);

  useEffect(() => {
    if (review) {
      setTitle(review.title || '');
      setContent(review.content || '');
      setImages(review.images || []);

      // Pre-fill existing criterion ratings
      const initialScores: Record<string, number> = {};
      if (review.ratings && review.ratings.length > 0) {
        review.ratings.forEach((r: any) => {
          initialScores[r.criterionId || r.criterion?.id] = r.score;
        });
      }
      setCriterionScores(initialScores);

      // If review has category criteria populated, use them
      if (review.listing?.category?.ratingCriteria) {
        setCriteria(review.listing.category.ratingCriteria);
      } else if (review.listing?.id) {
        // Fetch listing by ID to get full active criteria
        setLoadingCriteria(true);
        api<any>(`/listings/by-id/${review.listing.id}`).then((res) => {
          if (res.success && res.data?.category?.ratingCriteria) {
            setCriteria(res.data.category.ratingCriteria);
          }
          setLoadingCriteria(false);
        }).catch(() => setLoadingCriteria(false));
      }
    }
  }, [review, open]);

  if (!open || !review) return null;

  const handleScoreChange = (criterionId: string, score: number) => {
    setCriterionScores((prev) => ({ ...prev, [criterionId]: score }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (content.trim().length < 10) {
      toast.error('Review content must be at least 10 characters.');
      return;
    }

    // Validate that all criteria have ratings
    if (criteria.length > 0) {
      const missingCriteria = criteria.filter((c) => !criterionScores[c.id]);
      if (missingCriteria.length > 0) {
        toast.error(`Please provide a rating for: ${missingCriteria.map((c) => c.name).join(', ')}`);
        return;
      }
    }

    setSaving(true);

    const ratingsPayload = Object.entries(criterionScores).map(([criterionId, score]) => ({
      criterionId,
      score,
    }));

    const body: any = {
      title: title.trim() || undefined,
      content: content.trim(),
      images,
      ...(ratingsPayload.length > 0 ? { ratings: ratingsPayload } : {}),
    };

    try {
      const res = await api(`/reviews/${review.id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });

      if (res.success && res.data) {
        toast.success('Your review and ratings have been updated!');
        onUpdated(res.data);
        onClose();
      } else {
        toast.error(res.error || 'Failed to update review');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-background-card border border-surface-border rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-surface-border bg-surface/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-text-primary truncate">Edit Review & Ratings</h2>
              <p className="text-xs text-text-muted truncate">
                {review.listing?.name || 'Update your experience'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">
          {/* Criteria Ratings Breakdown */}
          {criteria.length > 0 && (
            <div className="p-4 bg-surface rounded-xl border border-surface-border space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Rating Criteria (1 - 5 Stars) *
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {criteria.map((crit) => {
                  const currentScore = criterionScores[crit.id] || 0;
                  return (
                    <div key={crit.id} className="p-3 bg-background-card rounded-xl border border-surface-border/60 flex items-center justify-between">
                      <span className="text-xs font-semibold text-text-primary">{crit.name}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleScoreChange(crit.id, star)}
                            className="p-0.5 transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                star <= currentScore
                                  ? 'fill-star text-star'
                                  : 'text-surface-border'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="label">Review Headline (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input text-sm"
              placeholder="e.g. Outstanding sound quality after 6 months of use"
            />
          </div>

          {/* Content */}
          <div>
            <label className="label">Review Experience *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input text-sm min-h-[120px] resize-none"
              placeholder="Share detailed feedback about this product or place..."
              required
            />
            <span className="text-xs text-text-muted mt-1 block">
              Minimum 10 characters ({content.length} characters)
            </span>
          </div>

          {/* Images */}
          <div>
            <label className="label">Product Images (Optional, up to 5)</label>
            <ReviewImagesUploader
              images={images}
              onChange={setImages}
              maxImages={5}
            />
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-surface-border bg-surface/50">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-sm py-2 px-4 justify-center"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || loadingCriteria}
            className="btn-primary text-sm py-2 px-5 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Update Review</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
