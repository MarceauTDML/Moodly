import type { Request, Response } from 'express';
import { getBody } from '../../middlewares/validate.middleware';
import { sendSuccess } from '../../utils/response.util';
import { authService } from './auth.services';
import type { LoginInput, RefreshInput, RegisterInput } from './auth.validators';
export const authController = {
  async register(req: Request, res: Response) {
    sendSuccess(res, await authService.register(getBody<RegisterInput>(req)), 201);
  },
  async login(req: Request, res: Response) {
    sendSuccess(res, await authService.login(getBody<LoginInput>(req)));
  },
  async refresh(req: Request, res: Response) {
    sendSuccess(res, await authService.refresh(getBody<RefreshInput>(req)));
  },
};
