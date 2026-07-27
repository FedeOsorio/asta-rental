import { ContractStatus } from '@asta-rental/shared';

export class ContractEntity {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly propertyId: string,
    public readonly renterId: string,
    public readonly startDate: string,
    public readonly endDate: string,
    public readonly monthlyRent: number,
    public readonly status: ContractStatus,
    public readonly createdAt: Date
  ) {}

  public isActive(): boolean {
    return this.status === 'active';
  }
}
