import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import validate from '../../middlewares/validate';
import { createBoardSchema, updateBoardSchema } from './board.validation';
import { listBoards, fetchBoard, addBoard, editBoard, removeBoard } from './board.controller';

const router = Router();

// All board routes require authentication + an active org (checked in controller)
router.use(requireAuth);

// GET  /api/v1/boards          → list all boards for active org
router.get('/', listBoards);

// GET  /api/v1/boards/:id      → get single board
router.get('/:id', fetchBoard);

// POST /api/v1/boards          → create board
router.post('/', validate(createBoardSchema), addBoard);

// PATCH /api/v1/boards/:id     → update board
router.patch('/:id', validate(updateBoardSchema), editBoard);

// DELETE /api/v1/boards/:id    → delete board
router.delete('/:id', removeBoard);

export default router;
