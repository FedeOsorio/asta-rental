import { Router } from 'express';
import { PaymentController } from './payment.controller.js';
import { authenticate } from '../../../../middleware/auth.js';
import { roleGuard } from '../../../../middleware/roleGuard.js';

export const paymentRouter = Router();

paymentRouter.use(authenticate);

paymentRouter.get('/', PaymentController.list);
paymentRouter.patch('/:id/mark-paid', roleGuard('admin', 'agent'), PaymentController.markPaid);
paymentRouter.post('/maintenance/mark-overdue', roleGuard('admin'), PaymentController.runMaintenance);
