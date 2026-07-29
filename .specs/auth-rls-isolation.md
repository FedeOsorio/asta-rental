# Specification: Authentication & Row Level Security (RLS) Isolation

## Overview
Guarantees tenant data boundary enforcement at the PostgreSQL database level using session variable `app.current_org` and a restricted system role (`app_user`).

## Flow & Architecture
1. **JWT Authenticated Request**:
   - `authenticate` middleware parses `Authorization: Bearer <token>`.
   - Extracts `org` (Organization UUID) from verified payload.
   - Sets `req.user = { userId, organizationId, role, jti }`.

2. **Database Checkout with Tenant Context (`withTenantDb`)**:
   - All tenant queries are executed within a strict database transaction block (`BEGIN; ... COMMIT;`).
   - The connection context temporarily adopts a restricted role: `SET LOCAL ROLE app_user`. This prevents superuser privileges (like local `postgres`) from bypassing RLS during development and tests.
   - The organization ID is injected via `SELECT set_config('app.current_org', $1, true)`.
   - PostgreSQL RLS policy filters all multi-tenant tables (`properties`, `renters`, `contracts`, `payments`) matching `organization_id = current_setting('app.current_org', true)::uuid`.

3. **Security Invariant**:
   - Even if application code performs `SELECT * FROM properties` without a `WHERE organization_id = ...` clause, PostgreSQL enforces the policy.
   - User A belonging to `Organization Alpha` can never read or mutate data belonging to `Organization Beta`.

## Verification
Validated via automated integration test suite checking cross-organization isolation (`rls.test.ts`), ensuring `app_user` correctly triggers RLS policy boundaries.
