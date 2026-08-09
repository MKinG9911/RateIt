import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewInput, UpdateReviewInput } from '@rateit/shared';
import { Prisma } from '@rateit/database';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new review with criterion scores — atomically.
   */
  async create(userId: string, listingId: string, data: CreateReviewInput) {
    // 1. Check listing exists and is active
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        category: {
          include: {
            ratingCriteria: { where: { isActive: true } },
          },
        },
      },
    });

    if (!listing || listing.status !== 'ACTIVE') {
      throw new NotFoundException('Listing not found or not active');
    }

    // 2. Check user hasn't already reviewed this listing
    const existingReview = await this.prisma.review.findUnique({
      where: {
        userId_listingId: { userId, listingId },
      },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this listing');
    }

    // 3. Validate criteria
    const activeCriteria = listing.category.ratingCriteria;
    const activeCriteriaIds = new Set(activeCriteria.map((c) => c.id));

    // Check that all submitted criteria belong to this category
    for (const rating of data.ratings) {
      if (!activeCriteriaIds.has(rating.criterionId)) {
        throw new BadRequestException(
          `Criterion ${rating.criterionId} does not belong to this listing's category or is inactive`,
        );
      }
    }

    // Check for duplicate criteria in submission
    const submittedCriteriaIds = new Set(data.ratings.map((r) => r.criterionId));
    if (submittedCriteriaIds.size !== data.ratings.length) {
      throw new BadRequestException('Duplicate criteria in submission');
    }

    // Check that ALL active criteria are covered
    if (submittedCriteriaIds.size !== activeCriteria.length) {
      throw new BadRequestException(
        `All ${activeCriteria.length} active criteria must be rated. You provided ${submittedCriteriaIds.size}.`,
      );
    }

    for (const criterion of activeCriteria) {
      if (!submittedCriteriaIds.has(criterion.id)) {
        throw new BadRequestException(`Missing rating for criterion: ${criterion.name}`);
      }
    }

    // 4. Calculate overall rating
    const totalScore = data.ratings.reduce((sum, r) => sum + r.score, 0);
    const overallRating = totalScore / data.ratings.length;

    // 5. Create review + ratings in a transaction
    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          userId,
          listingId,
          title: data.title,
          content: data.content,
          overallRating: new Prisma.Decimal(overallRating.toFixed(2)),
          status: 'VISIBLE',
        },
      });

      await tx.reviewRating.createMany({
        data: data.ratings.map((r) => ({
          reviewId: review.id,
          criterionId: r.criterionId,
          score: r.score,
        })),
      });

      return tx.review.findUnique({
        where: { id: review.id },
        include: {
          ratings: {
            include: {
              criterion: { select: { id: true, name: true, displayOrder: true } },
            },
          },
          user: { select: { id: true, displayName: true, username: true } },
        },
      });
    });
  }

  /**
   * Update an existing review. Recalculates overall rating.
   */
  async update(reviewId: string, userId: string, data: UpdateReviewInput) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        listing: {
          include: {
            category: {
              include: {
                ratingCriteria: { where: { isActive: true } },
              },
            },
          },
        },
      },
    });

    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only edit your own reviews');
    }

    return this.prisma.$transaction(async (tx) => {
      const updateData: Prisma.ReviewUpdateInput = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.content !== undefined) updateData.content = data.content;

      if (data.ratings && data.ratings.length > 0) {
        // Validate criteria
        const activeCriteria = review.listing.category.ratingCriteria;
        const activeCriteriaIds = new Set(activeCriteria.map((c) => c.id));

        for (const rating of data.ratings) {
          if (!activeCriteriaIds.has(rating.criterionId)) {
            throw new BadRequestException(
              `Criterion ${rating.criterionId} does not belong to this listing's category`,
            );
          }
        }

        const submittedCriteriaIds = new Set(data.ratings.map((r) => r.criterionId));
        if (submittedCriteriaIds.size !== data.ratings.length) {
          throw new BadRequestException('Duplicate criteria in submission');
        }

        if (submittedCriteriaIds.size !== activeCriteria.length) {
          throw new BadRequestException(
            `All ${activeCriteria.length} active criteria must be rated`,
          );
        }

        // Recalculate overall
        const totalScore = data.ratings.reduce((sum, r) => sum + r.score, 0);
        const overallRating = totalScore / data.ratings.length;
        updateData.overallRating = new Prisma.Decimal(overallRating.toFixed(2));

        // Delete old ratings and create new ones
        await tx.reviewRating.deleteMany({
          where: { reviewId: review.id },
        });

        await tx.reviewRating.createMany({
          data: data.ratings.map((r) => ({
            reviewId: review.id,
            criterionId: r.criterionId,
            score: r.score,
          })),
        });
      }

      return tx.review.update({
        where: { id: reviewId },
        data: updateData,
        include: {
          ratings: {
            include: {
              criterion: { select: { id: true, name: true, displayOrder: true } },
            },
          },
          user: { select: { id: true, displayName: true, username: true } },
        },
      });
    });
  }

  /**
   * Delete a review and all its ratings.
   */
  async delete(reviewId: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    // Cascade will handle ReviewRating deletion
    await this.prisma.review.delete({ where: { id: reviewId } });
    return { success: true, message: 'Review deleted' };
  }

  /**
   * Get reviews for a listing (public).
   */
  async findByListing(listingId: string, page: number, limit: number) {
    const where = {
      listingId,
      status: 'VISIBLE' as const,
    };

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          ratings: {
            include: {
              criterion: { select: { id: true, name: true, displayOrder: true } },
            },
          },
          user: { select: { id: true, displayName: true, username: true } },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get current user's reviews.
   */
  async findByUser(userId: string, page: number, limit: number) {
    const where = {
      userId,
      status: { not: 'REMOVED' as const },
    };

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: { select: { name: true, slug: true } },
            },
          },
          ratings: {
            include: {
              criterion: { select: { id: true, name: true } },
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Check if user has already reviewed a listing.
   */
  async hasReviewed(userId: string, listingId: string): Promise<boolean> {
    const existing = await this.prisma.review.findUnique({
      where: {
        userId_listingId: { userId, listingId },
      },
    });
    return !!existing;
  }
}
