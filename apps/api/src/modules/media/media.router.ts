import { Router } from 'express';
import multer from 'multer';
import { MediaController } from './media.controller';
import { authenticate } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import { PERMISSIONS } from '@triclinium/shared';

export const mediaRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

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
  upload.single('file'),
  MediaController.upload
);

mediaRouter.delete(
  '/admin/media/:id',
  authenticate,
  requirePermission(PERMISSIONS.MEDIA_DELETE),
  MediaController.deleteMedia
);
