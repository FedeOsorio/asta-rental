import { Router } from 'express';
import { CommunicationsController } from './communications.controller.js';
import { authenticate } from '../../../../middleware/auth.js';
import { roleGuard } from '../../../../middleware/roleGuard.js';

export const communicationsRouter = Router();

communicationsRouter.use(authenticate);

communicationsRouter.post('/generate-drafts', roleGuard('admin'), CommunicationsController.generateDrafts);
communicationsRouter.get('/drafts', CommunicationsController.getDrafts);
communicationsRouter.patch('/:id/approve', roleGuard('admin'), CommunicationsController.approveDraft);
