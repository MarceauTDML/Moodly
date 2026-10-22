import type { Request, Response } from 'express';
import { getBody, getParams, getQuery } from '../../middlewares/validate.middleware';
import { sendNoContent, sendSuccess } from '../../utils/response.util';
import { usersService } from './users.services';
import type {
  CollaboratorInput,
  UpdateCollaboratorInput,
  ChangePasswordInput,
  CreateUserInput,
  ListUsersQuery,
  NotificationSettingsInput,
  PushTokenInput,
  UpdateMeInput,
  UpdateUserInput,
  UserIdParams,
} from './users.validators';

export const usersController = {
  async listCollaborators(req: Request, res: Response) {
    sendSuccess(res, await usersService.listCollaborators(req.user!));
  },
  async getCollaborator(req: Request, res: Response) {
    sendSuccess(
      res,
      await usersService.getCollaborator(req.user!, getParams<UserIdParams>(req).userId),
    );
  },
  async createCollaborator(req: Request, res: Response) {
    sendSuccess(
      res,
      await usersService.createCollaborator(req.user!, getBody<CollaboratorInput>(req)),
      201,
    );
  },
  async updateCollaborator(req: Request, res: Response) {
    sendSuccess(
      res,
      await usersService.updateCollaborator(
        req.user!,
        getParams<UserIdParams>(req).userId,
        getBody<UpdateCollaboratorInput>(req),
      ),
    );
  },
  async inviteCollaborator(req: Request, res: Response) {
    sendSuccess(
      res,
      await usersService.inviteCollaborator(req.user!, getParams<UserIdParams>(req).userId),
    );
  },
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
    sendSuccess(
      res,
      await usersService.updateNotificationSettings(
        req.user!.id,
        getBody<NotificationSettingsInput>(req),
      ),
    );
  },

  async setPushToken(req: Request, res: Response) {
    sendSuccess(res, await usersService.setPushToken(req.user!.id, getBody<PushTokenInput>(req)));
  },

  async list(req: Request, res: Response) {
    sendSuccess(res, await usersService.list(req.user!.companyId, getQuery<ListUsersQuery>(req)));
  },

  async getById(req: Request, res: Response) {
    sendSuccess(res, await usersService.getById(req.user!, getParams<UserIdParams>(req).userId));
  },

  async create(req: Request, res: Response) {
    sendSuccess(res, await usersService.create(req.user!, getBody<CreateUserInput>(req)), 201);
  },

  async update(req: Request, res: Response) {
    sendSuccess(
      res,
      await usersService.update(
        req.user!,
        getParams<UserIdParams>(req).userId,
        getBody<UpdateUserInput>(req),
      ),
    );
  },

  async remove(req: Request, res: Response) {
    await usersService.remove(req.user!, getParams<UserIdParams>(req).userId);
    sendNoContent(res);
  },
};
