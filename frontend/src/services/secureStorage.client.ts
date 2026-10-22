import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
const SESSION_KEY = 'moodly.manager.access-token';
// Sur le web, le jeton reste en mémoire Redux : aucun localStorage ni cookie JavaScript.
export const secureStorage = {
  readToken: async () => (Platform.OS === 'web' ? null : SecureStore.getItemAsync(SESSION_KEY)),
  writeToken: async (token: string) => {
    if (Platform.OS !== 'web')
      await SecureStore.setItemAsync(SESSION_KEY, token, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
  },
  clearToken: async () => {
    if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(SESSION_KEY);
  },
};
