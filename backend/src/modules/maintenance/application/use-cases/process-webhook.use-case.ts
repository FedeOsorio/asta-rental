import { AiAgentPort } from '../../../ai/domain/ports/ai-agent.port.js';
import { withTenantDb } from '../../../../db/index.js';
import * as schema from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';

export class ProcessWebhookUseCase {
  constructor(private readonly aiAgent: AiAgentPort) {}

  async execute(organizationId: string, renterEmail: string, messageText: string): Promise<void> {
    await withTenantDb(organizationId, async (tenantDb) => {
      let [renter] = await tenantDb
        .select()
        .from(schema.renters)
        .where(eq(schema.renters.email, renterEmail))
        .limit(1);

      if (!renter) {
        // Fallback for demo mode: assign to first renter in organization or create one if none exist
        const [firstRenter] = await tenantDb.select().from(schema.renters).limit(1);
        if (firstRenter) {
          renter = firstRenter;
        } else {
          const [newRenter] = await tenantDb.insert(schema.renters).values({
            organizationId,
            fullName: 'Inquilino Demo (WhatsApp)',
            email: renterEmail || 'whatsapp.demo@example.com',
            phone: '+5491199887766'
          }).returning();
          renter = newRenter;
        }
      }

      // Classify the ticket via AI
      const classification = await this.aiAgent.classifyMaintenanceTicket(messageText);

      // Create the ticket
      await tenantDb.insert(schema.maintenanceTickets).values({
        organizationId,
        renterId: renter.id,
        description: messageText,
        urgency: classification.urgency,
        category: classification.category,
        status: 'open'
      });
    });
  }
}
