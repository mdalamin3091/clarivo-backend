import { Request, Response }         from 'express';
import catchAsync                     from '../../utils/catchAsync';
import sendResponse                   from '../../utils/sendResponse';
import ApiError                       from '../../utils/ApiError';
import { AuthenticatedRequest }       from '../../middlewares/requireAuth';
import { feedbackQuerySchema }        from './feedback.validation';
import * as service                   from './feedback.service';

// ── Helpers ────────────────────────────────────────────────────────────────────

const getOrgId = (req: Request): string => {
  const orgId = (req as AuthenticatedRequest).session.activeOrganizationId;
  if (!orgId) throw new ApiError(403, 'No active organization');
  return orgId;
};

const getUserId = (req: Request): string =>
  (req as AuthenticatedRequest).user.id;

// ── Feedback ───────────────────────────────────────────────────────────────────

export const listFeedback = catchAsync(async (req: Request, res: Response) => {
  const query  = feedbackQuerySchema.parse(req.query);
  const result = await service.listFeedback(getOrgId(req), getUserId(req), query);
  sendResponse(res, { statusCode: 200, success: true, message: 'Feedback fetched', data: result });
});

export const getOneFeedback = catchAsync(async (req: Request, res: Response) => {
  const feedback = await service.getFeedback(getOrgId(req), getUserId(req), req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Feedback fetched', data: { feedback } });
});

export const addFeedback = catchAsync(async (req: Request, res: Response) => {
  const feedback = await service.createFeedback(getOrgId(req), getUserId(req), req.body);
  sendResponse(res, { statusCode: 201, success: true, message: 'Feedback created', data: { feedback } });
});

export const editFeedback = catchAsync(async (req: Request, res: Response) => {
  const feedback = await service.updateFeedback(getOrgId(req), getUserId(req), req.params.id as string, req.body);
  sendResponse(res, { statusCode: 200, success: true, message: 'Feedback updated', data: { feedback } });
});

export const removeFeedback = catchAsync(async (req: Request, res: Response) => {
  await service.deleteFeedback(getOrgId(req), getUserId(req), req.params.id as string);
  sendResponse(res, { statusCode: 200, success: true, message: 'Feedback deleted', data: null });
});

// ── Vote ───────────────────────────────────────────────────────────────────────

export const voteFeedback = catchAsync(async (req: Request, res: Response) => {
  const result = await service.toggleFeedbackVote(
    getOrgId(req),
    getUserId(req),
    req.params.id as string,
    req.body,
  );
  sendResponse(res, { statusCode: 200, success: true, message: 'Vote updated', data: result });
});

// ── Comments ───────────────────────────────────────────────────────────────────

export const addComment = catchAsync(async (req: Request, res: Response) => {
  const comments = await service.addComment(
    getOrgId(req),
    getUserId(req),
    req.params.id as string,
    req.body,
  );
  sendResponse(res, { statusCode: 201, success: true, message: 'Comment added', data: { comments } });
});

export const editComment = catchAsync(async (req: Request, res: Response) => {
  const comments = await service.updateComment(
    getOrgId(req),
    getUserId(req),
    req.params.id        as string,
    req.params.commentId as string,
    req.body,
  );
  sendResponse(res, { statusCode: 200, success: true, message: 'Comment updated', data: { comments } });
});

export const removeComment = catchAsync(async (req: Request, res: Response) => {
  const comments = await service.deleteComment(
    getOrgId(req),
    getUserId(req),
    req.params.id        as string,
    req.params.commentId as string,
  );
  sendResponse(res, { statusCode: 200, success: true, message: 'Comment deleted', data: { comments } });
});

// ── Comment vote ───────────────────────────────────────────────────────────────

export const voteComment = catchAsync(async (req: Request, res: Response) => {
  const result = await service.toggleCommentVote(
    getOrgId(req),
    getUserId(req),
    req.params.id        as string,
    req.params.commentId as string,
    req.body,
  );
  sendResponse(res, { statusCode: 200, success: true, message: 'Comment vote updated', data: result });
});
