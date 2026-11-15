import dotenv from 'dotenv';
import path from 'path';

// Load .env file from root or local
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/triclinium?schema=public',
  directDatabaseUrl: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL || '',
  
  auth: {
    secret: process.env.AUTH_SECRET || 'triclinium_default_dev_secret_key_change_in_production_32bytes!',
    sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || '604800', 10), // 7 days in seconds
    cookieName: 'triclinium_session',
  },

  cors: {
    origins: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map((o) => o.trim()),
  },

  urls: {
    frontend: process.env.FRONTEND_URL || 'http://localhost:3000',
    api: process.env.API_URL || 'http://localhost:4000',
    site: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  },

  redis: {
    restUrl: process.env.UPSTASH_REDIS_REST_URL,
    restToken: process.env.UPSTASH_REDIS_REST_TOKEN,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  resend: {
    apiKey: process.env.RESEND_API_KEY,
    senderName: process.env.EMAIL_SENDER_NAME || 'TRICLINIUM Enterprise',
    senderAddress: process.env.EMAIL_SENDER_ADDRESS || 'notifications@triclinium.com',
    adminNotificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'archer.tritech@gmail.com',
  },

  revalidation: {
    secret: process.env.INTERNAL_REVALIDATION_SECRET || 'triclinium_reval_secret_key',
  },
};
