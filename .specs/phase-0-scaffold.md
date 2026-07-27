# Specification: Phase 0 — Project Scaffold & Monorepo Foundation

## Overview
Phase 0 establishes the foundation of the `asta-rental` multi-tenant real estate SaaS project.

## Components & Scope

### 1. Monorepo & Workspaces (`npm workspaces`)
- **Root Directory**: `E:\asta-rental`
- **Workspaces**:
  - `packages/shared`: Shared TypeScript definitions and Zod validation schemas (`@asta-rental/shared`).
  - `packages/backend`: Express API, PostgreSQL pool with RLS wrapper, Prisma schema, Redis client (`backend`).
  - `packages/frontend`: Next.js App Router UI (`frontend`).

### 2. Database Schema (`Drizzle ORM`)
- **Tables**: `organizations`, `users`, `refresh_tokens`, `properties`, `renters`, `contracts`, `payments`.
- **Primary Keys**: UUID v4 on all tables.
- **Tenant Isolation Column**: `organization_id` (UUID FK -> `organizations.id`) present on all multi-tenant domain entities (`properties`, `renters`, `contracts`, `payments`).
- **Enums (English)**:
  - `Role`: `admin`, `agent`
  - `PropertyType`: `apartment`, `house`, `commercial`
  - `PropertyStatus`: `available`, `rented`, `maintenance`
  - `ContractStatus`: `active`, `expired`, `terminated`
  - `PaymentStatus`: `pending`, `paid`, `overdue`, `cancelled`

### 3. Native PostgreSQL Row Level Security (RLS)
- **Policy Pattern**:
  ```sql
  CREATE POLICY tenant_isolation_<table_name> ON <table_name>
    USING (organization_id = NULLIF(current_setting('app.current_org', true), '')::uuid);
  ```
- **Connection Helper**: `withTenantClient` in `packages/backend/src/db/pool.ts` sets `SET LOCAL app.current_org = $1` on a dedicated checkout client before returning control to the caller handler.

### 4. Shared Types and Schemas
- Defined in `packages/shared/src/types/` and `packages/shared/src/schemas/`.
- Strict null checks and TypeScript strict flags enabled in all package `tsconfig.json` files.

## Acceptance Criteria & Verification
1. Monorepo package structure exists and compiles without TypeScript errors.
2. `docker-compose.yml` launches PostgreSQL 16 on port 5432 and Redis 7 on port 6379.
3. Database seeding generates 2 organizations (`Alpha` and `Beta`) with sample properties, renters, contracts, and payments.
