# Specification: Properties Module (`/properties`)

## Overview
Manages real estate properties for real estate agencies (`organizations`) under Feature-Based Hexagonal Architecture.

## Use Cases & Endpoints

### 1. `GET /properties` (`ListPropertiesUseCase`)
- **Query Params**: `status` (`available` | `rented` | `maintenance`).
- **Isolation**: RLS automatically restricts output to properties where `organization_id = app.current_org`.
- **Soft Delete Filter**: Excludes properties where `deleted_at IS NOT NULL`.

### 2. `POST /properties` (`CreatePropertyUseCase`)
- **Roles Allowed**: `admin`, `agent`.
- **Input Validation**: Zod `createPropertySchema` (`address`, `type`, `monthlyRent`).
- **Default Status**: `available`.

### 3. `GET /properties/:id` (`GetPropertyByIdUseCase`)
- Returns property by UUID.
- Returns `404 Not Found` if missing or soft-deleted.

### 4. `PATCH /properties/:id` (`UpdatePropertyUseCase`)
- **Roles Allowed**: `admin`, `agent`.
- Updates fields (`address`, `type`, `monthlyRent`, `status`).

### 5. `DELETE /properties/:id` (`DeletePropertyUseCase`)
- **Roles Allowed**: `admin`, `agent`.
- **Soft Delete**: Sets `deleted_at = NOW()`.
