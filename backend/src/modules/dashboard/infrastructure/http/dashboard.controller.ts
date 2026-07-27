import { Request, Response, NextFunction } from 'express';
import { DrizzlePaymentRepository } from '../../../payments/infrastructure/persistence/drizzle-payment.repository.js';
import { RedisDashboardCacheAdapter } from '../../../payments/infrastructure/cache/redis-dashboard-cache.adapter.js';
import { GetCollectionDashboardUseCase } from '../../application/use-cases/get-collection-dashboard.use-case.js';

const paymentRepo = new DrizzlePaymentRepository();
const paymentCache = new RedisDashboardCacheAdapter();

const getCollectionDashboardUseCase = new GetCollectionDashboardUseCase(paymentRepo, paymentCache);

export class DashboardController {
  static async getCollectionStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await getCollectionDashboardUseCase.execute(req.user!.organizationId);
      res.status(200).json(metrics);
    } catch (error) {
      next(error);
    }
  }
}
