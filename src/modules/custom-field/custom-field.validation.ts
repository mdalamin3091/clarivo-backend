import { z } from 'zod';

const FIELD_TYPES = ['text', 'number', 'url', 'date', 'boolean', 'dropdown', 'multiselect'] as const;
const OPTION_TYPES = new Set(['dropdown', 'multiselect']);

export const createCustomFieldSchema = z
  .object({
    name:                 z.string().min(1, 'Name is required').max(100).trim(),
    type:                 z.enum(FIELD_TYPES),
    options:              z.array(z.string().min(1)).optional(),
    placeholder:          z.string().max(200).optional(),
    isRequired:           z.boolean().optional(),
    isPrivate:            z.boolean().optional(),
    showAnswerToEveryone: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (OPTION_TYPES.has(data.type) && (!data.options || data.options.length === 0)) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        path:    ['options'],
        message: `At least one option is required for ${data.type} fields`,
      });
    }
  });

export const updateCustomFieldSchema = z
  .object({
    name:                 z.string().min(1).max(100).trim().optional(),
    type:                 z.enum(FIELD_TYPES).optional(),
    options:              z.array(z.string().min(1)).optional(),
    placeholder:          z.string().max(200).optional(),
    isRequired:           z.boolean().optional(),
    isPrivate:            z.boolean().optional(),
    showAnswerToEveryone: z.boolean().optional(),
    order:                z.number().int().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    const effectiveType = data.type;
    if (effectiveType && OPTION_TYPES.has(effectiveType) && (!data.options || data.options.length === 0)) {
      ctx.addIssue({
        code:    z.ZodIssueCode.custom,
        path:    ['options'],
        message: `At least one option is required for ${effectiveType} fields`,
      });
    }
  });

export type CreateCustomFieldBody = z.infer<typeof createCustomFieldSchema>;
export type UpdateCustomFieldBody = z.infer<typeof updateCustomFieldSchema>;
