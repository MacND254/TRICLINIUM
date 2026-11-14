import { Request, Response, NextFunction } from 'express';
import prisma from '../../database/client';
import { cache, CACHE_KEYS, invalidateServiceCaches } from '../../integrations/redis';
import { logAudit } from '../../middleware/audit';
import {
  createServiceSchema,
  updateServiceSchema,
  serviceCategorySchema,
  serviceFilterQuerySchema,
} from '@triclinium/validation';
import { slugify } from '@triclinium/shared';

export class ServicesController {
  // ================= PUBLIC METHODS =================

  // GET /services
  static async getPublicServices(req: Request, res: Response, next: NextFunction) {
    try {
      const query = serviceFilterQuerySchema.parse(req.query);
      const cacheKey = `${CACHE_KEYS.SERVICE_LIST}:${JSON.stringify(query)}`;

      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      const where: any = {
        status: 'PUBLISHED',
        deletedAt: null,
      };

      if (query.category) {
        where.category = {
          OR: [{ slug: query.category }, { id: query.category }],
        };
      }

      if (query.featured !== undefined) {
        where.isFeatured = query.featured;
      }

      if (query.search) {
        where.OR = [
          { name: { contains: query.search.trim(), mode: 'insensitive' } },
          { shortDescription: { contains: query.search.trim(), mode: 'insensitive' } },
        ];
      }

      const page = query.page || 1;
      const limit = query.limit || 12;
      const skip = (page - 1) * limit;

      const [total, services] = await Promise.all([
        prisma.service.count({ where }),
        prisma.service.findMany({
          where,
          skip,
          take: limit,
          orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
          include: {
            category: true,
            features: { orderBy: { displayOrder: 'asc' } },
            images: { orderBy: { displayOrder: 'asc' } },
          },
        }),
      ]);

      const formatted = services.map((s) => ({
        ...s,
        price: s.price ? Number(s.price) : null,
        features: s.features.filter((f) => f.featureType === 'feature').map((f) => f.title),
        benefits: s.features.filter((f) => f.featureType === 'benefit').map((f) => f.title),
        process: s.features
          .filter((f) => f.featureType === 'process_step')
          .map((f) => ({ title: f.title, description: f.description || '', order: f.displayOrder })),
        additionalImages: s.images.map((img) => img.url),
      }));

      const responseData = {
        items: formatted,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };

      await cache.set(cacheKey, responseData, 300);
      return res.json({ success: true, data: responseData });
    } catch (err) {
      next(err);
    }
  }

  // GET /services/:slug
  static async getPublicServiceBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const cacheKey = CACHE_KEYS.SERVICE_DETAIL(slug);

      const cached = await cache.get(cacheKey);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      const service = await prisma.service.findFirst({
        where: {
          slug,
          status: 'PUBLISHED',
          deletedAt: null,
        },
        include: {
          category: true,
          images: { orderBy: { displayOrder: 'asc' } },
          features: { orderBy: { displayOrder: 'asc' } },
          relatedFrom: {
            include: {
              relatedService: {
                include: { category: true },
              },
            },
          },
        },
      });

      if (!service) {
        return res.status(404).json({
          success: false,
          error: { code: 'SERVICE_NOT_FOUND', message: 'Service not found' },
        });
      }

      const formatted = {
        ...service,
        price: service.price ? Number(service.price) : null,
        features: service.features.filter((f) => f.featureType === 'feature').map((f) => f.title),
        benefits: service.features.filter((f) => f.featureType === 'benefit').map((f) => f.title),
        process: service.features
          .filter((f) => f.featureType === 'process_step')
          .map((f) => ({ title: f.title, description: f.description || '', order: f.displayOrder })),
        additionalImages: service.images.map((img) => img.url),
        relatedServices: service.relatedFrom.map((rel) => ({
          ...rel.relatedService,
          price: rel.relatedService.price ? Number(rel.relatedService.price) : null,
        })),
      };

