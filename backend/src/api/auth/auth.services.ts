import { PENDING_ACTIVATION_HASH } from '../../config/auth.config';
import { signAccessToken } from '../../services/token.service';
import { hashPassword, sha256, verifyPassword } from '../../utils/hash.util';
import { ApiError } from '../../utils/response.util';
import { authRepo } from './auth.repo';
import type { RegisterInput, LoginInput } from './auth.validators';

export const authService = {
  async register({ token, password }: RegisterInput) {
    const tokenHash = sha256(token);
    const user = await authRepo.findInvitation(tokenHash);
    if (!user)
      throw ApiError.badRequest(
        'Ce lien est invalide ou expiré. Demandez une nouvelle invitation à votre manager.',
        'INVALID_INVITATION',
      );
    // Conditional update consumes the invitation once, including concurrent requests.
    const result = await authRepo.activate(user.id, tokenHash, await hashPassword(password));
    if (result.count !== 1)
      throw ApiError.badRequest('Ce lien est invalide ou expiré.', 'INVALID_INVITATION');
    return {
      message: 'Votre compte est activé. Vous pouvez vous connecter.',
      email: user.email,
      role: user.role,
    };
  },
  async login(input: LoginInput) {
    const user = await authRepo.findByEmail(input.email);
    if (
      !user ||
      user.passwordHash === PENDING_ACTIVATION_HASH ||
      !(await verifyPassword(input.password, user.passwordHash))
    ) {
      throw ApiError.unauthorized('Identifiants incorrects', 'INVALID_CREDENTIALS');
    }
    const portal = user.role === 'COLLABORATEUR' ? 'employee' : 'manager';
    if (input.portal && input.portal !== portal) {
      throw ApiError.forbidden(
        portal === 'employee'
          ? 'Ce compte appartient à l’espace collaborateur.'
          : 'Ce compte appartient à l’espace manager.',
        'WRONG_PORTAL',
      );
    }
    return {
      message: 'Connexion réussie',
      token: signAccessToken(user),
      user: { id: user.id, email: user.email, role: user.role },
    };
  },
};
