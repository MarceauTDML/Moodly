import type { Request, Response } from 'express';
import { getBody } from '../../middlewares/validate.middleware';
import { sendSuccess } from '../../utils/response.util';
import { passwordService } from './password.services';
import type { ForgotPasswordInput, ResetPasswordInput } from './password.validators';

export const passwordController = {
  async forgot(req: Request, res: Response) {
    await passwordService.forgot(getBody<ForgotPasswordInput>(req));
    sendSuccess(res, {
      message: 'Si un compte existe pour cet e-mail, un lien de réinitialisation vient de vous être envoyé.',
    });
  },

  async reset(req: Request, res: Response) {
    await passwordService.reset(getBody<ResetPasswordInput>(req));
    sendSuccess(res, { message: 'Votre mot de passe a été mis à jour.' });
  },
};
