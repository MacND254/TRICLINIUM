import { Request, Response, NextFunction } from 'express';
import prisma from '../../database/client';
import { cache, CACHE_KEYS } from '../../integrations/redis';
import { logAudit } from '../../middleware/audit';
import { websiteSettingsSchema } from '@triclinium/validation';
import { DEFAULT_WEBSITE_SETTINGS } from '@triclinium/shared';
import { sendMailGateway, getNotifyEmail } from '../../integrations/mailer';

export class SettingsController {
  // POST /admin/settings/test-email
  static async sendTestEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const to = await getNotifyEmail();
      const result = await sendMailGateway({
        to,
        subject: 'TRICLINIUM — Mail Gateway Test',
        html: `<div style="font-family:sans-serif;padding:24px;"><h2 style="color:#0f172a">Mail Gateway Active</h2><p>This confirms your TRICLINIUM mail gateway is configured and working correctly.</p><p style="color:#64748b;font-size:13px;">Sent at: ${new Date().toISOString()}</p></div>`,
      });
      if (!result.success) return res.status(500).json({ success: false, message: result.error || 'Send failed' });
      return res.json({ success: true, message: `Test email sent to ${to}` });
    } catch (err) { next(err); }
  }
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
      const allRows = await prisma.websiteSetting.findMany();
      const rowMap: Record<string, any> = {};
      for (const r of allRows) {
        rowMap[r.key] = r.value;
      }

      const globalSetting = rowMap['global_settings'] || DEFAULT_WEBSITE_SETTINGS;

      // Flatten for settings page consumers while keeping structure
      const flatSettings: Record<string, any> = {
        ...rowMap,
        siteName: rowMap['siteName'] || globalSetting?.general?.companyName || 'TRICLINIUM',
        tagline: rowMap['tagline'] || 'Advanced CCTV & Security Solutions',
        description: rowMap['description'] || globalSetting?.general?.description || '',
        contactEmail: rowMap['contactEmail'] || globalSetting?.contact?.email || 'inquiries@triclinium.com',
        phone: rowMap['phone'] || globalSetting?.contact?.phone || '',
        address: rowMap['address'] || globalSetting?.contact?.address || '',
        businessHours: rowMap['businessHours'] || globalSetting?.contact?.businessHours || '',
        metaTitle: rowMap['metaTitle'] || globalSetting?.seo?.defaultTitle || '',
        metaDescription: rowMap['metaDescription'] || globalSetting?.seo?.defaultDescription || '',
        primaryColor: rowMap['primaryColor'] || globalSetting?.appearance?.primaryColor || '#0ea5e9',
        accentColor: rowMap['accentColor'] || globalSetting?.appearance?.accentColor || '#0284c7',
        ...globalSetting,
      };

      return res.json({ success: true, data: flatSettings, items: allRows });
    } catch (err) {
      next(err);
    }
  }

  // PUT /admin/settings
  static async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      if (Array.isArray(req.body.settings)) {
        for (const item of req.body.settings) {
          if (item.key) {
            await prisma.websiteSetting.upsert({
              where: { key: item.key },
              update: { value: item.value },
              create: { key: item.key, value: item.value },
            });
          }
        }
      } else if (req.body && typeof req.body === 'object') {
        if (req.body.general) {
          const validated = websiteSettingsSchema.parse(req.body);
          await prisma.websiteSetting.upsert({
            where: { key: 'global_settings' },
            update: { value: validated as any },
            create: { key: 'global_settings', value: validated as any },
          });
        } else {
          for (const [k, v] of Object.entries(req.body)) {
            await prisma.websiteSetting.upsert({
              where: { key: k },
              update: { value: v as any },
              create: { key: k, value: v as any },
            });
          }
        }
      }

      await cache.del([CACHE_KEYS.SETTINGS, CACHE_KEYS.HOMEPAGE]);

      await logAudit({
        req,
        action: 'WEBSITE_SETTINGS_UPDATED',
        entityType: 'WebsiteSetting',
        entityId: 'global_settings',
      });

      return res.json({
        success: true,
        message: 'Website settings updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}
