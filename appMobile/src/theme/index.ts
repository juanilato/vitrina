/**
 * Theme System
 * Export all theme tokens
 */

export * from './colors';
export * from './typography';
export * from './spacing';

import { colors } from './colors';
import { fontSizes, fontWeights, textStyles } from './typography';
import { spacing, borderRadius, shadows } from './spacing';

// Export typography as a named export for direct use
export const typography = textStyles;

export const theme = {
  colors,
  fontSizes,
  fontWeights,
  textStyles,
  typography: textStyles,
  spacing,
  borderRadius,
  shadows,
} as const;

export type Theme = typeof theme;
