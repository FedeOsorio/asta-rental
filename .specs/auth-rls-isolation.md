# Specification: Authentication & Row Level Security (RLS) Isolation

## Overview
Guarantees tenant data boundary enforcement at the PostgreSQL database level using session variable `app.current_org`.

## Flow & Architecture
1. **JWT Authenticated Request**:
   - `authenticate` middleware parses `Authorization: Bearer <token>`.
   - Extracts `org` (Organization UUID) from verified payload.
   - Sets `req.user = { userId, organizationId, role, jti }`.

2. **Database Checkout with Tenant Context**:
   - All tenant queries are executed through `withTenantDb(organizationId, callback)`.
   - Before executing queries, `SET LOCAL app.current_org = $1` is executed on the checked-out `pg.Client`.
   - PostgreSQL RLS policy filters all multi-tenant tables (`properties`, `renters`, `contracts`, `payments`) matching `organization_id = current_setting('app.current_org')::uuid`.

3. **Security Invariant**:
   - Even if application code performs `SELECT * FROM properties` without a `WHERE organization_id = ...` clause, PostgreSQL enforces the policy.
   - User A belonging to `Organization Alpha` can never read or mutate data belonging to `Organization Beta`.

## Verification
Validated via automated integration test suite checking cross-organization isolation.
