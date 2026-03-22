import { z } from 'zod';

const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const createStatusSchema = z.object({
  name:      z.string().min(1, 'Name is required').max(50).trim(),
  color:     z.string().regex(hexColorRegex, 'Must be a valid hex color (e.g. #3b82f6)'),
  isDefault: z.boolean().optional(),
});

export const updateStatusSchema = createStatusSchema.partial();

export type CreateStatusBody = z.infer<typeof createStatusSchema>;
export type UpdateStatusBody = z.infer<typeof updateStatusSchema>;
