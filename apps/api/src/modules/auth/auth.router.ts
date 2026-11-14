import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { authLimiter, passwordResetLimiter } from '../../middleware/rate-limit';

export const authRouter = Router();

authRouter.post('/login', authLimiter, AuthController.login);
authRouter.post('/logout', authenticate, AuthController.logout);
authRouter.get('/me', authenticate, AuthController.getMe);
authRouter.post('/forgot-password', passwordResetLimiter, AuthController.forgotPassword);
authRouter.post('/reset-password', passwordResetLimiter, AuthController.resetPassword);
authRouter.post('/change-password', authenticate, AuthController.changePassword);
