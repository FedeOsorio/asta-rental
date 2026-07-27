import { PaymentRepositoryPort } from '../../domain/ports/payment-repository.port.js';
import { PaymentEntity } from '../../domain/payment.entity.js';
import { PaymentStatus } from '@asta-rental/shared';

export class ListPaymentsUseCase {
  constructor(private readonly paymentRepo: PaymentRepositoryPort) {}

  async execute(organizationId: string, statusFilter?: PaymentStatus): Promise<PaymentEntity[]> {
    return this.paymentRepo.findAll(organizationId, statusFilter);
  }
}
