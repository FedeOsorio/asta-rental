import { Router } from 'express';
import { MaintenanceController } from './maintenance.controller.js';
import { authenticate } from '../../../../middleware/auth.js';

export const maintenanceRouter = Router();

// Webhook is public (simulating Twilio/Meta calling our API)
maintenanceRouter.post('/webhook', MaintenanceController.processWebhook);

// Get tickets is protected
maintenanceRouter.get('/tickets', authenticate, MaintenanceController.getTickets);
