import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'system' | 'light' | 'dark';
const KEY = 'moodly.theme';
const isMode = (value: string | null): value is ThemeMode =>
  value === 'system' || value === 'light' || value === 'dark';

// Préférence d'affichage propre à l'appareil, pas au compte. Sur le web, rien n'est conservé.
export const themePreference = {
  async read(): Promise<ThemeMode> {
    if (Platform.OS === 'web') return 'system';
    const value = await SecureStore.getItemAsync(KEY).catch(() => null);
    return isMode(value) ? value : 'system';
  },
  async write(mode: ThemeMode) {
    if (Platform.OS !== 'web') await SecureStore.setItemAsync(KEY, mode);
  },
};
