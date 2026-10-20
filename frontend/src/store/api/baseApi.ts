import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { z } from 'zod';
import type { Session } from '../../types/auth.types';
import { ApiRequestError, requestApi, type ApiFailure } from '../../services/api.client';
import { signedOut } from '../slices/authSlice';
interface ApiArgs {
  url: string;
  method?: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
  public?: boolean;
  schema?: z.ZodType;
}
const baseQuery: BaseQueryFn<ApiArgs, unknown, ApiFailure> = async (args, api) => {
  const session = (api.getState() as { auth: { session: Session | null } }).auth.session;
  try {
    const data = await requestApi(args.url, {
      method: args.method,
      body: args.body,
      token: args.public ? null : session?.token,
      schema: args.schema,
      signal: api.signal,
    });
    return { data };
  } catch (error) {
    const failure =
      error instanceof ApiRequestError
        ? error.failure
        : { status: 'UNKNOWN', message: 'Une erreur est survenue.' };
    const current = (api.getState() as { auth: { session: Session | null } }).auth.session;
    // Une ancienne requête ne doit pas déconnecter une nouvelle session.
    if (failure.status === 401 && !args.public && current?.token === session?.token)
      api.dispatch(signedOut());
    return { error: failure };
  }
};
export const baseApi = createApi({
  reducerPath: 'managerApi',
  baseQuery,
  tagTypes: ['Profile', 'Notifications', 'Teams'],
  keepUnusedDataFor: 0,
  endpoints: () => ({}),
});
