import { describe, it, expect } from 'vitest';
import { generateMonthlyPaymentDates } from '../../src/modules/contracts/domain/payment-date-generator.js';

describe('Payment Date Generator Utility', () => {
  it('should generate monthly due dates between start and end date', () => {
    const dates = generateMonthlyPaymentDates('2026-01-15', '2026-04-15');

    expect(dates).toHaveLength(4);
    expect(dates).toEqual([
      '2026-01-15',
      '2026-02-15',
      '2026-03-15',
      '2026-04-15'
    ]);
  });

  it('should generate 12 monthly dates for a 1-year contract', () => {
    const dates = generateMonthlyPaymentDates('2026-01-01', '2026-12-01');
    expect(dates).toHaveLength(12);
  });
});
