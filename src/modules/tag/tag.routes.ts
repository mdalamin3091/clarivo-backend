import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import validate from '../../middlewares/validate';
import { createTagSchema, updateTagSchema } from './tag.validation';
import { listTags, addTag, editTag, removeTag } from './tag.controller';

const router = Router();

router.use(requireAuth);

// GET    /api/v1/tags        → list all tags for active org
router.get('/',    listTags);

// POST   /api/v1/tags        → create tag
router.post('/',   validate(createTagSchema), addTag);

// PATCH  /api/v1/tags/:id    → update tag (name, color, isPrivate, order)
router.patch('/:id',  validate(updateTagSchema), editTag);

// DELETE /api/v1/tags/:id    → delete tag
router.delete('/:id', removeTag);

export default router;
