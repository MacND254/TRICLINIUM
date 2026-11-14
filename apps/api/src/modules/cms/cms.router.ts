import { Router } from 'express';
import { CmsController } from './cms.controller';
import { authenticate } from '../../middleware/auth';
import { requirePermission } from '../../middleware/rbac';
import { PERMISSIONS } from '@triclinium/shared';

export const cmsRouter = Router();

// ================= PUBLIC CMS ROUTES =================
cmsRouter.get('/homepage', CmsController.getPublicHomepage);
cmsRouter.get('/pages/:slug', CmsController.getPublicPage);
cmsRouter.get('/blog', CmsController.getPublicBlog);
cmsRouter.get('/blog/:slug', CmsController.getPublicBlogPost);
cmsRouter.get('/faqs', CmsController.getPublicFaqs);
cmsRouter.get('/testimonials', CmsController.getPublicTestimonials);

// ================= ADMIN CMS ROUTES =================
// Pages
cmsRouter.get('/admin/pages', authenticate, requirePermission(PERMISSIONS.CMS_VIEW), CmsController.getAdminPages);
cmsRouter.post('/admin/pages', authenticate, requirePermission(PERMISSIONS.CMS_EDIT), CmsController.createPage);
cmsRouter.patch('/admin/pages/:id', authenticate, requirePermission(PERMISSIONS.CMS_EDIT), CmsController.updatePage);

// Blog
cmsRouter.get('/admin/blog', authenticate, requirePermission(PERMISSIONS.CMS_VIEW), CmsController.getAdminBlog);
cmsRouter.post('/admin/blog', authenticate, requirePermission(PERMISSIONS.CMS_EDIT), CmsController.createBlogPost);
cmsRouter.patch('/admin/blog/:id', authenticate, requirePermission(PERMISSIONS.CMS_EDIT), CmsController.updateBlogPost);
cmsRouter.delete('/admin/blog/:id', authenticate, requirePermission(PERMISSIONS.CMS_EDIT), CmsController.deleteBlogPost);

// FAQs
cmsRouter.post('/admin/faqs', authenticate, requirePermission(PERMISSIONS.CMS_EDIT), CmsController.createFaq);
cmsRouter.patch('/admin/faqs/:id', authenticate, requirePermission(PERMISSIONS.CMS_EDIT), CmsController.updateFaq);
cmsRouter.delete('/admin/faqs/:id', authenticate, requirePermission(PERMISSIONS.CMS_EDIT), CmsController.deleteFaq);

// Testimonials
cmsRouter.post('/admin/testimonials', authenticate, requirePermission(PERMISSIONS.CMS_EDIT), CmsController.createTestimonial);
cmsRouter.patch('/admin/testimonials/:id', authenticate, requirePermission(PERMISSIONS.CMS_EDIT), CmsController.updateTestimonial);
cmsRouter.delete('/admin/testimonials/:id', authenticate, requirePermission(PERMISSIONS.CMS_EDIT), CmsController.deleteTestimonial);

// Homepage Sections
cmsRouter.put('/admin/homepage/sections/:key', authenticate, requirePermission(PERMISSIONS.CMS_EDIT), CmsController.updateHomepageSection);
