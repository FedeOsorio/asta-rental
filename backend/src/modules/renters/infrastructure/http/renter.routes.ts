import { Router } from 'express';
import { RenterController } from './renter.controller.js';
import { authenticate } from '../../../../middleware/auth.js';
import { roleGuard } from '../../../../middleware/roleGuard.js';

export const renterRouter = Router();

renterRouter.use(authenticate);

renterRouter.get('/', RenterController.list);
renterRouter.post('/', roleGuard('admin', 'agent'), RenterController.create);
renterRouter.get('/:id', RenterController.getById);
renterRouter.patch('/:id', roleGuard('admin', 'agent'), RenterController.update);
renterRouter.delete('/:id', roleGuard('admin', 'agent'), RenterController.delete);
