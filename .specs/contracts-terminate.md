# Specification: Contracts — Lease Termination (`PATCH /contracts/:id/terminate`)

## Overview
Terminates an active contract prematurely, releases the associated property, and cancels future pending payments.

## Flow & Transactional Logic (`TerminateContractUseCase`)
1. **Validation**: Check if contract exists and `status === 'active'`. If already terminated → return `400 Bad Request`.
2. **Database Transaction**:
   - Update contract status → `terminated`.
   - Update associated property status → `available`.
   - Update future pending payments (`due_date > TODAY` and `status = 'pending'`) → `cancelled` (retained for audit history).
