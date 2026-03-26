import path from 'path';
import crypto from 'crypto';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import ApiError from '../../utils/ApiError';

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5 MB
const MAX_FILE_SIZE  = 10 * 1024 * 1024; // 10 MB

// Resolve uploads root relative to the project root (clarivo-backend/)
const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');

const imageStorage = multer.diskStorage({
  destination(_req: Request, _file: Express.Multer.File, cb) {
    const type = (_req.query.type as string) === 'social' ? 'social' : 'logos';
    cb(null, path.join(UPLOADS_ROOT, type));
  },
  filename(_req: Request, file: Express.Multer.File, cb) {
    const ext  = path.extname(file.originalname).toLowerCase() || '.jpg';
    const name = `${crypto.randomUUID()}${ext}`;
    cb(null, name);
  },
});

const fileStorage = multer.diskStorage({
  destination(_req: Request, _file: Express.Multer.File, cb) {
    cb(null, path.join(UPLOADS_ROOT, 'files'));
  },
  filename(_req: Request, file: Express.Multer.File, cb) {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = `${crypto.randomUUID()}${ext}`;
    cb(null, name);
  },
});

const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  if (ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image files are allowed (jpeg, png, webp, gif, svg)'));
  }
};

export const imageUpload = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE },
}).single('file');

export const fileUpload = multer({
  storage: fileStorage,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('file');


