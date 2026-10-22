import { createContext, useContext } from 'react';
import { colors } from './colors';
export const ThemeContext = createContext(colors);
export const ThemeProvider = ThemeContext.Provider;
export const useAppTheme = () => useContext(ThemeContext);
