import { Router } from 'express';
import healthRouter from '../modules/health/health.routes';
import organizationRouter from '../modules/organization/organization.routes';

const router = Router();

router.use('/health', healthRouter);
router.use('/organizations', organizationRouter);

export default router;
