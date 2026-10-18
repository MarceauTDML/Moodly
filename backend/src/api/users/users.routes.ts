import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { usersController } from './users.controllers';
import {
  changePasswordSchema,
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
usersRoutes.patch('/me/password', validate({ body: changePasswordSchema }), usersController.changePassword);
usersRoutes.get('/me/notifications', usersController.getNotifications);
usersRoutes.patch('/me/notifications', validate({ body: notificationSettingsSchema }), usersController.updateNotifications);
usersRoutes.put('/me/push-token', validate({ body: pushTokenSchema }), usersController.setPushToken);

usersRoutes.get('/', requireRole('ADMIN'), validate({ query: listUsersQuerySchema }), usersController.list);
usersRoutes.post('/', requireRole('ADMIN'), validate({ body: createUserSchema }), usersController.create);
usersRoutes.get('/:userId', requireRole('ADMIN'), validate({ params: userIdParamsSchema }), usersController.getById);
usersRoutes.patch(
  '/:userId',
  requireRole('ADMIN'),
  validate({ params: userIdParamsSchema, body: updateUserSchema }),
  usersController.update,
);
usersRoutes.delete('/:userId', requireRole('ADMIN'), validate({ params: userIdParamsSchema }), usersController.remove);
