import type { Request, Response } from 'express';
import { getBody, getParams } from '../../middlewares/validate.middleware';
import { sendNoContent, sendSuccess } from '../../utils/response.util';
import { teamsService } from './teams.services';
import type { AddMemberInput, CreateTeamInput, MemberParams, UpdateMemberInput, UpdateTeamInput } from './teams.validators';

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

  async addMember(req: Request, res: Response) {
    sendSuccess(res, await teamsService.addMember(req.user!, req.team!, getBody<AddMemberInput>(req)), 201);
  },

  async updateMember(req: Request, res: Response) {
    const { userId } = getParams<MemberParams>(req);
    sendSuccess(res, await teamsService.updateMember(req.user!, req.team!, userId, getBody<UpdateMemberInput>(req).isLead));
  },

  async removeMember(req: Request, res: Response) {
    await teamsService.removeMember(req.team!, getParams<MemberParams>(req).userId);
    sendNoContent(res);
  },
};
