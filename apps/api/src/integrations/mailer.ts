import nodemailer from 'nodemailer';
import prisma from '../database/client';

interface MailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

// Get SMTP config from individual DB settings keys at runtime
async function getSmtpConfig() {
  const settings = await prisma.websiteSetting.findMany({
    where: {
      key: {
        in: ['smtpHost', 'smtpPort', 'smtpSecure', 'smtpUser', 'smtpPass', 'smtpFromEmail', 'smtpFromName', 'notifyEmail'],
      },
    },
  });
  const cfg: Record<string, string> = {};
  for (const s of settings) cfg[s.key] = String(s.value ?? '');
  return cfg;
}

export async function sendMailGateway(payload: MailPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const cfg = await getSmtpConfig();
    if (!cfg.smtpHost || !cfg.smtpUser) {
      console.info('[Mailer] SMTP not configured — email simulated:', payload.subject);
      return { success: true };
    }

    const transport = nodemailer.createTransport({
      host: cfg.smtpHost,
      port: parseInt(cfg.smtpPort || '587'),
      secure: cfg.smtpSecure === 'true',
      auth: { user: cfg.smtpUser, pass: cfg.smtpPass },
    });

    await transport.sendMail({
      from: `"${cfg.smtpFromName || 'TRICLINIUM'}" <${cfg.smtpFromEmail || cfg.smtpUser}>`,
      to: Array.isArray(payload.to) ? payload.to.join(', ') : payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    return { success: true };
  } catch (err: any) {
    console.error('[Mailer Error]:', err.message);
    return { success: false, error: err.message };
  }
}

// Get the admin notification email from DB settings
export async function getNotifyEmail(): Promise<string> {
  const setting = await prisma.websiteSetting.findFirst({ where: { key: 'notifyEmail' } });
  const val = setting ? String(setting.value ?? '') : '';
  return val || process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@triclinium.com';
}
