import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { z } from 'zod';
import type { Session } from '../../types/auth.types';
import { ApiRequestError, requestApi, type ApiFailure } from '../../services/api.client';
import { refreshSession } from '../../services/session.client';
import { signedOut, tokensRefreshed } from '../slices/authSlice';
interface ApiArgs {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  public?: boolean;
  schema?: z.ZodType;
}
const toFailure = (error: unknown): ApiFailure =>
  error instanceof ApiRequestError
    ? error.failure
    : { status: 'UNKNOWN', message: 'Une erreur est survenue.' };
const baseQuery: BaseQueryFn<ApiArgs, unknown, ApiFailure> = async (args, api) => {
  const currentSession = () =>
    (api.getState() as { auth: { session: Session | null } }).auth.session;
  const send = (token: string | undefined) =>
    requestApi(args.url, {
      method: args.method,
      body: args.body,
      token: args.public ? null : token,
      schema: args.schema,
      signal: api.signal,
    });
  const session = currentSession();
  try {
    return { data: await send(session?.token) };
  } catch (error) {
    const failure = toFailure(error);
    const latest = currentSession();
    if (failure.status !== 401 || args.public || !session || latest?.user.id !== session.user.id)
      return { error: failure };
    // Jeton d'accès expiré : un renouvellement, puis une seule nouvelle tentative.
    try {
      let token = latest.token;
      if (latest.token === session.token) {
        const tokens = await refreshSession(latest.refreshToken);
        if (currentSession()?.refreshToken === latest.refreshToken)
          api.dispatch(tokensRefreshed(tokens));
        token = tokens.token;
      }
      return { data: await send(token) };
    } catch (retryError) {
      const retryFailure = toFailure(retryError);
      // Une ancienne requête ne doit pas déconnecter une nouvelle session.
      if (retryFailure.status === 401 && currentSession()?.refreshToken === latest.refreshToken)
        api.dispatch(signedOut());
      return { error: retryFailure };
    }
  }
};
export const baseApi = createApi({
  reducerPath: 'managerApi',
  baseQuery,
  tagTypes: ['Profile', 'Notifications', 'Teams', 'DailyCheckin', 'Collaborators', 'TwoFactor'],
  keepUnusedDataFor: 0,
  endpoints: () => ({}),
});
