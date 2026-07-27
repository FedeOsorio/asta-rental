import { eq, and, isNull, gt } from 'drizzle-orm';
import { db } from '../../db/index.js';
import * as schema from '../../db/schema.js';
import { comparePassword } from '../../utils/password.js';
import { generateRandomToken, hashToken } from '../../utils/crypto.js';
import { signAccessToken, getRemainingTtlSeconds, verifyAccessToken } from '../../utils/jwt.js';
import { redisClient } from '../../utils/redis.js';
import {
  clearLoginAttempts,
  recordFailedLoginAttempt
} from '../../middleware/rateLimiter.js';
import { LoginInput, LoginResponse } from '@asta-rental/shared';

const REFRESH_TOKEN_DAYS = 7;

export class AuthService {
  static async login(input: LoginInput): Promise<{
    loginResponse: LoginResponse;
    refreshToken: string;
  }> {
    const { email, password } = input;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find user by email
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, normalizedEmail));

    if (!user) {
      await recordFailedLoginAttempt(normalizedEmail);
      throw new Error('Invalid email or password');
    }

    // 2. Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      await recordFailedLoginAttempt(normalizedEmail);
      throw new Error('Invalid email or password');
    }

    // 3. Clear failed attempts on successful login
    await clearLoginAttempts(normalizedEmail);

    // 4. Generate Access Token (JWT)
    const { accessToken } = signAccessToken({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role
    });

    // 5. Generate Refresh Token (Opaque string stored hashed)
    const rawRefreshToken = generateRandomToken();
    const tokenHash = hashToken(rawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

    await db.insert(schema.refreshTokens).values({
      userId: user.id,
      tokenHash,
      expiresAt
    });

    return {
      loginResponse: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId
        },
        accessToken
      },
      refreshToken: rawRefreshToken
    };
  }

  static async refreshTokens(rawRefreshToken: string): Promise<{
    accessToken: string;
    newRefreshToken: string;
  }> {
    const tokenHash = hashToken(rawRefreshToken);
    const now = new Date();

    // 1. Find matching valid refresh token in DB
    const [existingToken] = await db
      .select()
      .from(schema.refreshTokens)
      .where(
        and(
          eq(schema.refreshTokens.tokenHash, tokenHash),
          isNull(schema.refreshTokens.revokedAt),
          gt(schema.refreshTokens.expiresAt, now)
        )
      );

    if (!existingToken) {
      throw new Error('Invalid or expired refresh token');
    }

    // 2. Fetch associated user
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, existingToken.userId));

    if (!user) {
      throw new Error('User not found');
    }

    // 3. Rotate Refresh Token: Revoke old token
    await db
      .update(schema.refreshTokens)
      .set({ revokedAt: now })
      .where(eq(schema.refreshTokens.id, existingToken.id));

    // 4. Issue new tokens
    const { accessToken } = signAccessToken({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role
    });

    const newRawRefreshToken = generateRandomToken();
    const newTokenHash = hashToken(newRawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

    await db.insert(schema.refreshTokens).values({
      userId: user.id,
      tokenHash: newTokenHash,
      expiresAt
    });

    return {
      accessToken,
      newRefreshToken: newRawRefreshToken
    };
  }

  static async logout(
    rawAccessToken: string,
    rawRefreshToken?: string
  ): Promise<void> {
    // 1. Revoke Refresh Token in DB if provided
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await db
        .update(schema.refreshTokens)
        .set({ revokedAt: new Date() })
        .where(eq(schema.refreshTokens.tokenHash, tokenHash));
    }

    // 2. Blacklist Access Token JTI in Redis
    try {
      const decoded = verifyAccessToken(rawAccessToken);
      const remainingTtl = getRemainingTtlSeconds(decoded);

      if (remainingTtl > 0 && redisClient.isOpen) {
        await redisClient.setEx(`blacklist:${decoded.jti}`, remainingTtl, 'true');
      }
    } catch (error) {
      // If access token is already expired/invalid, no blacklist needed
    }
  }
}
