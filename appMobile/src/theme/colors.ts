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

export type ColorName = keyof typeof colors;
