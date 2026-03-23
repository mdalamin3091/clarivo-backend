import { Router } from 'express';
import { requireAuth, requireOrg } from '../../middlewares/requireAuth';
import validate from '../../middlewares/validate';
import { createRoadmapSchema, updateRoadmapSchema, updateColumnSchema, reorderColumnsSchema, reorderRoadmapsSchema } from './roadmap.validation';
import * as ctrl from './roadmap.controller';

const router = Router();

router.use(requireAuth, requireOrg);

router.get(   '/',        ctrl.listRoadmaps);
router.get(   '/:id',    ctrl.getOneRoadmap);
router.post(  '/',        validate(createRoadmapSchema),  ctrl.addRoadmap);
// reorder must be defined before /:id to avoid being swallowed as a param
router.patch( '/reorder', validate(reorderRoadmapsSchema), ctrl.reorderRoadmapsCtrl);
router.patch( '/:id',     validate(updateRoadmapSchema),  ctrl.editRoadmap);
router.delete('/:id',     ctrl.removeRoadmap);

// ── Column routes (nested under /:roadmapId/columns) ──────────────────────────
// reorder must be defined before /:columnId to avoid being swallowed as a param
router.patch( '/:roadmapId/columns/reorder',     validate(reorderColumnsSchema), ctrl.reorderRoadmapColumns);
router.post(  '/:roadmapId/columns',             ctrl.addColumn);
router.patch( '/:roadmapId/columns/:columnId',   validate(updateColumnSchema),   ctrl.editColumn);
router.delete('/:roadmapId/columns/:columnId',   ctrl.removeColumn);

export default router;
