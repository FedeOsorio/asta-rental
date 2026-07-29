import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { env } from '../../../../config/env.js';
import { redisClient } from '../../../../utils/redis.js';
import { TokenServicePort } from '../../domain/ports/token-service.port.js';
import { AuthPayload, UserRole } from '@asta-rental/shared';

const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_WINDOW_SECONDS = 15 * 60; // 15 minutes

export class JwtTokenService implements TokenServicePort {
  signAccessToken(params: { userId: string; organizationId: string; role: UserRole; email: string }): {
    accessToken: string;
    jti: string;
  } {
    const jti = uuidv4();
    const payload: AuthPayload = {
      sub: params.userId,
      org: params.organizationId,
      role: params.role,
      email: params.email,
      jti
    };

    const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn']
    });

    return { accessToken, jti };
  }

  verifyAccessToken(token: string): {
    sub: string;
    org: string;
    role: UserRole;
    email: string;
    jti: string;
    exp?: number;
  } {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
  }

  generateRandomToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  async blacklistAccessToken(jti: string, remainingTtlSeconds: number): Promise<void> {
    if (redisClient.isOpen && remainingTtlSeconds > 0) {
      await redisClient.setEx(`blacklist:${jti}`, remainingTtlSeconds, 'true');
    }
  }

  async isAccessTokenBlacklisted(jti: string): Promise<boolean> {
    if (!redisClient.isOpen) return false;
    const exists = await redisClient.get(`blacklist:${jti}`);
    return !!exists;
  }

  async recordFailedLogin(email: string): Promise<void> {
    if (!redisClient.isOpen) return;
    const key = `login:attempts:${email.toLowerCase().trim()}`;
    const attempts = await redisClient.incr(key);
    if (attempts === 1) {
      await redisClient.expire(key, BLOCK_WINDOW_SECONDS);
    }
  }

  async clearFailedLogin(email: string): Promise<void> {
    if (!redisClient.isOpen) return;
    const key = `login:attempts:${email.toLowerCase().trim()}`;
    await redisClient.del(key);
  }

  async isLoginBlocked(email: string): Promise<boolean> {
    if (!redisClient.isOpen) return false;
    const key = `login:attempts:${email.toLowerCase().trim()}`;
    const attemptsStr = await redisClient.get(key);
    const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
    return attempts >= MAX_LOGIN_ATTEMPTS;
  }
}
