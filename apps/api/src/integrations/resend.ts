import { Resend } from 'resend';
import { config } from '../config';

const resendClient = config.resend.apiKey ? new Resend(config.resend.apiKey) : null;

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!resendClient) {
    console.info(`[Email Service (Simulated - No API Key)]:`, {
      to: payload.to,
      subject: payload.subject,
    });
    return { success: true, id: `simulated-${Date.now()}` };
  }

  try {
    const { data, error } = await resendClient.emails.send({
      from: `${config.resend.senderName} <${config.resend.senderAddress}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    if (error) {
      console.error('[Resend Error]:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error('[Resend Exception]:', err.message || err);
    return { success: false, error: err.message || 'Email delivery failed' };
  }
}

// ================= EMAIL TEMPLATES =================

export function generateInquiryNotificationEmail(data: {
  referenceNumber: string;
  type: string;
  customerName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message: string;
  targetName?: string;
}) {
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
    <div style="border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px;">
      <h2 style="color: #0f172a; margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 0.05em;">TRICLINIUM Enterprise Alert</h2>
      <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">New ${data.type} Inquiry Received</p>
    </div>
    <div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Reference:</strong> ${data.referenceNumber}</p>
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Customer:</strong> ${data.customerName}</p>
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
      ${data.phone ? `<p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Phone:</strong> ${data.phone}</p>` : ''}
      ${data.company ? `<p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Company:</strong> ${data.company}</p>` : ''}
      ${data.targetName ? `<p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Target Item/Service:</strong> ${data.targetName}</p>` : ''}
    </div>
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 15px; color: #1e293b; margin-bottom: 8px;">Customer Inquiry Message:</h3>
      <p style="background: #ffffff; border: 1px solid #cbd5e1; padding: 14px; border-radius: 6px; color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
    </div>
    <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e2e8f0;">
      <a href="${config.urls.frontend}/admin/inquiries" style="background: #0f172a; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px; display: inline-block;">View in Administration Console</a>
    </div>
  </div>`;
}

export function generateQuotationNotificationEmail(data: {
  referenceNumber: string;
  customerName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  items: Array<{ productName?: string; quantity: number; notes?: string | null }>;
  message?: string;
}) {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-size: 14px; color: #1e293b;">${item.productName || 'Custom Line Item'}</td>
        <td style="padding: 10px; font-size: 14px; color: #1e293b; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; font-size: 14px; color: #64748b;">${item.notes || '-'}</td>
      </tr>`
    )
    .join('');

  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
    <div style="border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px;">
      <h2 style="color: #0f172a; margin: 0; font-size: 20px; text-transform: uppercase;">Quotation Request [${data.referenceNumber}]</h2>
      <p style="color: #64748b; margin: 4px 0 0 0; font-size: 14px;">Customer submitted a multi-product request for quote</p>
    </div>
    <div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Customer:</strong> ${data.customerName}</p>
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Email:</strong> ${data.email}</p>
      ${data.phone ? `<p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Phone:</strong> ${data.phone}</p>` : ''}
      ${data.company ? `<p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Company:</strong> ${data.company}</p>` : ''}
    </div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="background: #f1f5f9; text-align: left;">
          <th style="padding: 10px; font-size: 13px; color: #475569;">Product</th>
          <th style="padding: 10px; font-size: 13px; color: #475569; text-align: center;">Qty</th>
          <th style="padding: 10px; font-size: 13px; color: #475569;">Notes</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    ${data.message ? `<p style="font-size: 14px; color: #334155; line-height: 1.5; margin-bottom: 24px;"><strong>Additional Requirements:</strong><br>${data.message}</p>` : ''}
    <div style="text-align: center; padding-top: 16px; border-top: 1px solid #e2e8f0;">
      <a href="${config.urls.frontend}/admin/inquiries" style="background: #0284c7; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px; display: inline-block;">Prepare Official Quote</a>
    </div>
  </div>`;
}

export function generatePasswordResetEmail(resetUrl: string, recipientName: string) {
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
    <h2 style="color: #0f172a; margin-top: 0;">Password Reset Request</h2>
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello ${recipientName},</p>
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">We received a request to reset your TRICLINIUM administrator password. Click the button below to proceed. This link expires in 1 hour.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">Reset Password</a>
    </div>
    <p style="color: #64748b; font-size: 13px; line-height: 1.5;">If you did not request this password reset, please disregard this email or contact security immediately.</p>
  </div>`;
}

export function generateInquiryStatusUpdateEmail(referenceNumber: string, customerName: string, newStatus: string, note?: string) {
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
    <h2 style="color: #0f172a; margin-top: 0;">Inquiry Update - ${referenceNumber}</h2>
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Dear ${customerName},</p>
    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Your inquiry <strong>${referenceNumber}</strong> with TRICLINIUM has been updated to status: <strong style="color: #0284c7;">${newStatus.replace('_', ' ')}</strong>.</p>
    ${note ? `<div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 12px; margin: 16px 0; font-size: 14px; color: #334155;">${note}</div>` : ''}
    <p style="color: #64748b; font-size: 14px;">If you have any further questions, please reply directly to this email or call our team.</p>
  </div>`;
}
