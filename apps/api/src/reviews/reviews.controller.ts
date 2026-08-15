import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { User } from '@rateit/database';
import {
  createReviewSchema,
  updateReviewSchema,
  voteReviewSchema,
  CreateReviewInput,
  UpdateReviewInput,
  VoteReviewInput,
} from '@rateit/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller()
@UseGuards(SupabaseAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('listings/:listingId/reviews')
  @Public()
  async findByListing(
    @Param('listingId') listingId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Req() req: any,
  ) {
    const currentUserId = req.user?.id;
    const result = await this.reviewsService.findByListing(
      listingId,
      Number(page),
      Math.min(Number(limit), 50),
      currentUserId,
    );
    return { success: true, data: result };
  }

  @Post('listings/:listingId/reviews')
  @UseGuards(ActiveUserGuard)
  async create(
    @Param('listingId') listingId: string,
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(createReviewSchema)) data: CreateReviewInput,
  ) {
    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Administrators cannot rate or review listings.');
    }
    const review = await this.reviewsService.create(user.id, listingId, data);
    return { success: true, data: review };
  }

  @Post('reviews/:id/vote')
  @UseGuards(ActiveUserGuard)
  async vote(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(voteReviewSchema)) data: VoteReviewInput,
  ) {
    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Administrators cannot vote on reviews.');
    }
    const result = await this.reviewsService.vote(id, user.id, data.voteType);
    return { success: true, data: result };
  }

  @Get('listings/:listingId/reviews/check')
  async checkReviewed(@Param('listingId') listingId: string, @CurrentUser() user: User) {
    const hasReviewed = await this.reviewsService.hasReviewed(user.id, listingId);
    return { success: true, data: { hasReviewed } };
  }

  @Get('reviews/my')
  async findMine(@CurrentUser() user: User, @Query('page') page = 1, @Query('limit') limit = 10) {
    const result = await this.reviewsService.findByUser(
      user.id,
      Number(page),
      Math.min(Number(limit), 50),
    );
    return { success: true, data: result };
  }

  @Patch('reviews/:id')
  @UseGuards(ActiveUserGuard)
  async update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(updateReviewSchema)) data: UpdateReviewInput,
  ) {
    if (user.role === 'ADMIN') {
      throw new ForbiddenException('Administrators cannot rate or review listings.');
    }
    const review = await this.reviewsService.update(id, user.id, data);
    return { success: true, data: review };
  }

  @Delete('reviews/:id')
  @UseGuards(ActiveUserGuard)
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    const result = await this.reviewsService.delete(id, user.id);
    return { success: true, data: result };
  }
}
