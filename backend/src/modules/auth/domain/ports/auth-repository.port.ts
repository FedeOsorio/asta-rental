import { UserEntity } from '../user.entity.js';
import { RefreshTokenEntity } from '../refresh-token.entity.js';

export interface AuthRepositoryPort {
  findUserByEmail(email: string): Promise<UserEntity | null>;
  findUserById(id: string): Promise<UserEntity | null>;
  saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<RefreshTokenEntity>;
  findRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenEntity | null>;
  revokeRefreshToken(tokenId: string): Promise<void>;
  revokeRefreshTokenByHash(tokenHash: string): Promise<void>;
}
