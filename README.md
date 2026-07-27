# asta-rental — Multi-tenant Real Estate SaaS

A production-ready Multi-tenant Real Estate Rental Management SaaS built with **TypeScript**, **Next.js (App Router)**, **Node.js (Express)**, and **PostgreSQL Row Level Security (RLS)**.

Designed as a technical portfolio project demonstrating **security-by-design**, **multi-tenancy isolation**, **disciplined testing**, and **AI-assisted development workflow**.

---

## 🚀 Key Features & Architectural Highlights

1. **Native PostgreSQL Row Level Security (RLS)**
   - Tenant data isolation (`organizations`) enforced directly at the database engine level via `app.current_org` session variable.
   - Eliminates application-layer forgotten `WHERE organization_id = ?` leaks.

2. **Monorepo Architecture (npm Workspaces)**
   - `shared`: Domain TypeScript types and Zod validation schemas.
   - `backend`: Express REST API with PostgreSQL pool wrapper, Redis cache, JWT auth, and Vitest.
   - `frontend`: Next.js App Router UI with modern aesthetic and state management.

3. **Secure Authentication & Token Strategy**
   - In-memory Short-lived Access Tokens (JWT) + httpOnly Secure Refresh Tokens with DB rotation & Redis token blacklisting.
   - Redis Rate Limiting on authentication endpoints.

4. **Transactional Business Logic**
   - Atomic database transactions for contract generation, automatic rent schedule generation, and property availability updates.

5. **AI Agent Use Cases Versioning**
   - Features documented under `.specs/` and validated by automated test suites in CI.

---

## 🛠️ Quickstart (Development)

### Prerequisites
- Node.js >= 20
- Docker & Docker Compose

### Setup Instructions

1. **Clone & Install Dependencies**
   ```bash
   git clone https://github.com/your-username/asta-rental.git
   cd asta-rental
   npm install
   ```

2. **Start Infrastructure (PostgreSQL 16 + Redis 7)**
   ```bash
   npm run db:up
   ```

3. **Run Drizzle Migrations & Seed Database**
   ```bash
   npm run db:migrate --workspace=backend
   npm run db:seed --workspace=backend
   ```

4. **Start Development Servers (Backend & Frontend)**
   ```bash
   npm run dev
   ```

5. **Test Health Check**
   ```bash
   curl http://localhost:4000/health
   ```

---

## 🧪 Testing

```bash
# Run backend integration & unit tests
npm run test --workspace=backend
```

---

## 📁 Repository Structure

```
asta-rental/
├── .specs/               # Feature specs & agent use cases
├── docs/                 # Architecture documentation
├── shared/               # Shared types & Zod schemas
├── backend/              # Express API & DB layer (Drizzle ORM + pg pool)
├── frontend/             # Next.js App Router application
├── docker-compose.yml    # Postgres + Redis dev containers
├── package.json          # npm workspace root
└── README.md
```
