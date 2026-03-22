import { z } from 'zod';

const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const createTagSchema = z.object({
  name:      z.string().min(1, 'Name is required').max(50).trim(),
  color:     z.string().regex(hexColorRegex, 'Must be a valid hex color (e.g. #3b82f6)'),
  isPrivate: z.boolean().optional(),
});

export const updateTagSchema = createTagSchema
  .partial()
  .extend({ order: z.number().int().min(1).optional() });

export type CreateTagBody = z.infer<typeof createTagSchema>;
export type UpdateTagBody = z.infer<typeof updateTagSchema>;
