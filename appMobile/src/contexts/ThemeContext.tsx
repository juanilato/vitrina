/**
 * Theme Context
 * Provides dynamic theming based on user preferences
 */

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { colors as lightColors, darkColors } from '../theme/colors';
import { usePreferences } from './PreferencesContext';

type ColorScheme = typeof lightColors;

interface ThemeContextType {
  colors: ColorScheme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { theme } = usePreferences();
  const isDark = theme === 'dark';

  const themeColors = useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);

  const value = useMemo(
    () => ({
      colors: themeColors,
      isDark,
    }),
    [themeColors, isDark],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};
