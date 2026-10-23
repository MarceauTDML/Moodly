import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authLimiter } from '../../middlewares/rateLimiter.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { twoFactorController } from './two-factor.controllers';
import { challengeSchema, confirmSchema, disableSchema, setupSchema, verifySchema } from './two-factor.validators';

// Configuration depuis les paramètres : /users/me/2fa
export const twoFactorAccountRoutes = Router();
twoFactorAccountRoutes.use(authenticate);
twoFactorAccountRoutes.get('/', twoFactorController.status);
twoFactorAccountRoutes.post('/setup', validate({ body: setupSchema }), twoFactorController.setup);
twoFactorAccountRoutes.post('/confirm', authLimiter, validate({ body: confirmSchema }), twoFactorController.confirm);
twoFactorAccountRoutes.delete('/', authLimiter, validate({ body: disableSchema }), twoFactorController.disable);

// Seconde étape de connexion : /auth/2fa
export const twoFactorLoginRoutes = Router();
twoFactorLoginRoutes.post('/verify', authLimiter, validate({ body: verifySchema }), twoFactorController.verify);
twoFactorLoginRoutes.post('/resend', authLimiter, validate({ body: challengeSchema }), twoFactorController.resend);
