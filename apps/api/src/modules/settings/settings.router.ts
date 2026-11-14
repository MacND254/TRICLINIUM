import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';

export const settingsRouter = Router();

// Public website branding & contact settings
settingsRouter.get('/settings/public', SettingsController.getPublicSettings);

// Admin settings management (Super Admin exclusive)
settingsRouter.get('/admin/settings', authenticate, requireRole('SUPER_ADMIN'), SettingsController.getAdminSettings);
settingsRouter.put('/admin/settings', authenticate, requireRole('SUPER_ADMIN'), SettingsController.updateSettings);
settingsRouter.post('/admin/settings/test-email', authenticate, requireRole('SUPER_ADMIN'), SettingsController.sendTestEmail);

