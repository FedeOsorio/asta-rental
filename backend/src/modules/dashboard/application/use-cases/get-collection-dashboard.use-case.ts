import { PaymentRepositoryPort } from '../../../payments/domain/ports/payment-repository.port.js';
import { PaymentCachePort } from '../../../payments/domain/ports/payment-cache.port.js';
import { CollectionDashboard } from '@asta-rental/shared';

export class GetCollectionDashboardUseCase {
  constructor(
    private readonly paymentRepo: PaymentRepositoryPort,
    private readonly paymentCache: PaymentCachePort
  ) {}

  async execute(organizationId: string): Promise<CollectionDashboard> {
    // 1. Attempt reading from Redis cache
    const cachedData = await this.paymentCache.getDashboardMetrics(organizationId);
    if (cachedData) {
      return cachedData;
    }

    // 2. Cache miss: calculate aggregates from PostgreSQL with RLS
    const metrics = await this.paymentRepo.calculateDashboardMetrics(organizationId);

    // 3. Save result to Redis cache with 60s TTL
    await this.paymentCache.setDashboardMetrics(organizationId, metrics, 60);

    return metrics;
  }
}
