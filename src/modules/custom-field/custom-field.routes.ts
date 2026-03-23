import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import validate from '../../middlewares/validate';
import { createCustomFieldSchema, updateCustomFieldSchema } from './custom-field.validation';
import {
  listCustomFields,
  addCustomField,
  editCustomField,
  removeCustomField,
} from './custom-field.controller';

const router = Router();

router.use(requireAuth);

// GET    /api/v1/custom-fields        → list all custom fields for active org
router.get('/',     listCustomFields);

// POST   /api/v1/custom-fields        → create custom field
router.post('/',    validate(createCustomFieldSchema), addCustomField);

// PATCH  /api/v1/custom-fields/:id    → update custom field
router.patch('/:id',  validate(updateCustomFieldSchema), editCustomField);

// DELETE /api/v1/custom-fields/:id    → delete custom field
router.delete('/:id', removeCustomField);

export default router;
