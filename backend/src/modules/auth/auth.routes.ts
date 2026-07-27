import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { loginRateLimiter } from '../../middleware/rateLimiter.js';
import { authenticate } from '../../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/login', loginRateLimiter, AuthController.login);
authRouter.post('/refresh', AuthController.refresh);
authRouter.post('/logout', authenticate, AuthController.logout);
authRouter.get('/me', authenticate, AuthController.me);
