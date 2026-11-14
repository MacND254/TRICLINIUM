import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { rateLimit } from '../../middleware/rate-limit';

export const authRouter = Router();

// Progressive login throttling & brute-force protection: max 10 attempts per 15 mins
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts. Please try again later.',
});

authRouter.post('/login', loginLimiter, AuthController.login);
authRouter.post('/logout', authenticate, AuthController.logout);
authRouter.get('/me', authenticate, AuthController.getMe);
authRouter.post('/forgot-password', loginLimiter, AuthController.forgotPassword);
authRouter.post('/reset-password', loginLimiter, AuthController.resetPassword);
authRouter.post('/change-password', authenticate, AuthController.changePassword);
