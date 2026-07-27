import { db, pool } from './index.js';
import * as schema from './schema.js';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Starting database seed with Drizzle ORM...');

  // Clean existing data
  await db.delete(schema.payments);
  await db.delete(schema.contracts);
  await db.delete(schema.renters);
  await db.delete(schema.properties);
  await db.delete(schema.refreshTokens);
  await db.delete(schema.users);
  await db.delete(schema.organizations);

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Organization Alpha
  const [orgAlpha] = await db
    .insert(schema.organizations)
    .values({ name: 'Alpha Real Estate Solutions' })
    .returning();

  // 2. Users for Org Alpha
  await db.insert(schema.users).values([
    {
      organizationId: orgAlpha.id,
      email: 'admin@alpha.com',
      passwordHash,
      role: 'admin'
    },
    {
      organizationId: orgAlpha.id,
      email: 'agent@alpha.com',
      passwordHash,
      role: 'agent'
    }
  ]);

  // 3. Create Organization Beta
  const [orgBeta] = await db
    .insert(schema.organizations)
    .values({ name: 'Beta Properties Group' })
    .returning();

  // Users for Org Beta
  await db.insert(schema.users).values([
    {
      organizationId: orgBeta.id,
      email: 'admin@beta.com',
      passwordHash,
      role: 'admin'
    }
  ]);

  // 4. Properties for Org Alpha
  const [propAlpha1] = await db
    .insert(schema.properties)
    .values({
      organizationId: orgAlpha.id,
      address: '123 Main Street, Suite 4B',
      type: 'apartment',
      monthlyRent: '1200.00',
      status: 'rented'
    })
    .returning();

  await db.insert(schema.properties).values({
    organizationId: orgAlpha.id,
    address: '456 Ocean Drive',
    type: 'house',
    monthlyRent: '2500.00',
    status: 'available'
  });

  // 5. Properties for Org Beta
  await db.insert(schema.properties).values({
    organizationId: orgBeta.id,
    address: '789 Commercial Boulevard',
    type: 'commercial',
    monthlyRent: '4000.00',
    status: 'available'
  });

  // 6. Renter for Org Alpha
  const [renterAlpha1] = await db
    .insert(schema.renters)
    .values({
      organizationId: orgAlpha.id,
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+15550199'
    })
    .returning();

  // 7. Contract & Payments for Org Alpha
  const [contractAlpha] = await db
    .insert(schema.contracts)
    .values({
      organizationId: orgAlpha.id,
      propertyId: propAlpha1.id,
      renterId: renterAlpha1.id,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      monthlyRent: '1200.00',
      status: 'active'
    })
    .returning();

  await db.insert(schema.payments).values([
    {
      organizationId: orgAlpha.id,
      contractId: contractAlpha.id,
      dueDate: '2026-01-01',
      paidDate: '2026-01-02',
      amount: '1200.00',
      status: 'paid'
    },
    {
      organizationId: orgAlpha.id,
      contractId: contractAlpha.id,
      dueDate: '2026-02-01',
      paidDate: null,
      amount: '1200.00',
      status: 'overdue'
    }
  ]);

  console.log('✅ Drizzle seed completed successfully!');
  console.log(`- Org Alpha ID: ${orgAlpha.id} (admin@alpha.com / agent@alpha.com)`);
  console.log(`- Org Beta ID: ${orgBeta.id} (admin@beta.com)`);
  console.log('Password for all users: password123');

  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
