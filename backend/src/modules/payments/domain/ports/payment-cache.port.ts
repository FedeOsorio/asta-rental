import { CollectionDashboard } from '@asta-rental/shared';

export interface PaymentCachePort {
  getDashboardMetrics(organizationId: string): Promise<CollectionDashboard | null>;
  setDashboardMetrics(organizationId: string, data: CollectionDashboard, ttlSeconds?: number): Promise<void>;
  invalidateDashboardMetrics(organizationId: string): Promise<void>;
}
