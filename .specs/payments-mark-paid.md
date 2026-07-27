# Specification: Payments — Mark as Paid (`PATCH /payments/:id/mark-paid`)

## Overview
Updates payment status to `paid`, sets `paid_date`, and actively invalidates the organization's dashboard cache in Redis.

## Flow & Caching Logic (`MarkPaymentPaidUseCase`)
1. **Input**: Optional `{ paidDate }` (defaults to today's date if omitted).
2. **Database Update**: Sets `status = 'paid'`, `paid_date = YYYY-MM-DD`.
3. **Active Redis Cache Invalidation**: Calls `paymentCache.invalidateDashboardMetrics(organizationId)` deleting Redis key `dashboard:collection:${organizationId}` so subsequent dashboard requests calculate fresh aggregates.
