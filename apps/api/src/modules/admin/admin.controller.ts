import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../database/client';
import { logAudit } from '../../middleware/audit';
import { createUserSchema, updateUserSchema } from '@triclinium/validation';

export class AdminController {
  // GET /admin/dashboard
  static async getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const [
        totalProducts,
        publishedProducts,
        draftProducts,
        totalServices,
        productCategories,
        serviceCategories,
        newInquiries,
        pendingQuotations,
        processedInquiries,
        publishedArticles,
        recentInquiries,
        recentProducts,
        recentActivities,
      ] = await Promise.all([
        prisma.product.count({ where: { deletedAt: null } }),
        prisma.product.count({ where: { status: 'PUBLISHED', deletedAt: null } }),
        prisma.product.count({ where: { status: 'DRAFT', deletedAt: null } }),
        prisma.service.count({ where: { deletedAt: null } }),
        prisma.productCategory.count(),
        prisma.serviceCategory.count(),
        prisma.inquiry.count({ where: { status: 'NEW' } }),
        prisma.inquiry.count({ where: { type: 'QUOTATION', status: { in: ['NEW', 'IN_PROGRESS'] } } }),
        prisma.inquiry.count({ where: { status: { in: ['QUOTED', 'CONVERTED', 'CLOSED'] } } }),
        prisma.blogPost.count({ where: { status: 'PUBLISHED' } }),
        prisma.inquiry.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            product: { select: { name: true } },
            service: { select: { name: true } },
          },
        }),
        prisma.product.findMany({
          where: { deletedAt: null },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            category: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        }),
        prisma.auditLog.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      return res.json({
        success: true,
        data: {
          totalProducts,
          publishedProducts,
          draftProducts,
          totalServices,
          productCategories,
          serviceCategories,
          newInquiries,
          pendingQuotations,
          processedInquiries,
          publishedArticles,
          recentInquiries: recentInquiries.map((i) => ({
            ...i,
            targetName: i.subject || i.product?.name || i.service?.name,
          })),
          recentProducts: recentProducts.map((p) => ({
            ...p,
            price: p.price ? Number(p.price) : null,
          })),
          recentActivities,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // ================= ADMINISTRATOR MANAGEMENT =================

  // GET /admin/users
  static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          userRoles: {
            include: { role: true },
          },
        },
      });

      return res.json({
        success: true,
        data: users.map((u) => ({
          id: u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          avatarUrl: u.avatarUrl,
          isActive: u.isActive,
          lastLoginAt: u.lastLoginAt,
          createdAt: u.createdAt,
          roles: u.userRoles.map((ur) => ur.role.name),
        })),
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /admin/users
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createUserSchema.parse(req.body);
      const email = data.email.toLowerCase().trim();

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(409).json({ success: false, error: { message: 'A user with this email already exists' } });
      }

      const defaultPassword = data.password || 'AdminTriclinium2026!@#';
      const passwordHash = await bcrypt.hash(defaultPassword, 12);

      const user = await prisma.$transaction(async (tx) => {
        const u = await tx.user.create({
          data: {
            email,
            passwordHash,
            firstName: data.firstName,
            lastName: data.lastName,
            isActive: data.isActive,
          },
        });

        // Resolve roles
        const roles = await tx.role.findMany({
          where: { name: { in: data.roles } },
        });

        if (roles.length > 0) {
          await tx.userRole.createMany({
            data: roles.map((r) => ({
              userId: u.id,
              roleId: r.id,
            })),
          });
        }

        return u;
      });

      await logAudit({
        req,
        action: 'ADMIN_USER_CREATED',
        entityType: 'User',
        entityId: user.id,
        details: { email: user.email, roles: data.roles },
      });

      return res.status(201).json({
        success: true,
        data: { id: user.id, email: user.email },
        message: 'Administrator account created successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  // PATCH /admin/users/:id
  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateUserSchema.parse(req.body);

      const user = await prisma.$transaction(async (tx) => {
        const u = await tx.user.update({
          where: { id },
          data: {
            ...(data.firstName && { firstName: data.firstName }),
            ...(data.lastName && { lastName: data.lastName }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
          },
        });

        if (data.roles && data.roles.length > 0) {
          await tx.userRole.deleteMany({ where: { userId: id } });
          const roles = await tx.role.findMany({ where: { name: { in: data.roles } } });
          await tx.userRole.createMany({
            data: roles.map((r) => ({ userId: id, roleId: r.id })),
          });
        }

        return u;
      });

      await logAudit({
        req,
        action: 'ADMIN_USER_UPDATED',
        entityType: 'User',
        entityId: id,
        details: { name: `${user.firstName} ${user.lastName}` },
      });

      return res.json({ success: true, data: user, message: 'User updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  // ================= ROLES & AUDIT LOGS =================

  // GET /admin/roles
  static async listRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await prisma.role.findMany({
        include: {
          rolePermissions: { include: { permission: true } },
          _count: { select: { userRoles: true } },
        },
      });

      const permissions = await prisma.permission.findMany({
        orderBy: [{ module: 'asc' }, { code: 'asc' }],
      });

      return res.json({
        success: true,
        data: {
          roles: roles.map((r) => ({
            id: r.id,
            name: r.name,
            description: r.description,
            userCount: r._count.userRoles,
            permissions: r.rolePermissions.map((rp) => rp.permission.code),
          })),
          availablePermissions: permissions,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /admin/audit-logs
  static async listAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 30;
      const entityType = req.query.entityType as string;

      const where: any = {};
      if (entityType) where.entityType = entityType;

      const [total, logs] = await Promise.all([
        prisma.auditLog.count({ where }),
        prisma.auditLog.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      return res.json({
        success: true,
        data: {
          items: logs,
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
}
