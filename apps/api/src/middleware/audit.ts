import { Request } from 'express';
import prisma from '../database/client';

export async function logAudit(params: {
  req?: Request;
  userId?: string | null;
  userName?: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: any;
}) {
  try {
    const ipAddress = params.req?.ip || params.req?.socket?.remoteAddress || null;
    const userId = params.userId || params.req?.user?.id || null;
    const userName = params.userName || params.req?.user?.name || 'System';

    await prisma.auditLog.create({
      data: {
        userId,
        userName,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        details: params.details ? (params.details as any) : undefined,
        ipAddress,
      },
    });
  } catch (err) {
    console.error('[Audit Log Failure]:', err);
  }
}
