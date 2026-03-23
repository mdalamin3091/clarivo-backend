import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import validate from '../../middlewares/validate';
import { createStatusSchema, updateStatusSchema } from './status.validation';
import { listStatuses, addStatus, editStatus, removeStatus, makeDefault } from './status.controller';

const router = Router();

router.use(requireAuth);

// GET  /api/v1/statuses           → list all statuses for active org
router.get('/', listStatuses);

// POST /api/v1/statuses           → create status
router.post('/', validate(createStatusSchema), addStatus);

// PATCH /api/v1/statuses/:id      → update status
router.patch('/:id', validate(updateStatusSchema), editStatus);

// DELETE /api/v1/statuses/:id     → delete status
router.delete('/:id', removeStatus);

// PATCH /api/v1/statuses/:id/default → set as default
router.patch('/:id/default', makeDefault);

export default router;
