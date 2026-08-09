// ──────────────────────────────────────────────────────────
// Shared Constants
// ──────────────────────────────────────────────────────────

export const USER_ROLES = ['USER', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['ACTIVE', 'SUSPENDED'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const LISTING_STATUSES = ['ACTIVE', 'HIDDEN', 'REMOVED'] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const REVIEW_STATUSES = ['VISIBLE', 'HIDDEN', 'REMOVED'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

export const CATEGORY_SLUGS = [
  'movies',
  'hotels',
  'restaurants',
  'shops',
  'smartphones',
  'tvs',
  'refrigerators',
  'headphones',
  'pc-parts',
] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export const MIN_RATING_SCORE = 1;
export const MAX_RATING_SCORE = 5;

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;
