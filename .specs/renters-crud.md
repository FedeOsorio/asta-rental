# Specification: Renters Module (`/renters`)

## Overview
Manages tenant/renter personal and contact information under Feature-Based Hexagonal Architecture.

## Endpoints & Use Cases

### 1. `GET /renters` (`ListRentersUseCase`)
- Returns list of renters for `organization_id = app.current_org`.

### 2. `POST /renters` (`CreateRenterUseCase`)
- **Roles Allowed**: `admin`, `agent`.
- **Validation**: Zod `createRenterSchema` (`fullName`, `email`, `phone`).

### 3. `GET /renters/:id` (`GetRenterByIdUseCase`)
- Returns renter details or `404 Not Found`.

### 4. `PATCH /renters/:id` (`UpdateRenterUseCase`)
- **Roles Allowed**: `admin`, `agent`.
- Updates renter details.
