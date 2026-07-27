import { eq, and, lt } from 'drizzle-orm';
import { withTenantDb } from '../../../../db/index.js';
import * as schema from '../../../../db/schema.js';
import { PaymentRepositoryPort } from '../../domain/ports/payment-repository.port.js';
import { PaymentEntity } from '../../domain/payment.entity.js';
import { PaymentStatus, CollectionDashboard } from '@asta-rental/shared';

function mapRowToEntity(row: typeof schema.payments.$inferSelect): PaymentEntity {
  return new PaymentEntity(
    row.id,
    row.organizationId,
    row.contractId,
    row.dueDate,
    row.paidDate,
    parseFloat(row.amount.toString()),
    row.status,
    row.createdAt
  );
}

export class DrizzlePaymentRepository implements PaymentRepositoryPort {
  async findAll(organizationId: string, statusFilter?: PaymentStatus): Promise<PaymentEntity[]> {
    return withTenantDb(organizationId, async (tenantDb) => {
      const conditions = [];
      if (statusFilter) {
        conditions.push(eq(schema.payments.status, statusFilter));
      }

      const rows = await tenantDb
        .select()
        .from(schema.payments)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return rows.map(mapRowToEntity);
    });
  }

  async findById(organizationId: string, id: string): Promise<PaymentEntity | null> {
    return withTenantDb(organizationId, async (tenantDb) => {
      const [row] = await tenantDb
        .select()
        .from(schema.payments)
        .where(eq(schema.payments.id, id));

      if (!row) return null;
      return mapRowToEntity(row);
    });
  }

  async markPaid(
    organizationId: string,
    id: string,
    paidDateStr?: string
  ): Promise<PaymentEntity | null> {
    return withTenantDb(organizationId, async (tenantDb) => {
      const todayStr = paidDateStr || new Date().toISOString().split('T')[0];

      const [row] = await tenantDb
        .update(schema.payments)
        .set({
          status: 'paid',
          paidDate: todayStr
        })
        .where(eq(schema.payments.id, id))
        .returning();

      if (!row) return null;
      return mapRowToEntity(row);
    });
  }

  async runOverdueMaintenance(organizationId: string): Promise<number> {
    return withTenantDb(organizationId, async (tenantDb) => {
      const todayStr = new Date().toISOString().split('T')[0];

      const rows = await tenantDb
        .update(schema.payments)
        .set({ status: 'overdue' })
        .where(
          and(
            eq(schema.payments.status, 'pending'),
            lt(schema.payments.dueDate, todayStr)
          )
        )
        .returning();

      return rows.length;
    });
  }

  async calculateDashboardMetrics(organizationId: string): Promise<CollectionDashboard> {
    return withTenantDb(organizationId, async (tenantDb) => {
      const payments = await tenantDb.select().from(schema.payments);
      const properties = await tenantDb.select().from(schema.properties);
      const contracts = await tenantDb.select().from(schema.contracts);

      let totalCollected = 0;
      let totalPending = 0;
      let totalOverdue = 0;

      const propertyMap = new Map<
        string,
        { propertyId: string; address: string; collected: number; pending: number; overdue: number }
      >();

      for (const prop of properties) {
        propertyMap.set(prop.id, {
          propertyId: prop.id,
          address: prop.address,
          collected: 0,
          pending: 0,
          overdue: 0
        });
      }

      const contractToProperty = new Map<string, string>();
      for (const c of contracts) {
        contractToProperty.set(c.id, c.propertyId);
      }

      for (const p of payments) {
        const amount = parseFloat(p.amount.toString());
        const propId = contractToProperty.get(p.contractId);
        const propMetrics = propId ? propertyMap.get(propId) : undefined;

        if (p.status === 'paid') {
          totalCollected += amount;
          if (propMetrics) propMetrics.collected += amount;
        } else if (p.status === 'pending') {
          totalPending += amount;
          if (propMetrics) propMetrics.pending += amount;
        } else if (p.status === 'overdue') {
          totalOverdue += amount;
          if (propMetrics) propMetrics.overdue += amount;
        }
      }

      return {
        totalCollected,
        totalPending,
        totalOverdue,
        byProperty: Array.from(propertyMap.values())
      };
    });
  }
}
