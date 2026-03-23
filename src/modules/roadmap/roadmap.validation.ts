import { z } from 'zod';

const roadmapIconSchema = z.object({
  type:  z.enum(['predefined', 'emoji']),
  value: z.string().min(1),
});

export const createRoadmapSchema = z.object({
  name:         z.string().min(1, 'Name is required').max(100).trim(),
  description:  z.string().max(500).trim().optional(),
  icon:         roadmapIconSchema,
  visibility:   z.enum(['everyone', 'teamOnly']).optional(),
  baseFilter:   z.string().optional(),
  copiedFromId: z.string().optional(),
});

export const updateRoadmapSchema = createRoadmapSchema
  .partial()
  .extend({ order: z.number().int().min(0).optional() });

export type CreateRoadmapBody = z.infer<typeof createRoadmapSchema>;
export type UpdateRoadmapBody = z.infer<typeof updateRoadmapSchema>;

// ── Column schemas ─────────────────────────────────────────────────────────────

export const updateColumnSchema = z.object({
  name:       z.string().min(1).max(100).trim().optional(),
  color:      z.string().optional(),
  baseFilter: z.string().optional(),
  order:      z.number().int().min(0).optional(),
});

export const reorderRoadmapsSchema = z.object({
  items: z.array(z.object({
    id:    z.string(),
    order: z.number().int().min(0),
  })).min(1),
});

export type ReorderRoadmapsBody = z.infer<typeof reorderRoadmapsSchema>;

export const reorderColumnsSchema = z.object({
  items: z.array(z.object({
    id:    z.string(),
    order: z.number().int().min(0),
  })).min(1),
});

export type UpdateColumnBody    = z.infer<typeof updateColumnSchema>;
export type ReorderColumnsBody  = z.infer<typeof reorderColumnsSchema>;
