import { Router } from 'express';
import { ServicesController } from './services.controller';
import { authenticate } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import { PERMISSIONS } from '@triclinium/shared';

export const servicesRouter = Router();

// ================= PUBLIC ROUTES =================
servicesRouter.get('/services', ServicesController.getPublicServices);
servicesRouter.get('/services/:slug', ServicesController.getPublicServiceBySlug);
servicesRouter.get('/service-categories', ServicesController.getPublicCategories);

// ================= ADMIN ROUTES =================
servicesRouter.get(
  '/admin/services',
  authenticate,
  requirePermission(PERMISSIONS.SERVICES_VIEW),
  ServicesController.getAdminServices
);

servicesRouter.get(
  '/admin/services/:id',
  authenticate,
  requirePermission(PERMISSIONS.SERVICES_VIEW),
  ServicesController.getAdminServiceById
);

servicesRouter.post(
  '/admin/services',
  authenticate,
  requirePermission(PERMISSIONS.SERVICES_CREATE),
  ServicesController.createService
);

servicesRouter.patch(
  '/admin/services/:id',
  authenticate,
  requirePermission(PERMISSIONS.SERVICES_EDIT),
  ServicesController.updateService
);

servicesRouter.delete(
  '/admin/services/:id',
  authenticate,
  requirePermission(PERMISSIONS.SERVICES_DELETE),
  ServicesController.deleteService
);

// Admin Service Categories
servicesRouter.post(
  '/admin/service-categories',
  authenticate,
  requirePermission(PERMISSIONS.SERVICES_CREATE),
  ServicesController.createCategory
);

servicesRouter.patch(
  '/admin/service-categories/:id',
  authenticate,
  requirePermission(PERMISSIONS.SERVICES_EDIT),
  ServicesController.updateCategory
);

servicesRouter.delete(
  '/admin/service-categories/:id',
  authenticate,
  requirePermission(PERMISSIONS.SERVICES_DELETE),
  ServicesController.deleteCategory
);
