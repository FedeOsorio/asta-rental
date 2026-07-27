import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { redisClient } from '../utils/redis.js';

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);

    // Check Redis token blacklist
    if (redisClient.isOpen) {
      const isBlacklisted = await redisClient.get(`blacklist:${decoded.jti}`);
      if (isBlacklisted) {
        res.status(401).json({ error: 'Unauthorized: Token has been revoked' });
        return;
      }
    }

    req.user = {
      userId: decoded.sub,
      organizationId: decoded.org,
      role: decoded.role,
      jti: decoded.jti,
      rawToken: token
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}
