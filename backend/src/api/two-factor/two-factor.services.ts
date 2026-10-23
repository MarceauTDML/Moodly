import { randomBytes, randomInt } from 'node:crypto';
import type { User } from '@prisma/client';
import { PENDING_ACTIVATION_HASH } from '../../config/auth.config';
import { isProd } from '../../config/env.config';
import { isMailerConfigured } from '../../config/mailer.config';
import { emailService } from '../../services/email.service';
import {
  passwordFingerprint,
  signAccessToken,
  signRefreshToken,
  signTwoFactorChallenge,
  verifyTwoFactorChallenge,
} from '../../services/token.service';
import { base32Encode, generateTotpSecret, otpauthUrl, verifyTotp } from '../../services/totp.service';
import { sha256, verifyPassword } from '../../utils/hash.util';
import { ApiError } from '../../utils/response.util';
import { openSecret, sealSecret } from '../../utils/secret-box.util';
import { twoFactorRepo } from './two-factor.repo';
import type { ChallengeInput, ConfirmInput, DisableInput, SetupInput, VerifyInput } from './two-factor.validators';

const EMAIL_CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;
const RECOVERY_CODES = 8;

const hashCode = (userId: string, code: string) => sha256(`${userId}:${code}`);
const maskEmail = (email: string) => {
  const [name = '', domain = ''] = email.split('@');
  return `${name.slice(0, 1)}•••@${domain}`;
};
const newRecoveryCodes = () =>
  Array.from({ length: RECOVERY_CODES }, () => {
    const raw = base32Encode(randomBytes(5)).toLowerCase();
    return `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
  });

const sendEmailCode = async (user: User) => {
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  await twoFactorRepo.update(user.id, {
    twoFactorCodeHash: hashCode(user.id, code),
    twoFactorCodeExpiry: new Date(Date.now() + EMAIL_CODE_TTL_MS),
  });
  try {
    await emailService.sendTwoFactorCode(user.email, user.firstName, code);
  } catch {
    throw new ApiError(503, 'Le code n’a pas pu être envoyé. Réessayez plus tard.', 'MAIL_UNAVAILABLE');
  }
};

const assertNotLocked = (user: User) => {
  if (user.twoFactorLockedUntil && user.twoFactorLockedUntil > new Date())
    throw new ApiError(429, 'Trop de codes incorrects. Réessayez dans quelques minutes.', 'TWO_FACTOR_LOCKED');
};

// Après MAX_ATTEMPTS échecs, la vérification est bloquée LOCK_MS, même avec une nouvelle connexion.
const rejectCode = async (user: User): Promise<never> => {
  const attempts = user.twoFactorAttempts + 1;
  await twoFactorRepo.update(
    user.id,
    attempts >= MAX_ATTEMPTS
      ? { twoFactorAttempts: 0, twoFactorLockedUntil: new Date(Date.now() + LOCK_MS) }
      : { twoFactorAttempts: attempts },
  );
  throw ApiError.badRequest('Code incorrect ou expiré.', 'INVALID_TWO_FACTOR_CODE');
};

const consumeTotp = (user: User, sealedSecret: string, code: string, data = {}) => {
  const step = verifyTotp(openSecret(sealedSecret), code, user.twoFactorLastStep);
  if (step === null) return Promise.resolve(false);
  return twoFactorRepo.consume(
    user.id,
    { OR: [{ twoFactorLastStep: null }, { twoFactorLastStep: { lt: step } }] },
    { ...data, twoFactorLastStep: step },
  );
};

const consumeEmailCode = (user: User, code: string, data = {}) =>
  twoFactorRepo.consume(
    user.id,
    { twoFactorCodeHash: hashCode(user.id, code), twoFactorCodeExpiry: { gt: new Date() } },
    { ...data, twoFactorCodeHash: null, twoFactorCodeExpiry: null },
  );

const consumeRecoveryCode = (user: User, code: string) => {
  const hash = hashCode(user.id, code);
  if (!user.twoFactorRecoveryCodes.includes(hash)) return Promise.resolve(false);
  return twoFactorRepo.consume(
    user.id,
    { twoFactorRecoveryCodes: { has: hash } },
    { twoFactorRecoveryCodes: user.twoFactorRecoveryCodes.filter((h) => h !== hash) },
  );
};

const getUserOrThrow = async (id: string) => {
  const user = await twoFactorRepo.findById(id);
  if (!user) throw ApiError.notFound('Utilisateur introuvable');
  return user;
};

export const twoFactorService = {
  status: async (userId: string) => {
    const user = await getUserOrThrow(userId);
    return {
      method: user.twoFactorMethod,
      recoveryCodesLeft: user.twoFactorMethod ? user.twoFactorRecoveryCodes.length : 0,
    };
  },

  async setup(userId: string, { method }: SetupInput) {
    const user = await getUserOrThrow(userId);
    if (user.twoFactorMethod)
      throw ApiError.conflict('La double authentification est déjà activée.', 'TWO_FACTOR_ALREADY_ENABLED');
    if (method === 'TOTP') {
      const secret = generateTotpSecret();
      await twoFactorRepo.update(userId, {
        twoFactorPendingMethod: 'TOTP',
        twoFactorPendingSecret: sealSecret(secret),
        twoFactorLastStep: null,
      });
      return { method, secret, otpauthUrl: otpauthUrl(secret, user.email) };
    }
    if (isProd && !isMailerConfigured)
      throw new ApiError(503, 'L’envoi d’e-mails n’est pas configuré.', 'MAIL_UNAVAILABLE');
    await twoFactorRepo.update(userId, { twoFactorPendingMethod: 'EMAIL', twoFactorPendingSecret: null });
    await sendEmailCode(user);
    return { method, email: maskEmail(user.email) };
  },

  // La méthode n'est activée qu'après un premier code valide : impossible de se bloquer
  // avec une application mal configurée.
  async confirm(userId: string, { code }: ConfirmInput) {
    const user = await getUserOrThrow(userId);
    if (!user.twoFactorPendingMethod)
      throw ApiError.badRequest('Aucune configuration en cours.', 'NO_TWO_FACTOR_SETUP');
    assertNotLocked(user);
    const recoveryCodes = newRecoveryCodes();
    const enable = {
      twoFactorMethod: user.twoFactorPendingMethod,
      twoFactorSecret: user.twoFactorPendingSecret,
      twoFactorPendingMethod: null,
      twoFactorPendingSecret: null,
      twoFactorRecoveryCodes: recoveryCodes.map((c) => hashCode(userId, c)),
    };
    const accepted =
      user.twoFactorPendingMethod === 'TOTP'
        ? await consumeTotp(user, user.twoFactorPendingSecret!, code, enable)
        : await consumeEmailCode(user, code, enable);
    if (!accepted) return rejectCode(user);
    // Affichés une seule fois : seuls leurs hachages sont conservés.
    return { method: enable.twoFactorMethod, recoveryCodes };
  },

  async disable(userId: string, { password }: DisableInput) {
    const user = await getUserOrThrow(userId);
    if (!(await verifyPassword(password, user.passwordHash)))
      throw ApiError.badRequest('Mot de passe incorrect', 'INVALID_PASSWORD');
    await twoFactorRepo.update(userId, {
      twoFactorMethod: null,
      twoFactorSecret: null,
      twoFactorPendingMethod: null,
      twoFactorPendingSecret: null,
      twoFactorLastStep: null,
      twoFactorRecoveryCodes: [],
      twoFactorCodeHash: null,
      twoFactorCodeExpiry: null,
      twoFactorAttempts: 0,
      twoFactorLockedUntil: null,
    });
  },

  // Appelé par /auth/login une fois le mot de passe vérifié.
  async challenge(user: User) {
    if (user.twoFactorMethod === 'EMAIL') await sendEmailCode(user);
    return {
      message: 'Code de vérification requis',
      twoFactorRequired: true as const,
      method: user.twoFactorMethod!,
      challengeToken: signTwoFactorChallenge(user),
      ...(user.twoFactorMethod === 'EMAIL' ? { email: maskEmail(user.email) } : {}),
    };
  },

  async verifyLogin({ challengeToken, code }: VerifyInput) {
    const user = await userFromChallenge(challengeToken);
    assertNotLocked(user);
    const accepted =
      (/^\d{6}$/.test(code) &&
        (user.twoFactorMethod === 'TOTP'
          ? await consumeTotp(user, user.twoFactorSecret!, code)
          : await consumeEmailCode(user, code))) ||
      (await consumeRecoveryCode(user, code));
    if (!accepted) return rejectCode(user);
    return {
      message: 'Connexion réussie',
      token: signAccessToken(user),
      refreshToken: signRefreshToken(user),
      user: { id: user.id, email: user.email, role: user.role },
    };
  },

  async resend({ challengeToken }: ChallengeInput) {
    const user = await userFromChallenge(challengeToken);
    if (user.twoFactorMethod !== 'EMAIL')
      throw ApiError.badRequest('Cette méthode n’envoie pas de code.', 'NOT_EMAIL_METHOD');
    await sendEmailCode(user);
    return { message: 'Un nouveau code a été envoyé.', email: maskEmail(user.email) };
  },
};

// Le défi devient invalide si le mot de passe a changé ou si la double authentification
// a été désactivée entre-temps.
async function userFromChallenge(challengeToken: string) {
  const payload = verifyTwoFactorChallenge(challengeToken);
  const user = await twoFactorRepo.findById(payload.sub);
  if (
    !user ||
    !user.twoFactorMethod ||
    user.passwordHash === PENDING_ACTIVATION_HASH ||
    passwordFingerprint(user.passwordHash) !== payload.ver
  )
    throw ApiError.unauthorized('Session expirée, reconnectez-vous.', 'INVALID_TOKEN');
  return user;
}
