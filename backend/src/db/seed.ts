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

  const [propAlpha3] = await db
    .insert(schema.properties)
    .values({
      organizationId: orgAlpha.id,
      address: 'Av. Belgrano 1200, Piso 2B',
      type: 'apartment',
      monthlyRent: '800.00',
      status: 'rented'
    })
    .returning();

  const [propAlpha4] = await db
    .insert(schema.properties)
    .values({
      organizationId: orgAlpha.id,
      address: 'Calle Florida 500, Local 5',
      type: 'commercial',
      monthlyRent: '5000.00',
      status: 'rented'
    })
    .returning();

  await db.insert(schema.properties).values({
    organizationId: orgAlpha.id,
    address: 'Av. Santa Fe 3200, Piso 8',
    type: 'apartment',
    monthlyRent: '1500.00',
    status: 'available'
  });

  const [propAlpha5] = await db
    .insert(schema.properties)
    .values({
      organizationId: orgAlpha.id,
      address: 'Calle Honduras 4900, Casa',
      type: 'house',
      monthlyRent: '3000.00',
      status: 'rented'
    })
    .returning();


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

  const [renterAlpha3] = await db
    .insert(schema.renters)
    .values({
      organizationId: orgAlpha.id,
      fullName: 'Lucía Gómez',
      email: 'lucia.gomez@example.com',
      phone: '+5491133445566'
    })
    .returning();

  const [renterAlpha4] = await db
    .insert(schema.renters)
    .values({
      organizationId: orgAlpha.id,
      fullName: 'Martín Pérez',
      email: 'martin.perez@example.com',
      phone: '+5491122334455'
    })
    .returning();

  const [renterAlpha5] = await db
    .insert(schema.renters)
    .values({
      organizationId: orgAlpha.id,
      fullName: 'Sofía Díaz',
      email: 'sofia.diaz@example.com',
      phone: '+5491199887766'
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

  const [contractAlpha3] = await db
    .insert(schema.contracts)
    .values({
      organizationId: orgAlpha.id,
      propertyId: propAlpha3.id,
      renterId: renterAlpha3.id,
      startDate: '2026-02-01',
      endDate: '2027-01-31',
      monthlyRent: '800.00',
      status: 'active'
    })
    .returning();

  const [contractAlpha4] = await db
    .insert(schema.contracts)
    .values({
      organizationId: orgAlpha.id,
      propertyId: propAlpha4.id,
      renterId: renterAlpha4.id,
      startDate: '2025-11-01',
      endDate: '2028-10-31',
      monthlyRent: '5000.00',
      status: 'active'
    })
    .returning();

  const [contractAlpha5] = await db
    .insert(schema.contracts)
    .values({
      organizationId: orgAlpha.id,
      propertyId: propAlpha5.id,
      renterId: renterAlpha5.id,
      startDate: '2026-03-01',
      endDate: '2027-02-28',
      monthlyRent: '3000.00',
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
      dueDate: '2026-05-01',
      paidDate: '2026-05-03',
      amount: '1200.00',
      status: 'paid'
    },
    {
      organizationId: orgAlpha.id,
      contractId: contractAlpha1.id,
      dueDate: '2026-06-01',
      paidDate: '2026-06-05',
      amount: '1200.00',
      status: 'paid'
    },
    {
      organizationId: orgAlpha.id,
      contractId: contractAlpha1.id,
      dueDate: '2026-07-01', // Current month
      paidDate: null,
      amount: '1200.00',
      status: 'pending'
    },
    {
      organizationId: orgAlpha.id,
      contractId: contractAlpha1.id,
      dueDate: '2026-08-01', // Future
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
      dueDate: '2026-05-10',
      paidDate: '2026-05-12',
      amount: '2500.00',
      status: 'paid'
    },
    {
      organizationId: orgAlpha.id,
      contractId: contractAlpha2.id,
      dueDate: '2026-06-10',
      paidDate: '2026-06-15',
      amount: '2500.00',
      status: 'paid'
    },
    {
      organizationId: orgAlpha.id,
      contractId: contractAlpha2.id,
      dueDate: '2026-07-10', // Past in July
      paidDate: null,
      amount: '2500.00',
      status: 'overdue'
    }
  ]);

  // Payments for Contract 3
  await db.insert(schema.payments).values([
    {
      organizationId: orgAlpha.id,
      contractId: contractAlpha3.id,
      dueDate: '2026-06-01',
      paidDate: '2026-06-05',
      amount: '800.00',
      status: 'paid'
    },
    {
      organizationId: orgAlpha.id,
      contractId: contractAlpha3.id,
      dueDate: '2026-07-01',
      paidDate: '2026-07-02',
      amount: '800.00',
      status: 'paid'
    },
    {
      organizationId: orgAlpha.id,
      contractId: contractAlpha3.id,
      dueDate: '2026-08-01',
      paidDate: null,
      amount: '800.00',
      status: 'pending'
    }
  ]);

  // Payments for Contract 4
  await db.insert(schema.payments).values([
    {
      organizationId: orgAlpha.id,
      contractId: contractAlpha4.id,
      dueDate: '2026-05-01',
      paidDate: null,
      amount: '5000.00',
      status: 'overdue'
    },
    {
      organizationId: orgAlpha.id,
      contractId: contractAlpha4.id,
      dueDate: '2026-06-01',
      paidDate: null,
      amount: '5000.00',
      status: 'overdue'
    },
    {
      organizationId: orgAlpha.id,
      contractId: contractAlpha4.id,
      dueDate: '2026-07-01',
      paidDate: null,
      amount: '5000.00',
      status: 'overdue'
    }
  ]);

  // Payments for Contract 5
  await db.insert(schema.payments).values([
    {
      organizationId: orgAlpha.id,
      contractId: contractAlpha5.id,
      dueDate: '2026-05-01',
      paidDate: '2026-05-01',
      amount: '3000.00',
      status: 'paid'
    },
    {
      organizationId: orgAlpha.id,
      contractId: contractAlpha5.id,
      dueDate: '2026-06-01',
      paidDate: '2026-06-03',
      amount: '3000.00',
      status: 'paid'
    },
    {
      organizationId: orgAlpha.id,
      contractId: contractAlpha5.id,
      dueDate: '2026-07-01',
      paidDate: null,
      amount: '3000.00',
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
