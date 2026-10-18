import type { Request, Response } from 'express';
import { getBody } from '../../middlewares/validate.middleware';
import { sendNoContent, sendSuccess } from '../../utils/response.util';
import { teamsService } from './teams.services';
import type { CreateTeamInput, UpdateTeamInput } from './teams.validators';

export const teamsController = {
  async list(req: Request, res: Response) {
    sendSuccess(res, await teamsService.list(req.user!));
  },

  async get(req: Request, res: Response) {
    sendSuccess(res, await teamsService.get(req.team!));
  },

  async create(req: Request, res: Response) {
    sendSuccess(res, await teamsService.create(req.user!, getBody<CreateTeamInput>(req)), 201);
  },

  async update(req: Request, res: Response) {
    sendSuccess(res, await teamsService.update(req.team!, getBody<UpdateTeamInput>(req)));
  },

  async remove(req: Request, res: Response) {
    await teamsService.remove(req.team!);
    sendNoContent(res);
  },
};
