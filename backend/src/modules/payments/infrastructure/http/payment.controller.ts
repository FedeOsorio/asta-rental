import { Request, Response, NextFunction } from 'express';
import { markPaymentPaidSchema, PaymentStatus } from '@asta-rental/shared';
import { DrizzlePaymentRepository } from '../persistence/drizzle-payment.repository.js';
import { RedisDashboardCacheAdapter } from '../cache/redis-dashboard-cache.adapter.js';
import { ListPaymentsUseCase } from '../../application/use-cases/list-payments.use-case.js';
import { MarkPaymentPaidUseCase } from '../../application/use-cases/mark-payment-paid.use-case.js';
import { RunOverdueMaintenanceUseCase } from '../../application/use-cases/run-overdue-maintenance.use-case.js';

const paymentRepo = new DrizzlePaymentRepository();
const paymentCache = new RedisDashboardCacheAdapter();

const listPaymentsUseCase = new ListPaymentsUseCase(paymentRepo);
const markPaymentPaidUseCase = new MarkPaymentPaidUseCase(paymentRepo, paymentCache);
const runOverdueMaintenanceUseCase = new RunOverdueMaintenanceUseCase(paymentRepo);

export class PaymentController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const statusFilter = req.query.status as PaymentStatus | undefined;
      const payments = await listPaymentsUseCase.execute(req.user!.organizationId, statusFilter);
      res.status(200).json(payments);
    } catch (error) {
      next(error);
    }
  }

  static async markPaid(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = markPaymentPaidSchema.parse(req.body);
      const updated = await markPaymentPaidUseCase.execute(
        req.user!.organizationId,
        req.params.id,
        validatedInput.paidDate
      );
      res.status(200).json(updated);
    } catch (error: any) {
      if (error.message === 'PAYMENT_NOT_FOUND') {
        res.status(404).json({ error: 'Payment not found' });
        return;
      }
      next(error);
    }
  }

  static async runMaintenance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await runOverdueMaintenanceUseCase.execute(req.user!.organizationId);
      res.status(200).json({
        message: 'Overdue maintenance job executed successfully',
        updatedPaymentsCount: result.updatedCount
      });
    } catch (error) {
      next(error);
    }
  }
}
