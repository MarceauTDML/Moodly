import type { Request, Response } from 'express';
import { getBody } from '../../middlewares/validate.middleware';
import { sendSuccess } from '../../utils/response.util';
import { moodsService } from './moods.services';
import type { SubmitMoodInput } from './moods.validators';

export const moodsController = {
  async options(_req: Request, res: Response) {
    sendSuccess(res, await moodsService.getOptions());
  },

  async today(req: Request, res: Response) {
    sendSuccess(res, await moodsService.getTodayStatus(req.user!.id));
  },

  async submit(req: Request, res: Response) {
    sendSuccess(res, await moodsService.submit(req.user!, getBody<SubmitMoodInput>(req)), 201);
  },
};
