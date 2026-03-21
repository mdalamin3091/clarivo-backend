import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import validate from '../../middlewares/validate';
import { setupOrganizationSchema, updateBrandingSchema, updatePortalMenusSchema } from './organization.validation';
import { checkName, setup, updateBranding, updatePortalMenus } from './organization.controller';

const router = Router();

// GET /api/v1/organizations/check-name?name=<name>
// Public — check availability before user submits the form
router.get('/check-name', checkName);

// POST /api/v1/organizations/setup
// Requires auth — called once after signup to create the initial org
router.post('/setup', requireAuth, validate(setupOrganizationSchema), setup);

// PATCH /api/v1/organizations/branding
// Updates current org's branding settings
router.patch('/branding', requireAuth, validate(updateBrandingSchema), updateBranding);

// PUT /api/v1/organizations/portal-menus
// Replaces the public portal menu configuration for the active org
// Data is read via get-full-organization (better-auth) — no separate GET needed
router.put('/portal-menus', requireAuth, validate(updatePortalMenusSchema), updatePortalMenus);

export default router;
