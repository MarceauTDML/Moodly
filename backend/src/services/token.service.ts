import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config';
import type { AccessTokenPayload, AuthTokens, RefreshTokenPayload } from '../types/auth.types';
import { randomToken, sha256 } from '../utils/hash.util';
import { ApiError } from '../utils/response.util';

interface TokenSubject {
  id: string;
  role: AccessTokenPayload['role'];
  companyId: string;
  passwordHash: string;
}

export const passwordFingerprint = (passwordHash: string): string => sha256(passwordHash).slice(0, 16);

export const signAccessToken = (user: Omit<TokenSubject, 'passwordHash'>): string =>
  jwt.sign({ role: user.role, companyId: user.companyId, type: 'access' }, jwtConfig.access.secret, {
    subject: user.id,
    expiresIn: jwtConfig.access.expiresIn,
    issuer: jwtConfig.issuer,
  });

export const signRefreshToken = (user: Pick<TokenSubject, 'id' | 'passwordHash'>): string =>
  jwt.sign({ ver: passwordFingerprint(user.passwordHash), type: 'refresh' }, jwtConfig.refresh.secret, {
    subject: user.id,
    expiresIn: jwtConfig.refresh.expiresIn,
    issuer: jwtConfig.issuer,
  });

export const issueTokens = (user: TokenSubject): AuthTokens => ({
  accessToken: signAccessToken(user),
  refreshToken: signRefreshToken(user),
  tokenType: 'Bearer',
  expiresIn: String(jwtConfig.access.expiresIn),
});

const verify = <T extends { type: string }>(token: string, secret: string, type: T['type']): T & { sub: string } => {
  try {
    const payload = jwt.verify(token, secret, { issuer: jwtConfig.issuer }) as T & { sub?: string };
    if (payload.type !== type || !payload.sub) throw new Error('wrong token type');
    return payload as T & { sub: string };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) throw ApiError.unauthorized('Session expirée', 'TOKEN_EXPIRED');
    throw ApiError.unauthorized('Jeton invalide', 'INVALID_TOKEN');
  }
};

export const verifyAccessToken = (token: string): { sub: string } => {
  try {
    const payload = jwt.verify(token, jwtConfig.access.secret) as { sub?: string; type?: string };
    if (!payload.sub || (payload.type !== undefined && payload.type !== 'access')) throw new Error('wrong token type');
    return { sub: payload.sub };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) throw ApiError.unauthorized('Session expirée', 'TOKEN_EXPIRED');
    throw ApiError.unauthorized('Jeton invalide', 'INVALID_TOKEN');
  }
};

export const verifyRefreshToken = (token: string) =>
  verify<RefreshTokenPayload>(token, jwtConfig.refresh.secret, 'refresh');

export const generateResetToken = (): { token: string; hash: string } => {
  const token = randomToken(32);
  return { token, hash: sha256(token) };
};
