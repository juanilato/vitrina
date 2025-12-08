/**
 * Theme System - Vitrina Design System
 * Export all theme tokens
 */

export * from './colors';
export * from './typography';
export * from './spacing';

import { colors } from './colors';
import { fontSizes, fontWeights, textStyles } from './typography';
import { spacing, borderRadius, shadows, SIZES, SHADOWS } from './spacing';

// Export constants for easier use (compatible with peluqueriamascotas style)
export const COLORS = colors;

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
  COLORS: colors,
  SIZES,
  SHADOWS,
} as const;

export type Theme = typeof theme;
