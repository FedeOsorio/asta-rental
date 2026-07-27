# Specification: Frontend — Next.js App Router UI (`packages/frontend`)

## Overview
Provides a modern, high-aesthetic web interface for `asta-rental` built with Next.js 14 App Router, Tailwind CSS, Lucide icons, glassmorphism design system, and in-memory auth state management.

## Key Views & Features
1. **Login Page (`/login`)**:
   - Accepts email/password credentials.
   - Quick demo preset buttons for testing multi-tenant isolation (`admin@alpha.com`, `agent@alpha.com`, `admin@beta.com`).
2. **Dashboard Layout (`/`)**:
   - Sidebar navigation with active tenant RLS indicator showing `organizationId`.
   - Real-time collection metrics (Total Collected, Total Pending, Total Overdue) & property breakdown table.
3. **Properties Page (`/properties`)**:
   - Card grid for property management with soft-delete action and property creation modal.
4. **Renters Page (`/renters`)**:
   - Renter profile management and creation modal.
5. **Contracts Page (`/contracts`)**:
   - Transactional contract creation form triggering monthly payment generation.
6. **Payments Page (`/payments`)**:
   - Filterable payments list and "Mark as Paid" action triggering active Redis cache invalidation for dashboard.
