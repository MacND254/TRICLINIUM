import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../../database/client';
import { config } from '../../config';
import { logAudit } from '../../middleware/audit';
import { sendEmail, generatePasswordResetEmail } from '../../integrations/resend';
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '@triclinium/validation';
import { RoleName } from '@triclinium/types';

export class AuthController {
  // POST /admin/auth/login
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase().trim() },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: { permission: true },
                  },
                },
              },
            },
          },
        },
      });

      // Check account lockout
      if (user && user.lockedUntil && user.lockedUntil > new Date()) {
        const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
        return res.status(423).json({
          success: false,
          error: {
            code: 'ACCOUNT_LOCKED',
            message: `Account is temporarily locked. Please try again in ${remainingMinutes} minute(s).`,
          },
        });
      }

      const isValidPassword = user ? await bcrypt.compare(data.password, user.passwordHash) : false;

      if (!user || !isValidPassword) {
        if (user) {
          const attempts = user.failedAttempts + 1;
          const lockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
          await prisma.user.update({
            where: { id: user.id },
            data: { failedAttempts: attempts, lockedUntil },
          });
        }

        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email address or password',
          },
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCOUNT_INACTIVE',
            message: 'Your administrator account has been deactivated.',
          },
        });
      }

      // Reset failed attempts on success
      await prisma.user.update({
        where: { id: user.id },
        data: { failedAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
      });

      // Issue JWT Session Token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.auth.secret,
        { expiresIn: config.auth.sessionMaxAge }
      );

      // Store session in DB
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + config.auth.sessionMaxAge * 1000);

      await prisma.session.create({
        data: {
          userId: user.id,
          tokenHash,
          userAgent: req.headers['user-agent'] || 'unknown',
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
          expiresAt,
        },
      });

      // Set HttpOnly, Secure, SameSite Cookie
      res.cookie(config.auth.cookieName, token, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'lax',
        maxAge: config.auth.sessionMaxAge * 1000,
        path: '/',
      });

      // Audit Log
      await logAudit({
        req,
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        action: 'ADMIN_LOGIN',
        entityType: 'User',
        entityId: user.id,
      });

      const roles: RoleName[] = user.userRoles.map((ur) => ur.role.name as RoleName);
      const permissionSet = new Set<string>();
      user.userRoles.forEach((ur) => {
        ur.role.rolePermissions.forEach((rp) => permissionSet.add(rp.permission.code));
      });

      return res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
            roles,
            permissions: Array.from(permissionSet),
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /admin/auth/logout
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.sessionToken) {
        const tokenHash = crypto.createHash('sha256').update(req.sessionToken).digest('hex');
        await prisma.session.deleteMany({ where: { tokenHash } });
      }

      res.clearCookie(config.auth.cookieName, { path: '/' });

      if (req.user) {
        await logAudit({
          req,
          userId: req.user.id,
          userName: req.user.name,
          action: 'ADMIN_LOGOUT',
          entityType: 'User',
          entityId: req.user.id,
        });
      }

      return res.json({
        success: true,
        message: 'Successfully logged out',
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /admin/auth/me
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED' } });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: { permission: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!user || !user.isActive) {
        return res.status(401).json({ success: false, error: { code: 'USER_INACTIVE' } });
      }

      const roles = user.userRoles.map((ur) => ur.role.name);
      const permissions = Array.from(
        new Set(user.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.code)))
      );

      let sessionExpiresAt: string | null = null;
      let sessionIssuedAt: string | null = null;
      if (req.sessionToken) {
        try {
          const decoded: any = jwt.decode(req.sessionToken);
          if (decoded?.exp) {
            sessionExpiresAt = new Date(decoded.exp * 1000).toISOString();
          }
          if (decoded?.iat) {
            sessionIssuedAt = new Date(decoded.iat * 1000).toISOString();
          }
        } catch {}
      }

      return res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatarUrl: user.avatarUrl,
          roles,
          permissions,
          sessionExpiresAt,
          sessionIssuedAt,
          cookieName: config.auth.cookieName,
          cookieMaxAge: config.auth.sessionMaxAge,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /admin/auth/forgot-password
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (user && user.isActive) {
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash,
            expiresAt,
          },
        });

        const resetUrl = `${config.urls.frontend}/admin/reset-password?token=${rawToken}`;
        await sendEmail({
          to: user.email,
          subject: 'TRICLINIUM Administrator Password Reset',
          html: generatePasswordResetEmail(resetUrl, user.firstName),
        });

        await logAudit({
          req,
          userId: user.id,
          userName: `${user.firstName} ${user.lastName}`,
          action: 'PASSWORD_RESET_REQUESTED',
          entityType: 'User',
          entityId: user.id,
        });
      }

      // Always return success to prevent email enumeration
      return res.json({
        success: true,
        message: 'If the provided email corresponds to an active account, password reset instructions have been sent.',
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /admin/auth/reset-password
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const resetRecord = await prisma.passwordResetToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });

      if (!resetRecord || resetRecord.isUsed || resetRecord.expiresAt < new Date()) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Password reset link is invalid or has expired',
          },
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      await prisma.$transaction([
        prisma.user.update({
          where: { id: resetRecord.userId },
          data: { passwordHash, failedAttempts: 0, lockedUntil: null },
        }),
        prisma.passwordResetToken.update({
          where: { id: resetRecord.id },
          data: { isUsed: true },
        }),
        // Invalidate all existing sessions for security
        prisma.session.deleteMany({
          where: { userId: resetRecord.userId },
        }),
      ]);

      await logAudit({
        req,
        userId: resetRecord.userId,
        userName: `${resetRecord.user.firstName} ${resetRecord.user.lastName}`,
        action: 'PASSWORD_RESET_COMPLETED',
        entityType: 'User',
        entityId: resetRecord.userId,
      });

      return res.json({
        success: true,
        message: 'Password has been successfully reset. Please log in with your new credentials.',
      });
    } catch (err) {
      next(err);
    }
  }

  // POST /admin/auth/change-password
  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED' } });
      }

      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CURRENT_PASSWORD',
            message: 'The current password you entered is incorrect',
          },
        });
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);

      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });

      await logAudit({
        req,
        userId: user.id,
        userName: req.user.name,
        action: 'PASSWORD_CHANGED',
        entityType: 'User',
        entityId: user.id,
      });

      return res.json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}
