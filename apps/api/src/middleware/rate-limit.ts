import { Request, Response, NextFunction } from 'express';
import { cache } from '../integrations/redis';

export function rateLimit(options: { windowMs?: number; max?: number; message?: string }) {
  const windowSecs = Math.ceil((options.windowMs || 60000) / 1000);
  const maxRequests = options.max || 60;
  const errorMsg = options.message || 'Too many requests, please try again later.';

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const key = `ratelimit:${req.baseUrl}${req.path}:${ip}`;

      const count = await cache.incr(key, windowSecs);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count));

      if (count > maxRequests) {
        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: errorMsg,
          },
        });
      }

      next();
    } catch (err) {
      // Never let rate limiting failures block valid requests
      next();
    }
  };
}
