# ASTA Rental (Alquileres y Gestión Inmobiliaria B2B SaaS)

ASTA Rental is a modern, high-performance B2B Software as a Service (SaaS) application designed for real estate agencies, property managers, and independent landlords to seamlessly manage properties, renters, contracts, and payments.

## 🚀 Features

*   **Multi-Tenant Architecture**: Robust organization-level data segregation (Row-Level Security) so multiple agencies can use the platform securely.
*   **Property Management**: Manage physical properties, track statuses, and organize by organization.
*   **Renter Profiles**: Keep a detailed repository of renters, their contact details, and their active contracts.
*   **Smart Contracts**: Link properties to renters with specific start/end dates and rent amounts.
*   **Automated Payments**: Auto-generation of monthly payment records via chron jobs. Track pending, paid, overdue, and cancelled payments.
*   **Role-Based Access Control (RBAC)**: Fine-grained permissions for `admin` and `agent` roles within each organization.
*   **Draft Communications**: Generate AI-powered communications or manual drafts to notify renters of overdue payments or updates.
*   **Maintenance Ticketing**: Create and track maintenance requests linked to specific properties.
*   **Secure Authentication**: JWT-based authentication with automatic refresh token rotation, cross-site origin protection, and brute-force mitigation.
*   **Bilingual Interface**: Seamlessly switch between Spanish (es) and English (en) with full internationalization (i18n).

## 🛠 Tech Stack

### Frontend
*   **Framework**: Next.js 14 (App Router) with React 18
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS & custom CSS modules
*   **State Management**: Zustand & React Context
*   **Icons**: Lucide React
*   **Build Tool**: Turborepo (Monorepo setup)

### Backend
*   **Runtime**: Node.js & Express.js
*   **Language**: TypeScript
*   **Database**: PostgreSQL
*   **ORM**: Drizzle ORM (Type-safe schema definition and migrations)
*   **Caching/Rate Limiting**: Redis
*   **Authentication**: JWT (JSON Web Tokens) with HttpOnly cookies & localStorage fallback mechanism.
*   **Validation**: Zod

### Shared Package
*   `@asta-rental/shared`: A common workspace package sharing DTOs, Zod schemas, types, and constants between the backend and frontend.

## 📦 Project Structure (Monorepo)

```
asta-rental/
├── frontend/      # Next.js 14 application
├── backend/       # Express server & APIs
└── shared/        # Shared TypeScript interfaces & Zod schemas
```

## ⚙️ Local Development Setup

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL
*   Redis (running locally on port 6379)

### 1. Environment Variables
Create a `.env.local` file in `frontend/` and `.env` in `backend/` with the appropriate local configurations.
*(Example configurations are standard for localhost 3000/4000).*

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup & Seeding
```bash
# In the backend directory
npm run db:migrate
npm run db:seed
```
*The seed command sets up a default organization ("Alpha Real Estate Solutions") and an admin user.*

### 4. Run Development Servers
```bash
# Terminal 1: Run frontend
cd frontend
npm run dev

# Terminal 2: Run backend
cd backend
npm run dev
```

The application will be available at `http://localhost:3000`.

## 🛡 Security Highlights
*   **Row-Level Security (RLS)**: Enforced directly at the PostgreSQL level via Drizzle schemas to guarantee tenant data isolation.
*   **Token Rotation**: Refresh tokens are securely rotated upon every usage and revoked in PostgreSQL, preventing replay attacks.
*   **Strict CORS Policy**: Designed for secure client-server cross-origin communication with credentials.

## 📄 License
All rights reserved.
