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
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { ActiveUserGuard } from '../auth/guards/active-user.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { User } from '@rateit/database';
import {
  createListingSchema,
  updateListingSchema,
  CreateListingInput,
  UpdateListingInput,
} from '@rateit/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('listings')
@UseGuards(SupabaseAuthGuard)
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  @Public()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 12,
    @Query('categoryId') categoryId?: string,
    @Query('categorySlug') categorySlug?: string,
    @Query('subcategoryId') subcategoryId?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('minRating') minRating?: string,
  ) {
    const result = await this.listingsService.findAll({
      page: Number(page),
      limit: Math.min(Number(limit), 50),
      categoryId,
      categorySlug,
      subcategoryId,
      search,
      sort,
      minRating: minRating ? Number(minRating) : undefined,
    });
    return { success: true, data: result };
  }

  @Get('check-duplicate')
  @UseGuards(ActiveUserGuard, RolesGuard)
  @Roles('ADMIN')
  async checkDuplicate(@Query('categoryId') categoryId: string, @Query('name') name: string) {
    const matches = await this.listingsService.checkDuplicate(categoryId, name);
    return { success: true, data: { matches } };
  }

  @Get('my')
  @UseGuards(ActiveUserGuard, RolesGuard)
  @Roles('ADMIN')
  async findMine(@CurrentUser() user: User, @Query('page') page = 1, @Query('limit') limit = 12) {
    const result = await this.listingsService.findByUser(
      user.id,
      Number(page),
      Math.min(Number(limit), 50),
    );
    return { success: true, data: result };
  }

  @Get('by-id/:id')
  @Public()
  async findById(@Param('id') id: string) {
    const listing = await this.listingsService.findById(id);
    return { success: true, data: listing };
  }

  @Get(':slug')
  @Public()
  async findBySlug(@Param('slug') slug: string) {
    const listing = await this.listingsService.findBySlug(slug);
    return { success: true, data: listing };
  }

  @Post()
  @UseGuards(ActiveUserGuard, RolesGuard)
  @Roles('ADMIN')
  async create(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(createListingSchema)) data: CreateListingInput,
  ) {
    const listing = await this.listingsService.create(user.id, data);
    return { success: true, data: listing };
  }

  @Patch(':id')
  @UseGuards(ActiveUserGuard, RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(updateListingSchema)) data: UpdateListingInput,
  ) {
    const listing = await this.listingsService.update(id, user.id, data, user.role === 'ADMIN');
    return { success: true, data: listing };
  }

  @Delete(':id')
  @UseGuards(ActiveUserGuard, RolesGuard)
  @Roles('ADMIN')
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    const result = await this.listingsService.delete(id, user.id, user.role === 'ADMIN');
    return result;
  }
}
