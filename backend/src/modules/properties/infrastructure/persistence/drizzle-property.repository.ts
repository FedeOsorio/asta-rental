import { eq, and, isNull } from 'drizzle-orm';
import { withTenantDb } from '../../../../db/index.js';
import * as schema from '../../../../db/schema.js';
import { PropertyRepositoryPort } from '../../domain/ports/property-repository.port.js';
import { PropertyEntity } from '../../domain/property.entity.js';
import { CreatePropertyInput, UpdatePropertyInput, PropertyStatus } from '@asta-rental/shared';

function mapRowToEntity(row: typeof schema.properties.$inferSelect): PropertyEntity {
  return new PropertyEntity(
    row.id,
    row.organizationId,
    row.address,
    row.type,
    parseFloat(row.monthlyRent.toString()),
    row.status,
    row.deletedAt,
    row.createdAt
  );
}

export class DrizzlePropertyRepository implements PropertyRepositoryPort {
  async create(organizationId: string, input: CreatePropertyInput): Promise<PropertyEntity> {
    return withTenantDb(organizationId, async (tenantDb) => {
      const [row] = await tenantDb
        .insert(schema.properties)
        .values({
          organizationId,
          address: input.address,
          type: input.type,
          monthlyRent: input.monthlyRent.toString()
        })
        .returning();

      return mapRowToEntity(row);
    });
  }

  async findAll(organizationId: string, statusFilter?: PropertyStatus): Promise<PropertyEntity[]> {
    return withTenantDb(organizationId, async (tenantDb) => {
      const conditions = [isNull(schema.properties.deletedAt)];
      if (statusFilter) {
        conditions.push(eq(schema.properties.status, statusFilter));
      }

      const rows = await tenantDb
        .select()
        .from(schema.properties)
        .where(and(...conditions));

      return rows.map(mapRowToEntity);
    });
  }

  async findById(organizationId: string, id: string): Promise<PropertyEntity | null> {
    return withTenantDb(organizationId, async (tenantDb) => {
      const [row] = await tenantDb
        .select()
        .from(schema.properties)
        .where(and(eq(schema.properties.id, id), isNull(schema.properties.deletedAt)));

      if (!row) return null;
      return mapRowToEntity(row);
    });
  }

  async update(
    organizationId: string,
    id: string,
    input: UpdatePropertyInput
  ): Promise<PropertyEntity | null> {
    return withTenantDb(organizationId, async (tenantDb) => {
      const updateData: Partial<typeof schema.properties.$inferInsert> = {};

      if (input.address !== undefined) updateData.address = input.address;
      if (input.type !== undefined) updateData.type = input.type;
      if (input.monthlyRent !== undefined) updateData.monthlyRent = input.monthlyRent.toString();
      if (input.status !== undefined) updateData.status = input.status;

      const [row] = await tenantDb
        .update(schema.properties)
        .set(updateData)
        .where(and(eq(schema.properties.id, id), isNull(schema.properties.deletedAt)))
        .returning();

      if (!row) return null;
      return mapRowToEntity(row);
    });
  }

  async softDelete(organizationId: string, id: string): Promise<boolean> {
    return withTenantDb(organizationId, async (tenantDb) => {
      const [row] = await tenantDb
        .update(schema.properties)
        .set({ deletedAt: new Date() })
        .where(and(eq(schema.properties.id, id), isNull(schema.properties.deletedAt)))
        .returning();

      return !!row;
    });
  }
}
