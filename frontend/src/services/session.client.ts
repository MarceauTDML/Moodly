import type { SessionTokens } from '../types/auth.types';
import { requestApi } from './api.client';
import { tokensSchema } from './api.schemas';
// Plusieurs requêtes peuvent expirer en même temps : un seul renouvellement est envoyé.
let pending: { refreshToken: string; promise: Promise<SessionTokens> } | null = null;
export function refreshSession(refreshToken: string): Promise<SessionTokens> {
  if (pending?.refreshToken === refreshToken) return pending.promise;
  const promise = requestApi<SessionTokens>('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
    schema: tokensSchema,
  }).finally(() => {
    if (pending?.promise === promise) pending = null;
  });
  pending = { refreshToken, promise };
  return promise;
}
