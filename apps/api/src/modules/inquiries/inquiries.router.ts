import { Router } from 'express';
import { InquiriesController } from './inquiries.controller';
import { authenticate } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import { publicFormLimiter } from '../../middleware/rate-limit';
import { PERMISSIONS } from '@triclinium/shared';

export const inquiriesRouter = Router();

// ================= PUBLIC ROUTES =================
inquiriesRouter.post('/inquiries', publicFormLimiter, InquiriesController.createInquiry);
inquiriesRouter.post('/contact', publicFormLimiter, InquiriesController.submitContact);
inquiriesRouter.post('/quotation-requests', publicFormLimiter, InquiriesController.requestQuotation);

// ================= ADMIN INQUIRY ROUTES =================
inquiriesRouter.get(
  '/admin/inquiries',
  authenticate,
  requirePermission(PERMISSIONS.INQUIRIES_VIEW),
  InquiriesController.getAdminInquiries
);

inquiriesRouter.get(
  '/admin/inquiries/export',
  authenticate,
  requirePermission(PERMISSIONS.INQUIRIES_EXPORT),
  InquiriesController.exportInquiries
);

inquiriesRouter.get(
  '/admin/inquiries/:id',
  authenticate,
  requirePermission(PERMISSIONS.INQUIRIES_VIEW),
  InquiriesController.getAdminInquiryById
);

inquiriesRouter.patch(
  '/admin/inquiries/:id',
  authenticate,
  requirePermission(PERMISSIONS.INQUIRIES_EDIT),
  InquiriesController.updateInquiry
);

inquiriesRouter.post(
  '/admin/inquiries/:id/notes',
  authenticate,
  requirePermission(PERMISSIONS.INQUIRIES_EDIT),
  InquiriesController.addInquiryNote
);

inquiriesRouter.post(
  '/admin/inquiries/custom-quote',
  authenticate,
  requirePermission(PERMISSIONS.INQUIRIES_EDIT),
  InquiriesController.createCustomQuote
);

inquiriesRouter.put(
  '/admin/inquiries/custom-quote/:id',
  authenticate,
  requirePermission(PERMISSIONS.INQUIRIES_EDIT),
  InquiriesController.updateCustomQuote
);

inquiriesRouter.delete(
  '/admin/inquiries/:id',
  authenticate,
  requirePermission(PERMISSIONS.INQUIRIES_DELETE),
  InquiriesController.deleteInquiry
);

inquiriesRouter.post(
  '/admin/inquiries/:id/send-quote',
  authenticate,
  requirePermission(PERMISSIONS.INQUIRIES_EDIT),
  InquiriesController.sendQuoteToClient
);

inquiriesRouter.post(
  '/admin/inquiries/:id/send-invoice',
  authenticate,
  requirePermission(PERMISSIONS.INQUIRIES_EDIT),
  InquiriesController.sendInvoiceToClient
);

inquiriesRouter.post(
  '/admin/inquiries/:id/convert-to-invoice',
  authenticate,
  requirePermission(PERMISSIONS.INQUIRIES_EDIT),
  InquiriesController.convertToInvoice
);
