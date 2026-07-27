import { Router } from 'express';
import { PropertyController } from './property.controller.js';
import { authenticate } from '../../../../middleware/auth.js';
import { roleGuard } from '../../../../middleware/roleGuard.js';

export const propertyRouter = Router();

propertyRouter.use(authenticate);

propertyRouter.get('/', PropertyController.list);
propertyRouter.post('/', roleGuard('admin', 'agent'), PropertyController.create);
propertyRouter.get('/:id', PropertyController.getById);
propertyRouter.patch('/:id', roleGuard('admin', 'agent'), PropertyController.update);
propertyRouter.delete('/:id', roleGuard('admin', 'agent'), PropertyController.delete);
