import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { authLimiter } from '../../middlewares/rateLimiter.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { usersController } from '../users/users.controllers';
import { collaboratorSchema } from '../users/users.validators';
import { authController } from './auth.controllers';
import { loginSchema, refreshSchema, registerSchema } from './auth.validators';
const router = Router();
router.post('/login', authLimiter, validate({ body: loginSchema }), authController.login);
router.post('/refresh', authLimiter, validate({ body: refreshSchema }), authController.refresh);
router.post('/register', authLimiter, validate({ body: registerSchema }), authController.register);
router.post('/activate', authLimiter, validate({ body: registerSchema }), authController.register);
// Keep the old invitation entry point with the same checks as /users/collaborators.
router.post(
  '/collaborators',
  authenticate,
  requireRole('MANAGER', 'ADMIN'),
  validate({ body: collaboratorSchema }),
  usersController.createCollaborator,
);
export default router;
