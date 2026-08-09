import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateListingInput,
  UpdateListingInput,
  normalizeName,
  generateSlug,
} from '@rateit/shared';
import { Prisma } from '@rateit/database';

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check for duplicate listing names in a category.
   */
  async checkDuplicate(categoryId: string, name: string) {
    const normalized = normalizeName(name);
    const existing = await this.prisma.listing.findMany({
      where: {
        categoryId,
        normalizedName: { contains: normalized, mode: 'insensitive' },
        status: 'ACTIVE',
      },
      take: 5,
      select: { id: true, name: true, slug: true },
    });
    return existing;
  }

  /**
   * Create a new listing. Checks for duplicate names in the category.
   */
  async create(userId: string, data: CreateListingInput) {
    const normalized = normalizeName(data.name);
    let slug = generateSlug(data.name);

    // Check exact duplicate
    const exactDup = await this.prisma.listing.findUnique({
      where: {
        categoryId_normalizedName: {
          categoryId: data.categoryId,
          normalizedName: normalized,
        },
      },
    });

    if (exactDup) {
      throw new ConflictException('A listing with this name already exists in this category');
    }

    // Check slug collision and make unique
    const slugExists = await this.prisma.listing.findUnique({
      where: {
        categoryId_slug: {
          categoryId: data.categoryId,
          slug,
        },
      },
    });

    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    return this.prisma.listing.create({
      data: {
        categoryId: data.categoryId,
        createdById: userId,
        name: data.name.trim(),
        normalizedName: normalized,
        slug,
        description: data.description,
        brand: data.brand,
        imageUrl: data.imageUrl || null,
        websiteUrl: data.websiteUrl || null,
        location: data.location,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        createdBy: { select: { id: true, displayName: true, username: true } },
      },
    });
  }

  /**
   * Update a listing. Enforces ownership and lock rules after reviews.
   */
  async update(listingId: string, userId: string, data: UpdateListingInput, isAdmin = false) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { _count: { select: { reviews: true } } },
    });

    if (!listing) throw new NotFoundException('Listing not found');

    // Ownership check (unless admin)
    if (!isAdmin && listing.createdById !== userId) {
      throw new ForbiddenException('You can only edit your own listings');
    }

    const hasReviews = listing._count.reviews > 0;

    // If listing has reviews, restrict what can be changed
    if (hasReviews && !isAdmin) {
      if (data.name || data.categoryId || data.brand) {
        throw new BadRequestException(
          'Cannot change name, category, or brand after the listing has reviews. Only description, URLs, and location can be updated.',
        );
      }
    }

    const updateData: Prisma.ListingUpdateInput = {};

    if (data.name) {
      updateData.name = data.name.trim();
      updateData.normalizedName = normalizeName(data.name);
      updateData.slug = generateSlug(data.name);
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || null;
    if (data.websiteUrl !== undefined) updateData.websiteUrl = data.websiteUrl || null;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.categoryId) {
      updateData.category = { connect: { id: data.categoryId } };
    }

    return this.prisma.listing.update({
      where: { id: listingId },
      data: updateData,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        createdBy: { select: { id: true, displayName: true, username: true } },
      },
    });
  }

  /**
   * Delete a listing — only if it has no reviews.
   */
  async delete(listingId: string, userId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { _count: { select: { reviews: true } } },
    });

    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.createdById !== userId) {
      throw new ForbiddenException('You can only delete your own listings');
    }
    if (listing._count.reviews > 0) {
      throw new BadRequestException(
        'Cannot delete a listing that has reviews. Contact an admin to remove it.',
      );
    }

    await this.prisma.listing.delete({ where: { id: listingId } });
    return { success: true, message: 'Listing deleted' };
  }

  /**
   * Find listings with pagination, search, and filtering.
   */
  async findAll(params: {
    page: number;
    limit: number;
    categoryId?: string;
    categorySlug?: string;
    search?: string;
    sort?: string;
  }) {
    const { page, limit, categoryId, categorySlug, search, sort } = params;
    const where: Prisma.ListingWhereInput = {
      status: 'ACTIVE',
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'name') orderBy = { name: 'asc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };

    const [items, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          createdBy: { select: { id: true, displayName: true, username: true } },
          _count: { select: { reviews: { where: { status: 'VISIBLE' } } } },
        },
      }),
      this.prisma.listing.count({ where }),
    ]);

    // Calculate average ratings for each listing
    const itemsWithStats = await Promise.all(
      items.map(async (item) => {
        const stats = await this.prisma.review.aggregate({
          where: { listingId: item.id, status: 'VISIBLE' },
          _avg: { overallRating: true },
        });
        return {
          ...item,
          averageRating: stats._avg.overallRating ? Number(stats._avg.overallRating) : null,
          reviewCount: item._count.reviews,
        };
      }),
    );

    return {
      items: itemsWithStats,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a single listing by its composite slug (category slug is checked in controller).
   */
  async findBySlug(slug: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { slug, status: 'ACTIVE' },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            ratingCriteria: {
              where: { isActive: true },
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
        createdBy: { select: { id: true, displayName: true, username: true } },
        _count: { select: { reviews: { where: { status: 'VISIBLE' } } } },
      },
    });

    if (!listing) throw new NotFoundException('Listing not found');

    // Calculate aggregate stats
    const [avgStats, criterionAvgs, ratingDistribution] = await Promise.all([
      this.prisma.review.aggregate({
        where: { listingId: listing.id, status: 'VISIBLE' },
        _avg: { overallRating: true },
        _count: true,
      }),
      this.getListingCriterionAverages(listing.id),
      this.getRatingDistribution(listing.id),
    ]);

    return {
      ...listing,
      averageRating: avgStats._avg.overallRating ? Number(avgStats._avg.overallRating) : null,
      reviewCount: avgStats._count,
      criterionAverages: criterionAvgs,
      ratingDistribution,
    };
  }

  async findById(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            ratingCriteria: {
              where: { isActive: true },
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
        createdBy: { select: { id: true, displayName: true, username: true } },
        _count: { select: { reviews: { where: { status: 'VISIBLE' } } } },
      },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  /**
   * Get listings created by a specific user.
   */
  async findByUser(userId: string, page: number, limit: number) {
    const where: Prisma.ListingWhereInput = {
      createdById: userId,
      status: { not: 'REMOVED' },
    };

    const [items, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { reviews: { where: { status: 'VISIBLE' } } } },
        },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ─── Helpers ──────────────────────────────────────────

  private async getListingCriterionAverages(listingId: string) {
    const results = await this.prisma.reviewRating.groupBy({
      by: ['criterionId'],
      where: {
        review: { listingId, status: 'VISIBLE' },
      },
      _avg: { score: true },
      _count: true,
    });

    // Enrich with criterion details
    const criteria = await this.prisma.ratingCriterion.findMany({
      where: {
        id: { in: results.map((r) => r.criterionId) },
      },
    });

    return results
      .map((r) => {
        const criterion = criteria.find((c) => c.id === r.criterionId);
        return {
          criterionId: r.criterionId,
          criterionName: criterion?.name || 'Unknown',
          displayOrder: criterion?.displayOrder || 0,
          average: r._avg.score ? Number(r._avg.score) : 0,
          count: r._count,
        };
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  private async getRatingDistribution(listingId: string) {
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    const reviews = await this.prisma.review.findMany({
      where: { listingId, status: 'VISIBLE' },
      select: { overallRating: true },
    });

    for (const review of reviews) {
      const rounded = Math.round(Number(review.overallRating));
      const key = Math.max(1, Math.min(5, rounded));
      distribution[key] = (distribution[key] || 0) + 1;
    }

    return distribution;
  }
}
