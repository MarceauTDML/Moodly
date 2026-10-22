import type { Request, Response } from 'express';
import { getQuery } from '../../middlewares/validate.middleware';
import { sendSuccess } from '../../utils/response.util';
import { moodmapService } from './moodmap.services';
import type { EvolutionQuery, HistoryQuery, TrendsQuery } from './moodmap.validators';

export const moodmapController = {
  async summary(req: Request, res: Response) {
    sendSuccess(res, await moodmapService.getSummary(req.team!));
  },

  async history(req: Request, res: Response) {
    sendSuccess(res, await moodmapService.getHistory(req.team!, getQuery<HistoryQuery>(req)));
  },

  async trends(req: Request, res: Response) {
    sendSuccess(res, await moodmapService.getTrends(req.team!, getQuery<TrendsQuery>(req)));
  },

  async evolution(req: Request, res: Response) {
    sendSuccess(res, await moodmapService.getEvolution(req.team!, getQuery<EvolutionQuery>(req)));
  },
};
