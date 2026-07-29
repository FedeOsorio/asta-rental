import { Request, Response } from 'express';
import { ProcessWebhookUseCase } from '../../application/use-cases/process-webhook.use-case.js';
import { MockAiAdapter } from '../../../ai/infrastructure/adapters/mock-ai.adapter.js';
import { withTenantDb, db } from '../../../../db/index.js';
import * as schema from '../../../../db/schema.js';
import { eq, desc } from 'drizzle-orm';

const aiAgent = new MockAiAdapter();
const processWebhookUseCase = new ProcessWebhookUseCase(aiAgent);

export class MaintenanceController {
  static async processWebhook(req: Request, res: Response): Promise<void> {
    try {
      // In a real WhatsApp webhook, organizationId would be deduced from the recipient phone number.
      // For the portfolio demo, we'll pass it in the body.
      let organizationId = req.body?.organizationId || req.user?.organizationId;
      const renterEmail = req.body?.renterEmail || req.user?.email || 'demo@renter.com';
      const messageText = req.body?.messageText || 'Tengo una filtración de agua en el baño';

      if (!organizationId) {
        const [firstOrg] = await db.select().from(schema.organizations).limit(1);
        organizationId = firstOrg?.id;
      }

      if (!organizationId) {
        res.status(400).json({ error: 'Missing organizationId' });
        return;
      }

      // Non-blocking background processing
      processWebhookUseCase.execute(organizationId, renterEmail, messageText).catch(err => {
        console.error('Webhook processing failed:', err);
      });

      res.status(202).json({ success: true, message: 'Webhook received and processing started' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getTickets(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.user!.organizationId;
      const tickets = await withTenantDb(organizationId, async (tenantDb) => {
        return tenantDb
          .select({
            id: schema.maintenanceTickets.id,
            description: schema.maintenanceTickets.description,
            urgency: schema.maintenanceTickets.urgency,
            category: schema.maintenanceTickets.category,
            status: schema.maintenanceTickets.status,
            createdAt: schema.maintenanceTickets.createdAt,
            renterName: schema.renters.fullName
          })
          .from(schema.maintenanceTickets)
          .leftJoin(schema.renters, eq(schema.maintenanceTickets.renterId, schema.renters.id))
          .orderBy(desc(schema.maintenanceTickets.createdAt));
      });
      res.json(tickets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
