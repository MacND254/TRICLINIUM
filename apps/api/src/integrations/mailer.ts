import nodemailer from 'nodemailer';
import prisma from '../database/client';

export interface MailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

// Get SMTP config from individual DB settings keys at runtime
export async function getSmtpConfig() {
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
      console.info('[Mail Gateway] SMTP not configured — email simulated to:', payload.to, '| Subject:', payload.subject);
      return { success: true };
    }

    const isSecure = cfg.smtpSecure === 'true' || cfg.smtpPort === '465';

    const transport = nodemailer.createTransport({
      host: cfg.smtpHost,
      port: parseInt(cfg.smtpPort || '587'),
      secure: isSecure,
      auth: { user: cfg.smtpUser, pass: cfg.smtpPass },
      tls: {
        rejectUnauthorized: false, // Prevents self-signed cert blocks on custom cPanel servers
      },
    });

    await transport.sendMail({
      from: `"${cfg.smtpFromName || 'TRICLINIUM SYSTEMS'}" <${cfg.smtpFromEmail || cfg.smtpUser}>`,
      to: Array.isArray(payload.to) ? payload.to.join(', ') : payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    console.info('[Mail Gateway] Email successfully dispatched to:', payload.to, '| Subject:', payload.subject);
    return { success: true };
  } catch (err: any) {
    console.error('[Mail Gateway Error]:', err.message);
    return { success: false, error: err.message };
  }
}

// Get the admin notification email from DB settings
export async function getNotifyEmail(): Promise<string> {
  const setting = await prisma.websiteSetting.findFirst({ where: { key: 'notifyEmail' } });
  const val = setting ? String(setting.value ?? '') : '';
  return val || process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@triclinium.com';
}

// ================= EMAIL TEMPLATES FOR CLIENTS =================

export function generateClientQuotationEmail(data: {
  quoteRef: string;
  clientName: string;
  date: string;
  validUntil: string;
  items: Array<{ description: string; qty: number; unitPrice: number }>;
  taxRate: number;
  notes?: string;
  paymentTerms?: string;
  phone?: string;
}) {
  const subtotal = data.items.reduce((acc, i) => acc + (i.qty * i.unitPrice), 0);
  const vat = Math.round(subtotal * (data.taxRate / 100));
  const grandTotal = subtotal + vat;

  const rows = data.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; font-size: 13px; color: #1e293b;">${item.description}</td>
        <td style="padding: 10px 12px; font-size: 13px; color: #1e293b; text-align: center;">${item.qty}</td>
        <td style="padding: 10px 12px; font-size: 13px; color: #1e293b; text-align: right;">Ksh ${item.unitPrice.toLocaleString()}</td>
        <td style="padding: 10px 12px; font-size: 13px; font-weight: 600; color: #0284c7; text-align: right;">Ksh ${(item.qty * item.unitPrice).toLocaleString()}</td>
      </tr>`
    )
    .join('');

  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 650px; margin: 0 auto; padding: 28px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px;">
      <div>
        <h2 style="color: #0f172a; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">TRICLINIUM SYSTEMS</h2>
        <p style="color: #0284c7; margin: 2px 0 0 0; font-size: 12px; font-weight: 700; text-transform: uppercase;">Security &amp; Surveillance Enterprise</p>
      </div>
      <div style="text-align: right;">
        <span style="background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;">OFFICIAL QUOTATION</span>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #475569; font-weight: 600;">Ref: ${data.quoteRef}</p>
      </div>
    </div>

    <p style="font-size: 15px; color: #1e293b; margin: 0 0 16px 0;">Dear <strong>${data.clientName}</strong>,</p>
    <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
      Thank you for contacting TRICLINIUM SYSTEMS. Please find below the tailored quotation for your security and surveillance requirements:
    </p>

    <div style="background: #f8fafc; border-radius: 8px; padding: 14px; margin-bottom: 20px; font-size: 12px; color: #475569;">
      <p style="margin: 0 0 4px 0;"><strong>Quotation Date:</strong> ${data.date}</p>
      <p style="margin: 0;"><strong>Valid Until:</strong> ${data.validUntil} (30 Days)</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background: #f1f5f9; text-align: left;">
          <th style="padding: 10px 12px; font-size: 12px; color: #475569; text-transform: uppercase;">Description</th>
          <th style="padding: 10px 12px; font-size: 12px; color: #475569; text-align: center; text-transform: uppercase;">Qty</th>
          <th style="padding: 10px 12px; font-size: 12px; color: #475569; text-align: right; text-transform: uppercase;">Unit Price</th>
          <th style="padding: 10px 12px; font-size: 12px; color: #475569; text-align: right; text-transform: uppercase;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div style="text-align: right; margin-bottom: 24px; padding-top: 12px; border-top: 2px solid #e2e8f0;">
      <p style="margin: 4px 0; font-size: 13px; color: #64748b;">Subtotal: <strong style="color: #1e293b;">Ksh ${subtotal.toLocaleString()}</strong></p>
      <p style="margin: 4px 0; font-size: 13px; color: #64748b;">VAT (${data.taxRate}%): <strong style="color: #1e293b;">Ksh ${vat.toLocaleString()}</strong></p>
      <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: 800; color: #0284c7;">Total (KES): Ksh ${grandTotal.toLocaleString()}</p>
    </div>

    ${data.paymentTerms ? `
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 12px; font-weight: 600; color: #166534;">Payment Terms &amp; Scope:</p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #15803d; line-height: 1.5;">${data.paymentTerms}</p>
    </div>` : ''}

    ${data.notes ? `
    <div style="margin-bottom: 20px;">
      <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #475569;">Warranty &amp; Notes:</p>
      <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">${data.notes}</p>
    </div>` : ''}

    <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #64748b; text-align: center;">
      <p style="margin: 0 0 4px 0; font-weight: 600; color: #1e293b;">TRICLINIUM SYSTEMS — Nairobi, Kenya</p>
      <p style="margin: 0;">Westlands Commercial Center, Ring Road · Phone / WhatsApp: +254 700 555 199 · Email: inquiries@triclinium.com</p>
    </div>
  </div>`;
}

