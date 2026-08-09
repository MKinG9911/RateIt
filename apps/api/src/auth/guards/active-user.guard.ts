import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/**
 * Guard that checks if the user's status is ACTIVE.
 * Used on write endpoints to prevent suspended users from creating/editing.
 */
@Injectable()
export class ActiveUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException('Your account is suspended. You cannot perform this action.');
    }

    return true;
  }
}
