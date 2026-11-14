import { Request, Response, NextFunction } from 'express';
import { cache } from '../integrations/redis';

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

export function rateLimit(options: RateLimitOptions) {
  const windowMs = options.windowMs || 60000;
  const windowSecs = Math.ceil(windowMs / 1000);
  const maxRequests = options.max || 60;
  const errorMsg = options.message || 'Too many requests. Please slow down and try again later.';

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const customKey = options.keyGenerator ? options.keyGenerator(req) : `${req.baseUrl}${req.path}:${ip}`;
      const cacheKey = `ratelimit:${customKey}`;

      const count = await cache.incr(cacheKey, windowSecs);
      const remaining = Math.max(0, maxRequests - count);
      const resetTime = Math.ceil((Date.now() + windowMs) / 1000);

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', resetTime);

      if (count > maxRequests) {
        res.setHeader('Retry-After', windowSecs);
        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: errorMsg,
            retryAfter: windowSecs,
          },
        });
      }

      next();
    } catch (err) {
      // In case of cache failure, do not block traffic
      next();
    }
  };
}

// ================= PRE-CONFIGURED SECURITY RATE LIMITERS =================

/**
 * Strict authentication brute-force protection:
 * Max 5 attempts per 15 minutes per IP + email combination.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts. Please wait 15 minutes before retrying.',
  keyGenerator: (req) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const email = (req.body?.email || '').toLowerCase().trim();
    return `auth_login:${ip}:${email}`;
  },
});

/**
 * Password recovery throttling:
 * Max 3 requests per 30 minutes per IP.
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 3,
  message: 'Too many password reset requests. Please check your inbox or try again in 30 minutes.',
  keyGenerator: (req) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `password_reset:${ip}`;
  },
});

/**
 * Public form submission throttling (Inquiries, Contact, Quotations):
 * Max 10 submissions per 15 minutes per IP.
 */
export const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Submission limit reached. Please wait a few minutes before submitting another request.',
  keyGenerator: (req) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `public_form:${ip}`;
  },
});

/**
 * File upload throttling:
 * Max 30 media uploads per 15 minutes per user/IP.
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Upload frequency limit reached. Please wait a few minutes before uploading more files.',
  keyGenerator: (req) => {
    const userId = (req as any).user?.id || req.ip || 'unknown';
    return `media_upload:${userId}`;
  },
});

/**
 * Global API rate limiter for DoS and automated scraping mitigation:
 * Max 200 requests per minute per IP.
 */
export const globalApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  message: 'High traffic detected from your network. Please slow down your requests.',
  keyGenerator: (req) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `global_api:${ip}`;
  },
});
