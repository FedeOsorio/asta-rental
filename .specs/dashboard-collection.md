# Specification: Collection Dashboard (`GET /dashboard/collection-status`)

## Overview
Returns financial collection aggregates (total collected, pending, overdue, and per-property breakdown) using Redis read-through caching.

## Flow & Caching Strategy (`GetCollectionDashboardUseCase`)
1. **Cache Attempt**: Check Redis key `dashboard:collection:${organizationId}`.
2. **Cache Hit**: If key exists, parse JSON and return immediately.
3. **Cache Miss**:
   - Query PostgreSQL database with RLS (`withTenantDb`) to compute financial aggregates:
     - `totalCollected`: SUM of amounts where `status = 'paid'`.
     - `totalPending`: SUM of amounts where `status = 'pending'`.
     - `totalOverdue`: SUM of amounts where `status = 'overdue'`.
     - `byProperty`: Breakdown per property address.
   - Cache JSON payload in Redis with `TTL = 60 seconds`.
   - Return calculated metrics.
