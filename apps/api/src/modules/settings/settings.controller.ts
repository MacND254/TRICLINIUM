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

      const allRows = await prisma.websiteSetting.findMany();
      const rowMap: Record<string, any> = {};
      for (const r of allRows) {
        rowMap[r.key] = r.value;
      }

      const globalSetting = rowMap['global_settings'] || DEFAULT_WEBSITE_SETTINGS;

      // Filter and merge for public consumption
      const publicSettings = {
        siteName: rowMap['siteName'] || globalSetting?.general?.companyName || 'TRICLINIUM SYSTEMS',
        tagline: rowMap['tagline'] || globalSetting?.general?.tagline || 'CCTV Surveillance & Smart Security',
        logoUrl: rowMap['logoUrl'] || globalSetting?.general?.logoUrl || '',
        faviconUrl: rowMap['faviconUrl'] || globalSetting?.general?.faviconUrl || '',
        contactEmail: rowMap['contactEmail'] || globalSetting?.contact?.email || 'inquiries@triclinium.com',
        supportEmail: rowMap['supportEmail'] || globalSetting?.contact?.supportEmail || 'support@triclinium.com',
        phone: rowMap['phone'] || globalSetting?.contact?.phone || '+254 700 555 199',
        phoneAlt: rowMap['phoneAlt'] || globalSetting?.contact?.phoneAlt || '+254 711 555 198',
        address: rowMap['address'] || globalSetting?.contact?.address || 'Westlands Commercial Center, Ring Road',
        city: rowMap['city'] || 'Nairobi',
        country: rowMap['country'] || 'Kenya',
        postalCode: rowMap['postalCode'] || '00100',
        businessHours: rowMap['businessHours'] || globalSetting?.contact?.businessHours || 'Mon–Sat: 08:00–18:00 EAT (24/7 Monitoring Station)',
        currency: rowMap['currency'] || 'KES',
        currencySymbol: rowMap['currencySymbol'] || 'Ksh',
        primaryColor: rowMap['primaryColor'] || globalSetting?.appearance?.primaryColor || '#0ea5e9',
        accentColor: rowMap['accentColor'] || globalSetting?.appearance?.accentColor || '#0284c7',
        themeMode: rowMap['themeMode'] || 'system',
        colorGrading: rowMap['colorGrading'] || 'cyber-security',
        borderRadius: rowMap['borderRadius'] || 'rounded-xl',
        metaTitle: rowMap['metaTitle'] || globalSetting?.seo?.defaultTitle || 'TRICLINIUM SYSTEMS — CCTV Surveillance & Smart Security',
        metaDescription: rowMap['metaDescription'] || globalSetting?.seo?.defaultDescription || 'Kenya premier supplier & installer of 4K CCTV surveillance cameras, smart video doorbells, wireless home alarms, and video intercoms.',
        googleAnalyticsId: rowMap['googleAnalyticsId'] || '',
        googleTagManagerId: rowMap['googleTagManagerId'] || '',
        maxUploadSizeMb: rowMap['maxUploadSizeMb'] ? Number(rowMap['maxUploadSizeMb']) : 2,
        general: globalSetting?.general,
        contact: globalSetting?.contact,
        social: globalSetting?.social,
        appearance: globalSetting?.appearance,
        seo: globalSetting?.seo,
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
            let finalValue = item.value;
            // Auto-convert Data URIs to persistent media assets to prevent JSON bloat
            if (typeof finalValue === 'string' && finalValue.startsWith('data:')) {
              try {
                const matches = finalValue.match(/^data:([a-zA-Z0-9\/+.-]+);base64,(.+)$/);
                if (matches) {
                  const mimeType = matches[1];
                  const ext = mimeType === 'image/png' ? '.png' : mimeType === 'image/svg+xml' ? '.svg' : '.jpg';
                  const filename = `${Date.now()}-${item.key}-${Math.random().toString(36).substring(7)}${ext}`;
                  await prisma.mediaAsset.create({
                    data: {
                      filename,
                      originalName: `${item.key}${ext}`,
                      url: finalValue,
                      mimeType,
                      size: Buffer.byteLength(matches[2], 'base64'),
                      provider: 'local',
                    },
                  });
                  finalValue = `/api/v1/media/file/${filename}`;
                }
              } catch (e) {
                console.warn('[Auto-extract settings image data URI failed]:', e);
              }
            }

            await prisma.websiteSetting.upsert({
              where: { key: item.key },
              update: { value: finalValue },
              create: { key: item.key, value: finalValue },
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
