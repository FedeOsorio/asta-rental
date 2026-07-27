import { PropertyType, PropertyStatus } from '@asta-rental/shared';

export class PropertyEntity {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly address: string,
    public readonly type: PropertyType,
    public readonly monthlyRent: number,
    public readonly status: PropertyStatus,
    public readonly deletedAt: Date | null,
    public readonly createdAt: Date
  ) {}

  public isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  public isAvailable(): boolean {
    return this.status === 'available' && !this.isDeleted();
  }
}
