import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@rateit/database';

/**
 * AuthService handles JWT verification via Supabase JWKS
 * and auto-creates/syncs application users.
 */
@Injectable()
export class AuthService {
  private jwks: ReturnType<typeof createRemoteJWKSet>;
  private issuer: string;

  constructor(private readonly prisma: PrismaService) {
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL environment variable is required');
    }

    this.issuer =
      process.env.SUPABASE_JWT_ISSUER || `${supabaseUrl}/auth/v1`;

    const jwksUrl =
      process.env.SUPABASE_JWKS_URL || `${supabaseUrl}/auth/v1/.well-known/jwks.json`;

    // Initialize JWKS set (cached automatically by jose)
    this.jwks = createRemoteJWKSet(
      new URL(jwksUrl),
    );
  }

  /**
   * Verify a Supabase JWT and return the payload.
   */
  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        audience: 'authenticated',
      });
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Get or create the application user from a verified JWT.
   * Auto-syncs email, username, and displayName from the token payload metadata.
   */
  async getOrCreateUser(payload: JWTPayload): Promise<User> {
    const supabaseUserId = payload.sub;
    if (!supabaseUserId) {
      throw new UnauthorizedException('Token missing user ID');
    }

    const email = (payload as Record<string, unknown>).email as string;
    if (!email) {
      throw new UnauthorizedException('Token missing email');
    }

    // Extract user metadata from Supabase token
    const userMetadata = ((payload.user_metadata ||
      (payload as Record<string, unknown>).raw_user_meta_data ||
      {}) as Record<string, unknown>);

    const username = (userMetadata.username || userMetadata.user_name) as string | undefined;
    const displayName = (userMetadata.displayName || userMetadata.display_name || userMetadata.name) as string | undefined;

    // Try to find existing user
    let user = await this.prisma.user.findUnique({
      where: { id: supabaseUserId },
    });

    if (user) {
      const updateData: Record<string, unknown> = {};
      if (user.email !== email) updateData.email = email;
      if (!user.username && username) updateData.username = username;
      if (!user.displayName && displayName) updateData.displayName = displayName;

      if (Object.keys(updateData).length > 0) {
        user = await this.prisma.user.update({
          where: { id: supabaseUserId },
          data: updateData,
        });
      }
      return user;
    }

    // Create new user — always USER role, ACTIVE status
    return this.prisma.user.create({
      data: {
        id: supabaseUserId,
        email,
        username: username || null,
        displayName: displayName || null,
        role: 'USER',
        status: 'ACTIVE',
      },
    });
  }
}
