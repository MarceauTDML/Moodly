import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { usersController } from './users.controllers';
import { changePasswordSchema, notificationSettingsSchema, pushTokenSchema, updateMeSchema } from './users.validators';

export const usersRoutes = Router();

usersRoutes.use(authenticate);

usersRoutes.get('/me', usersController.getMe);
usersRoutes.patch('/me', validate({ body: updateMeSchema }), usersController.updateMe);
usersRoutes.patch('/me/password', validate({ body: changePasswordSchema }), usersController.changePassword);
usersRoutes.get('/me/notifications', usersController.getNotifications);
usersRoutes.patch('/me/notifications', validate({ body: notificationSettingsSchema }), usersController.updateNotifications);
usersRoutes.put('/me/push-token', validate({ body: pushTokenSchema }), usersController.setPushToken);
