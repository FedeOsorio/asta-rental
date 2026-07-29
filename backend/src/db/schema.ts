import {
  pgTable,
  uuid,
  text,
  timestamp,
  numeric,
  date,
  pgEnum
} from 'drizzle-orm/pg-core';

// Enums
export const roleEnum = pgEnum('role', ['admin', 'agent']);
export const propertyTypeEnum = pgEnum('property_type', ['apartment', 'house', 'commercial']);
export const propertyStatusEnum = pgEnum('property_status', ['available', 'rented', 'maintenance']);
export const contractStatusEnum = pgEnum('contract_status', ['active', 'expired', 'terminated']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'overdue', 'cancelled']);
export const communicationStatusEnum = pgEnum('communication_status', ['draft', 'approved', 'sent', 'rejected']);
export const ticketUrgencyEnum = pgEnum('ticket_urgency', ['low', 'medium', 'high', 'critical']);
export const ticketCategoryEnum = pgEnum('ticket_category', ['plumbing', 'electrical', 'gas', 'structural', 'other']);
export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'in_progress', 'resolved']);

// Organizations
export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Users
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').default('agent').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Refresh Tokens
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Properties
export const properties = pgTable('properties', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  address: text('address').notNull(),
  type: propertyTypeEnum('type').notNull(),
  monthlyRent: numeric('monthly_rent', { precision: 12, scale: 2 }).notNull(),
  status: propertyStatusEnum('status').default('available').notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Renters
export const renters = pgTable('renters', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Contracts
export const contracts = pgTable('contracts', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  propertyId: uuid('property_id')
    .notNull()
    .references(() => properties.id, { onDelete: 'cascade' }),
  renterId: uuid('renter_id')
    .notNull()
    .references(() => renters.id, { onDelete: 'cascade' }),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  monthlyRent: numeric('monthly_rent', { precision: 12, scale: 2 }).notNull(),
  status: contractStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Payments
export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  contractId: uuid('contract_id')
    .notNull()
    .references(() => contracts.id, { onDelete: 'cascade' }),
  dueDate: date('due_date').notNull(),
  paidDate: date('paid_date'),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  status: paymentStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Communications (AI Drafts / Messages)
export const communications = pgTable('communications', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  renterId: uuid('renter_id')
    .notNull()
    .references(() => renters.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // e.g., 'overdue_notice'
  content: text('content').notNull(),
  status: communicationStatusEnum('status').default('draft').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Maintenance Tickets (AI Classified)
export const maintenanceTickets = pgTable('maintenance_tickets', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  propertyId: uuid('property_id')
    .references(() => properties.id, { onDelete: 'cascade' }), // Optional if renter doesn't specify
  renterId: uuid('renter_id')
    .references(() => renters.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  urgency: ticketUrgencyEnum('urgency').default('low').notNull(),
  category: ticketCategoryEnum('category').default('other').notNull(),
  status: ticketStatusEnum('status').default('open').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});
