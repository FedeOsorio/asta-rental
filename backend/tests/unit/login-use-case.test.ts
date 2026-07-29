import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase } from '../../src/modules/auth/application/use-cases/login.use-case.js';
import { AuthRepositoryPort } from '../../src/modules/auth/domain/ports/auth-repository.port.js';
import { TokenServicePort } from '../../src/modules/auth/domain/ports/token-service.port.js';
import { UserEntity } from '../../src/modules/auth/domain/user.entity.js';

describe('LoginUseCase (Hexagonal Unit Test)', () => {
  let mockAuthRepo: AuthRepositoryPort;
  let mockTokenService: TokenServicePort;
  let loginUseCase: LoginUseCase;

  const mockUser = new UserEntity(
    'user-uuid-1',
    'org-uuid-1',
    'test@example.com',
    'hashed-password',
    'admin',
    new Date()
  );

  beforeEach(() => {
    mockAuthRepo = {
      findUserByEmail: vi.fn(),
      findUserById: vi.fn(),
      saveRefreshToken: vi.fn(),
      findRefreshTokenByHash: vi.fn(),
      revokeRefreshToken: vi.fn(),
      revokeRefreshTokenByHash: vi.fn(),
      findOrganizationNameById: vi.fn().mockResolvedValue('Mocked Org')
    };

    mockTokenService = {
      signAccessToken: vi.fn().mockReturnValue({ accessToken: 'access-token-xyz', jti: 'jti-123' }),
      verifyAccessToken: vi.fn(),
      generateRandomToken: vi.fn().mockReturnValue('random-refresh-token'),
      hashToken: vi.fn().mockReturnValue('hashed-refresh-token'),
      comparePassword: vi.fn().mockResolvedValue(true),
      blacklistAccessToken: vi.fn(),
      isAccessTokenBlacklisted: vi.fn(),
      recordFailedLogin: vi.fn(),
      clearFailedLogin: vi.fn(),
      isLoginBlocked: vi.fn().mockResolvedValue(false)
    };

    loginUseCase = new LoginUseCase(mockAuthRepo, mockTokenService);
  });

  it('should authenticate user successfully and issue tokens', async () => {
    vi.mocked(mockAuthRepo.findUserByEmail).mockResolvedValue(mockUser);

    const result = await loginUseCase.execute({
      email: 'test@example.com',
      password: 'validPassword'
    });

    expect(result.loginResponse.accessToken).toBe('access-token-xyz');
    expect(result.refreshToken).toBe('random-refresh-token');
    expect(result.loginResponse.user.email).toBe('test@example.com');
    expect(mockTokenService.clearFailedLogin).toHaveBeenCalledWith('test@example.com');
  });

  it('should throw INVALID_CREDENTIALS when user does not exist', async () => {
    vi.mocked(mockAuthRepo.findUserByEmail).mockResolvedValue(null);

    await expect(
      loginUseCase.execute({
        email: 'unknown@example.com',
        password: 'anyPassword'
      })
    ).rejects.toThrow('INVALID_CREDENTIALS');

    expect(mockTokenService.recordFailedLogin).toHaveBeenCalledWith('unknown@example.com');
  });

  it('should throw TOO_MANY_REQUESTS when login rate limit is exceeded', async () => {
    vi.mocked(mockTokenService.isLoginBlocked).mockResolvedValue(true);

    await expect(
      loginUseCase.execute({
        email: 'blocked@example.com',
        password: 'anyPassword'
      })
    ).rejects.toThrow('TOO_MANY_REQUESTS');
  });
});
