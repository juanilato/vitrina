/**
 * Vitrina Typography System
 * Based on Brandbook - Tipografías sans-serif geométricas y modernas
 * Títulos: Montserrat Bold/SemiBold
 * Textos: Poppins Regular / Roboto Regular
 */

import { Platform } from 'react-native';

export const fontFamilies = {
  // For headings and brand elements (Montserrat-like on mobile)
  heading: Platform.select({
    ios: 'System',  // iOS System font is clean and geometric
    android: 'Roboto',  // Roboto is geometric and similar to Poppins
    default: 'System',
  }),
  // For body text (Poppins/Roboto-like)
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

import { responsiveFontSize } from '../utils/responsive';

export const fontSizes = {
  xs: responsiveFontSize(12),
  sm: responsiveFontSize(14),
  base: responsiveFontSize(16),
  lg: responsiveFontSize(18),
  xl: responsiveFontSize(20),
  '2xl': responsiveFontSize(24),
  '3xl': responsiveFontSize(28),
  '4xl': responsiveFontSize(32),
  '5xl': responsiveFontSize(36),
};

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const lineHeights = {
  xs: responsiveFontSize(16),
  sm: responsiveFontSize(20),
  base: responsiveFontSize(24),
  lg: responsiveFontSize(28),
  xl: responsiveFontSize(32),
  '2xl': responsiveFontSize(36),
  '3xl': responsiveFontSize(40),
  '4xl': responsiveFontSize(44),
  '5xl': responsiveFontSize(48),
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
  bodyLarge: {
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    fontWeight: fontWeights.regular,
  },
  bodyMedium: {
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    fontWeight: fontWeights.regular,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    fontWeight: fontWeights.regular,
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
  caption: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: fontWeights.regular,
  },
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

  // Heading shortcuts
  h1: {
    fontSize: fontSizes['4xl'],
    lineHeight: lineHeights['4xl'],
    fontWeight: fontWeights.bold,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: fontSizes['3xl'],
    lineHeight: lineHeights['3xl'],
    fontWeight: fontWeights.bold,
    letterSpacing: -0.4,
  },
  h3: {
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeights['2xl'],
    fontWeight: fontWeights.bold,
    letterSpacing: -0.3,
  },
};
