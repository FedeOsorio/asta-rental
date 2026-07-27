export class RefreshTokenEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly tokenHash: string,
    public readonly expiresAt: Date,
    public readonly revokedAt: Date | null,
    public readonly createdAt: Date
  ) {}

  public isExpired(now: Date = new Date()): boolean {
    return this.expiresAt < now;
  }

  public isRevoked(): boolean {
    return this.revokedAt !== null;
  }

  public isValid(now: Date = new Date()): boolean {
    return !this.isExpired(now) && !this.isRevoked();
  }
}
