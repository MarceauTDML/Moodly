import { Router } from 'express';
import {
  authLimiter,
  forgotPasswordEmailLimiter,
  forgotPasswordLimiter,
} from '../../middlewares/rateLimiter.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { passwordController } from './password.controllers';
import { forgotPasswordSchema, resetPasswordSchema } from './password.validators';

export const passwordRoutes = Router();

passwordRoutes.post(
  '/forgot',
  forgotPasswordLimiter,
  validate({ body: forgotPasswordSchema }),
  forgotPasswordEmailLimiter,
  passwordController.forgot,
);
passwordRoutes.post('/reset', authLimiter, validate({ body: resetPasswordSchema }), passwordController.reset);
