import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { bootstrapFinished, signedIn, signedOut } from '../store/slices/authSlice';
import { useLoginMutation } from '../store/api/authApi';
import { baseApi } from '../store/api/baseApi';
import { ApiRequestError, requestApi } from '../services/api.client';
import { profileSchema } from '../services/api.schemas';
import { secureStorage } from '../services/secureStorage.client';
import { refreshSession } from '../services/session.client';
import type { LoginInput } from '../types/auth.types';
import type { Profile } from '../types/user.types';

export function useSessionBootstrap() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        let tokens = await secureStorage.readTokens();
        if (!tokens) return;
        const loadProfile = (token: string) =>
          requestApi<Profile>('/users/me', { token, schema: profileSchema });
        let user: Profile;
        try {
          user = await loadProfile(tokens.token);
        } catch (error) {
          // Le jeton d'accès a expiré pendant que l'application était fermée.
          if (!(error instanceof ApiRequestError && error.failure.status === 401)) throw error;
          tokens = await refreshSession(tokens.refreshToken);
          await secureStorage.writeTokens(tokens);
          user = await loadProfile(tokens.token);
        }
        if (active) dispatch(signedIn({ ...tokens, user }));
      } catch {
        await secureStorage.clearTokens().catch(() => undefined);
      } finally {
        if (active) dispatch(bootstrapFinished());
      }
    })();
    return () => {
      active = false;
    };
  }, [dispatch]);
}
export function useAuth() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);
  const [login, result] = useLoginMutation();
  const signIn = async (input: LoginInput) => {
    const response = await login(input).unwrap();
    // Le choix de portail oriente la connexion ; le rôle vient toujours du serveur.
    const profile = await requestApi<Profile>('/users/me', {
      token: response.token,
      schema: profileSchema,
    });
    const tokens = { token: response.token, refreshToken: response.refreshToken };
    await secureStorage.writeTokens(tokens);
    dispatch(baseApi.util.resetApiState());
    dispatch(signedIn({ ...tokens, user: profile }));
    result.reset();
  };
  const signOut = () => dispatch(signedOut());
  return { ...auth, signIn, signOut };
}