export function generateClientInvoiceEmail(data: {
  invoiceNumber: string;
  clientName: string;
  clientCompany?: string;
  date: string;
  dueDate: string;
  items: Array<{ description: string; qty: number; unitPrice: number }>;
  taxRate: number;
  paymentStatus: string;
  notes?: string;
}) {
  const subtotal = data.items.reduce((acc, i) => acc + (i.qty * i.unitPrice), 0);
  const vat = Math.round(subtotal * (data.taxRate / 100));
  const grandTotal = subtotal + vat;

  const rows = data.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; font-size: 13px; color: #1e293b;">${item.description}</td>
        <td style="padding: 10px 12px; font-size: 13px; color: #1e293b; text-align: center;">${item.qty}</td>
        <td style="padding: 10px 12px; font-size: 13px; color: #1e293b; text-align: right;">Ksh ${item.unitPrice.toLocaleString()}</td>
        <td style="padding: 10px 12px; font-size: 13px; font-weight: 600; color: #0f172a; text-align: right;">Ksh ${(item.qty * item.unitPrice).toLocaleString()}</td>
      </tr>`
    )
    .join('');

  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 650px; margin: 0 auto; padding: 28px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #059669; padding-bottom: 16px; margin-bottom: 24px;">
      <div>
        <h2 style="color: #0f172a; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">TRICLINIUM SYSTEMS</h2>
        <p style="color: #059669; margin: 2px 0 0 0; font-size: 12px; font-weight: 700; text-transform: uppercase;">Official Tax Invoice</p>
      </div>
      <div style="text-align: right;">
        <span style="background: ${data.paymentStatus === 'PAID' ? '#dcfce7' : '#fef3c7'}; color: ${data.paymentStatus === 'PAID' ? '#15803d' : '#b45309'}; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700;">
          ${data.paymentStatus === 'PAID' ? 'PAID IN FULL' : 'PAYMENT DUE'}
        </span>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #475569; font-weight: 600;">Inv: ${data.invoiceNumber}</p>
      </div>
    </div>

    <p style="font-size: 15px; color: #1e293b; margin: 0 0 16px 0;">Billed To: <strong>${data.clientName}</strong> ${data.clientCompany ? `(${data.clientCompany})` : ''}</p>

    <div style="background: #f8fafc; border-radius: 8px; padding: 14px; margin-bottom: 20px; font-size: 12px; color: #475569;">
      <p style="margin: 0 0 4px 0;"><strong>Invoice Date:</strong> ${data.date}</p>
      <p style="margin: 0;"><strong>Payment Due Date:</strong> ${data.dueDate}</p>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background: #f1f5f9; text-align: left;">
          <th style="padding: 10px 12px; font-size: 12px; color: #475569; text-transform: uppercase;">Item / Service</th>
          <th style="padding: 10px 12px; font-size: 12px; color: #475569; text-align: center; text-transform: uppercase;">Qty</th>
          <th style="padding: 10px 12px; font-size: 12px; color: #475569; text-align: right; text-transform: uppercase;">Unit Price</th>
          <th style="padding: 10px 12px; font-size: 12px; color: #475569; text-align: right; text-transform: uppercase;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div style="text-align: right; margin-bottom: 24px; padding-top: 12px; border-top: 2px solid #e2e8f0;">
      <p style="margin: 4px 0; font-size: 13px; color: #64748b;">Subtotal: <strong style="color: #1e293b;">Ksh ${subtotal.toLocaleString()}</strong></p>
      <p style="margin: 4px 0; font-size: 13px; color: #64748b;">VAT (16%): <strong style="color: #1e293b;">Ksh ${vat.toLocaleString()}</strong></p>
      <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: 800; color: #059669;">Total Due (KES): Ksh ${grandTotal.toLocaleString()}</p>
    </div>

    <!-- Payment Channels -->
    <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #166534;">Payment Instructions:</h4>
      <div style="font-size: 12px; color: #15803d; line-height: 1.6;">
        <p style="margin: 0 0 4px 0;"><strong>M-Pesa Paybill:</strong> 247247 &nbsp;|&nbsp; <strong>Account:</strong> 0700555199 (TRICLINIUM)</p>
        <p style="margin: 0 0 4px 0;"><strong>Bank Transfer:</strong> Equity Bank Kenya &nbsp;|&nbsp; <strong>Account No:</strong> 0180299887766</p>
        <p style="margin: 0;"><strong>KRA PIN:</strong> P051234567Z</p>
      </div>
    </div>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #64748b; text-align: center;">
      <p style="margin: 0 0 4px 0; font-weight: 600; color: #1e293b;">TRICLINIUM SYSTEMS — Nairobi, Kenya</p>
      <p style="margin: 0;">Westlands Commercial Center, Ring Road · Phone / WhatsApp: +254 700 555 199 · Email: inquiries@triclinium.com</p>
    </div>
  </div>`;
}

