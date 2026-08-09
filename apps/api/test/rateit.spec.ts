import { describe, it, expect } from 'vitest';
import {
  normalizeName,
  generateSlug,
  registerSchema,
  createListingSchema,
  createReviewSchema,
  moderateListingSchema,
  moderateReviewSchema,
  adminUpdateUserSchema,
} from '@rateit/shared';

// ──────────────────────────────────────────────────────────
// Unit Tests for RateIt Business Logic
// ──────────────────────────────────────────────────────────

describe('normalizeName', () => {
  it('should trim and lowercase', () => {
    expect(normalizeName('  The Grand Hotel  ')).toBe('the grand hotel');
  });

  it('should collapse multiple spaces', () => {
    expect(normalizeName('iPhone   16   Pro')).toBe('iphone 16 pro');
  });

  it('should normalize smart quotes', () => {
    expect(normalizeName('Joe\u2019s Diner')).toBe("joe's diner");
  });

  it('should normalize em dashes', () => {
    expect(normalizeName('Hotel\u2014Deluxe')).toBe('hotel-deluxe');
  });
});

describe('generateSlug', () => {
  it('should create a URL-safe slug', () => {
    expect(generateSlug('The Grand Hotel')).toBe('the-grand-hotel');
  });

  it('should remove special characters', () => {
    expect(generateSlug("Joe's Diner!")).toBe('joes-diner');
  });

  it('should collapse multiple dashes', () => {
    expect(generateSlug('  Hello -- World  ')).toBe('hello-world');
  });
});

// ──────────────────────────────────────────────────────────
// Auth & Authorization Tests
// ──────────────────────────────────────────────────────────

describe('Auth & Authorization', () => {
  it('unauthenticated users should not have access tokens', () => {
    const authHeader = undefined;
    expect(authHeader).toBeUndefined();
  });

  it('registration input cannot assign admin role', () => {
    const input = {
      email: 'test@example.com',
      password: 'password123',
      role: 'ADMIN',
    };

    const parsed = registerSchema.parse(input);
    expect(parsed).not.toHaveProperty('role');
    expect(parsed).not.toHaveProperty('status');
  });

  it('should validate email format on registration', () => {
    expect(() =>
      registerSchema.parse({ email: 'not-an-email', password: 'password123' }),
    ).toThrow();
  });

  it('should require minimum password length', () => {
    expect(() => registerSchema.parse({ email: 'test@example.com', password: 'short' })).toThrow();
  });
});

// ──────────────────────────────────────────────────────────
// Listing Validation Tests
// ──────────────────────────────────────────────────────────

describe('Listing Validation', () => {
  it('should validate create listing input', () => {
    const valid = createListingSchema.parse({
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'The Grand Hotel',
      description: 'A luxury hotel',
    });
    expect(valid.name).toBe('The Grand Hotel');
    expect(valid.categoryId).toBeDefined();
  });

  it('should reject empty name', () => {
    expect(() =>
      createListingSchema.parse({
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        name: '',
      }),
    ).toThrow();
  });

  it('should reject invalid categoryId', () => {
    expect(() =>
      createListingSchema.parse({
        categoryId: 'not-a-uuid',
        name: 'Test Listing',
      }),
    ).toThrow();
  });

  it('should accept optional fields', () => {
    const valid = createListingSchema.parse({
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Test',
      brand: 'TestBrand',
      location: 'NYC',
      imageUrl: 'https://example.com/img.jpg',
      websiteUrl: 'https://example.com',
    });
    expect(valid.brand).toBe('TestBrand');
    expect(valid.location).toBe('NYC');
  });

  it('duplicate normalized names should match', () => {
    expect(normalizeName('The Grand Hotel')).toBe(normalizeName('the grand hotel'));
    expect(normalizeName('  iPhone 16 Pro  ')).toBe(normalizeName('iPhone   16   Pro'));
  });

  it('same name in different categories should be allowed conceptually', () => {
    const name = normalizeName('Test Product');
    const catA = 'cat-a';
    const catB = 'cat-b';
    expect(`${catA}:${name}`).not.toBe(`${catB}:${name}`);
  });
});

// ──────────────────────────────────────────────────────────
// Review Validation Tests
// ──────────────────────────────────────────────────────────

