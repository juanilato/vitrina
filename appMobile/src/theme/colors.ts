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

// Dark theme colors
export const darkColors = {
  // Brand colors (ajustados para modo oscuro)
  primary: '#4A9EE0',      // Azul más suave y legible
  primaryLight: '#6BB3E8',
  primaryDark: '#3A8FD1',

  secondary: '#4CAF82',    // Verde más suave
  secondaryLight: '#6BC599',
  secondaryDark: '#3C9A6E',

  accent: '#5BB3E8',       // Azul brillante pero no tan intenso
  accentLight: '#7BC8ED',
  accentDark: '#4A9EE0',

  orange: '#F5925A',       // Naranja más suave
  orangeLight: '#F7A675',
  orangeDark: '#E67E45',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  background: '#121212',   // Negro suave (Material Design dark)

  // Grays (optimizados para modo oscuro)
  gray50: '#1E1E1E',       // Fondos de cards
  gray100: '#2A2A2A',      // Fondos secundarios
  gray200: '#3A3A3A',      // Bordes suaves
  gray300: '#4A4A4A',      // Bordes normales
  gray400: '#999999',      // Texto deshabilitado
  gray500: '#B3B3B3',      // Texto terciario
  gray600: '#CCCCCC',      // Texto secundario
  gray700: '#E0E0E0',      // Texto normal
  gray800: '#F0F0F0',      // Texto enfatizado
  gray900: '#FAFAFA',      // Texto muy enfatizado

  // Semantic colors
  success: '#4CAF82',
  green50: '#1A3329',
  error: '#F48FB1',
  warning: '#F5925A',
  info: '#5BB3E8',

  // Backgrounds
  backgroundSecondary: '#1E1E1E',
  backgroundTertiary: '#2A2A2A',

  // Text
  text: '#E0E0E0',
  textSecondary: '#B3B3B3',
  textTertiary: '#999999',
  textQuaternary: '#737373',

  // Borders
  border: '#3A3A3A',
  borderLight: '#2A2A2A',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',

  // Card
  card: '#1E1E1E',
  cardBorder: 'rgba(255, 255, 255, 0.08)',

  // Shadow
  shadowColor: '#000000',
} as const;

export type ColorName = keyof typeof colors;
