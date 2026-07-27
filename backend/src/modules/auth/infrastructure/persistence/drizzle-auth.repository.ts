import { eq } from 'drizzle-orm';
import { db } from '../../../../db/index.js';
import * as schema from '../../../../db/schema.js';
import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port.js';
import { UserEntity } from '../../domain/user.entity.js';
import { RefreshTokenEntity } from '../../domain/refresh-token.entity.js';

export class DrizzleAuthRepository implements AuthRepositoryPort {
  async findUserByEmail(email: string): Promise<UserEntity | null> {
    const [row] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase().trim()));

    if (!row) return null;

    return new UserEntity(
      row.id,
      row.organizationId,
      row.email,
      row.passwordHash,
      row.role,
      row.createdAt
    );
  }

  async findUserById(id: string): Promise<UserEntity | null> {
    const [row] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));

    if (!row) return null;

    return new UserEntity(
      row.id,
      row.organizationId,
      row.email,
      row.passwordHash,
      row.role,
      row.createdAt
    );
  }

  async saveRefreshToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date
  ): Promise<RefreshTokenEntity> {
    const [row] = await db
      .insert(schema.refreshTokens)
      .values({
        userId,
        tokenHash,
        expiresAt
      })
      .returning();

    return new RefreshTokenEntity(
      row.id,
      row.userId,
      row.tokenHash,
      row.expiresAt,
      row.revokedAt,
      row.createdAt
    );
  }

  async findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenEntity | null> {
    const [row] = await db
      .select()
      .from(schema.refreshTokens)
      .where(eq(schema.refreshTokens.tokenHash, tokenHash));

    if (!row) return null;

    return new RefreshTokenEntity(
      row.id,
      row.userId,
      row.tokenHash,
      row.expiresAt,
      row.revokedAt,
      row.createdAt
    );
  }

  async revokeRefreshToken(tokenId: string): Promise<void> {
    await db
      .update(schema.refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(schema.refreshTokens.id, tokenId));
  }

  async revokeRefreshTokenByHash(tokenHash: string): Promise<void> {
    await db
      .update(schema.refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(schema.refreshTokens.tokenHash, tokenHash));
  }
}
