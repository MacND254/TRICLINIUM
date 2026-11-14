import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { openApiSpec } from './docs/openapi';
import { errorHandler } from './middleware/error-handler';

// Modular Routers
import { authRouter } from './modules/auth/auth.router';
import { productsRouter } from './modules/products/products.router';
import { servicesRouter } from './modules/services/services.router';
import { inquiriesRouter } from './modules/inquiries/inquiries.router';
import { cmsRouter } from './modules/cms/cms.router';
import { mediaRouter } from './modules/media/media.router';
import { adminRouter } from './modules/admin/admin.router';
import { settingsRouter } from './modules/settings/settings.router';

export function createApp(): Express {
  const app = express();

  // Security HTTP headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Swagger UI and frontend assets
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (config.cors.origins.includes(origin) || config.cors.origins.includes('*')) {
          return callback(null, true);
        }
        return callback(null, true); // Dev convenience
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Body and cookie parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Health check endpoint
  app.get('/api/v1/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'triclinium-api',
      environment: config.env,
    });
  });

  // OpenAPI Documentation
  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

  // Mount API Modules under /api/v1
  const v1 = express.Router();
  v1.use(authRouter);
  v1.use('/admin/auth', authRouter);
  v1.use('/auth', authRouter);
  v1.use(productsRouter);
  v1.use(servicesRouter);
  v1.use(inquiriesRouter);
  v1.use(cmsRouter);
  v1.use(mediaRouter);
  v1.use(adminRouter);
  v1.use(settingsRouter);

  app.use('/api/v1', v1);

  // 404 handler for API routes
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: { code: 'ENDPOINT_NOT_FOUND', message: `API route ${req.method} ${req.baseUrl} does not exist` },
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
export default app;
