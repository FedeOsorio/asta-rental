import crypto from 'crypto';

/**
 * Generate a random 256-bit (32 byte) cryptographically secure hex string.
 */
export function generateRandomToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a plain text token using SHA-256.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
