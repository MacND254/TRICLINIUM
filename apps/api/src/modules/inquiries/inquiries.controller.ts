import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../../database/client';
import { logAudit } from '../../middleware/audit';
import {
  sendEmail,
  generateInquiryNotificationEmail,
  generateQuotationNotificationEmail,
  generateInquiryStatusUpdateEmail,
} from '../../integrations/resend';
import {
  sendMailGateway,
  getNotifyEmail,
  generateClientQuotationEmail,
  generateClientInvoiceEmail,
} from '../../integrations/mailer';
import { config } from '../../config';
import {
  productInquirySchema,
  serviceInquirySchema,
  generalContactSchema,
  quotationRequestSchema,
  adminInquiryUpdateSchema,
  inquiryNoteSchema,
  inquiryFilterQuerySchema,
} from '@triclinium/validation';
import { generateReferenceNumber } from '@triclinium/shared';

export class InquiriesController {
  // ================= PUBLIC SUBMISSIONS =================

  // POST /inquiries (Handles both product and service inquiries)
  static async createInquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const isProduct = Boolean(req.body.productId);
      const isService = Boolean(req.body.serviceId);

      let customerName = '';
      let email = '';
      let phone: string | null = null;
      let company: string | null = null;
      let message = '';
      let preferredContact: any = 'EMAIL';
      let productId: string | null = null;
      let serviceId: string | null = null;
      let targetName = '';
      let inquiryType: any = 'GENERAL';

      if (isProduct) {
        const data = productInquirySchema.parse(req.body);
        customerName = data.customerName;
        email = data.email;
        phone = data.phone || null;
        company = data.company || null;
        message = data.message;
        preferredContact = data.preferredContact;
        productId = data.productId;
        inquiryType = 'PRODUCT';

        const product = await prisma.product.findUnique({ where: { id: data.productId } });
        targetName = product ? product.name : 'Selected Product';
      } else if (isService) {
        const data = serviceInquirySchema.parse(req.body);
        customerName = data.customerName;
        email = data.email;
        phone = data.phone || null;
        company = data.company || null;
        message = data.projectDescription;
        preferredContact = data.preferredContact;
        serviceId = data.serviceId;
        inquiryType = 'SERVICE';

        const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
        targetName = service ? service.name : 'Selected Service';
      } else {
        const data = generalContactSchema.parse(req.body);
        customerName = data.customerName;
        email = data.email;
        phone = data.phone || null;
        company = data.company || null;
        message = data.message;
        preferredContact = data.preferredContact;
        inquiryType = 'GENERAL';
        targetName = data.subject;
      }

      const referenceNumber = generateReferenceNumber(inquiryType === 'PRODUCT' ? 'PRD' : inquiryType === 'SERVICE' ? 'SRV' : 'GEN');

      const inquiry = await prisma.$transaction(async (tx) => {
        const created = await tx.inquiry.create({
          data: {
            referenceNumber,
            type: inquiryType,
            status: 'NEW',
            urgency: 'MEDIUM',
            customerName,
            email,
            phone,
            company,
            subject: targetName,
            message,
            preferredContact,
            productId,
            serviceId,
          },
        });

        await tx.inquiryActivity.create({
          data: {
            inquiryId: created.id,
            actorName: customerName,
            action: 'INQUIRY_CREATED',
            details: `Inquiry submitted via public website form for ${targetName}`,
          },
        });

        return created;
      });

      // Deliver transactional notifications (error isolated)
      sendEmail({
        to: [config.resend.adminNotificationEmail],
        subject: `[TRICLINIUM Inquiry] ${targetName} (${referenceNumber})`,
        html: generateInquiryNotificationEmail({
          referenceNumber,
          type: inquiryType,
          customerName,
          email,
          phone,
          company,
          message,
          targetName,
        }),
      }).catch((emailErr) => console.error('[Inquiry Email Error]:', emailErr));

      // Mail gateway (SMTP) — supplementary delivery
      getNotifyEmail().then(notifyTo => {
        sendMailGateway({
          to: notifyTo,
          subject: `[TRICLINIUM Inquiry] ${targetName} (${referenceNumber})`,
          html: generateInquiryNotificationEmail({ referenceNumber, type: inquiryType, customerName, email, phone, company, message, targetName }),
        }).catch(e => console.error('[Mailer Gateway Error]:', e));
      });

