import type { Request, Response } from 'express';
import { getQuery } from '../../middlewares/validate.middleware';
import { sendSuccess } from '../../utils/response.util';
import { moodmapService } from './moodmap.services';
import type { HistoryQuery } from './moodmap.validators';

export const moodmapController = {
  async summary(req: Request, res: Response) {
    sendSuccess(res, await moodmapService.getSummary(req.team!));
  },

  async history(req: Request, res: Response) {
    sendSuccess(res, await moodmapService.getHistory(req.team!, getQuery<HistoryQuery>(req)));
  },
};
