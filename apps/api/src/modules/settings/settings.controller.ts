import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
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
      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MAIL_GATEWAY_ERROR',
            message: result.error || 'Failed to dispatch test email via Mail Gateway. Please check your SMTP credentials.',
          },
          message: result.error || 'Failed to dispatch test email',
        });
      }
      return res.json({ success: true, message: `Test email sent successfully to ${to}` });
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
        contactEmail: rowMap['contactEmail'] || rowMap['notifyEmail'] || rowMap['smtpFromEmail'] || globalSetting?.contact?.email || 'inquiries@triclinium.com',
        supportEmail: rowMap['supportEmail'] || globalSetting?.contact?.supportEmail || 'support@triclinium.com',
        notifyEmail: rowMap['notifyEmail'] || '',
        smtpFromEmail: rowMap['smtpFromEmail'] || '',
        phone: rowMap['phone'] || globalSetting?.contact?.phone || '+254 700 555 199',
        phoneAlt: rowMap['phoneAlt'] !== undefined && rowMap['phoneAlt'] !== null
          ? String(rowMap['phoneAlt']).trim()
          : (globalSetting?.contact?.phoneAlt ? String(globalSetting.contact.phoneAlt).trim() : ''),
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
      const itemsToUpsert: Array<{ key: string; value: any }> = [];

      if (Array.isArray(req.body.settings)) {
        for (const item of req.body.settings) {
          if (!item || !item.key) continue;
          let finalValue = item.value;

          // Auto-convert Data URIs to persistent media assets on disk to prevent database bloat
          if (typeof finalValue === 'string' && finalValue.startsWith('data:')) {
            try {
              const matches = finalValue.match(/^data:([a-zA-Z0-9\/+.-]+);base64,(.+)$/);
              if (matches) {
                const mimeType = matches[1];
                const ext = mimeType === 'image/png' ? '.png' : mimeType === 'image/svg+xml' ? '.svg' : mimeType === 'image/webp' ? '.webp' : '.jpg';
                const filename = `${Date.now()}-${item.key}-${crypto.randomBytes(6).toString('hex')}${ext}`;

                let uploadDir = path.resolve(process.cwd(), 'apps/web/public/uploads');
                if (!fs.existsSync(path.resolve(process.cwd(), 'apps/web')) && fs.existsSync(path.resolve(process.cwd(), '../web/public'))) {
                  uploadDir = path.resolve(process.cwd(), '../web/public/uploads');
                }
                if (!fs.existsSync(uploadDir)) {
                  fs.mkdirSync(uploadDir, { recursive: true });
                }

                const buffer = Buffer.from(matches[2], 'base64');
                fs.writeFileSync(path.join(uploadDir, filename), buffer);

                const publicUrl = `/uploads/${filename}`;
                await prisma.mediaAsset.create({
                  data: {
                    filename,
                    originalName: `${item.key}${ext}`,
                    url: publicUrl,
                    mimeType,
                    size: buffer.length,
                    provider: 'local',
                  },
                });
                finalValue = publicUrl;
              }
            } catch (e) {
              console.warn('[Auto-extract settings image data URI failed]:', e);
            }
          }

          itemsToUpsert.push({ key: item.key, value: finalValue });
        }
      } else if (req.body && typeof req.body === 'object') {
        if (req.body.general) {
          const validated = websiteSettingsSchema.parse(req.body);
          itemsToUpsert.push({ key: 'global_settings', value: validated });
        } else {
          for (const [k, v] of Object.entries(req.body)) {
            itemsToUpsert.push({ key: k, value: v });
          }
        }
      }

      // Fast single-query batch upsert for all settings (sub-second vs minutes of round trips)
      if (itemsToUpsert.length > 0) {
        const ids = itemsToUpsert.map(() => crypto.randomUUID());
        const keys = itemsToUpsert.map((i) => i.key);
        const values = itemsToUpsert.map((i) => JSON.stringify(i.value));

        try {
          await prisma.$executeRaw`
            INSERT INTO website_settings (id, key, value, "updatedAt")
            SELECT 
              unnest(${ids}::text[]),
              unnest(${keys}::text[]),
              unnest(${values}::jsonb[]),
              NOW()
            ON CONFLICT (key) DO UPDATE
            SET value = EXCLUDED.value, "updatedAt" = EXCLUDED."updatedAt"
          `;
        } catch (rawErr) {
          console.warn('[Batch executeRaw failed, falling back to transaction]:', rawErr);
          await prisma.$transaction(
            itemsToUpsert.map((i) =>
              prisma.websiteSetting.upsert({
                where: { key: i.key },
                update: { value: i.value },
                create: { key: i.key, value: i.value },
              })
            )
          );
        }
      }

      await cache.del([CACHE_KEYS.SETTINGS, CACHE_KEYS.HOMEPAGE]).catch(() => {});

      await logAudit({
        req,
        action: 'WEBSITE_SETTINGS_UPDATED',
        entityType: 'WebsiteSetting',
        entityId: 'global_settings',
      }).catch(() => {});

      return res.json({
        success: true,
        message: 'Website settings updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}
