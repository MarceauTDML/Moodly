import type { Request, Response } from 'express';
import { getParams } from '../../middlewares/validate.middleware';
import { sendSuccess } from '../../utils/response.util';
import { tagsService } from './tags.services';
import type { TagCodeParams } from './tags.validators';

export const tagsController = {
  async list(_req: Request, res: Response) {
    sendSuccess(res, await tagsService.list());
  },

  async getByCode(req: Request, res: Response) {
    sendSuccess(res, await tagsService.getByCode(getParams<TagCodeParams>(req).code));
  },
};
