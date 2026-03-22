import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import validate from '../../middlewares/validate';
import { setupOrganizationSchema } from './organization.validation';
import { checkSlug, createOrganization } from './organization.controller';

const router = Router();

// GET /api/v1/organizations/check-slug?slug=<slug>
// Public — check slug availability before the user is authenticated
router.get('/check-slug', checkSlug);

// POST /api/v1/organizations/create
// Requires auth — called once after signup to create the initial org
router.post('/create', requireAuth, validate(setupOrganizationSchema), createOrganization);

export default router;
