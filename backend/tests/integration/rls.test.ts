import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db, pool, withTenantDb } from '../../src/db/index.js';
import * as schema from '../../src/db/schema.js';
import { eq } from 'drizzle-orm';

describe('RLS Cross-Tenant Isolation Tests', () => {
  let orgAlphaId: string;
  let orgBetaId: string;
  let propAlphaId: string;

  beforeAll(async () => {
    // Note: this assumes the database has been seeded via `npm run db:seed` or similar before the tests run.
    // Let's create dummy organizations directly to ensure isolation tests are stable
    const [orgAlpha] = await db.insert(schema.organizations).values({ name: 'Test Org Alpha' }).returning();
    const [orgBeta] = await db.insert(schema.organizations).values({ name: 'Test Org Beta' }).returning();
    orgAlphaId = orgAlpha.id;
    orgBetaId = orgBeta.id;

    const [propAlpha] = await db.insert(schema.properties).values({
      organizationId: orgAlphaId,
      address: 'Alpha Exclusive Property',
      type: 'apartment',
      monthlyRent: '1000.00',
      status: 'available'
    }).returning();
    propAlphaId = propAlpha.id;
  });

  afterAll(async () => {
    // Cleanup created orgs
    await db.delete(schema.organizations).where(eq(schema.organizations.id, orgAlphaId));
    await db.delete(schema.organizations).where(eq(schema.organizations.id, orgBetaId));
  });

  it('Tenant Alpha can see their own properties', async () => {
    await withTenantDb(orgAlphaId, async (tenantDb) => {
      const properties = await tenantDb.select().from(schema.properties);
      const alphaProp = properties.find((p) => p.id === propAlphaId);
      expect(alphaProp).toBeDefined();
    });
  });

  it('Tenant Beta CANNOT see Tenant Alpha properties (RLS Isolation)', async () => {
    await withTenantDb(orgBetaId, async (tenantDb) => {
      const properties = await tenantDb.select().from(schema.properties);
      const alphaProp = properties.find((p) => p.id === propAlphaId);
      
      // The core RLS assertion: Tenant Beta should not see Alpha's properties
      expect(alphaProp).toBeUndefined();
    });
  });

  it('Tenant Beta CANNOT insert a property for Tenant Alpha (RLS Policy Enforcement)', async () => {
    await withTenantDb(orgBetaId, async (tenantDb) => {
      // Trying to insert a property with orgAlphaId while in orgBetaId context
      await expect(
        tenantDb.insert(schema.properties).values({
          organizationId: orgAlphaId,
          address: 'Malicious Insertion Attempt',
          type: 'house',
          monthlyRent: '2000.00',
          status: 'available'
        })
      ).rejects.toThrow(); // Should violate RLS policy
    });
  });
});
