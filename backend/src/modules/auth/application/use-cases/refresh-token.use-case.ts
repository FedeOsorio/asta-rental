import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port.js';
import { TokenServicePort } from '../../domain/ports/token-service.port.js';

const REFRESH_TOKEN_DAYS = 7;

export class RefreshTokenUseCase {
  constructor(
    private readonly authRepo: AuthRepositoryPort,
    private readonly tokenService: TokenServicePort
  ) {}

  async execute(rawRefreshToken: string): Promise<{
    accessToken: string;
    newRefreshToken: string;
  }> {
    const tokenHash = this.tokenService.hashToken(rawRefreshToken);
    const existingToken = await this.authRepo.findRefreshTokenByHash(tokenHash);

    if (!existingToken || !existingToken.isValid()) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    const user = await this.authRepo.findUserById(existingToken.userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Token Rotation: Revoke old token
    await this.authRepo.revokeRefreshToken(existingToken.id);

    // Generate new tokens
    const { accessToken } = this.tokenService.signAccessToken({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role
    });

    const newRawRefreshToken = this.tokenService.generateRandomToken();
    const newTokenHash = this.tokenService.hashToken(newRawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

    await this.authRepo.saveRefreshToken(user.id, newTokenHash, expiresAt);

    return {
      accessToken,
      newRefreshToken: newRawRefreshToken
    };
  }
}