      return res.status(201).json({
        success: true,
        data: {
          referenceNumber: inquiry.referenceNumber,
          status: inquiry.status,
          createdAt: inquiry.createdAt,
        },
        message: 'Your inquiry has been received. Our team will review your specifications and contact you shortly.',
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /contact (General Contact Form)
  static async submitContact(req: Request, res: Response, next: NextFunction) {
    try {
      const data = generalContactSchema.parse(req.body);
      const referenceNumber = generateReferenceNumber('CON');

      const inquiry = await prisma.$transaction(async (tx) => {
        const created = await tx.inquiry.create({
          data: {
            referenceNumber,
            type: 'GENERAL',
            status: 'NEW',
            urgency: 'MEDIUM',
            customerName: data.customerName,
            email: data.email,
            phone: data.phone || null,
            company: data.company || null,
            subject: data.subject,
            message: data.message,
            preferredContact: data.preferredContact,
          },
        });

        await tx.inquiryActivity.create({
          data: {
            inquiryId: created.id,
            actorName: data.customerName,
            action: 'CONTACT_MESSAGE_RECEIVED',
            details: `General message received: "${data.subject}"`,
          },
        });

        return created;
      });

      sendEmail({
        to: [config.resend.adminNotificationEmail],
        subject: `[TRICLINIUM Contact] ${data.subject} (${referenceNumber})`,
        html: generateInquiryNotificationEmail({
          referenceNumber,
          type: 'General Contact',
          customerName: data.customerName,
          email: data.email,
          phone: data.phone,
          company: data.company,
          message: data.message,
          targetName: data.subject,
        }),
      }).catch((emailErr) => console.error('[Contact Email Error]:', emailErr));

      // Mail gateway (SMTP) — supplementary delivery
      getNotifyEmail().then(notifyTo => {
        sendMailGateway({
          to: notifyTo,
          subject: `[TRICLINIUM Contact] ${data.subject} (${referenceNumber})`,
          html: generateInquiryNotificationEmail({ referenceNumber, type: 'General Contact', customerName: data.customerName, email: data.email, phone: data.phone, company: data.company, message: data.message, targetName: data.subject }),
        }).catch(e => console.error('[Mailer Gateway Error]:', e));
      });

      return res.status(201).json({
        success: true,
        data: { referenceNumber: inquiry.referenceNumber },
        message: 'Thank you for contacting TRICLINIUM. Your message has been routed to our corporate desk.',
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /quotation-requests (Multi-Item RFQ)
  static async requestQuotation(req: Request, res: Response, next: NextFunction) {
    try {
      const data = quotationRequestSchema.parse(req.body);
      const referenceNumber = generateReferenceNumber('QUOT');

      // Fetch product names for line items
      const productIds = data.items.map((i) => i.productId).filter(Boolean) as string[];
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, sku: true },
      });
      const prodMap = new Map(products.map((p) => [p.id, p]));

      const itemsWithNames = data.items.map((item) => {
        const matched = item.productId ? prodMap.get(item.productId) : null;
        return {
          productId: item.productId || null,
          productName: matched ? `${matched.name} (${matched.sku})` : item.productName || 'Custom Specification',
          quantity: item.quantity,
          notes: item.notes || null,
        };
      });

      const quotation = await prisma.$transaction(async (tx) => {
        const created = await tx.inquiry.create({
          data: {
            referenceNumber,
            type: 'QUOTATION',
            status: 'NEW',
            urgency: 'HIGH',
            customerName: data.customerName,
            email: data.email,
            phone: data.phone || null,
            company: data.company || null,
            subject: `Request for Quotation - ${data.items.length} Line Item(s)`,
            message: data.message || 'Commercial quotation requested for multiple items.',
            preferredContact: data.preferredContact,
            items: {
              create: itemsWithNames.map((item) => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                notes: item.notes,
              })),
            },
          },
        });

        await tx.inquiryActivity.create({
          data: {
            inquiryId: created.id,
            actorName: data.customerName,
            action: 'QUOTATION_REQUESTED',
            details: `Requested quotation with ${itemsWithNames.length} line item(s)`,
          },
        });

        return created;
      });

      sendEmail({
        to: [config.resend.adminNotificationEmail],
        subject: `[TRICLINIUM RFQ] Quote Request ${referenceNumber}`,
        html: generateQuotationNotificationEmail({
          referenceNumber,
          customerName: data.customerName,
          email: data.email,
          phone: data.phone,
          company: data.company,
          items: itemsWithNames,
          message: data.message,
        }),
      }).catch((emailErr) => console.error('[Quotation Email Error]:', emailErr));

      return res.status(201).json({
        success: true,
        data: { referenceNumber: quotation.referenceNumber },
        message: 'Your Request for Quotation (RFQ) has been logged. Our pricing specialists will prepare a proposal.',
      });
    } catch (err) {
      next(err);
    }
  }

  // ================= ADMIN METHODS =================

  // GET /admin/inquiries
  static async getAdminInquiries(req: Request, res: Response, next: NextFunction) {
    try {
      const query = inquiryFilterQuerySchema.parse(req.query);
      const where: any = {};

      if (query.type) where.type = query.type;
      if (query.status) where.status = query.status;
      if (query.urgency) where.urgency = query.urgency;
      if (query.assignedTo) where.assignedToId = query.assignedTo;

      if (query.search) {
        const s = query.search.trim();
        where.OR = [
          { referenceNumber: { contains: s, mode: 'insensitive' } },
          { customerName: { contains: s, mode: 'insensitive' } },
          { email: { contains: s, mode: 'insensitive' } },
          { company: { contains: s, mode: 'insensitive' } },
        ];
      }

      const page = query.page || 1;
      const limit = query.limit || 20;
      const skip = (page - 1) * limit;

      const [total, inquiries] = await Promise.all([
        prisma.inquiry.count({ where }),
        prisma.inquiry.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
            product: { select: { id: true, name: true, sku: true } },
            service: { select: { id: true, name: true } },
            items: true,
          },
        }),
      ]);

