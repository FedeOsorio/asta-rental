import { describe, it, expect } from 'vitest';
import { generateRandomToken, hashToken } from '../../src/utils/crypto.js';

describe('Crypto Utilities', () => {
  it('should generate a 64-character hex random token (256-bit)', () => {
    const token = generateRandomToken();
    expect(token).toBeDefined();
    expect(token).toHaveLength(64);
  });

  it('should generate different random tokens on each invocation', () => {
    const token1 = generateRandomToken();
    const token2 = generateRandomToken();
    expect(token1).not.toEqual(token2);
  });

  it('should hash a token deterministically using SHA-256', () => {
    const raw = 'test-token-123';
    const hash1 = hashToken(raw);
    const hash2 = hashToken(raw);

    expect(hash1).toEqual(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 output is 64 hex characters
  });
});
