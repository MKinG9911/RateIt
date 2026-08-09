import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@rateit/database';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Listing Moderation ──────────────────────────────────

  async findAllListings(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    categoryId?: string;
  }) {
    const { page, limit, search, status, categoryId } = params;
    const where: Prisma.ListingWhereInput = {};

    if (status) where.status = status as 'ACTIVE' | 'HIDDEN' | 'REMOVED';
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          createdBy: { select: { id: true, email: true, displayName: true } },
          _count: { select: { reviews: true } },
        },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async moderateListing(
    listingId: string,
    status: 'ACTIVE' | 'HIDDEN' | 'REMOVED',
    reason: string,
  ) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });
    if (!listing) throw new NotFoundException('Listing not found');

    return this.prisma.listing.update({
      where: { id: listingId },
      data: {
        status,
        moderationReason: reason,
      },
    });
  }

  async adminUpdateListing(
    listingId: string,
    data: {
      name?: string;
      brand?: string;
      categoryId?: string;
      description?: string;
      imageUrl?: string;
      websiteUrl?: string;
      location?: string;
    },
  ) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });
    if (!listing) throw new NotFoundException('Listing not found');

    const updateData: Prisma.ListingUpdateInput = {};
    if (data.name !== undefined) {
      updateData.name = data.name;
      updateData.normalizedName = data.name.trim().toLowerCase().replace(/\s+/g, ' ');
      updateData.slug = data.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
    }
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || null;
    if (data.websiteUrl !== undefined) updateData.websiteUrl = data.websiteUrl || null;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.categoryId) updateData.category = { connect: { id: data.categoryId } };

    return this.prisma.listing.update({
      where: { id: listingId },
      data: updateData,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        createdBy: { select: { id: true, email: true, displayName: true } },
      },
    });
  }

  // ─── Review Moderation ──────────────────────────────────

  async findAllReviews(params: {
    page: number;
    limit: number;
    status?: string;
    listingId?: string;
  }) {
    const { page, limit, status, listingId } = params;
    const where: Prisma.ReviewWhereInput = {};

    if (status) where.status = status as 'VISIBLE' | 'HIDDEN' | 'REMOVED';
    if (listingId) where.listingId = listingId;

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, displayName: true } },
          listing: {
            select: {
              id: true,
              name: true,
              category: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async moderateReview(reviewId: string, status: 'VISIBLE' | 'HIDDEN' | 'REMOVED', reason: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Review not found');

    return this.prisma.review.update({
      where: { id: reviewId },
      data: {
        status,
        moderationReason: reason,
      },
    });
  }

  // ─── Category Management ──────────────────────────────────

  async findAllCategories() {
    return this.prisma.category.findMany({
      include: {
        ratingCriteria: { orderBy: { displayOrder: 'asc' } },
        _count: { select: { listings: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async updateCategory(
    categoryId: string,
    data: { name?: string; description?: string; isActive?: boolean },
  ) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) throw new NotFoundException('Category not found');

    return this.prisma.category.update({
      where: { id: categoryId },
      data,
    });
  }

  async createCriterion(data: {
    categoryId: string;
    name: string;
    description?: string;
    displayOrder?: number;
  }) {
    return this.prisma.ratingCriterion.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        displayOrder: data.displayOrder || 0,
        isActive: true,
      },
    });
  }

  async updateCriterion(
    criterionId: string,
    data: { name?: string; description?: string; displayOrder?: number; isActive?: boolean },
  ) {
    const criterion = await this.prisma.ratingCriterion.findUnique({
      where: { id: criterionId },
      include: { _count: { select: { reviewRatings: true } } },
    });
    if (!criterion) throw new NotFoundException('Criterion not found');

    // Prevent deactivating criteria that have been used in reviews
    // (they can be deactivated but not deleted)
    if (data.isActive === false && criterion._count.reviewRatings > 0) {
      // Allowed: deactivation is fine, just won't be used for new reviews
    }

    return this.prisma.ratingCriterion.update({
      where: { id: criterionId },
      data,
    });
  }

  // ─── Analytics ──────────────────────────────────────────

  async getAnalytics() {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalListings,
      totalReviews,
      mostReviewedListings,
      highestRatedListings,
      mostActiveReviewers,
      listingsOverTime,
      reviewsOverTime,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.listing.count({ where: { status: 'ACTIVE' } }),
      this.prisma.review.count({ where: { status: 'VISIBLE' } }),

      // Most reviewed listings (top 10)
      this.prisma.listing.findMany({
        where: { status: 'ACTIVE' },
        orderBy: {
          reviews: { _count: 'desc' },
        },
        take: 10,
        include: {
          category: { select: { name: true } },
          _count: { select: { reviews: { where: { status: 'VISIBLE' } } } },
        },
      }),

      // Highest rated listings (min 3 reviews, top 10)
      this.getHighestRatedListings(),

      // Most active reviewers (top 10)
      this.getMostActiveReviewers(),

      // Listings created over time (last 12 months)
      this.getListingsOverTime(),

      // Reviews created over time (last 12 months)
      this.getReviewsOverTime(),
    ]);

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalListings,
      totalReviews,
      mostReviewedListings: mostReviewedListings.map((l) => ({
        id: l.id,
        name: l.name,
        category: l.category.name,
        reviewCount: l._count.reviews,
      })),
      highestRatedListings,
      mostActiveReviewers,
      listingsOverTime,
      reviewsOverTime,
    };
  }

  private async getHighestRatedListings() {
    // Get listings with >= 3 visible reviews, sorted by avg overall rating
    const listings = await this.prisma.listing.findMany({
      where: {
        status: 'ACTIVE',
        reviews: { some: { status: 'VISIBLE' } },
      },
      include: {
        category: { select: { name: true } },
        reviews: {
          where: { status: 'VISIBLE' },
          select: { overallRating: true },
        },
      },
    });

    return listings
      .map((l) => {
        const visibleReviews = l.reviews;
        if (visibleReviews.length < 3) return null;
        const avg =
          visibleReviews.reduce((sum, r) => sum + Number(r.overallRating), 0) /
          visibleReviews.length;
        return {
          id: l.id,
          name: l.name,
          category: l.category.name,
          averageRating: Math.round(avg * 100) / 100,
          reviewCount: visibleReviews.length,
        };
      })
      .filter((l): l is NonNullable<typeof l> => l !== null)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 10);
  }

  private async getMostActiveReviewers() {
    const reviewers = await this.prisma.review.groupBy({
      by: ['userId'],
      where: { status: 'VISIBLE' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const users = await this.prisma.user.findMany({
      where: { id: { in: reviewers.map((r) => r.userId) } },
      select: { id: true, displayName: true, username: true, email: true },
    });

    return reviewers.map((r) => {
      const user = users.find((u) => u.id === r.userId);
      return {
        userId: r.userId,
        displayName: user?.displayName || user?.username || user?.email || 'Unknown',
        reviewCount: r._count.id,
      };
    });
  }

  private async getListingsOverTime() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const results = await this.prisma.$queryRaw<{ month: string; count: bigint }[]>`
      SELECT TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
             COUNT(*)::bigint as count
      FROM listings
      WHERE "createdAt" >= ${twelveMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    return results.map((r) => ({
      month: r.month,
      count: Number(r.count),
    }));
  }

  private async getReviewsOverTime() {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const results = await this.prisma.$queryRaw<{ month: string; count: bigint }[]>`
      SELECT TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
             COUNT(*)::bigint as count
      FROM reviews
      WHERE "createdAt" >= ${twelveMonthsAgo}
        AND status = 'VISIBLE'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    return results.map((r) => ({
      month: r.month,
      count: Number(r.count),
    }));
  }
}
