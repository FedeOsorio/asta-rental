import { Router } from 'express';
import { ContractController } from './contract.controller.js';
import { authenticate } from '../../../../middleware/auth.js';
import { roleGuard } from '../../../../middleware/roleGuard.js';

export const contractRouter = Router();

contractRouter.use(authenticate);

contractRouter.post('/', roleGuard('admin', 'agent'), ContractController.create);
contractRouter.get('/:id', ContractController.getById);
contractRouter.patch('/:id/terminate', roleGuard('admin', 'agent'), ContractController.terminate);