      await cache.set(cacheKey, formatted, 600);
      return res.json({ success: true, data: formatted });
    } catch (err) {
      next(err);
    }
  }

  // GET /service-categories
  static async getPublicCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const cached = await cache.get(CACHE_KEYS.SERVICE_CATEGORIES);
      if (cached) {
        return res.json({ success: true, data: cached });
      }

      const categories = await prisma.serviceCategory.findMany({
        orderBy: { displayOrder: 'asc' },
        include: {
          _count: {
            select: { services: { where: { status: 'PUBLISHED', deletedAt: null } } },
          },
        },
      });

      const formatted = categories.map((c) => ({
        ...c,
        serviceCount: c._count.services,
      }));

      await cache.set(CACHE_KEYS.SERVICE_CATEGORIES, formatted, 1800);
      return res.json({ success: true, data: formatted });
    } catch (err) {
      next(err);
    }
  }

  // ================= ADMIN METHODS =================

  // GET /admin/services
  static async getAdminServices(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const search = (req.query.search as string) || '';
      const status = req.query.status as any;

      const where: any = {
        deletedAt: null,
      };

      if (status) where.status = status;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { shortDescription: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [total, services] = await Promise.all([
        prisma.service.count({ where }),
        prisma.service.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { updatedAt: 'desc' },
          include: { category: true },
        }),
      ]);

      return res.json({
        success: true,
        data: {
          items: services.map((s) => ({
            ...s,
            price: s.price ? Number(s.price) : null,
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

  // GET /admin/services/:id
  static async getAdminServiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const service = await prisma.service.findUnique({
        where: { id },
        include: {
          category: true,
          images: { orderBy: { displayOrder: 'asc' } },
          features: { orderBy: { displayOrder: 'asc' } },
          relatedFrom: { select: { relatedServiceId: true } },
        },
      });

      if (!service) {
        return res.status(404).json({ success: false, error: { message: 'Service not found' } });
      }

      return res.json({
        success: true,
        data: {
          ...service,
          price: service.price ? Number(service.price) : null,
          features: service.features.filter((f) => f.featureType === 'feature').map((f) => f.title),
          benefits: service.features.filter((f) => f.featureType === 'benefit').map((f) => f.title),
          process: service.features
            .filter((f) => f.featureType === 'process_step')
            .map((f) => ({ title: f.title, description: f.description || '', order: f.displayOrder })),
          additionalImages: service.images.map((img) => img.url),
          relatedServiceIds: service.relatedFrom.map((r) => r.relatedServiceId),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /admin/services
  static async createService(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createServiceSchema.parse(req.body);
      const slug = data.slug ? slugify(data.slug) : slugify(data.name);

      const created = await prisma.$transaction(async (tx) => {
        const srv = await tx.service.create({
          data: {
            name: data.name,
            slug,
            shortDescription: data.shortDescription,
            fullDescription: data.fullDescription,
            categoryId: data.categoryId,
            featuredImage: data.featuredImage || null,
            pricingModel: data.pricingModel,
            price: data.price !== null && data.price !== undefined ? data.price : null,
            currency: data.currency,
            isFeatured: data.isFeatured,
            status: data.status,
            seoTitle: data.seoTitle,
            seoDescription: data.seoDescription,
            displayOrder: data.displayOrder,
          },
        });

        // Create features, benefits, and process steps
        const featureItems: Array<{ serviceId: string; featureType: string; title: string; description?: string; displayOrder: number }> = [];

        data.features.forEach((feat, idx) => {
          featureItems.push({ serviceId: srv.id, featureType: 'feature', title: feat, displayOrder: idx });
        });

        data.benefits.forEach((ben, idx) => {
          featureItems.push({ serviceId: srv.id, featureType: 'benefit', title: ben, displayOrder: idx });
        });

        data.process.forEach((step, idx) => {
          featureItems.push({
            serviceId: srv.id,
            featureType: 'process_step',
            title: step.title,
            description: step.description,
            displayOrder: step.order ?? idx,
          });
        });

        if (featureItems.length > 0) {
          await tx.serviceFeature.createMany({ data: featureItems });
        }

        if (data.additionalImages && data.additionalImages.length > 0) {
          await tx.serviceImage.createMany({
            data: data.additionalImages.map((url, idx) => ({
              serviceId: srv.id,
              url,
              displayOrder: idx,
            })),
          });
        }

        if (data.relatedServiceIds && data.relatedServiceIds.length > 0) {
          await tx.serviceRelated.createMany({
            data: data.relatedServiceIds.map((relId) => ({
              serviceId: srv.id,
              relatedServiceId: relId,
            })),
          });
        }

        return srv;
      });

      await invalidateServiceCaches(created.slug);

      await logAudit({
        req,
        action: 'SERVICE_CREATED',
        entityType: 'Service',
        entityId: created.id,
        details: { name: created.name },
      });

      return res.status(201).json({
        success: true,
        data: created,
        message: 'Service created successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /admin/services/:id
  static async updateService(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateServiceSchema.parse(req.body);

      const existing = await prisma.service.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, error: { message: 'Service not found' } });
      }

      const slug = data.slug ? slugify(data.slug) : undefined;

      const updated = await prisma.$transaction(async (tx) => {
        const srv = await tx.service.update({
          where: { id },
          data: {
            ...(data.name && { name: data.name }),
            ...(slug && { slug }),
            ...(data.shortDescription && { shortDescription: data.shortDescription }),
            ...(data.fullDescription && { fullDescription: data.fullDescription }),
            ...(data.categoryId && { categoryId: data.categoryId }),
            ...(data.featuredImage !== undefined && { featuredImage: data.featuredImage || null }),
            ...(data.pricingModel && { pricingModel: data.pricingModel }),
            ...(data.price !== undefined && { price: data.price }),
            ...(data.currency && { currency: data.currency }),
            ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
            ...(data.status && { status: data.status }),
            ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
            ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
            ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
          },
        });

        // Recreate features/benefits/process if provided
        if (data.features || data.benefits || data.process) {
          await tx.serviceFeature.deleteMany({ where: { serviceId: id } });

          const featureItems: Array<{ serviceId: string; featureType: string; title: string; description?: string; displayOrder: number }> = [];

          (data.features || []).forEach((feat, idx) => {
            featureItems.push({ serviceId: id, featureType: 'feature', title: feat, displayOrder: idx });
          });

          (data.benefits || []).forEach((ben, idx) => {
            featureItems.push({ serviceId: id, featureType: 'benefit', title: ben, displayOrder: idx });
          });

          (data.process || []).forEach((step, idx) => {
            featureItems.push({
              serviceId: id,
              featureType: 'process_step',
              title: step.title,
              description: step.description,
              displayOrder: step.order ?? idx,
            });
          });

          if (featureItems.length > 0) {
            await tx.serviceFeature.createMany({ data: featureItems });
          }
        }

        if (data.additionalImages) {
          await tx.serviceImage.deleteMany({ where: { serviceId: id } });
          if (data.additionalImages.length > 0) {
            await tx.serviceImage.createMany({
              data: data.additionalImages.map((url, idx) => ({
                serviceId: id,
                url,
                displayOrder: idx,
              })),
            });
          }
        }

        if (data.relatedServiceIds) {
          await tx.serviceRelated.deleteMany({ where: { serviceId: id } });
          if (data.relatedServiceIds.length > 0) {
            await tx.serviceRelated.createMany({
              data: data.relatedServiceIds.map((relId) => ({
                serviceId: id,
                relatedServiceId: relId,
              })),
            });
          }
        }

        return srv;
      });

      await invalidateServiceCaches(existing.slug);
      if (slug && slug !== existing.slug) {
        await invalidateServiceCaches(slug);
      }

      await logAudit({
        req,
        action: 'SERVICE_UPDATED',
        entityType: 'Service',
        entityId: id,
        details: { name: updated.name },
      });

      return res.json({
        success: true,
        data: updated,
        message: 'Service updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /admin/services/:id
  static async deleteService(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const service = await prisma.service.findUnique({ where: { id } });

      if (!service) {
        return res.status(404).json({ success: false, error: { message: 'Service not found' } });
      }

      await prisma.service.update({
        where: { id },
        data: { deletedAt: new Date(), status: 'ARCHIVED' },
      });

      await invalidateServiceCaches(service.slug);

      await logAudit({
        req,
        action: 'SERVICE_ARCHIVED',
        entityType: 'Service',
        entityId: id,
        details: { name: service.name },
      });

      return res.json({ success: true, message: 'Service archived successfully' });
    } catch (err) {
      next(err);
    }
  }

  // ================= SERVICE CATEGORIES =================

  // POST /admin/service-categories
  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = serviceCategorySchema.parse(req.body);
      const slug = slugify(data.slug || data.name);

      const category = await prisma.serviceCategory.create({
        data: {
          name: data.name,
          slug,
          description: data.description,
          displayOrder: data.displayOrder,
        },
      });

      await cache.del(CACHE_KEYS.SERVICE_CATEGORIES);

      await logAudit({
        req,
        action: 'SERVICE_CATEGORY_CREATED',
        entityType: 'ServiceCategory',
        entityId: category.id,
      });

      return res.status(201).json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /admin/service-categories/:id
  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = serviceCategorySchema.partial().parse(req.body);
      const slug = data.slug ? slugify(data.slug) : undefined;

      const category = await prisma.serviceCategory.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(slug && { slug }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
        },
      });

      await cache.del(CACHE_KEYS.SERVICE_CATEGORIES);

      return res.json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }

  // DELETE /admin/service-categories/:id
  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const count = await prisma.service.count({
        where: { categoryId: id, deletedAt: null },
      });

      if (count > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CATEGORY_NOT_EMPTY',
            message: `Cannot delete category: contains ${count} assigned active service(s).`,
          },
        });
      }

      await prisma.serviceCategory.delete({ where: { id } });
      await cache.del(CACHE_KEYS.SERVICE_CATEGORIES);

      return res.json({ success: true, message: 'Category deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}
