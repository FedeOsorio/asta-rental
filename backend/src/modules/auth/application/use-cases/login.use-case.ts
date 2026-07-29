import { AuthRepositoryPort } from '../../domain/ports/auth-repository.port.js';
import { TokenServicePort } from '../../domain/ports/token-service.port.js';
import { LoginInput, LoginResponse } from '@asta-rental/shared';

const REFRESH_TOKEN_DAYS = 7;

export class LoginUseCase {
  constructor(
    private readonly authRepo: AuthRepositoryPort,
    private readonly tokenService: TokenServicePort
  ) {}

  async execute(input: LoginInput): Promise<{
    loginResponse: LoginResponse;
    refreshToken: string;
  }> {
    const email = input.email.toLowerCase().trim();

    // 1. Check Rate Limiter
    const isBlocked = await this.tokenService.isLoginBlocked(email);
    if (isBlocked) {
      throw new Error('TOO_MANY_REQUESTS');
    }

    // 2. Find User
    const user = await this.authRepo.findUserByEmail(email);
    if (!user) {
      await this.tokenService.recordFailedLogin(email);
      throw new Error('INVALID_CREDENTIALS');
    }

    // 3. Compare Password
    const isValid = await this.tokenService.comparePassword(input.password, user.passwordHash);
    if (!isValid) {
      await this.tokenService.recordFailedLogin(email);
      throw new Error('INVALID_CREDENTIALS');
    }

    // 4. Reset Failed Login Attempts
    await this.tokenService.clearFailedLogin(email);

    // Fetch org name for UI (directly via db, simple query)
    const { db } = await import('../../../../db/index.js');
    const schema = await import('../../../../db/schema.js');
    const { eq } = await import('drizzle-orm');
    
    const [organization] = await db
      .select({ name: schema.organizations.name })
      .from(schema.organizations)
      .where(eq(schema.organizations.id, user.organizationId));

    const organizationName = organization?.name || 'Unknown Organization';

    // 5. Issue Access Token
    const { accessToken } = this.tokenService.signAccessToken({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role,
      email: user.email
    });

    // 6. Issue Refresh Token
    const rawRefreshToken = this.tokenService.generateRandomToken();
    const tokenHash = this.tokenService.hashToken(rawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

    await this.authRepo.saveRefreshToken(user.id, tokenHash, expiresAt);

    return {
      loginResponse: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          organizationName
        },
        accessToken
      },
      refreshToken: rawRefreshToken
    };
  }
}
