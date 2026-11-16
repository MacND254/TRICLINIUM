import { PrismaClient } from '@prisma/client';
import { config } from '../config';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: [
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
      ...(config.env === 'development'
        ? [{ emit: 'stdout' as const, level: 'query' as const }]
        : []),
    ],
  });

  client.$on('error' as any, (e: any) => {
    // Filter out benign idle pool connection closures from PgBouncer / Neon compute auto-suspend
    const msg = typeof e.message === 'string' ? e.message : JSON.stringify(e);
    if (msg.includes('kind: Closed') || msg.includes('Closed, cause: None')) {
      return;
    }
    console.error('[Prisma Error]:', e);
  });

  client.$on('warn' as any, (e: any) => {
    console.warn('[Prisma Warning]:', e);
  });

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Preserve PrismaClient instance across serverless lambda invocations to reuse connection pool
globalForPrisma.prisma = prisma;

export default prisma;
