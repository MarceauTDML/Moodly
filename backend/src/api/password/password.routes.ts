import { Router } from 'express';
import { authLimiter } from '../../middlewares/rateLimiter.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { passwordController } from './password.controllers';
import { forgotPasswordSchema, resetPasswordSchema } from './password.validators';

export const passwordRoutes = Router();

passwordRoutes.post('/forgot', authLimiter, validate({ body: forgotPasswordSchema }), passwordController.forgot);
passwordRoutes.post('/reset', authLimiter, validate({ body: resetPasswordSchema }), passwordController.reset);
