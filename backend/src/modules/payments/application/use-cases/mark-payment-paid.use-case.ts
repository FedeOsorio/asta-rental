import { PaymentRepositoryPort } from '../../domain/ports/payment-repository.port.js';
import { PaymentCachePort } from '../../domain/ports/payment-cache.port.js';
import { PaymentEntity } from '../../domain/payment.entity.js';

export class MarkPaymentPaidUseCase {
  constructor(
    private readonly paymentRepo: PaymentRepositoryPort,
    private readonly paymentCache: PaymentCachePort
  ) {}

  async execute(organizationId: string, id: string, paidDateStr?: string): Promise<PaymentEntity> {
    const payment = await this.paymentRepo.findById(organizationId, id);
    if (!payment) {
      throw new Error('PAYMENT_NOT_FOUND');
    }

    const updated = await this.paymentRepo.markPaid(organizationId, id, paidDateStr);
    if (!updated) {
      throw new Error('PAYMENT_NOT_FOUND');
    }

    // Active cache invalidation for dashboard collection
    await this.paymentCache.invalidateDashboardMetrics(organizationId);

    return updated;
  }
}
