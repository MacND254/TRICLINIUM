import { app } from './app';
import { config } from './config';
import prisma from './database/client';

const server = app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`🚀 TRICLINIUM API Server listening on port ${config.port}`);
  console.log(`📡 Base API URL: http://localhost:${config.port}/api/v1`);
  console.log(`📚 OpenAPI Docs: http://localhost:${config.port}/api/v1/docs`);
  console.log(`🛡️  Environment: ${config.env}`);
  console.log(`====================================================`);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.info(`[${signal}] Received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.info('Prisma disconnected. Server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
