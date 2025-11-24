/**
 * Vitrina Brand Colors
 * Based on Brandbook - Manual de Identidad Visual
 * Paleta de colores para transmitir confianza, innovación y dinamismo
 */

export const colors = {
  // Brand colors (from Vitrina Brandbook)
  primary: '#0A2A43',      // Azul oscuro - Color principal de marca
  primaryLight: '#0D3354',
  primaryDark: '#071D2F',

  secondary: '#2E9D66',    // Verde - Color secundario
  secondaryLight: '#3DB378',
  secondaryDark: '#258652',

  accent: '#007ACC',       // Azul brillante - Elementos interactivos
  accentLight: '#1A8FDB',
  accentDark: '#0066B3',

  orange: '#F26B1D',       // Naranja - CTAs y elementos destacados
  orangeLight: '#F4843D',
  orangeDark: '#D85F19',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  background: '#F9F9F9',   // Blanco del brandbook

  // Grays
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#E5E5E5',
  gray300: '#D4D4D4',
  gray400: '#A3A3A3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#333333',      // Gris oscuro para texto (del brandbook)
  gray900: '#171717',

  // Semantic colors (using brand colors)
  success: '#2E9D66',      // Verde
  green50: '#ECFDF5',      // Verde claro para fondos
  error: '#DC2626',        // Red
  warning: '#F26B1D',      // Naranja
  info: '#007ACC',         // Azul brillante

  // Backgrounds
  backgroundSecondary: '#FFFFFF',
  backgroundTertiary: '#F9F9F9',

  // Text (según brandbook: textos en gris oscuro #333)
  text: '#333333',
  textSecondary: '#525252',
  textTertiary: '#8E8E93',
  textQuaternary: '#C7C7CC',

  // Borders
  border: '#E5E5EA',
  borderLight: '#F2F2F7',

  // Overlay
  overlay: 'rgba(10, 42, 67, 0.5)',     // Using primary color
  overlayLight: 'rgba(10, 42, 67, 0.1)',

  // Card
  card: '#FFFFFF',
  cardBorder: 'rgba(10, 42, 67, 0.04)',

  // Shadow
  shadowColor: '#0A2A43',  // Primary color for shadows
} as const;

// Dark theme colors (iOS style - grises suaves)
export const darkColors = {
  // Brand colors (iOS system colors adaptados)
  primary: '#0A84FF',      // iOS systemBlue
  primaryLight: '#409CFF',
  primaryDark: '#0066CC',

  secondary: '#30D158',    // iOS systemGreen
  secondaryLight: '#5ADA7A',
  secondaryDark: '#28B84C',

  accent: '#0A84FF',       // iOS systemBlue
  accentLight: '#409CFF',
  accentDark: '#0066CC',

  orange: '#FF9F0A',       // iOS systemOrange
  orangeLight: '#FFB340',
  orangeDark: '#E08C00',

  // Neutrals (iOS dark)
  white: '#FFFFFF',
  black: '#000000',
  background: '#000000',   // iOS pure black background

  // Grays (iOS systemGray scale)
  gray50: '#1C1C1E',       // iOS elevated background
  gray100: '#2C2C2E',      // iOS secondary background
  gray200: '#3A3A3C',      // iOS tertiary background
  gray300: '#48484A',      // iOS separator
  gray400: '#636366',      // iOS systemGray2
  gray500: '#8E8E93',      // iOS systemGray
  gray600: '#AEAEB2',      // iOS systemGray3
  gray700: '#C7C7CC',      // iOS systemGray4
  gray800: '#D1D1D6',      // iOS systemGray5
  gray900: '#E5E5EA',      // iOS systemGray6

  // Semantic colors (iOS system colors)
  success: '#30D158',      // iOS systemGreen
  green50: '#0D2818',      // Verde fondo sutil
  error: '#FF453A',        // iOS systemRed
  warning: '#FF9F0A',      // iOS systemOrange
  info: '#0A84FF',         // iOS systemBlue

  // Backgrounds (iOS dark mode)
  backgroundSecondary: '#1C1C1E',  // iOS elevated
  backgroundTertiary: '#2C2C2E',   // iOS secondary

  // Text (iOS dark mode)
  text: '#FFFFFF',
  textSecondary: '#EBEBF5', // iOS secondaryLabel (60% opacity)
  textTertiary: '#EBEBF599', // iOS tertiaryLabel (40% opacity)
  textQuaternary: '#EBEBF54D', // iOS quaternaryLabel (30% opacity)

  // Borders (iOS separators)
  border: '#38383A',       // iOS separator opaque
  borderLight: '#2C2C2E',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.25)',

  // Card (iOS grouped background)
  card: '#1C1C1E',
  cardBorder: 'rgba(255, 255, 255, 0.1)',

  // Shadow
  shadowColor: '#000000',
} as const;

export type ColorName = keyof typeof colors;
