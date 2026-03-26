import { Router } from 'express';
import { requireAuth, requireOrg } from '../../middlewares/requireAuth';
import validate from '../../middlewares/validate';
import {
  createFeedbackSchema,
  updateFeedbackSchema,
  toggleVoteSchema,
  addCommentSchema,
  updateCommentSchema,
  toggleCommentVoteSchema,
} from './feedback.validation';
import * as ctrl from './feedback.controller';

const router = Router();

router.use(requireAuth, requireOrg);

// ── Feedback CRUD ──────────────────────────────────────────────────────────────
// query params are parsed in the service via feedbackQuerySchema — no body to validate here
router.get(   '/',    ctrl.listFeedback);
router.post(  '/',    validate(createFeedbackSchema),         ctrl.addFeedback);
router.get(   '/:id', ctrl.getOneFeedback);
router.patch( '/:id', validate(updateFeedbackSchema),         ctrl.editFeedback);
router.delete('/:id', ctrl.removeFeedback);

// ── Feedback vote ──────────────────────────────────────────────────────────────
router.post('/:id/vote', validate(toggleVoteSchema), ctrl.voteFeedback);

// ── Comments ───────────────────────────────────────────────────────────────────
router.post(  '/:id/comments',              validate(addCommentSchema),          ctrl.addComment);
router.patch( '/:id/comments/:commentId',   validate(updateCommentSchema),       ctrl.editComment);
router.delete('/:id/comments/:commentId',   ctrl.removeComment);

// ── Comment vote ───────────────────────────────────────────────────────────────
router.post('/:id/comments/:commentId/vote', validate(toggleCommentVoteSchema),  ctrl.voteComment);

export default router;
