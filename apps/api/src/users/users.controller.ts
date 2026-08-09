import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@rateit/database';
import { updateProfileSchema, UpdateProfileInput } from '@rateit/shared';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('users')
@UseGuards(SupabaseAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUser() user: User) {
    return { success: true, data: user };
  }

  @Patch('me')
  async updateProfile(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(updateProfileSchema)) data: UpdateProfileInput,
  ) {
    const updated = await this.usersService.updateProfile(user.id, data);
    return { success: true, data: updated };
  }
}
