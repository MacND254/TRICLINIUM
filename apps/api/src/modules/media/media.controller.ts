import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import prisma from '../../database/client';
import { uploadMedia } from '../../integrations/cloudinary';
import { logAudit } from '../../middleware/audit';

export class MediaController {
  // GET /media/file/:filename or /uploads/:filename
  static async serveFile(req: Request, res: Response, next: NextFunction) {
    try {
      const rawParam = req.params.filename || req.params.id || '';
      const filename = path.basename(rawParam);

      // 1. Try disk storage first (for local development or pre-bundled uploads)
      const possiblePaths = [
        path.resolve(process.cwd(), 'apps/web/public/uploads', filename),
        path.resolve(process.cwd(), '../web/public/uploads', filename),
        path.resolve(process.cwd(), 'public/uploads', filename),
        path.resolve(process.cwd(), 'uploads', filename),
      ];

      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          return res.sendFile(p);
        }
      }

      // 2. Query database for media asset by filename, id, or url suffix
      const asset = await prisma.mediaAsset.findFirst({
        where: {
          OR: [
            { filename },
            { id: filename },
            { url: { endsWith: filename } },
          ],
        },
      });

      if (!asset) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Requested media asset was not found' },
        });
      }

      // 3. If asset URL points to external CDN/Cloudinary, redirect
      if (asset.url.startsWith('http://') || asset.url.startsWith('https://')) {
        return res.redirect(302, asset.url);
      }

      // 4. If asset URL is a base64 Data URI, decode and stream binary with caching headers
      if (asset.url.startsWith('data:')) {
        const matches = asset.url.match(/^data:([a-zA-Z0-9\/+.-]+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1] || asset.mimeType || 'image/jpeg';
          const buffer = Buffer.from(matches[2], 'base64');
          res.setHeader('Content-Type', mimeType);
          res.setHeader('Content-Length', buffer.length.toString());
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          return res.end(buffer);
        }
      }

      return res.status(404).json({
        success: false,
        error: { code: 'FILE_NOT_FOUND', message: 'Media content could not be located' },
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /admin/media/upload
  static async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { code: 'FILE_REQUIRED', message: 'No file was provided in the upload request' },
        });
      }

      // Enforce admin configured max upload size limit
      let maxUploadSizeMb = 2; // Default 2MB limit
      try {
        const settingRow = await prisma.websiteSetting.findUnique({ where: { key: 'maxUploadSizeMb' } });
        if (settingRow && settingRow.value) {
          const parsed = Number(settingRow.value);
          if (!isNaN(parsed) && parsed > 0) {
            maxUploadSizeMb = parsed;
          }
        }
      } catch {}

      const maxBytes = maxUploadSizeMb * 1024 * 1024;
      if (req.file.size > maxBytes) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: `File size (${(req.file.size / (1024 * 1024)).toFixed(2)} MB) exceeds configured upload limit of ${maxUploadSizeMb} MB.`,
          },
        });
      }

      const uploaded = await uploadMedia(req.file);

      // Return clean, short public URL so database JSON fields don't store megabytes of base64
      const publicUrl = uploaded.url.startsWith('data:')
        ? `/api/v1/media/file/${uploaded.filename}`
        : uploaded.url;

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
        details: { filename: asset.filename, url: publicUrl },
      });

      return res.status(201).json({
        success: true,
        data: {
          ...asset,
          url: publicUrl,
        },
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
