import { UserRole } from '@asta-rental/shared';

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly role: UserRole,
    public readonly createdAt: Date
  ) {}
}
