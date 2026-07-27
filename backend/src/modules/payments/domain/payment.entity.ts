import { PaymentStatus } from '@asta-rental/shared';

export class PaymentEntity {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly contractId: string,
    public readonly dueDate: string,
    public readonly paidDate: string | null,
    public readonly amount: number,
    public readonly status: PaymentStatus,
    public readonly createdAt: Date
  ) {}

  public isPending(): boolean {
    return this.status === 'pending';
  }

  public isOverdue(): boolean {
    return this.status === 'overdue';
  }
}
