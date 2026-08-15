import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(activeOnly = true) {
    const whereCondition = activeOnly ? { isActive: true } : {};

    const categories = await this.prisma.category.findMany({
      where: {
        ...whereCondition,
        parentId: null, // Root parent categories first
      },
      include: {
        children: {
          where: whereCondition,
          include: {
            ratingCriteria: {
              where: whereCondition,
              orderBy: { displayOrder: 'asc' },
            },
            _count: {
              select: {
                listings: { where: { status: 'ACTIVE' } },
              },
            },
          },
          orderBy: { name: 'asc' },
        },
        ratingCriteria: {
          where: whereCondition,
          orderBy: { displayOrder: 'asc' },
        },
        _count: {
          select: {
            listings: { where: { status: 'ACTIVE' } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Aggregate subcategory listing counts into parent category
    return categories.map((parent) => {
      const directListings = parent._count?.listings || 0;
      const childrenListings =
        parent.children?.reduce((sum, child) => sum + (child._count?.listings || 0), 0) || 0;
      const totalListings = directListings + childrenListings;

      return {
        ...parent,
        _count: {
          ...parent._count,
          listings: totalListings,
        },
      };
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
            children: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                slug: true,
                _count: {
                  select: {
                    listings: { where: { status: 'ACTIVE' } },
                  },
                },
              },
              orderBy: { name: 'asc' },
            },
          },
        },
        children: {
          where: { isActive: true },
          include: {
            ratingCriteria: {
              where: { isActive: true },
              orderBy: { displayOrder: 'asc' },
            },
            _count: {
              select: {
                listings: { where: { status: 'ACTIVE' } },
              },
            },
          },
          orderBy: { name: 'asc' },
        },
        ratingCriteria: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
        _count: {
          select: {
            listings: { where: { status: 'ACTIVE' } },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const directListings = category._count?.listings || 0;
    const childrenListings =
      category.children?.reduce((sum, child) => sum + (child._count?.listings || 0), 0) || 0;
    const totalListings = directListings + childrenListings;

    return {
      ...category,
      _count: {
        ...category._count,
        listings: totalListings,
      },
    };
  }

  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        ratingCriteria: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }
}
