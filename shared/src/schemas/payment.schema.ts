import { z } from 'zod';

export const markPaymentPaidSchema = z.object({
  paidDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional()
});

export type MarkPaymentPaidInput = z.infer<typeof markPaymentPaidSchema>;
