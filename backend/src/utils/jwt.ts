import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env.js';
import { AuthPayload, UserRole } from '@asta-rental/shared';

export interface SignAccessTokenParams {
  userId: string;
  organizationId: string;
  role: UserRole;
  email: string;
}

export function signAccessToken({ userId, organizationId, role, email }: SignAccessTokenParams): {
  accessToken: string;
  jti: string;
} {
  const jti = uuidv4();
  const payload: AuthPayload = {
    sub: userId,
    org: organizationId,
    role,
    email,
    jti
  };

  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn']
  });

  return { accessToken, jti };
}

export function verifyAccessToken(token: string): jwt.JwtPayload & AuthPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload & AuthPayload;
  return decoded;
}

export function getRemainingTtlSeconds(decoded: jwt.JwtPayload): number {
  if (!decoded.exp) return 900; // 15 minutes fallback
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const remaining = decoded.exp - nowInSeconds;
  return remaining > 0 ? remaining : 0;
}
