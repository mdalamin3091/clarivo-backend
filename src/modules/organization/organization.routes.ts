import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import validate from '../../middlewares/validate';
import { setupOrganizationSchema } from './organization.validation';
import { checkName, setup } from './organization.controller';

const router = Router();

// GET /api/v1/organizations/check-name?name=<name>
// Public — check availability before user submits the form
router.get('/check-name', checkName);

// POST /api/v1/organizations/setup
// Requires auth — called once after signup to create the initial org
router.post('/setup', requireAuth, validate(setupOrganizationSchema), setup);

export default router;
