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
        data: users.map((u) => {
          const mainRoleName = u.userRoles[0]?.role?.name || 'ADMIN';
          const mainRoleId = u.userRoles[0]?.role?.id || 'admin';
          return {
            id: u.id,
            name: `${u.firstName} ${u.lastName}`.trim(),
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            avatarUrl: u.avatarUrl,
            isActive: u.isActive,
            failedLoginAttempts: u.failedAttempts,
            lockedUntil: u.lockedUntil,
            lastLoginAt: u.lastLoginAt,
            createdAt: u.createdAt,
            roles: u.userRoles.map((ur) => ur.role.name),
            role: { id: mainRoleId, name: mainRoleName },
          };
        }),
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /admin/users
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const body = { ...req.body };
      if (body.name && !body.firstName) {
        const parts = String(body.name).trim().split(/\s+/);
        body.firstName = parts[0] || 'User';
        body.lastName = parts.slice(1).join(' ') || 'Admin';
      }
      if (body.roleId && !body.roles) {
        const r = await prisma.role.findUnique({ where: { id: body.roleId } });
        if (r) {
          body.roles = [r.name];
        }
      }
      if (!body.roles || body.roles.length === 0) {
        body.roles = ['ADMIN'];
      }

      const data = createUserSchema.parse(body);
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
      const body = { ...req.body };
      if (body.name && !body.firstName) {
        const parts = String(body.name).trim().split(/\s+/);
        body.firstName = parts[0] || 'User';
        body.lastName = parts.slice(1).join(' ') || 'Admin';
      }
      if (body.roleId && !body.roles) {
        const r = await prisma.role.findUnique({ where: { id: body.roleId } });
        if (r) {
          body.roles = [r.name];
        }
      }

      const data = updateUserSchema.parse(body);

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

  // DELETE /admin/users/:id
  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (req.user?.id === id) {
        return res.status(400).json({ success: false, error: { message: 'You cannot delete your own account' } });
      }
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({ success: false, error: { message: 'User not found' } });
      }
      await prisma.user.delete({ where: { id } });
      await logAudit({
        req,
        action: 'ADMIN_USER_DELETED',
        entityType: 'User',
        entityId: id,
        details: { email: user.email },
      });
      return res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  // POST /admin/users/:id/reset-password
  static async resetUserPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { password } = req.body;
      if (!password || typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ success: false, error: { message: 'Password must be at least 8 characters long' } });
      }
      const passwordHash = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { id },
        data: {
          passwordHash,
          failedAttempts: 0,
          lockedUntil: null,
        },
      });
      await logAudit({
        req,
        action: 'ADMIN_PASSWORD_RESET',
        entityType: 'User',
        entityId: id,
      });
      return res.json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
      next(err);
    }
  }

  // POST /admin/users/:id/unlock
  static async unlockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await prisma.user.update({
        where: { id },
        data: {
          failedAttempts: 0,
          lockedUntil: null,
        },
      });
      await logAudit({
        req,
        action: 'ADMIN_USER_UNLOCKED',
        entityType: 'User',
        entityId: id,
      });
      return res.json({ success: true, message: 'User account unlocked successfully' });
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
  // GET /admin/audit-logs
  static async listAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 30;
      const entityType = req.query.entityType as string;
      const search = req.query.search as string;

      const where: any = {};
      if (entityType && entityType !== 'ALL') {
        where.entityType = entityType;
      }
      if (search && search.trim()) {
        where.OR = [
          { action: { contains: search.trim(), mode: 'insensitive' } },
          { entityType: { contains: search.trim(), mode: 'insensitive' } },
          { userName: { contains: search.trim(), mode: 'insensitive' } },
        ];
      }

      const [total, logs] = await Promise.all([
        prisma.auditLog.count({ where }),
        prisma.auditLog.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        }),
      ]);

      const formatted = logs.map((l) => ({
        id: l.id,
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        metadata: l.details as Record<string, unknown> | null,
        ipAddress: l.ipAddress,
        createdAt: l.createdAt,
        userName: l.userName,
        user: l.user
          ? {
              id: l.user.id,
              name: `${l.user.firstName} ${l.user.lastName}`.trim(),
              email: l.user.email,
            }
          : { id: 'system', name: l.userName || 'System', email: 'system@triclinium.com' },
      }));

      return res.json({
        success: true,
        data: {
          items: formatted,
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

  // GET /admin/audit-logs/export
  static async exportAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await prisma.auditLog.findMany({
        take: 2000,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      });

      const rows = [
        ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'User Name', 'User Email', 'IP Address'],
        ...logs.map((l) => [
          l.createdAt.toISOString(),
          `"${l.action.replace(/"/g, '""')}"`,
          `"${l.entityType.replace(/"/g, '""')}"`,
          `"${(l.entityId || '').replace(/"/g, '""')}"`,
          `"${(l.user ? `${l.user.firstName} ${l.user.lastName}`.trim() : l.userName || 'System').replace(/"/g, '""')}"`,
          `"${(l.user?.email || '').replace(/"/g, '""')}"`,
          `"${(l.ipAddress || '').replace(/"/g, '""')}"`,
        ]),
      ];

      const csv = rows.map((r) => r.join(',')).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="triclinium-audit-logs.csv"');
      return res.send(csv);
    } catch (err) {
      next(err);
    }
  }
}
