import { Request, Response, NextFunction } from 'express';
import { loginSchema } from '@asta-rental/shared';
import { env } from '../../../../config/env.js';
import { DrizzleAuthRepository } from '../persistence/drizzle-auth.repository.js';
import { JwtTokenService } from '../security/jwt-token.service.js';
import { LoginUseCase } from '../../application/use-cases/login.use-case.js';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case.js';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case.js';

const COOKIE_NAME = 'refresh_token';

const authRepo = new DrizzleAuthRepository();
const tokenService = new JwtTokenService();

const loginUseCase = new LoginUseCase(authRepo, tokenService);
const refreshTokenUseCase = new RefreshTokenUseCase(authRepo, tokenService);
const logoutUseCase = new LogoutUseCase(authRepo, tokenService);

function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/auth'
  });
}

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = loginSchema.parse(req.body);
      const { loginResponse, refreshToken } = await loginUseCase.execute(validatedInput);

      setRefreshTokenCookie(res, refreshToken);
      res.status(200).json(loginResponse);
    } catch (error: any) {
      if (error.message === 'TOO_MANY_REQUESTS') {
        res.status(429).json({ error: 'Too Many Requests: Please try again in 15 minutes' });
        return;
      }
      if (error.message === 'INVALID_CREDENTIALS') {
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;
      if (!refreshToken) {
        res.status(401).json({ error: 'Refresh token is required' });
        return;
      }

      const { accessToken, newRefreshToken } = await refreshTokenUseCase.execute(refreshToken);

      setRefreshTokenCookie(res, newRefreshToken);
      res.status(200).json({ accessToken });
    } catch (error: any) {
      clearRefreshTokenCookie(res);
      res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawAccessToken = req.user?.rawToken || req.headers.authorization?.split(' ')[1] || '';
      const refreshToken = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;

      if (rawAccessToken) {
        await logoutUseCase.execute(rawAccessToken, refreshToken);
      }

      clearRefreshTokenCookie(res);
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  static me(req: Request, res: Response): void {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    res.status(200).json({
      userId: req.user.userId,
      organizationId: req.user.organizationId,
      role: req.user.role
    });
  }
}
