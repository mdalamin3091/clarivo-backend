import { Router } from 'express';
import healthRouter       from '../modules/health/health.routes';
import organizationRouter from '../modules/organization/organization.routes';
import uploadRouter       from '../modules/upload/upload.routes';
import boardRouter        from '../modules/board/board.routes';
import statusRouter       from '../modules/status/status.routes';
import tagRouter          from '../modules/tag/tag.routes';

const router = Router();

router.use('/health',        healthRouter);
router.use('/organizations', organizationRouter);
router.use('/upload',        uploadRouter);
router.use('/boards',        boardRouter);
router.use('/statuses',      statusRouter);
router.use('/tags',          tagRouter);

export default router;
