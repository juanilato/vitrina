/**
 * iOS Typography System
 * Based on SF Pro / System fonts
 */

import { Platform } from 'react-native';

export const fontFamilies = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  semibold: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 36,
};

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const lineHeights = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 28,
  xl: 32,
  '2xl': 36,
  '3xl': 40,
  '4xl': 44,
  '5xl': 48,
};

/**
 * iOS Text Styles
 */
export const textStyles = {
  // Large Titles
  largeTitle: {
    fontSize: fontSizes['4xl'],
    lineHeight: lineHeights['4xl'],
    fontWeight: fontWeights.bold,
    letterSpacing: -0.5,
  },

  // Titles
  title1: {
    fontSize: fontSizes['3xl'],
    lineHeight: lineHeights['3xl'],
    fontWeight: fontWeights.bold,
    letterSpacing: -0.4,
  },
  title2: {
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeights['2xl'],
    fontWeight: fontWeights.bold,
    letterSpacing: -0.3,
  },
  title3: {
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.xl,
    fontWeight: fontWeights.semibold,
    letterSpacing: -0.2,
  },

  // Headline
  headline: {
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    fontWeight: fontWeights.semibold,
    letterSpacing: -0.1,
  },

  // Body
  body: {
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    fontWeight: fontWeights.regular,
  },
  bodyBold: {
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    fontWeight: fontWeights.semibold,
  },

  // Callout
  callout: {
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    fontWeight: fontWeights.regular,
  },

  // Subheadline
  subheadline: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    fontWeight: fontWeights.regular,
  },

  // Footnote
  footnote: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: fontWeights.regular,
  },

  // Caption
  caption1: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: fontWeights.regular,
  },
  caption2: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: fontWeights.regular,
  },
};
