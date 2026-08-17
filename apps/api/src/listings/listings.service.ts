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

    const targetCategoryId = data.categoryId || listing.categoryId;
    const nameChanged = data.name !== undefined && data.name.trim() !== listing.name;
    const categoryChanged = data.categoryId !== undefined && data.categoryId !== listing.categoryId;

    const updateData: Prisma.ListingUpdateInput = {};

    if (nameChanged || categoryChanged) {
      const newName = data.name !== undefined ? data.name.trim() : listing.name;
      const normalized = normalizeName(newName);
      let newSlug = generateSlug(newName);

      // Check if another listing in target category has this normalized name
      const duplicate = await this.prisma.listing.findFirst({
        where: {
          id: { not: listingId },
          categoryId: targetCategoryId,
          normalizedName: normalized,
        },
      });

      if (duplicate) {
        throw new ConflictException('A listing with this name already exists in this category');
      }

      // Check if another listing in target category has this slug
      const slugCollision = await this.prisma.listing.findFirst({
        where: {
          id: { not: listingId },
          categoryId: targetCategoryId,
          slug: newSlug,
        },
      });

      if (slugCollision) {
        newSlug = `${newSlug}-${Date.now().toString(36)}`;
      }

      updateData.name = newName;
      updateData.normalizedName = normalized;
      updateData.slug = newSlug;
    }

    if (categoryChanged && data.categoryId) {
      updateData.category = { connect: { id: data.categoryId } };
    }

    if (data.description !== undefined) updateData.description = data.description;
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || null;
    if (data.websiteUrl !== undefined) updateData.websiteUrl = data.websiteUrl || null;
    if (data.location !== undefined) updateData.location = data.location;

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
   * Delete a listing — only if it has no reviews (or admin).
   */
  async delete(listingId: string, userId: string, isAdmin = false) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { _count: { select: { reviews: true } } },
    });

    if (!listing) throw new NotFoundException('Listing not found');
    if (!isAdmin && listing.createdById !== userId) {
      throw new ForbiddenException('You can only delete your own listings');
    }
    if (!isAdmin && listing._count.reviews > 0) {
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
    subcategoryId?: string;
    search?: string;
    sort?: string;
    minRating?: number;
  }) {
    const { page, limit, categoryId, categorySlug, subcategoryId, search, sort, minRating } =
      params;
    const where: Prisma.ListingWhereInput = {
      status: 'ACTIVE',
    };

    if (subcategoryId) {
      where.categoryId = subcategoryId;
    } else if (categorySlug) {
      const category = await this.prisma.category.findUnique({
        where: { slug: categorySlug },
        include: { children: { select: { id: true } } },
      });
      if (category) {
        const categoryIds = [category.id, ...(category.children?.map((c) => c.id) || [])];
        where.categoryId = { in: categoryIds };
      } else {
        where.category = { slug: categorySlug };
      }
    } else if (categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
        include: { children: { select: { id: true } } },
      });
      if (category && category.children?.length > 0) {
        const categoryIds = [category.id, ...category.children.map((c) => c.id)];
        where.categoryId = { in: categoryIds };
      } else {
        where.categoryId = categoryId;
      }
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

    const rawListings = await this.prisma.listing.findMany({
      where,
      orderBy,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            parentId: true,
            parent: { select: { id: true, name: true, slug: true } },
          },
        },
        createdBy: { select: { id: true, displayName: true, username: true } },
        _count: { select: { reviews: { where: { status: 'VISIBLE' } } } },
      },
    });

    // Calculate average ratings for each listing
    let itemsWithStats = await Promise.all(
      rawListings.map(async (item) => {
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

    // Apply minRating filter if specified
    if (minRating && minRating > 0) {
      itemsWithStats = itemsWithStats.filter(
        (item) => item.averageRating !== null && item.averageRating >= minRating,
      );
    }

    // Apply custom sorting
    if (sort === 'rating') {
      itemsWithStats.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (sort === 'reviews') {
      itemsWithStats.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    const total = itemsWithStats.length;
    const paginatedItems = itemsWithStats.slice((page - 1) * limit, page * limit);

    return {
      items: paginatedItems,
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
            parentId: true,
            parent: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
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
      this.getListingCriterionAverages(listing.id, listing.categoryId),
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

  private async getListingCriterionAverages(listingId: string, categoryId: string) {
    const activeCriteria = await this.prisma.ratingCriterion.findMany({
      where: { categoryId, isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    const results = await this.prisma.reviewRating.groupBy({
      by: ['criterionId'],
      where: {
        review: { listingId, status: 'VISIBLE' },
        criterionId: { in: activeCriteria.map((c) => c.id) },
      },
      _avg: { score: true },
      _count: true,
    });

    return activeCriteria.map((criterion) => {
      const found = results.find((r) => r.criterionId === criterion.id);
      return {
        criterionId: criterion.id,
        criterionName: criterion.name,
        displayOrder: criterion.displayOrder,
        average: found?._avg?.score ? Number(found._avg.score) : 0,
        count: found?._count || 0,
      };
    });
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
