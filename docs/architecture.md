# Asta-Rental SaaS Architecture

This document outlines the core architectural decisions made in the `asta-rental` Multi-tenant Real Estate SaaS.

## 1. Multi-Tenancy Strategy: PostgreSQL Row Level Security (RLS)

**Decision**: We use a `shared database, shared schema` model where all tenants (Organizations) reside in the same tables. Tenant isolation is enforced natively at the database engine level using PostgreSQL Row Level Security (RLS).

**Why not application-level filtering?**
Filtering at the ORM layer (`WHERE organization_id = ?`) relies on developer discipline. Forgetting this filter in a single query exposes cross-tenant data. RLS moves this responsibility to the database engine.

**Implementation Details**:
- A PostgreSQL policy is applied to all business tables (`properties`, `renters`, `contracts`, `payments`, `users`).
- The policy enforces: `organization_id = NULLIF(current_setting('app.current_org', true), '')::uuid`
- In the application (Node.js/Express), every database interaction within a tenant's context is wrapped in `withTenantDb(organizationId, callback)`. This function claims a pg-pool connection, sets `app.current_org` in the connection session, executes the queries, and then clears the setting before releasing the connection back to the pool.

## 2. Authentication and Authorization

**Strategy**: Stateless JWT for short-lived access, Stateful Refresh Tokens for session extension and revocation.

- **Access Tokens (JWT)**: Short-lived (15 min). Contains user identity, role, and `organization_id`. Sent via `Authorization: Bearer <token>`. Stored purely in memory on the frontend to mitigate XSS vulnerabilities.
- **Refresh Tokens**: Opaque random strings, stored hashed (SHA-256) in the database. Exchanged for new access tokens. Sent via `httpOnly`, `Secure`, `SameSite=Strict` cookies to mitigate XSS and CSRF.
- **Revocation**:
  - Refresh tokens are explicitly revoked in the database upon logout or rotation.
  - Access tokens, despite being stateless, are tracked via Redis Blacklisting on logout. The token's `jti` is stored in Redis with a TTL equal to its remaining lifespan.

## 3. Layered (Hexagonal) Architecture

To decouple the core business logic from infrastructure (Express, PostgreSQL, Redis), business modules (`auth`, `properties`, `contracts`, `payments`, `renters`, `dashboard`) are structured as:

- **Domain Layer**: Entities and Interfaces (Ports). Does not depend on any specific technology.
- **Application Layer**: Use Cases that execute business rules orchestrating the domain and ports.
- **Infrastructure Layer**: Adapters for HTTP (Express Controllers/Routes), Persistence (Drizzle ORM Repositories), and Cache (Redis).

**Example Benefits**:
- `MarkPaymentPaidUseCase` is completely agnostic to Express or Drizzle.
- The `CreateContractUseCase` handles atomic transactional logic involving properties and payment schedule generation without tying into `req` or `res`.

## 4. Redis Caching & Rate Limiting

Redis is used intentionally for specific performance and security enhancements:
- **Rate Limiting**: Defends against brute-force attacks on the `/auth/login` endpoint.
- **Token Blacklist**: Validates active JWT `jti`s on authenticated requests.
- **Dashboard Cache**: Calculates collection metrics (Total Billed, Overdue, Paid) dynamically. This computation is expensive for large data sets, so it is cached in Redis with a 60-second TTL. The cache is actively invalidated when a payment status changes (`MarkPaymentPaidUseCase`).

## 5. Automated Testing

The project requires strong discipline around automated testing:
- **Unit Tests**: Test logic (like payment schedule generation) isolated from databases.
- **Integration Tests**: Verify queries against a real PostgreSQL instance. Specifically, cross-tenant RLS isolation is tested here to ensure data boundary guarantees.
- **E2E Tests**: Playwright scripts that verify entire user flows from the frontend down to the database.
- **CI Pipeline**: All tests, migrations, and builds run on GitHub Actions for every PR.
