import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UsersService } from '../users/users.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  moderateListingSchema,
  moderateReviewSchema,
  adminUpdateListingSchema,
  adminUpdateUserSchema,
  ModerateListingInput,
  ModerateReviewInput,
  AdminUpdateListingInput,
  AdminUpdateUserInput,
} from '@rateit/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('admin')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly usersService: UsersService,
  ) {}

  // ─── Users ──────────────────────────────────────────

  @Get('users')
  async findAllUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.usersService.findAll({
      page: Number(page),
      limit: Math.min(Number(limit), 50),
      search,
      role,
      status,
    });
    return { success: true, data: result };
  }

  @Patch('users/:id/suspend')
  async suspendUser(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(adminUpdateUserSchema)) data: AdminUpdateUserInput,
  ) {
    const user = await this.usersService.suspendUser(id);
    return { success: true, data: user, message: `User suspended: ${data.moderationReason}` };
  }

  @Patch('users/:id/restore')
  async restoreUser(@Param('id') id: string) {
    const user = await this.usersService.restoreUser(id);
    return { success: true, data: user };
  }

  // ─── Listings ──────────────────────────────────────────

  @Get('listings')
  async findAllListings(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const result = await this.adminService.findAllListings({
      page: Number(page),
      limit: Math.min(Number(limit), 50),
      search,
      status,
      categoryId,
    });
    return { success: true, data: result };
  }

  @Patch('listings/:id/moderate')
  async moderateListing(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(moderateListingSchema)) data: ModerateListingInput,
  ) {
    const listing = await this.adminService.moderateListing(id, data.status, data.moderationReason);
    return { success: true, data: listing };
  }

  @Patch('listings/:id')
  async adminUpdateListing(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(adminUpdateListingSchema)) data: AdminUpdateListingInput,
  ) {
    const listing = await this.adminService.adminUpdateListing(id, data);
    return { success: true, data: listing };
  }

  // ─── Reviews ──────────────────────────────────────────

  @Get('reviews')
  async findAllReviews(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
    @Query('listingId') listingId?: string,
  ) {
    const result = await this.adminService.findAllReviews({
      page: Number(page),
      limit: Math.min(Number(limit), 50),
      status,
      listingId,
    });
    return { success: true, data: result };
  }

  @Patch('reviews/:id/moderate')
  async moderateReview(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(moderateReviewSchema)) data: ModerateReviewInput,
  ) {
    const review = await this.adminService.moderateReview(id, data.status, data.moderationReason);
    return { success: true, data: review };
  }

  // ─── Categories ──────────────────────────────────────────

  @Get('categories')
  async findAllCategories() {
    const categories = await this.adminService.findAllCategories();
    return { success: true, data: categories };
  }

  @Patch('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() data: { name?: string; description?: string; isActive?: boolean },
  ) {
    const category = await this.adminService.updateCategory(id, data);
    return { success: true, data: category };
  }

  @Post('categories/:categoryId/criteria')
  async createCriterion(
    @Param('categoryId') categoryId: string,
    @Body() data: { name: string; description?: string; displayOrder?: number },
  ) {
    const criterion = await this.adminService.createCriterion({
      categoryId,
      ...data,
    });
    return { success: true, data: criterion };
  }

  @Patch('criteria/:id')
  async updateCriterion(
    @Param('id') id: string,
    @Body()
    data: {
      name?: string;
      description?: string;
      displayOrder?: number;
      isActive?: boolean;
    },
  ) {
    const criterion = await this.adminService.updateCriterion(id, data);
    return { success: true, data: criterion };
  }

  // ─── Analytics ──────────────────────────────────────────

  @Get('analytics')
  async getAnalytics() {
    const analytics = await this.adminService.getAnalytics();
    return { success: true, data: analytics };
  }
}
