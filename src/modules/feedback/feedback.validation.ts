import { z } from 'zod';

// ── Feedback ───────────────────────────────────────────────────────────────────

export const createFeedbackSchema = z.object({
  boardId:        z.string().min(1),
  title:          z.string().min(1).max(255).trim(),
  description:    z.unknown().optional(),           // Tiptap JSON doc
  statusId:       z.string().optional(),
  tagIds:         z.array(z.string()).optional(),
  assigneeIds:    z.array(z.string()).optional(),
  postVisibility: z.enum(['public', 'private']).optional(),
  enableComment:  z.boolean().optional(),
});

export const updateFeedbackSchema = z.object({
  title:          z.string().min(1).max(255).trim().optional(),
  description:    z.unknown().optional(),
  statusId:       z.string().nullable().optional(),
  tagIds:         z.array(z.string()).nullable().optional(),
  assigneeIds:    z.array(z.string()).nullable().optional(),
  boardId:        z.string().optional(),
  postVisibility: z.enum(['public', 'private']).optional(),
  enableComment:  z.boolean().optional(),
  pinnedAt:       z.string().datetime().nullable().optional(),
});

export const feedbackQuerySchema = z.object({
  boardId:  z.string().optional(),
  statusId: z.string().optional(),
  tagId:    z.string().optional(),
  search:   z.string().optional(),
  sort:     z.enum(['trending', 'recent', 'oldest', 'top']).optional(),
  page:     z.coerce.number().int().min(1).optional(),
  limit:    z.coerce.number().int().min(1).max(100).optional(),
});

// ── Vote ───────────────────────────────────────────────────────────────────────

export const toggleVoteSchema = z.object({
  type: z.enum(['upvote', 'downvote']),
});

// ── Comment ───────────────────────────────────────────────────────────────────

export const addCommentSchema = z.object({
  content:  z.unknown(),          // Tiptap JSON doc — validated structurally at runtime
  parentId: z.string().optional(),
});

export const updateCommentSchema = z.object({
  content: z.unknown(),
});

// ── Comment vote ──────────────────────────────────────────────────────────────

export const toggleCommentVoteSchema = z.object({
  type: z.enum(['upvote', 'downvote']),
});

// ── Exported types ─────────────────────────────────────────────────────────────

export type CreateFeedbackBody    = z.infer<typeof createFeedbackSchema>;
export type UpdateFeedbackBody    = z.infer<typeof updateFeedbackSchema>;
export type FeedbackQueryParams   = z.infer<typeof feedbackQuerySchema>;
export type ToggleVoteBody        = z.infer<typeof toggleVoteSchema>;
export type AddCommentBody        = z.infer<typeof addCommentSchema>;
export type UpdateCommentBody     = z.infer<typeof updateCommentSchema>;
export type ToggleCommentVoteBody = z.infer<typeof toggleCommentVoteSchema>;
