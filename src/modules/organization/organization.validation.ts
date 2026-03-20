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

export const checkNameSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export const updateBrandingSchema = z.object({
  displayName:  z.string().min(2).max(100).trim().optional(),
  brandColor:   z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color').nullable().optional(),
  darkBgColor:  z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color').nullable().optional(),
  defaultTheme: z.enum(['system', 'light', 'dark']).optional(),
  socialImage:  z.string().url('Invalid URL').nullable().optional(),
  logo:         z.string().url('Invalid URL').nullable().optional(),
});

export type SetupOrganizationBody  = z.infer<typeof setupOrganizationSchema>;
export type UpdateBrandingBody     = z.infer<typeof updateBrandingSchema>;

const moduleIconSchema = z.object({
  type: z.enum(['predefined', 'custom']),
  value: z.string().min(1),
});

export const moduleItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Module name is required').max(50).trim(),
  icon: moduleIconSchema,
  link: z.string().min(1, 'Link is required').max(100).trim(),
});

export const updatePortalMenusSchema = z.object({
  publicPortalMenus: z.array(moduleItemSchema).max(20),
});

export type UpdatePortalMenusBody = z.infer<typeof updatePortalMenusSchema>;
