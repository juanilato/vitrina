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

export const theme = {
  colors,
  fontSizes,
  fontWeights,
  textStyles,
  spacing,
  borderRadius,
  shadows,
} as const;

export type Theme = typeof theme;