      return res.json({
        success: true,
        data: {
          items: inquiries.map((inq) => ({
            ...inq,
            assignedToName: inq.assignedTo ? `${inq.assignedTo.firstName} ${inq.assignedTo.lastName}` : null,
          })),
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

  // GET /admin/inquiries/:id
  static async getAdminInquiryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const inquiry = await prisma.inquiry.findUnique({
        where: { id },
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
          product: true,
          service: true,
          items: {
            include: { product: true },
          },
          notes: {
            orderBy: { createdAt: 'desc' },
            include: { author: { select: { firstName: true, lastName: true } } },
          },
          activity: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!inquiry) {
        return res.status(404).json({ success: false, error: { message: 'Inquiry record not found' } });
      }

      return res.json({
        success: true,
        data: {
          ...inquiry,
          assignedToName: inquiry.assignedTo ? `${inquiry.assignedTo.firstName} ${inquiry.assignedTo.lastName}` : null,
          notes: inquiry.notes.map((n) => ({
            ...n,
            authorName: `${n.author.firstName} ${n.author.lastName}`,
          })),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /admin/inquiries/:id
  static async updateInquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = adminInquiryUpdateSchema.parse(req.body);

      const existing = await prisma.inquiry.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, error: { message: 'Inquiry not found' } });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const inq = await tx.inquiry.update({
          where: { id },
          data: {
            ...(data.status && { status: data.status }),
            ...(data.urgency && { urgency: data.urgency }),
            ...(data.assignedToId !== undefined && { assignedToId: data.assignedToId || null }),
          },
          include: { assignedTo: true },
        });

        // Record activity log
        let activityDetails = '';
        if (data.status && data.status !== existing.status) {
          activityDetails += `Status changed from ${existing.status} to ${data.status}. `;
        }
        if (data.urgency && data.urgency !== existing.urgency) {
          activityDetails += `Urgency changed from ${existing.urgency} to ${data.urgency}. `;
        }
        if (data.assignedToId !== undefined && data.assignedToId !== existing.assignedToId) {
          activityDetails += inq.assignedTo
            ? `Assigned to ${inq.assignedTo.firstName} ${inq.assignedTo.lastName}. `
            : 'Unassigned. ';
        }

        if (activityDetails) {
          await tx.inquiryActivity.create({
            data: {
              inquiryId: id,
              actorId: req.user?.id,
              actorName: req.user?.name || 'Administrator',
              action: 'INQUIRY_UPDATED',
              details: activityDetails.trim(),
            },
          });
        }

        return inq;
      });

      // Notify customer if status changes to QUOTED or IN_PROGRESS
      if (data.status && data.status !== existing.status && ['QUOTED', 'IN_PROGRESS', 'CLOSED'].includes(data.status)) {
        sendEmail({
          to: updated.email,
          subject: `Status Update: Inquiry ${updated.referenceNumber}`,
          html: generateInquiryStatusUpdateEmail(updated.referenceNumber, updated.customerName, data.status),
        }).catch((err) => console.error('[Status Update Email Error]:', err));
      }

      await logAudit({
        req,
        action: 'INQUIRY_STATUS_CHANGED',
        entityType: 'Inquiry',
        entityId: id,
        details: { referenceNumber: updated.referenceNumber, newStatus: data.status },
      });

      return res.json({ success: true, data: updated, message: 'Inquiry updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  // POST /admin/inquiries/:id/notes
  static async addInquiryNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { content } = inquiryNoteSchema.parse(req.body);

      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED' } });
      }

      const note = await prisma.$transaction(async (tx) => {
        const createdNote = await tx.inquiryNote.create({
          data: {
            inquiryId: id,
            authorId: req.user!.id,
            content,
          },
          include: { author: true },
        });

        await tx.inquiryActivity.create({
          data: {
            inquiryId: id,
            actorId: req.user!.id,
            actorName: req.user!.name,
            action: 'NOTE_ADDED',
            details: `Internal note added: "${content.slice(0, 50)}${content.length > 50 ? '...' : ''}"`,
          },
        });

        return createdNote;
      });

      return res.status(201).json({
        success: true,
        data: {
          ...note,
          authorName: `${note.author.firstName} ${note.author.lastName}`,
        },
        message: 'Internal note added successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /admin/inquiries/export (CSV Export)
  static async exportInquiries(req: Request, res: Response, next: NextFunction) {
    try {
      const inquiries = await prisma.inquiry.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          assignedTo: { select: { firstName: true, lastName: true } },
          product: { select: { name: true, sku: true } },
          service: { select: { name: true } },
        },
      });

      const headers = [
        'Reference Number',
        'Type',
        'Status',
        'Urgency',
        'Customer Name',
        'Email',
        'Phone',
        'Company',
        'Subject/Item',
        'Assigned To',
        'Created At',
      ];

      const rows = inquiries.map((i) => [
        `"${i.referenceNumber}"`,
        `"${i.type}"`,
        `"${i.status}"`,
        `"${i.urgency}"`,
        `"${i.customerName.replace(/"/g, '""')}"`,
        `"${i.email}"`,
        `"${(i.phone || '').replace(/"/g, '""')}"`,
        `"${(i.company || '').replace(/"/g, '""')}"`,
        `"${(i.subject || i.product?.name || i.service?.name || '').replace(/"/g, '""')}"`,
        `"${i.assignedTo ? `${i.assignedTo.firstName} ${i.assignedTo.lastName}` : 'Unassigned'}"`,
        `"${i.createdAt.toISOString()}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=triclinium-inquiries-${Date.now()}.csv`);
      return res.status(200).send(csvContent);
    } catch (err) {
      next(err);
    }
  }

  // POST /admin/inquiries/custom-quote (Create custom quote directly in admin)
  static async createCustomQuote(req: Request, res: Response, next: NextFunction) {
    try {
      const customQuoteSchema = z.object({
        customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
        email: z.string().email('Valid customer email is required'),
        phone: z.string().optional().nullable(),
        company: z.string().optional().nullable(),
        subject: z.string().optional().default('Custom Security Quotation'),
        notes: z.string().optional().default(''),
        paymentTerms: z.string().optional().default(''),
        validUntil: z.string().optional().default('30 Days'),
        items: z.array(
          z.object({
            description: z.string().min(1, 'Line item description is required'),
            qty: z.coerce.number().int().positive().default(1),
            unitPrice: z.coerce.number().nonnegative().default(0),
          })
        ).min(1, 'At least one line item is required'),
      });

      const data = customQuoteSchema.parse(req.body);

      const referenceNumber = `QT-${Date.now().toString().slice(-6)}`;
      const itemsSummary = data.items
        .map((i: { description: string; qty: number; unitPrice: number }) => `${i.description} (x${i.qty} @ Ksh ${i.unitPrice.toLocaleString()})`)
        .join(', ');

      const inquiry = await prisma.inquiry.create({
        data: {
          referenceNumber,
          type: 'QUOTATION',
          status: 'QUOTED',
          urgency: 'HIGH',
          customerName: data.customerName,
          email: data.email.toLowerCase().trim(),
          phone: data.phone || null,
          company: data.company || null,
          subject: data.subject || 'Custom Security Quotation',
          message: `Custom Quote Items:\n${itemsSummary}\n\nNotes: ${data.notes || 'None'}\nTerms: ${data.paymentTerms || 'Standard'}`,
          notes: {
            create: [
              {
                content: `Custom Quotation ${referenceNumber} drafted with ${data.items.length} line items. Valid until ${data.validUntil || '30 days'}.`,
                authorId: (req as any).user?.id,
              },
            ],
          },
        },
      });

      return res.status(201).json({
        success: true,
        data: inquiry,
        message: 'Custom quotation created successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /admin/inquiries/:id/send-quote (Send quotation to client via Mail Gateway)
  static async sendQuoteToClient(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { quoteData } = req.body;

      const inquiry = await prisma.inquiry.findUnique({ where: { id } });
      if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });

      const emailRecipient = quoteData?.clientEmail || inquiry.email;
      const html = generateClientQuotationEmail({
        quoteRef: quoteData?.quoteRef || inquiry.referenceNumber,
        clientName: quoteData?.clientName || inquiry.customerName,
        date: quoteData?.date || new Date().toISOString().split('T')[0],
        validUntil: quoteData?.validUntil || '30 Days',
        items: quoteData?.items || [],
        taxRate: quoteData?.taxRate ?? 16,
        notes: quoteData?.notes,
        paymentTerms: quoteData?.paymentTerms,
        phone: quoteData?.clientPhone || inquiry.phone || undefined,
      });

      const mailRes = await sendMailGateway({
        to: emailRecipient,
        subject: `Official Quotation [${quoteData?.quoteRef || inquiry.referenceNumber}] — TRICLINIUM SYSTEMS`,
        html,
      });

      if (!mailRes.success) {
        return res.status(500).json({ success: false, message: mailRes.error || 'Failed to dispatch quotation email' });
      }

      await prisma.inquiryNote.create({
        data: {
          inquiryId: id,
          content: `Quotation ${quoteData?.quoteRef || inquiry.referenceNumber} successfully emailed to client (${emailRecipient}) via Mail Gateway.`,
          authorId: (req as any).user?.id,
        },
      });

      return res.json({
        success: true,
        message: `Quotation successfully sent to ${emailRecipient}`,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /admin/inquiries/:id/send-invoice (Send invoice to client via Mail Gateway)
  static async sendInvoiceToClient(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { invoiceData } = req.body;

      const inquiry = await prisma.inquiry.findUnique({ where: { id } });
      if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });

      const emailRecipient = invoiceData?.clientEmail || inquiry.email;
      const html = generateClientInvoiceEmail({
        invoiceNumber: invoiceData?.invoiceNumber || `INV-${inquiry.referenceNumber}`,
        clientName: invoiceData?.clientName || inquiry.customerName,
        clientCompany: invoiceData?.clientCompany || inquiry.company || undefined,
        date: invoiceData?.date || new Date().toISOString().split('T')[0],
        dueDate: invoiceData?.dueDate || 'Upon Receipt',
        items: invoiceData?.items || [],
        taxRate: invoiceData?.taxRate ?? 16,
        paymentStatus: invoiceData?.paymentStatus || 'PAID',
        notes: invoiceData?.notes,
      });

      const mailRes = await sendMailGateway({
        to: emailRecipient,
        subject: `Tax Invoice [${invoiceData?.invoiceNumber || `INV-${inquiry.referenceNumber}`}] — TRICLINIUM SYSTEMS`,
        html,
      });

      if (!mailRes.success) {
        return res.status(500).json({ success: false, message: mailRes.error || 'Failed to dispatch invoice email' });
      }

      await prisma.inquiryNote.create({
        data: {
          inquiryId: id,
          content: `Tax Invoice ${invoiceData?.invoiceNumber || `INV-${inquiry.referenceNumber}`} (${invoiceData?.paymentStatus || 'PAID'}) successfully emailed to ${emailRecipient} via Mail Gateway.`,
          authorId: (req as any).user?.id,
        },
      });

      return res.json({
        success: true,
        message: `Tax Invoice successfully sent to ${emailRecipient}`,
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /admin/inquiries/:id/convert-to-invoice (Convert quote to invoice upon full payment)
  static async convertToInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { invoiceNumber, totalAmount, paymentReference, notes } = req.body;

      const inquiry = await prisma.inquiry.findUnique({ where: { id } });
      if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });

      const invNo = invoiceNumber || `INV-${inquiry.referenceNumber}`;
      const updated = await prisma.inquiry.update({
        where: { id },
        data: {
          status: 'CONVERTED',
        },
      });

      await prisma.inquiryNote.create({
        data: {
          inquiryId: id,
          content: `✅ Quotation converted to Tax Invoice ${invNo} upon full payment confirmation (KES ${totalAmount?.toLocaleString() || 'N/A'}${paymentReference ? `, Ref: ${paymentReference}` : ''}). ${notes || ''}`,
          authorId: (req as any).user?.id,
        },
      });

      return res.json({
        success: true,
        data: updated,
        message: `Quotation converted to Invoice ${invNo} successfully`,
      });
    } catch (err) {
      next(err);
    }
  }
}
