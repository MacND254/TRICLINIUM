import { Router } from 'express';
import { InquiriesController } from './inquiries.controller';
import { authenticate } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import { rateLimit } from '../../middleware/rate-limit';
import { PERMISSIONS } from '@triclinium/shared';

export const inquiriesRouter = Router();

// Anti-spam rate limiting for public inquiry submissions: 10 per hour per IP
const inquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Inquiry submission limit reached. Please contact us directly by telephone if urgent.',
});

// ================= PUBLIC ROUTES =================
inquiriesRouter.post('/inquiries', inquiryLimiter, InquiriesController.createInquiry);
inquiriesRouter.post('/contact', inquiryLimiter, InquiriesController.submitContact);
inquiriesRouter.post('/quotation-requests', inquiryLimiter, InquiriesController.requestQuotation);

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
