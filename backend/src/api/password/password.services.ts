import { PENDING_ACTIVATION_HASH } from '../../config/auth.config';
import { env } from '../../config/env.config';
import { emailService } from '../../services/email.service';
import { generateResetToken } from '../../services/token.service';
import { hashPassword, sha256 } from '../../utils/hash.util';
import { ApiError } from '../../utils/response.util';
import { passwordRepo } from './password.repo';
import type { ForgotPasswordInput, ResetPasswordInput } from './password.validators';

export const passwordService = {
  async forgot({ email }: ForgotPasswordInput): Promise<void> {
    const user = await passwordRepo.findByEmail(email);
    // Un compte jamais activé passe par POST /auth/register, pas par la réinitialisation
    if (!user || user.passwordHash === PENDING_ACTIVATION_HASH) return;
    const { token, hash } = generateResetToken();
    const expiry = new Date(Date.now() + env.RESET_TOKEN_TTL_MINUTES * 60 * 1000);
    await passwordRepo.setResetToken(user.id, hash, expiry);
    await emailService.sendResetPassword(user.email, user.firstName, token);
  },

  async reset({ token, password }: ResetPasswordInput): Promise<void> {
    const user = await passwordRepo.findByValidResetToken(sha256(token));
    if (!user) throw ApiError.badRequest('Lien de réinitialisation invalide ou expiré', 'INVALID_RESET_TOKEN');
    await passwordRepo.updatePassword(user.id, await hashPassword(password));
  },
};
