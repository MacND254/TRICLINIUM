import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { openApiSpec } from './docs/openapi';
import { errorHandler } from './middleware/error-handler';
import { sanitizeInput } from './middleware/sanitize';
import { globalApiLimiter } from './middleware/rate-limit';

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

  // Trust reverse proxy (Docker, Nginx, Next.js rewrites, Cloudflare) for accurate client IP resolution
  app.set('trust proxy', 1);

  // Disable technology footprint disclosure header
  app.disable('x-powered-by');

  // OWASP Hardened HTTP Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Swagger UI and frontend assets
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
      frameguard: { action: 'sameorigin' },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true,
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);

        // Always allow localhost in any environment
        if (/^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }

        // Allow any Vercel deployment domain (*.vercel.app)
        try {
          const parsed = new URL(origin);
          if (parsed.hostname.endsWith('.vercel.app')) {
            return callback(null, true);
          }
        } catch {}

        // Check configured origins
        const allowedOrigins = [
          ...config.cors.origins,
          config.urls.frontend,
          config.urls.site,
          process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
          process.env.NEXT_PUBLIC_SITE_URL,
        ].filter(Boolean);

        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          return callback(null, true);
        }

        // Dev convenience or Vercel deployment fallback
        if (!config.isProduction || process.env.VERCEL) {
          return callback(null, true);
        }

        return callback(new Error('CORS origin blocked by security policy'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Payload body limits (restricted from 10mb to 2mb to prevent memory exhaustion DoS)
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());

  // Input Sanitization: strip null bytes, XSS script injection, and prototype pollution attempts
  app.use(sanitizeInput);

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

  // Mount API Modules under /api/v1 with Global Rate Limiting
  const v1 = express.Router();
  v1.use(globalApiLimiter);
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
