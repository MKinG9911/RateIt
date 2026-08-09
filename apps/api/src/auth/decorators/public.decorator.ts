import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a route as public — no authentication required.
 * Optionally, if a token is present, the user will still be attached.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
