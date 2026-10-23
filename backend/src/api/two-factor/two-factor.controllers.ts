import type { Request, Response } from 'express';
import { getBody } from '../../middlewares/validate.middleware';
import { sendNoContent, sendSuccess } from '../../utils/response.util';
import { twoFactorService } from './two-factor.services';
import type { ChallengeInput, ConfirmInput, DisableInput, SetupInput, VerifyInput } from './two-factor.validators';

export const twoFactorController = {
  async status(req: Request, res: Response) {
    sendSuccess(res, await twoFactorService.status(req.user!.id));
  },
  async setup(req: Request, res: Response) {
    sendSuccess(res, await twoFactorService.setup(req.user!.id, getBody<SetupInput>(req)));
  },
  async confirm(req: Request, res: Response) {
    sendSuccess(res, await twoFactorService.confirm(req.user!.id, getBody<ConfirmInput>(req)));
  },
  async disable(req: Request, res: Response) {
    await twoFactorService.disable(req.user!.id, getBody<DisableInput>(req));
    sendNoContent(res);
  },
  async verify(req: Request, res: Response) {
    sendSuccess(res, await twoFactorService.verifyLogin(getBody<VerifyInput>(req)));
  },
  async resend(req: Request, res: Response) {
    sendSuccess(res, await twoFactorService.resend(getBody<ChallengeInput>(req)));
  },
};
