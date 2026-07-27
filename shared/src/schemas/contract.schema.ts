import { z } from 'zod';

export const createContractSchema = z.object({
  propertyId: z.string().uuid('Invalid property ID'),
  renterId: z.string().uuid('Invalid renter ID'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  monthlyRent: z.number().positive('Monthly rent must be positive')
}).refine(data => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate']
});

export type CreateContractInput = z.infer<typeof createContractSchema>;
