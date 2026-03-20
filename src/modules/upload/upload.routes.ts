import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import { imageUpload } from './upload.config';
import { uploadImage } from './upload.controller';

const router = Router();

// POST /api/v1/upload/image?type=logo|social
// Accepts multipart/form-data with a single field named "file"
router.post(
  '/image',
  requireAuth,
  // Wrap multer so errors pass through the global errorHandler
  (req: Request, res: Response, next: NextFunction) => {
    imageUpload(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  },
  uploadImage,
);

export default router;


