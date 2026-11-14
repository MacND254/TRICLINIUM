import { Request, Response, NextFunction } from 'express';
import prisma from '../../database/client';
import { cache, CACHE_KEYS } from '../../integrations/redis';
import { logAudit } from '../../middleware/audit';
import { websiteSettingsSchema } from '@triclinium/validation';
import { DEFAULT_WEBSITE_SETTINGS } from '@triclinium/shared';

export class SettingsController {
  // GET /settings/public
  static async getPublicSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const cached = await cache.get(CACHE_KEYS.SETTINGS);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      const dbSetting = await prisma.websiteSetting.findUnique({
        where: { key: 'global_settings' },
      });

      const settings = dbSetting ? (dbSetting.value as any) : DEFAULT_WEBSITE_SETTINGS;

      // Filter out sensitive administrative notification recipients for public consumption
      const publicSettings = {
        general: settings.general,
        contact: settings.contact,
        social: settings.social,
        appearance: settings.appearance,
        seo: settings.seo,
      };

      await cache.set(CACHE_KEYS.SETTINGS, publicSettings, 3600);
      return res.json({ success: true, data: publicSettings });
    } catch (err) {
      next(err);
    }
  }

  // GET /admin/settings
  static async getAdminSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const dbSetting = await prisma.websiteSetting.findUnique({
        where: { key: 'global_settings' },
      });

      const settings = dbSetting ? (dbSetting.value as any) : DEFAULT_WEBSITE_SETTINGS;
      return res.json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  }

  // PUT /admin/settings
  static async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = websiteSettingsSchema.parse(req.body);

      const updated = await prisma.websiteSetting.upsert({
        where: { key: 'global_settings' },
        update: { value: validated as any },
        create: {
          key: 'global_settings',
          value: validated as any,
        },
      });

      await cache.del([CACHE_KEYS.SETTINGS, CACHE_KEYS.HOMEPAGE]);

      await logAudit({
        req,
        action: 'WEBSITE_SETTINGS_UPDATED',
        entityType: 'WebsiteSetting',
        entityId: updated.id,
      });

      return res.json({
        success: true,
        data: updated.value,
        message: 'Website settings updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}
