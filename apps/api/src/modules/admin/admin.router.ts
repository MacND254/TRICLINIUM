import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole, requirePermission } from '../../middleware/rbac';
import { PERMISSIONS } from '@triclinium/shared';

export const adminRouter = Router();

adminRouter.get(
  '/admin/dashboard',
  authenticate,
  AdminController.getDashboardMetrics
);

// Admin Users
adminRouter.get(
  '/admin/users',
  authenticate,
  requireRole('SUPER_ADMIN'),
  AdminController.listUsers
);

adminRouter.post(
  '/admin/users',
  authenticate,
  requireRole('SUPER_ADMIN'),
  AdminController.createUser
);

adminRouter.patch(
  '/admin/users/:id',
  authenticate,
  requireRole('SUPER_ADMIN'),
  AdminController.updateUser
);

// Roles
adminRouter.get(
  '/admin/roles',
  authenticate,
  requireRole('SUPER_ADMIN'),
  AdminController.listRoles
);

// Audit Logs
adminRouter.get(
  '/admin/audit-logs',
  authenticate,
  requirePermission(PERMISSIONS.AUDIT_LOGS_VIEW),
  AdminController.listAuditLogs
);
