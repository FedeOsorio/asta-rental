import { z } from 'zod';

export const createRenterSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number must be at least 8 characters')
});

export const updateRenterSchema = createRenterSchema.partial();

export type CreateRenterInput = z.infer<typeof createRenterSchema>;
export type UpdateRenterInput = z.infer<typeof updateRenterSchema>;
