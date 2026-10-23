import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  bootstrapFailed,
  bootstrapFinished,
  bootstrapRetried,
  signedIn,
  signedOut,
} from '../store/slices/authSlice';
import { useLoginMutation, useVerifyTwoFactorMutation } from '../store/api/authApi';
import { baseApi } from '../store/api/baseApi';
import { ApiRequestError, errorMessage, requestApi } from '../services/api.client';
import { profileSchema } from '../services/api.schemas';
import { secureStorage } from '../services/secureStorage.client';
import { refreshSession } from '../services/session.client';
import { unregisterThisDevice } from '../services/pushNotifications.client';
import type { LoginInput, LoginResponse, Session, TwoFactorChallenge } from '../types/auth.types';
import type { Profile } from '../types/user.types';

const isRejectedSession = (error: unknown) =>
  error instanceof ApiRequestError && error.failure.status === 401;
async function restoreSession(): Promise<Session | null> {
  let tokens = await secureStorage.readTokens();
  if (!tokens) return null;
  const loadProfile = (token: string) =>
    requestApi<Profile>('/users/me', { token, schema: profileSchema });
  let user: Profile;
  try {
    user = await loadProfile(tokens.token);
  } catch (error) {
    // Le jeton d'accès a expiré pendant que l'application était fermée.
    if (!isRejectedSession(error)) throw error;
    tokens = await refreshSession(tokens.refreshToken);
    await secureStorage.writeTokens(tokens);
    user = await loadProfile(tokens.token);
  }
  return { ...tokens, user };
}
export function useSessionBootstrap() {
  const dispatch = useAppDispatch();
  const attempt = useAppSelector((s) => s.auth.bootstrapAttempt);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const session = await restoreSession();
        if (active) dispatch(session ? signedIn(session) : bootstrapFinished());
      } catch (error) {
        // Seul un refus du serveur efface la session. Une erreur réseau la conserve :
        // l'utilisateur peut réessayer une fois le serveur ou le Wi-Fi revenu.
        if (isRejectedSession(error)) {
          await secureStorage.clearTokens().catch(() => undefined);
          if (active) dispatch(bootstrapFinished());
        } else if (active) dispatch(bootstrapFailed(errorMessage(error)));
      }
    })();
    return () => {
      active = false;
    };
  }, [dispatch, attempt]);
}
export function useAuth() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);
  const [login, result] = useLoginMutation();
  const [verifyTwoFactor] = useVerifyTwoFactorMutation();
  const startSession = async (response: LoginResponse) => {
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
  // Renvoie le défi si le compte demande un code : la session n'est ouverte qu'après.
  const signIn = async (input: LoginInput): Promise<TwoFactorChallenge | null> => {
    const response = await login(input).unwrap();
    if ('twoFactorRequired' in response) return response;
    await startSession(response);
    return null;
  };
  const completeTwoFactor = async (challengeToken: string, code: string) =>
    startSession(await verifyTwoFactor({ challengeToken, code }).unwrap());
  const signOut = () => {
    const session = auth.session;
    dispatch(signedOut());
    // Sans attendre : ce téléphone cesse de recevoir les rappels du compte qui se déconnecte.
    if (session) void unregisterThisDevice(session).catch(() => undefined);
  };
  const retryBootstrap = () => dispatch(bootstrapRetried());
  return { ...auth, signIn, completeTwoFactor, signOut, retryBootstrap };
}
