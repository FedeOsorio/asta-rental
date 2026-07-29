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
      address: 'Av. Libertador 1450, Piso 4A',
      type: 'apartment',
      monthlyRent: '1200.00',
      status: 'rented'
    })
    .returning();

  const [propAlpha2] = await db
    .insert(schema.properties)
    .values({
      organizationId: orgAlpha.id,
      address: 'Calle Gorriti 4820, Palermo',
      type: 'house',
      monthlyRent: '2500.00',
      status: 'rented'
    })
    .returning();

  await db.insert(schema.properties).values({
    organizationId: orgAlpha.id,
    address: 'Av. Corrientes 800, Local 12',
    type: 'commercial',
    monthlyRent: '3500.00',
    status: 'available'
  });

  // 6. Renters for Org Alpha
  const [renterAlpha1] = await db
    .insert(schema.renters)
    .values({
      organizationId: orgAlpha.id,
      fullName: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@example.com',
      phone: '+5491144332211'
    })
    .returning();

  const [renterAlpha2] = await db
    .insert(schema.renters)
    .values({
      organizationId: orgAlpha.id,
      fullName: 'María Fernández',
      email: 'maria.fernandez@example.com',
      phone: '+5491155667788'
    })
    .returning();

  // 7. Contracts & Payments for Org Alpha
  const [contractAlpha1] = await db
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

  const [contractAlpha2] = await db
    .insert(schema.contracts)
    .values({
      organizationId: orgAlpha.id,
      propertyId: propAlpha2.id,
      renterId: renterAlpha2.id,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      monthlyRent: '2500.00',
      status: 'active'
    })
    .returning();

  // Payments for Contract 1
  await db.insert(schema.payments).values([
    {
      organizationId: orgAlpha.id,
      contractId: contractAlpha1.id,
      dueDate: '2026-01-01',
      paidDate: '2026-01-02',
      amount: '1200.00',
      status: 'paid'
    },
    {
      organizationId: orgAlpha.id,
      contractId: contractAlpha1.id,
      dueDate: '2026-01-15', // FECHA PASADA PERO PENDIENTE -> Para probar el botón de Mantenimiento!
      paidDate: null,
      amount: '1200.00',
      status: 'pending'
    },
    {
      organizationId: orgAlpha.id,
      contractId: contractAlpha1.id,
      dueDate: '2026-08-01', // FECHA FUTURA PENDIENTE -> No cambiará al correr Mantenimiento
      paidDate: null,
      amount: '1200.00',
      status: 'pending'
    }
  ]);

  // Payments for Contract 2
  await db.insert(schema.payments).values([
    {
      organizationId: orgAlpha.id,
      contractId: contractAlpha2.id,
      dueDate: '2026-01-10',
      paidDate: null,
      amount: '2500.00',
      status: 'overdue'
    },
    {
      organizationId: orgAlpha.id,
      contractId: contractAlpha2.id,
      dueDate: '2026-01-20', // FECHA PASADA PERO PENDIENTE -> También cambiará a Overdue al presionar el botón!
      paidDate: null,
      amount: '2500.00',
      status: 'pending'
    }
  ]);

  console.log('✅ Drizzle seed completed successfully!');
  console.log(`- Org Alpha (admin@alpha.com / agent@alpha.com)`);
  console.log('Password for all users: password123');

  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
