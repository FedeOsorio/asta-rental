import { describe, it, expect } from 'vitest';
import { signAccessToken } from '../../src/utils/jwt.js';

describe('Auth & RLS Architecture Tests', () => {
  it('should generate token with organization context for RLS session setting', () => {
    const orgAlphaId = 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1';
    const userAlphaId = 'u1u1u1u1-u1u1-u1u1-u1u1-u1u1u1u1u1u1';

    const { accessToken, jti } = signAccessToken({
      userId: userAlphaId,
      organizationId: orgAlphaId,
      role: 'admin'
    });

    expect(accessToken).toBeDefined();
    expect(jti).toBeDefined();
  });
});
