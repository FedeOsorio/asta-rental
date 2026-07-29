import { eq, and } from 'drizzle-orm';
import { withTenantDb } from '../../../../db/index.js';
import * as schema from '../../../../db/schema.js';
import { AiAgentPort } from '../../../ai/domain/ports/ai-agent.port.js';

export class GenerateOverdueDraftsUseCase {
  constructor(private readonly aiAgent: AiAgentPort) {}

  async execute(organizationId: string): Promise<{ generatedCount: number }> {
    let generatedCount = 0;

    await withTenantDb(organizationId, async (tenantDb) => {
      // Find overdue payments that don't have a draft already
      const overduePayments = await tenantDb
        .select({
          paymentId: schema.payments.id,
          amount: schema.payments.amount,
          dueDate: schema.payments.dueDate,
          renterId: schema.renters.id,
          renterName: schema.renters.fullName
        })
        .from(schema.payments)
        .innerJoin(schema.contracts, eq(schema.payments.contractId, schema.contracts.id))
        .innerJoin(schema.renters, eq(schema.contracts.renterId, schema.renters.id))
        .where(eq(schema.payments.status, 'overdue'));

      for (const payment of overduePayments) {
        // Check if draft already exists
        const existingDraft = await tenantDb.query.communications.findFirst({
          where: and(
            eq(schema.communications.renterId, payment.renterId),
            eq(schema.communications.type, 'overdue_notice'),
            eq(schema.communications.status, 'draft')
          )
        });

        if (!existingDraft) {
          const content = await this.aiAgent.generateOverdueNotice(
            payment.renterName,
            payment.amount,
            payment.dueDate
          );

          await tenantDb.insert(schema.communications).values({
            organizationId,
            renterId: payment.renterId,
            type: 'overdue_notice',
            content,
            status: 'draft'
          });

          generatedCount++;
        }
      }

      // Demo Fallback: If no drafts were generated (because no overdue payments or all already have drafts),
      // generate a demo draft for any existing (or newly created demo) renter.
      if (generatedCount === 0) {
        let allRenters = await tenantDb.select().from(schema.renters).limit(5);

        if (allRenters.length === 0) {
          // Auto-seed a demo renter if DB is empty
          const [newRenter] = await tenantDb.insert(schema.renters).values({
            organizationId,
            fullName: 'Carlos Gómez (Demo)',
            email: 'carlos.demo@example.com',
            phone: '+5491122334455'
          }).returning();
          allRenters = [newRenter];
        }

        const randomRenter = allRenters[Math.floor(Math.random() * allRenters.length)];
        const randomAmount = (Math.floor(Math.random() * 50) + 10) * 1000 + '';
        const mockDueDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const content = await this.aiAgent.generateOverdueNotice(
          randomRenter.fullName,
          randomAmount,
          mockDueDate
        );

        await tenantDb.insert(schema.communications).values({
          organizationId,
          renterId: randomRenter.id,
          type: 'overdue_notice',
          content,
          status: 'draft'
        });

        generatedCount++;
      }
    });

    return { generatedCount };
  }
}