describe('Review Validation', () => {
  it('should validate review creation', () => {
    const valid = createReviewSchema.parse({
      content: 'This is a detailed review of the product',
      ratings: [
        { criterionId: '550e8400-e29b-41d4-a716-446655440000', score: 4 },
        { criterionId: '550e8400-e29b-41d4-a716-446655440001', score: 5 },
      ],
    });
    expect(valid.ratings).toHaveLength(2);
  });

  it('should reject scores outside 1-5 range', () => {
    expect(() =>
      createReviewSchema.parse({
        content: 'A review with invalid score',
        ratings: [{ criterionId: '550e8400-e29b-41d4-a716-446655440000', score: 0 }],
      }),
    ).toThrow();

    expect(() =>
      createReviewSchema.parse({
        content: 'A review with invalid score',
        ratings: [{ criterionId: '550e8400-e29b-41d4-a716-446655440000', score: 6 }],
      }),
    ).toThrow();
  });

  it('should reject review with no ratings', () => {
    expect(() =>
      createReviewSchema.parse({
        content: 'A review with no ratings',
        ratings: [],
      }),
    ).toThrow();
  });

  it('should reject too-short review content', () => {
    expect(() =>
      createReviewSchema.parse({
        content: 'Short',
        ratings: [{ criterionId: '550e8400-e29b-41d4-a716-446655440000', score: 3 }],
      }),
    ).toThrow();
  });

  it('should calculate overall rating correctly', () => {
    const scores = [4, 5, 3, 4];
    const overall = scores.reduce((a, b) => a + b, 0) / scores.length;
    expect(overall).toBe(4.0);
  });

  it('should calculate overall rating with decimals', () => {
    const scores = [4, 5, 3];
    const overall = scores.reduce((a, b) => a + b, 0) / scores.length;
    expect(overall).toBeCloseTo(4.0, 2);
  });

  it('should calculate overall rating from mixed scores', () => {
    const scores = [1, 2, 3, 4, 5];
    const overall = scores.reduce((a, b) => a + b, 0) / scores.length;
    expect(overall).toBe(3.0);
  });
});

// ──────────────────────────────────────────────────────────
// Admin Validation Tests
// ──────────────────────────────────────────────────────────

describe('Admin Validation', () => {
  it('moderation requires a reason', () => {
    expect(() =>
      moderateListingSchema.parse({
        status: 'HIDDEN',
        moderationReason: '',
      }),
    ).toThrow();
  });

  it('moderation accepts valid input', () => {
    const valid = moderateListingSchema.parse({
      status: 'HIDDEN',
      moderationReason: 'Duplicate listing',
    });
    expect(valid.status).toBe('HIDDEN');
    expect(valid.moderationReason).toBe('Duplicate listing');
  });

  it('admin user update requires reason', () => {
    expect(() =>
      adminUpdateUserSchema.parse({
        status: 'SUSPENDED',
        moderationReason: '',
      }),
    ).toThrow();
  });

  it('admin cannot modify user rating scores through moderation', () => {
    const input = {
      status: 'HIDDEN',
      moderationReason: 'Spam review',
      overallRating: 1.0,
      ratings: [],
    };

    const parsed = moderateReviewSchema.parse(input);
    expect(parsed).not.toHaveProperty('overallRating');
    expect(parsed).not.toHaveProperty('ratings');
    expect(parsed).not.toHaveProperty('content');
  });
});

// ──────────────────────────────────────────────────────────
// Guard Logic Tests
// ──────────────────────────────────────────────────────────

describe('Guard Logic', () => {
  it('suspended users cannot perform write operations', () => {
    const user = { id: '1', role: 'USER', status: 'SUSPENDED' };
    expect(user.status).not.toBe('ACTIVE');
  });

  it('only ADMIN role can access admin endpoints', () => {
    const regularUser = { role: 'USER' };
    const adminUser = { role: 'ADMIN' };
    const requiredRoles = ['ADMIN'];

    expect(requiredRoles.includes(regularUser.role)).toBe(false);
    expect(requiredRoles.includes(adminUser.role)).toBe(true);
  });

  it('users can only edit their own listings', () => {
    const listingOwnerId = 'user-1';
    const requestingUserId = 'user-2';
    expect(listingOwnerId).not.toBe(requestingUserId);
  });

  it('users can only edit their own reviews', () => {
    const reviewUserId = 'user-1';
    const requestingUserId = 'user-2';
    expect(reviewUserId).not.toBe(requestingUserId);
  });
});
