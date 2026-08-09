import { z } from 'zod';
import { MIN_RATING_SCORE, MAX_RATING_SCORE } from './constants.js';

// ──────────────────────────────────────────────────────────
// Auth Schemas
// ──────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores')
    .optional(),
  displayName: z.string().min(1).max(100).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// ──────────────────────────────────────────────────────────
// User Schemas
// ──────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores')
    .optional(),
  displayName: z.string().min(1).max(100).optional(),
});

// ──────────────────────────────────────────────────────────
// Listing Schemas
// ──────────────────────────────────────────────────────────

export const createListingSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(5000).optional(),
  brand: z.string().max(100).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().max(300).optional(),
});

export const updateListingSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  brand: z.string().max(100).optional(),
  categoryId: z.string().uuid().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().max(300).optional(),
});

export const checkDuplicateSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(200),
});

// ──────────────────────────────────────────────────────────
// Review Schemas
// ──────────────────────────────────────────────────────────

export const criterionScoreSchema = z.object({
  criterionId: z.string().uuid(),
  score: z.number().int().min(MIN_RATING_SCORE).max(MAX_RATING_SCORE),
});

export const createReviewSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(10, 'Review must be at least 10 characters').max(5000),
  ratings: z.array(criterionScoreSchema).min(1, 'At least one criterion rating is required'),
});

export const updateReviewSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(10).max(5000).optional(),
  ratings: z.array(criterionScoreSchema).min(1).optional(),
});

// ──────────────────────────────────────────────────────────
// Admin Schemas
// ──────────────────────────────────────────────────────────

export const moderateListingSchema = z.object({
  status: z.enum(['ACTIVE', 'HIDDEN', 'REMOVED']),
  moderationReason: z.string().min(1, 'Moderation reason is required').max(500),
});

export const moderateReviewSchema = z.object({
  status: z.enum(['VISIBLE', 'HIDDEN', 'REMOVED']),
  moderationReason: z.string().min(1, 'Moderation reason is required').max(500),
});

export const adminUpdateUserSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
  moderationReason: z.string().min(1, 'Reason is required').max(500),
});

export const adminUpdateListingSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  brand: z.string().max(100).optional(),
  categoryId: z.string().uuid().optional(),
  description: z.string().max(5000).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().max(300).optional(),
});

// ──────────────────────────────────────────────────────────
// Pagination Schema
// ──────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

// ──────────────────────────────────────────────────────────
// Type exports from schemas
// ──────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type CheckDuplicateInput = z.infer<typeof checkDuplicateSchema>;
export type CriterionScoreInput = z.infer<typeof criterionScoreSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ModerateListingInput = z.infer<typeof moderateListingSchema>;
export type ModerateReviewInput = z.infer<typeof moderateReviewSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type AdminUpdateListingInput = z.infer<typeof adminUpdateListingSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
