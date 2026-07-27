import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port.js';
import { TokenServicePort } from '../../domain/ports/token-service.port.js';

export class LogoutUseCase {
  constructor(
    private readonly authRepo: AuthRepositoryPort,
    private readonly tokenService: TokenServicePort
  ) {}

  async execute(rawAccessToken: string, rawRefreshToken?: string): Promise<void> {
    // 1. Revoke Refresh Token in DB if present
    if (rawRefreshToken) {
      const tokenHash = this.tokenService.hashToken(rawRefreshToken);
      await this.authRepo.revokeRefreshTokenByHash(tokenHash);
    }

    // 2. Blacklist Access Token in Redis
    try {
      const decoded = this.tokenService.verifyAccessToken(rawAccessToken);
      if (decoded.exp) {
        const remainingTtl = decoded.exp - Math.floor(Date.now() / 1000);
        if (remainingTtl > 0) {
          await this.tokenService.blacklistAccessToken(decoded.jti, remainingTtl);
        }
      }
    } catch {
      // Access token already expired or malformed
    }
  }
}
