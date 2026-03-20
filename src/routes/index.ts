import { Router } from 'express';
import healthRouter from '../modules/health/health.routes';
import organizationRouter from '../modules/organization/organization.routes';
import uploadRouter from '../modules/upload/upload.routes';

const router = Router();

router.use('/health', healthRouter);
router.use('/organizations', organizationRouter);
router.use('/upload', uploadRouter);

export default router;
