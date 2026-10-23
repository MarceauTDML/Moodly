import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { darkColors, lightColors, type Palette } from './colors';
import { themePreference, type ThemeMode } from '../services/themePreference.storage';

export type ColorScheme = 'light' | 'dark';

interface Theme {
  colors: Palette;
  scheme: ColorScheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  statusBarStyle: 'light-content' | 'dark-content';
}

const ThemeContext = createContext<Theme>({
  colors: lightColors,
  scheme: 'light',
  mode: 'system',
  setMode: () => undefined,
  statusBarStyle: 'dark-content',
});

// « Système » suit le réglage du téléphone ; le choix est mémorisé sur l'appareil.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    void themePreference
      .read()
      .then(setModeState)
      .finally(() => setReady(true));
  }, []);
  const value = useMemo<Theme>(() => {
    const scheme: ColorScheme = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;
    return {
      colors: scheme === 'dark' ? darkColors : lightColors,
      scheme,
      mode,
      setMode: (next) => {
        setModeState(next);
        void themePreference.write(next).catch(() => undefined);
      },
      statusBarStyle: scheme === 'dark' ? 'light-content' : 'dark-content',
    };
  }, [mode, system]);
  // Attendre la préférence enregistrée évite d'afficher un instant le mauvais thème.
  if (!ready) return null;
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useAppTheme = () => useContext(ThemeContext);

// Styles dépendant des couleurs : créés une fois par palette, puis réutilisés.
export function themedStyles<T extends StyleSheet.NamedStyles<T>>(factory: (colors: Palette) => T) {
  const cache = new Map<Palette, T>();
  return function useThemedStyles(): T {
    const { colors } = useAppTheme();
    let styles = cache.get(colors);
    if (!styles) {
      styles = StyleSheet.create(factory(colors));
      cache.set(colors, styles);
    }
    return styles;
  };
}
