import { z } from 'zod';

export const setupOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .trim(),
  modules: z
    .array(z.enum(['feedback', 'survey', 'changelog', 'roadmap']))
    .min(1, 'Select at least one module'),
  accessibility: z.enum(['public', 'private']),
  teamSize: z.enum(['', '1', '2-10', '11-50', '51-200', '201+']).optional(),
});

export type SetupOrganizationBody = z.infer<typeof setupOrganizationSchema>;

export const checkSlugSchema = z.object({
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must be at most 100 characters'),
});

export type CheckSlugQuery = z.infer<typeof checkSlugSchema>;
