import { UserRole } from '@asta-rental/shared';

export interface TokenServicePort {
  signAccessToken(params: { userId: string; organizationId: string; role: UserRole; email: string }): {
    accessToken: string;
    jti: string;
  };
  verifyAccessToken(token: string): {
    sub: string;
    org: string;
    role: UserRole;
    email: string;
    jti: string;
    exp?: number;
  };
  generateRandomToken(): string;
  hashToken(token: string): string;
  comparePassword(plain: string, hash: string): Promise<boolean>;
  blacklistAccessToken(jti: string, remainingTtlSeconds: number): Promise<void>;
  isAccessTokenBlacklisted(jti: string): Promise<boolean>;
  recordFailedLogin(email: string): Promise<void>;
  clearFailedLogin(email: string): Promise<void>;
  isLoginBlocked(email: string): Promise<boolean>;
}
