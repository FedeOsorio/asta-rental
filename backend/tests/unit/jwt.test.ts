import { describe, it, expect } from 'vitest';
import { signAccessToken, verifyAccessToken, getRemainingTtlSeconds } from '../../src/utils/jwt.js';

describe('JWT Utilities', () => {
  const sampleParams = {
    userId: '11111111-1111-1111-1111-111111111111',
    organizationId: '22222222-2222-2222-2222-222222222222',
    role: 'admin' as const
  };

  it('should sign and verify access token correctly', () => {
    const { accessToken, jti } = signAccessToken(sampleParams);

    expect(accessToken).toBeDefined();
    expect(jti).toBeDefined();

    const decoded = verifyAccessToken(accessToken);
    expect(decoded.sub).toBe(sampleParams.userId);
    expect(decoded.org).toBe(sampleParams.organizationId);
    expect(decoded.role).toBe(sampleParams.role);
    expect(decoded.jti).toBe(jti);
  });

  it('should throw an error when verifying an invalid token', () => {
    expect(() => verifyAccessToken('invalid.jwt.token')).toThrow();
  });

  it('should calculate remaining TTL in seconds', () => {
    const { accessToken } = signAccessToken(sampleParams);
    const decoded = verifyAccessToken(accessToken);
    const ttl = getRemainingTtlSeconds(decoded);

    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(900); // 15 minutes = 900s
  });
});
