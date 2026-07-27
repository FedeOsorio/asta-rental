import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../utils/redis.js';

const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_WINDOW_SECONDS = 15 * 60; // 15 minutes

export async function loginRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    next();
    return;
  }

  const key = `login:attempts:${email.toLowerCase().trim()}`;

  try {
    if (!redisClient.isOpen) {
      next();
      return;
    }

    const attemptsStr = await redisClient.get(key);
    const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;

    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      const ttl = await redisClient.ttl(key);
      res.status(429).json({
        error: 'Too Many Requests',
        message: `Too many failed login attempts. Please try again in ${Math.ceil(
          ttl / 60
        )} minutes.`
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Rate Limiter Error:', error);
    next();
  }
}

export async function recordFailedLoginAttempt(email: string): Promise<void> {
  if (!redisClient.isOpen) return;

  const key = `login:attempts:${email.toLowerCase().trim()}`;
  try {
    const attempts = await redisClient.incr(key);
    if (attempts === 1) {
      await redisClient.expire(key, BLOCK_WINDOW_SECONDS);
    }
  } catch (error) {
    console.error('Record Failed Login Error:', error);
  }
}

export async function clearLoginAttempts(email: string): Promise<void> {
  if (!redisClient.isOpen) return;

  const key = `login:attempts:${email.toLowerCase().trim()}`;
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Clear Login Attempts Error:', error);
  }
}
