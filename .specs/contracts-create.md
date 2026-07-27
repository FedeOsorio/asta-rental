# Specification: Contracts — Creation & Payment Schedule Generation (`POST /contracts`)

## Overview
Executes atomic database transactions to lease a property, generate monthly payment schedules, and change property status.

## Flow & Transactional Logic (`CreateContractUseCase`)
1. **Validation**: Check if target `property` exists and `status === 'available'`. If rented/maintenance → return `409 Conflict`.
2. **Payment Schedule Generation**: Calculate monthly due dates from `startDate` to `endDate` using `generateMonthlyPaymentDates`.
3. **Database Transaction (`DrizzleContractRepository.createContractWithPayments`)**:
   - Insert contract record (`status = 'active'`).
   - Update property status (`status = 'rented'`).
   - Insert N payment rows (`status = 'pending'`, `amount = monthly_rent`).
   - **Rollback Invariant**: If any step fails, entire transaction is rolled back.
