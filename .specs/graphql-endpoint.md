# Specification: GraphQL Endpoint (`/graphql`)

## Overview
Exposes a unified GraphQL schema over Apollo Server for complex nested data fetching and financial reporting.

## Features & Resolvers
- **Authentication**: Validates Authorization `Bearer <token>` header and checks Redis token blacklist.
- **Tenant Context**: Sets `user.organizationId` in GraphQL context to enforce RLS on all underlying database queries.
- **Nested Queries**:
  - `contract(id)` fetches contract, nested `property`, nested `renter`, and nested `payments` in a single request.
  - `collectionDashboard` fetches financial metrics with Redis read-through caching.
