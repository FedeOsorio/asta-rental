import { redisClient } from '../../../../utils/redis.js';
import { PaymentCachePort } from '../../domain/ports/payment-cache.port.js';
import { CollectionDashboard } from '@asta-rental/shared';

export class RedisDashboardCacheAdapter implements PaymentCachePort {
  private getKey(organizationId: string): string {
    return `dashboard:collection:${organizationId}`;
  }

  async getDashboardMetrics(organizationId: string): Promise<CollectionDashboard | null> {
    if (!redisClient.isOpen) return null;
    try {
      const dataStr = await redisClient.get(this.getKey(organizationId));
      if (!dataStr) return null;
      return JSON.parse(dataStr);
    } catch (error) {
      console.error('Redis Get Cache Error:', error);
      return null;
    }
  }

  async setDashboardMetrics(
    organizationId: string,
    data: CollectionDashboard,
    ttlSeconds = 60
  ): Promise<void> {
    if (!redisClient.isOpen) return;
    try {
      await redisClient.setEx(this.getKey(organizationId), ttlSeconds, JSON.stringify(data));
    } catch (error) {
      console.error('Redis Set Cache Error:', error);
    }
  }

  async invalidateDashboardMetrics(organizationId: string): Promise<void> {
    if (!redisClient.isOpen) return;
    try {
      await redisClient.del(this.getKey(organizationId));
    } catch (error) {
      console.error('Redis Del Cache Error:', error);
    }
  }
}
