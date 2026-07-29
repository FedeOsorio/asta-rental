import { Request, Response } from 'express';
import { GenerateOverdueDraftsUseCase } from '../../application/use-cases/generate-overdue-drafts.use-case.js';
import { MockAiAdapter } from '../../../ai/infrastructure/adapters/mock-ai.adapter.js';
import { withTenantDb } from '../../../../db/index.js';
import * as schema from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';

// In a real app with DI, you would inject this. For the portfolio, we instantiate the mock directly.
const aiAgent = new MockAiAdapter();
const generateDraftsUseCase = new GenerateOverdueDraftsUseCase(aiAgent);

export class CommunicationsController {
  static async generateDrafts(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.user!.organizationId;
      const result = await generateDraftsUseCase.execute(organizationId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getDrafts(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.user!.organizationId;
      const drafts = await withTenantDb(organizationId, async (tenantDb) => {
        return tenantDb
          .select({
            id: schema.communications.id,
            type: schema.communications.type,
            content: schema.communications.content,
            status: schema.communications.status,
            createdAt: schema.communications.createdAt,
            renterName: schema.renters.fullName
          })
          .from(schema.communications)
          .innerJoin(schema.renters, eq(schema.communications.renterId, schema.renters.id))
          .where(eq(schema.communications.status, 'draft'));
      });
      res.json(drafts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async approveDraft(req: Request, res: Response): Promise<void> {
    try {
      const organizationId = req.user!.organizationId;
      const { id } = req.params;
      const { content } = req.body;

      await withTenantDb(organizationId, async (tenantDb) => {
        const updateData: any = { status: 'approved' };
        if (content) {
          updateData.content = content;
        }

        await tenantDb
          .update(schema.communications)
          .set(updateData)
          .where(eq(schema.communications.id, id));
        // In a real scenario, this would trigger an email or WhatsApp API call
      });
      
      res.json({ success: true, message: 'Draft approved and "sent".' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
