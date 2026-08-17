'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Share2,
  Copy,
  Check,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  QrCode,
  Sparkles,
  X,
  ExternalLink,
} from 'lucide-react';

interface SocialShareProps {
  title: string;
  description?: string | null;
  category?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  imageUrl?: string | null;
  variant?: 'inline' | 'button' | 'compact';
}

export function SocialShare({
  title,
  description,
  category,
  rating,
  reviewCount,
  imageUrl,
  variant = 'inline',
}: SocialShareProps) {
  const [currentUrl, setCurrentUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  // Formatted share text for social platforms
  const ratingText = rating ? `⭐ ${rating.toFixed(1)}/5.0 (${reviewCount || 0} reviews)` : '';
  const shareText = `Check out "${title}" ${ratingText} on RateIt — The community review platform!`;
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(shareText);

  // Social share destination URLs
  const shareLinks = [
    {
      name: 'X (Twitter)',
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      color: 'hover:bg-slate-800 hover:text-white',
      bgGlow: 'hover:shadow-sky-500/20',
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-4 h-4 text-[#1877F2]" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-[#1877F2]/15 hover:text-[#1877F2]',
      bgGlow: 'hover:shadow-blue-500/20',
    },
    {
      name: 'Instagram',
      icon: (
        <svg className="w-4 h-4 fill-current text-accent-pink" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      isInstagram: true,
      color: 'hover:bg-gradient-to-tr hover:from-amber-500/15 hover:via-rose-500/15 hover:to-purple-500/15 hover:text-pink-400',
      bgGlow: 'hover:shadow-pink-500/20',
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-4 h-4 text-accent-green" />,
      url: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
      color: 'hover:bg-accent-green/15 hover:text-accent-green',
      bgGlow: 'hover:shadow-emerald-500/20',
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-4 h-4 text-[#0A66C2]" />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:bg-[#0A66C2]/15 hover:text-[#0A66C2]',
      bgGlow: 'hover:shadow-blue-600/20',
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast.success('Optimized link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: currentUrl,
        });
        toast.success('Shared successfully!');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setShowModal(true);
        }
      }
    } else {
      setShowModal(true);
    }
  };

  const handleInstagramClick = () => {
    handleCopyLink();
    toast(
      (t) => (
        <div className="flex flex-col gap-1.5 py-1">
          <p className="font-semibold text-xs text-text-primary">
            Link copied for Instagram! 📸
          </p>
          <p className="text-xs text-text-secondary">
            Paste in your Instagram Story, Bio, or DM to share with friends.
          </p>
          <div className="pt-2 flex gap-2">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              onClick={() => toast.dismiss(t.id)}
              className="text-xs font-semibold px-2.5 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg inline-flex items-center gap-1"
            >
              Open Instagram <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      ),
      { duration: 5000 },
    );
  };

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={handleNativeShare}
          className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-2 group"
          title="Share this listing"
        >
          <Share2 className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
          <span>Share</span>
        </button>

        {showModal && (
          <ShareModal
            title={title}
            description={description}
            imageUrl={imageUrl}
            currentUrl={currentUrl}
            copied={copied}
            shareLinks={shareLinks}
            onCopy={handleCopyLink}
            onClose={() => setShowModal(false)}
            onInstagramClick={handleInstagramClick}
          />
        )}
      </>
    );
  }

  return (
    <div className="bg-surface/60 border border-surface-border rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <span>Share & Recommend</span>
              <Sparkles className="w-3.5 h-3.5 text-accent-yellow" />
            </h4>
            <p className="text-xs text-text-muted">
              Share this product with your friends across social media
            </p>
          </div>
        </div>

        {/* Action icons & Copy link */}
        <div className="flex flex-wrap items-center gap-2">
          {shareLinks.map((item) => {
            if (item.isInstagram) {
              return (
                <button
                  key={item.name}
                  onClick={handleInstagramClick}
                  className={`w-9 h-9 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-text-secondary transition-all duration-200 shadow-sm ${item.color} ${item.bgGlow}`}
                  title="Share on Instagram"
                >
                  {item.icon}
                </button>
              );
            }

            return (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-9 h-9 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-text-secondary transition-all duration-200 shadow-sm ${item.color} ${item.bgGlow}`}
                title={`Share on ${item.name}`}
              >
                {item.icon}
              </a>
            );
          })}

          {/* Copy Direct Link Button */}
          <button
            onClick={handleCopyLink}
            className={`h-9 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 shadow-sm ${
              copied
                ? 'bg-accent-green/15 text-accent-green border-accent-green/30'
                : 'bg-surface hover:bg-surface-light text-text-primary border-surface-border hover:border-primary/40'
            }`}
            title="Copy direct link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-primary" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ShareModalProps {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  currentUrl: string;
  copied: boolean;
  shareLinks: any[];
  onCopy: () => void;
  onClose: () => void;
  onInstagramClick: () => void;
}

function ShareModal({
  title,
  description,
  imageUrl,
  currentUrl,
  copied,
  shareLinks,
  onCopy,
  onClose,
  onInstagramClick,
}: ShareModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-background-card border border-surface-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-light transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Share this listing</h3>
            <p className="text-xs text-text-muted">Optimized for rich previews across platforms</p>
          </div>
        </div>

        {/* Item Preview Card */}
        <div className="flex gap-3 p-3 bg-surface border border-surface-border rounded-xl">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={title}
              className="w-14 h-14 object-cover rounded-lg border border-surface-border shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-text-primary truncate">{title}</h4>
            <p className="text-xs text-text-muted line-clamp-2 mt-0.5">
              {description || 'Community rating and authentic reviews on RateIt.'}
            </p>
          </div>
        </div>

        {/* Social Grid */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Share to Social Media
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {shareLinks.map((item) => {
              if (item.isInstagram) {
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      onInstagramClick();
                      onClose();
                    }}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 bg-surface hover:bg-surface-light border border-surface-border hover:border-accent-pink/40 rounded-xl text-xs font-medium text-text-primary transition-all text-left"
                  >
                    {item.icon}
                    <span>Instagram</span>
                  </button>
                );
              }

              return (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 bg-surface hover:bg-surface-light border border-surface-border hover:border-primary/40 rounded-xl text-xs font-medium text-text-primary transition-all"
                >
                  {item.icon}
                  <span>{item.name}</span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Direct Link Input with Copy */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Direct Link
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-surface border border-surface-border rounded-xl px-3 py-2 text-xs text-text-secondary truncate focus:outline-none"
            />
            <button
              onClick={onCopy}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                copied
                  ? 'bg-accent-green text-black'
                  : 'btn-primary'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
