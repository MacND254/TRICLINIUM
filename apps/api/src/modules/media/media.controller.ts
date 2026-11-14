import { Request, Response, NextFunction } from 'express';
import prisma from '../../database/client';
import { uploadMedia } from '../../integrations/cloudinary';
import { logAudit } from '../../middleware/audit';

export class MediaController {
  // POST /admin/media/upload
  static async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { code: 'FILE_REQUIRED', message: 'No file was provided in the upload request' },
        });
      }

      const uploaded = await uploadMedia(req.file);

      const asset = await prisma.mediaAsset.create({
        data: {
          filename: uploaded.filename,
          originalName: req.file.originalname,
          url: uploaded.url,
          mimeType: uploaded.mimeType,
          size: uploaded.size,
          width: uploaded.width || null,
          height: uploaded.height || null,
          provider: uploaded.provider,
          uploadedById: req.user?.id || null,
        },
      });

      await logAudit({
        req,
        action: 'MEDIA_UPLOADED',
        entityType: 'MediaAsset',
        entityId: asset.id,
        details: { filename: asset.filename, url: asset.url },
      });

      return res.status(201).json({
        success: true,
        data: asset,
        message: 'File uploaded successfully to media storage',
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /admin/media
  static async listMedia(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 24;
      const search = (req.query.search as string) || '';

      const where: any = {};
      if (search) {
        where.OR = [
          { filename: { contains: search, mode: 'insensitive' } },
          { originalName: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [total, assets, stats] = await Promise.all([
        prisma.mediaAsset.count({ where }),
        prisma.mediaAsset.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.mediaAsset.aggregate({
          _sum: { size: true },
          _count: { id: true },
        }),
      ]);

      return res.json({
        success: true,
        data: {
          items: assets,
          storageUsage: {
            totalFiles: stats._count.id,
            totalSizeBytes: stats._sum.size || 0,
            totalFormatted: ((stats._sum.size || 0) / (1024 * 1024)).toFixed(2) + ' MB',
          },
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /admin/media/:id
  static async deleteMedia(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const asset = await prisma.mediaAsset.findUnique({ where: { id } });

      if (!asset) {
        return res.status(404).json({ success: false, error: { message: 'Media asset not found' } });
      }

      await prisma.mediaAsset.delete({ where: { id } });

      await logAudit({
        req,
        action: 'MEDIA_DELETED',
        entityType: 'MediaAsset',
        entityId: id,
        details: { filename: asset.filename },
      });

      return res.json({ success: true, message: 'Media asset deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}
