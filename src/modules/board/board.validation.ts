import { z } from 'zod';

const boardIconSchema = z.object({
  type:  z.enum(['predefined', 'emoji']),
  value: z.string().min(1, 'Icon value is required'),
});

const boardGreetingSchema = z.object({
  welcomingTitle:         z.string().max(200).trim(),
  welcomingDescription:   z.string().max(500).trim(),
  postCreationButtonText: z.string().max(50).trim(),
}).nullable().optional();

export const createBoardSchema = z.object({
  name:                    z.string().min(1, 'Board name is required').max(100).trim(),
  icon:                    boardIconSchema,
  defaultSorting:          z.enum(['trending', 'recent', 'oldest', 'top']).optional(),
  greeting:                boardGreetingSchema,
  visibility:              z.enum(['public', 'private']).optional(),
  allowSubscribe:          z.boolean().optional(),
  disableFollowupQuestions: z.boolean().optional(),
  disableEndUserPosting:   z.boolean().optional(),
});

export const updateBoardSchema = createBoardSchema.partial();

export type CreateBoardBody = z.infer<typeof createBoardSchema>;
export type UpdateBoardBody = z.infer<typeof updateBoardSchema>;
