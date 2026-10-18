import type { Request, Response } from 'express';
import { getBody } from '../../middlewares/validate.middleware';
import { sendSuccess } from '../../utils/response.util';
import { usersService } from './users.services';
import type { ChangePasswordInput, NotificationSettingsInput, PushTokenInput, UpdateMeInput } from './users.validators';

export const usersController = {
  async getMe(req: Request, res: Response) {
    sendSuccess(res, await usersService.getProfile(req.user!.id));
  },

  async updateMe(req: Request, res: Response) {
    sendSuccess(res, await usersService.updateProfile(req.user!.id, getBody<UpdateMeInput>(req)));
  },

  async changePassword(req: Request, res: Response) {
    await usersService.changePassword(req.user!.id, getBody<ChangePasswordInput>(req));
    sendSuccess(res, { message: 'Mot de passe modifié.' });
  },

  async getNotifications(req: Request, res: Response) {
    sendSuccess(res, await usersService.getNotificationSettings(req.user!.id));
  },

  async updateNotifications(req: Request, res: Response) {
    sendSuccess(res, await usersService.updateNotificationSettings(req.user!.id, getBody<NotificationSettingsInput>(req)));
  },

  async setPushToken(req: Request, res: Response) {
    sendSuccess(res, await usersService.setPushToken(req.user!.id, getBody<PushTokenInput>(req)));
  },
};
