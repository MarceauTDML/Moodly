import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { bootstrapFinished, signedIn, signedOut } from '../store/slices/authSlice';
import { useLoginMutation } from '../store/api/authApi';
import { baseApi } from '../store/api/baseApi';
import { requestApi } from '../services/api.client';
import { profileSchema } from '../services/api.schemas';
import { secureStorage } from '../services/secureStorage.client';
import type { LoginInput } from '../types/auth.types';
import type { Profile } from '../types/user.types';

export function useSessionBootstrap() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const token = await secureStorage.readToken();
        if (!token) return;
        const user = await requestApi<Profile>('/users/me', { token, schema: profileSchema });
        if (active) dispatch(signedIn({ token, user }));
      } catch {
        await secureStorage.clearToken().catch(() => undefined);
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
    await secureStorage.writeToken(response.token);
    dispatch(baseApi.util.resetApiState());
    dispatch(signedIn({ token: response.token, user: profile }));
    result.reset();
  };
  const signOut = () => dispatch(signedOut());
  return { ...auth, signIn, signOut };
}
