import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import { imageUpload, fileUpload } from './upload.config';
import { uploadImage, uploadFileAsset } from './upload.controller';

const router = Router();

// POST /api/v1/upload/image?type=logo|social
router.post(
  '/image',
  requireAuth,
  (req: Request, res: Response, next: NextFunction) => {
    imageUpload(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  },
  uploadImage,
);

// POST /api/v1/upload/file  — arbitrary file attachments (≤10 MB)
router.post(
  '/file',
  requireAuth,
  (req: Request, res: Response, next: NextFunction) => {
    fileUpload(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  },
  uploadFileAsset,
);

export default router;


