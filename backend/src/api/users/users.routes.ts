import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authLimiter } from '../../middlewares/rateLimiter.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { usersController } from './users.controllers';
import {
  collaboratorSchema,
  updateCollaboratorSchema,
  changePasswordSchema,
  deleteMeSchema,
  createUserSchema,
  listUsersQuerySchema,
  notificationSettingsSchema,
  pushTokenSchema,
  updateMeSchema,
  updateUserSchema,
  userIdParamsSchema,
} from './users.validators';

export const usersRoutes = Router();

usersRoutes.use(authenticate);

usersRoutes.get('/me', usersController.getMe);
usersRoutes.patch('/me', validate({ body: updateMeSchema }), usersController.updateMe);
usersRoutes.patch(
  '/me/password',
  validate({ body: changePasswordSchema }),
  usersController.changePassword,
);
usersRoutes.delete(
  '/me',
  authLimiter,
  validate({ body: deleteMeSchema }),
  usersController.deleteMe,
);
usersRoutes.get('/me/export', usersController.exportMe);
usersRoutes.get('/me/notifications', usersController.getNotifications);
usersRoutes.patch(
  '/me/notifications',
  validate({ body: notificationSettingsSchema }),
  usersController.updateNotifications,
);
usersRoutes.put(
  '/me/push-token',
  validate({ body: pushTokenSchema }),
  usersController.setPushToken,
);

usersRoutes.get(
  '/collaborators',
  requireRole('MANAGER', 'ADMIN'),
  usersController.listCollaborators,
);
usersRoutes.post(
  '/collaborators',
  requireRole('MANAGER', 'ADMIN'),
  validate({ body: collaboratorSchema }),
  usersController.createCollaborator,
);
usersRoutes.get(
  '/collaborators/:userId',
  requireRole('MANAGER', 'ADMIN'),
  validate({ params: userIdParamsSchema }),
  usersController.getCollaborator,
);
usersRoutes.patch(
  '/collaborators/:userId',
  requireRole('MANAGER', 'ADMIN'),
  validate({ params: userIdParamsSchema, body: updateCollaboratorSchema }),
  usersController.updateCollaborator,
);
usersRoutes.post(
  '/collaborators/:userId/invite',
  requireRole('MANAGER', 'ADMIN'),
  validate({ params: userIdParamsSchema }),
  usersController.inviteCollaborator,
);

usersRoutes.get(
  '/',
  requireRole('ADMIN'),
  validate({ query: listUsersQuerySchema }),
  usersController.list,
);
usersRoutes.post(
  '/',
  requireRole('ADMIN'),
  validate({ body: createUserSchema }),
  usersController.create,
);
usersRoutes.get(
  '/:userId',
  requireRole('ADMIN'),
  validate({ params: userIdParamsSchema }),
  usersController.getById,
);
usersRoutes.patch(
  '/:userId',
  requireRole('ADMIN'),
  validate({ params: userIdParamsSchema, body: updateUserSchema }),
  usersController.update,
);
usersRoutes.delete(
  '/:userId',
  requireRole('ADMIN'),
  validate({ params: userIdParamsSchema }),
  usersController.remove,
);
