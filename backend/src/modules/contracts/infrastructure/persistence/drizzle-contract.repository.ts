import { eq, and, gt } from 'drizzle-orm';
import { withTenantDb } from '../../../../db/index.js';
import * as schema from '../../../../db/schema.js';
import { ContractRepositoryPort } from '../../domain/ports/contract-repository.port.js';
import { ContractEntity } from '../../domain/contract.entity.js';
import { CreateContractInput } from '@asta-rental/shared';

function mapRowToEntity(row: typeof schema.contracts.$inferSelect): ContractEntity {
  return new ContractEntity(
    row.id,
    row.organizationId,
    row.propertyId,
    row.renterId,
    row.startDate,
    row.endDate,
    parseFloat(row.monthlyRent.toString()),
    row.status,
    row.createdAt
  );
}

export class DrizzleContractRepository implements ContractRepositoryPort {
  async createContractWithPayments(
    organizationId: string,
    input: CreateContractInput,
    paymentDueDates: string[]
  ): Promise<ContractEntity> {
    return withTenantDb(organizationId, async (tenantDb) => {
      return tenantDb.transaction(async (tx) => {
        // 1. Insert contract
        const [contractRow] = await tx
          .insert(schema.contracts)
          .values({
            organizationId,
            propertyId: input.propertyId,
            renterId: input.renterId,
            startDate: input.startDate,
            endDate: input.endDate,
            monthlyRent: input.monthlyRent.toString(),
            status: 'active'
          })
          .returning();

        // 2. Update property status -> 'rented'
        await tx
          .update(schema.properties)
          .set({ status: 'rented' })
          .where(eq(schema.properties.id, input.propertyId));

        // 3. Insert payment schedule records
        const paymentRows = paymentDueDates.map((dueDate) => ({
          organizationId,
          contractId: contractRow.id,
          dueDate,
          amount: input.monthlyRent.toString(),
          status: 'pending' as const
        }));

        await tx.insert(schema.payments).values(paymentRows);

        return mapRowToEntity(contractRow);
      });
    });
  }

  async findById(organizationId: string, id: string): Promise<ContractEntity | null> {
    return withTenantDb(organizationId, async (tenantDb) => {
      const [row] = await tenantDb
        .select()
        .from(schema.contracts)
        .where(eq(schema.contracts.id, id));

      if (!row) return null;
      return mapRowToEntity(row);
    });
  }

  async terminateContract(
    organizationId: string,
    contractId: string,
    propertyId: string
  ): Promise<ContractEntity> {
    return withTenantDb(organizationId, async (tenantDb) => {
      return tenantDb.transaction(async (tx) => {
        // 1. Update contract status -> 'terminated'
        const [contractRow] = await tx
          .update(schema.contracts)
          .set({ status: 'terminated' })
          .where(eq(schema.contracts.id, contractId))
          .returning();

        // 2. Update property status -> 'available'
        await tx
          .update(schema.properties)
          .set({ status: 'available' })
          .where(eq(schema.properties.id, propertyId));

        // 3. Cancel future pending payments
        const todayStr = new Date().toISOString().split('T')[0];
        await tx
          .update(schema.payments)
          .set({ status: 'cancelled' })
          .where(
            and(
              eq(schema.payments.contractId, contractId),
              eq(schema.payments.status, 'pending'),
              gt(schema.payments.dueDate, todayStr)
            )
          );

        return mapRowToEntity(contractRow);
      });
    });
  }
}
