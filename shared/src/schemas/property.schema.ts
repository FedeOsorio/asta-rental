import { z } from 'zod';

export const createPropertySchema = z.object({
  address: z.string().min(5, 'Address must be at least 5 characters'),
  type: z.enum(['apartment', 'house', 'commercial']),
  monthlyRent: z.number().positive('Monthly rent must be positive')
});

export const updatePropertySchema = createPropertySchema.partial().extend({
  status: z.enum(['available', 'rented', 'maintenance']).optional()
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
