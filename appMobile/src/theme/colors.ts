/**
 * iOS Modern Color Palette
 * Diseño minimalista con colores neutros
 */

export const colors = {
  // Neutrals
  white: '#FFFFFF',
  black: '#000000',

  // Grays (iOS system grays)
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#E5E5E5',
  gray300: '#D4D4D4',
  gray400: '#A3A3A3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',

  // Accent color (minimalista)
  primary: '#2C2C2E',      // Dark gray (iOS system)
  primaryLight: '#3A3A3C',
  primaryDark: '#1C1C1E',

  // Subtle accent
  accent: '#5856D6',       // iOS purple
  accentLight: '#7977E0',

  // Semantic colors
  success: '#34C759',      // iOS green
  error: '#FF3B30',        // iOS red
  warning: '#FF9500',      // iOS orange
  info: '#007AFF',         // iOS blue

  // Backgrounds
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',  // iOS grouped background
  backgroundTertiary: '#FFFFFF',

  // Text
  text: '#000000',
  textSecondary: '#3C3C43',        // iOS secondary label
  textTertiary: '#8E8E93',         // iOS tertiary label
  textQuaternary: '#C7C7CC',       // iOS quaternary label

  // Borders
  border: '#E5E5EA',
  borderLight: '#F2F2F7',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',

  // Card
  card: '#FFFFFF',
  cardBorder: 'rgba(0, 0, 0, 0.04)',

  // Shadow
  shadowColor: '#000000',
} as const;

export type ColorName = keyof typeof colors;
