import { Router } from 'express';
import multer from 'multer';
import { MediaController } from './media.controller';
import { authenticate } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import { uploadLimiter } from '../../middleware/rate-limit';
import { PERMISSIONS } from '@triclinium/shared';

export const mediaRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Public high-performance static media serving endpoint
mediaRouter.get('/media/file/:filename', MediaController.serveFile);
mediaRouter.get('/uploads/:filename', MediaController.serveFile);
mediaRouter.get('/media/:id/raw', MediaController.serveFile);

mediaRouter.get(
  '/admin/media',
  authenticate,
  requirePermission(PERMISSIONS.MEDIA_VIEW),
  MediaController.listMedia
);

mediaRouter.post(
  '/admin/media/upload',
  authenticate,
  requirePermission(PERMISSIONS.MEDIA_UPLOAD),
  uploadLimiter,
  upload.single('file'),
  MediaController.upload
);

mediaRouter.delete(
  '/admin/media/:id',
  authenticate,
  requirePermission(PERMISSIONS.MEDIA_DELETE),
  MediaController.deleteMedia
);
