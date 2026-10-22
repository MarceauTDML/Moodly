import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { SessionTokens } from '../types/auth.types';
const SESSION_KEY = 'moodly.manager.access-token';
// Sur le web, les jetons restent en mémoire Redux : aucun localStorage ni cookie JavaScript.
export const secureStorage = {
  readTokens: async (): Promise<SessionTokens | null> => {
    if (Platform.OS === 'web') return null;
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    if (!raw) return null;
    try {
      const value: unknown = JSON.parse(raw);
      if (
        value &&
        typeof value === 'object' &&
        'token' in value &&
        'refreshToken' in value &&
        typeof value.token === 'string' &&
        typeof value.refreshToken === 'string'
      )
        return { token: value.token, refreshToken: value.refreshToken };
    } catch {
      // Ancien format (jeton d'accès seul) : une nouvelle connexion est nécessaire.
    }
    return null;
  },
  writeTokens: async ({ token, refreshToken }: SessionTokens) => {
    if (Platform.OS !== 'web')
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({ token, refreshToken }), {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
  },
  clearTokens: async () => {
    if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(SESSION_KEY);
  },
};
