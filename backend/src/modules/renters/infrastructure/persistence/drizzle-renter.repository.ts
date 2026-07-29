import { eq } from 'drizzle-orm';
import { withTenantDb } from '../../../../db/index.js';
import * as schema from '../../../../db/schema.js';
import { RenterRepositoryPort } from '../../domain/ports/renter-repository.port.js';
import { RenterEntity } from '../../domain/renter.entity.js';
import { CreateRenterInput, UpdateRenterInput } from '@asta-rental/shared';

function mapRowToEntity(row: typeof schema.renters.$inferSelect): RenterEntity {
  return new RenterEntity(
    row.id,
    row.organizationId,
    row.fullName,
    row.email,
    row.phone,
    row.createdAt
  );
}

export class DrizzleRenterRepository implements RenterRepositoryPort {
  async create(organizationId: string, input: CreateRenterInput): Promise<RenterEntity> {
    return withTenantDb(organizationId, async (tenantDb) => {
      const [row] = await tenantDb
        .insert(schema.renters)
        .values({
          organizationId,
          fullName: input.fullName,
          email: input.email,
          phone: input.phone
        })
        .returning();

      return mapRowToEntity(row);
    });
  }

  async findAll(organizationId: string): Promise<RenterEntity[]> {
    return withTenantDb(organizationId, async (tenantDb) => {
      const rows = await tenantDb
        .select()
        .from(schema.renters);

      return rows.map(mapRowToEntity);
    });
  }

  async findById(organizationId: string, id: string): Promise<RenterEntity | null> {
    return withTenantDb(organizationId, async (tenantDb) => {
      const [row] = await tenantDb
        .select()
        .from(schema.renters)
        .where(eq(schema.renters.id, id));

      if (!row) return null;
      return mapRowToEntity(row);
    });
  }

  async update(organizationId: string, id: string, input: UpdateRenterInput): Promise<RenterEntity | null> {
    return withTenantDb(organizationId, async (tenantDb) => {
      const updateData: Partial<typeof schema.renters.$inferInsert> = {};
      if (input.fullName !== undefined) updateData.fullName = input.fullName;
      if (input.email !== undefined) updateData.email = input.email;
      if (input.phone !== undefined) updateData.phone = input.phone;

      const [row] = await tenantDb
        .update(schema.renters)
        .set(updateData)
        .where(eq(schema.renters.id, id))
        .returning();

      if (!row) return null;
      return mapRowToEntity(row);
    });
  }

  async delete(organizationId: string, id: string): Promise<boolean> {
    return withTenantDb(organizationId, async (tenantDb) => {
      const [row] = await tenantDb
        .delete(schema.renters)
        .where(eq(schema.renters.id, id))
        .returning({ id: schema.renters.id });

      return !!row;
    });
  }
}
