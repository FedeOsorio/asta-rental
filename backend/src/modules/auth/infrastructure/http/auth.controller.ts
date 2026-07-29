import { Request, Response, NextFunction } from 'express';
import { loginSchema } from '@asta-rental/shared';
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
    secure: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/'
  });
}

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = loginSchema.parse(req.body);
      const { loginResponse, refreshToken } = await loginUseCase.execute(validatedInput);

      setRefreshTokenCookie(res, refreshToken);
      res.status(200).json({
        ...loginResponse,
        refreshToken
      });
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

  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.body?.refreshToken || req.cookies?.[COOKIE_NAME];
      if (!refreshToken) {
        res.status(401).json({ error: 'Refresh token is required' });
        return;
      }

      const { accessToken, newRefreshToken } = await refreshTokenUseCase.execute(refreshToken);

      setRefreshTokenCookie(res, newRefreshToken);
      res.status(200).json({ accessToken, refreshToken: newRefreshToken });
    } catch (error: any) {
      console.error('[Auth] Refresh token failed:', error.message || error);
      let debugInfo: any = {};
      
      if (error.message === 'INVALID_REFRESH_TOKEN') {
        const refreshToken = req.body?.refreshToken || req.cookies?.[COOKIE_NAME];
        debugInfo.receivedTokenLength = refreshToken?.length;
        debugInfo.receivedTokenStart = refreshToken?.substring(0, 10);
        debugInfo.fromCookie = !!req.cookies?.[COOKIE_NAME];
        debugInfo.fromBody = !!req.body?.refreshToken;
        
        try {
          const { db } = await import('../../../../db/index.js');
          const schema = await import('../../../../db/schema.js');
          const { eq } = await import('drizzle-orm');
          const tokenService = new (await import('../security/jwt-token.service.js')).JwtTokenService();
          
          const hash = refreshToken ? tokenService.hashToken(refreshToken) : 'none';
          const [row] = await db.select().from(schema.refreshTokens).where(eq(schema.refreshTokens.tokenHash, hash));
          
          debugInfo.foundInDb = !!row;
          if (row) {
             debugInfo.expiresAt = row.expiresAt;
             debugInfo.revokedAt = row.revokedAt;
             debugInfo.now = new Date();
             debugInfo.isExpired = row.expiresAt < new Date();
          }
        } catch (e: any) {
           debugInfo.dbError = e.message;
        }
      }

      clearRefreshTokenCookie(res);
      res.status(401).json({ error: 'Invalid or expired refresh token', debug: debugInfo });
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

  static async me(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    try {
      const { db } = await import('../../../../db/index.js');
      const schema = await import('../../../../db/schema.js');
      const { eq } = await import('drizzle-orm');

      const [organization] = await db
        .select({ name: schema.organizations.name })
        .from(schema.organizations)
        .where(eq(schema.organizations.id, req.user.organizationId));

      res.status(200).json({
        userId: req.user.userId,
        organizationId: req.user.organizationId,
        organizationName: organization?.name || 'Unknown Organization',
        role: req.user.role,
        email: req.user.email
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  }
}
