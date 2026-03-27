import { z } from 'zod';

// ── Feedback ───────────────────────────────────────────────────────────────────

export const createFeedbackSchema = z.object({
  boardId:        z.string().min(1, 'Board is required'),
  title:          z.string().min(1, 'Title is required').max(255).trim(),
  description:    z.unknown().optional(),                          // Tiptap JSON doc
  statusId:       z.string().optional(),
  tagIds:         z.array(z.string()).optional(),
  assigneeIds:    z.array(z.string()).optional(),
  postVisibility: z.enum(['public', 'private']).optional(),
  enableComment:  z.boolean().optional(),
  eta:            z.string().datetime().nullable().optional(),     // ISO-8601 or null
});

/** All fields optional for partial updates. */
export const updateFeedbackSchema = z.object({
  title:          z.string().min(1).max(255).trim().optional(),
  description:    z.unknown().optional(),
  boardId:        z.string().optional(),
  statusId:       z.string().nullable().optional(),
  tagIds:         z.array(z.string()).nullable().optional(),
  assigneeIds:    z.array(z.string()).nullable().optional(),
  postVisibility: z.enum(['public', 'private']).optional(),
  enableComment:  z.boolean().optional(),
  pinnedAt:       z.string().datetime().nullable().optional(),
  eta:            z.string().datetime().nullable().optional(),
});

/** Query-string filters + pagination for GET /feedback */
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

// ── Comments ───────────────────────────────────────────────────────────────────

export const addCommentSchema = z.object({
  /** Tiptap JSON document — required, must be a non-null value. */
  content:  z.unknown().refine((v) => v !== undefined && v !== null, {
    message: 'Comment content is required',
  }),
  parentId: z.string().optional(),
});

export const updateCommentSchema = z.object({
  content: z.unknown().refine((v) => v !== undefined && v !== null, {
    message: 'Comment content is required',
  }),
});

// ── Comment vote ───────────────────────────────────────────────────────────────

export const toggleCommentVoteSchema = z.object({
  type: z.enum(['upvote', 'downvote']),
});

// ── Exported inferred types ────────────────────────────────────────────────────

export type CreateFeedbackBody    = z.infer<typeof createFeedbackSchema>;
export type UpdateFeedbackBody    = z.infer<typeof updateFeedbackSchema>;
export type FeedbackQueryParams   = z.infer<typeof feedbackQuerySchema>;
export type ToggleVoteBody        = z.infer<typeof toggleVoteSchema>;
export type AddCommentBody        = z.infer<typeof addCommentSchema>;
export type UpdateCommentBody     = z.infer<typeof updateCommentSchema>;
export type ToggleCommentVoteBody = z.infer<typeof toggleCommentVoteSchema>;
