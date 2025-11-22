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

// Dark theme colors (elegante y suave)
export const darkColors = {
  // Brand colors (tonos elegantes sobre fondo oscuro)
  primary: '#5C9CE6',      // Azul suave elegante
  primaryLight: '#7BB3ED',
  primaryDark: '#4A87D1',

  secondary: '#5DBF8A',    // Verde menta suave
  secondaryLight: '#7DCDA1',
  secondaryDark: '#4AAF77',

  accent: '#6AADEB',       // Azul cielo suave
  accentLight: '#8AC1F0',
  accentDark: '#5599D9',

  orange: '#E8915C',       // Naranja cálido suave
  orangeLight: '#EDA87A',
  orangeDark: '#D47D48',

  // Neutrals
  white: '#FFFFFF',
  black: '#1A1A1A',        // Negro suave
  background: '#1A1A1A',   // Fondo principal suave

  // Grays (escala suave y elegante)
  gray50: '#242424',       // Fondos de cards
  gray100: '#2E2E2E',      // Fondos secundarios
  gray200: '#3A3A3A',      // Bordes suaves
  gray300: '#484848',      // Bordes normales
  gray400: '#6E6E6E',      // Texto deshabilitado
  gray500: '#8E8E8E',      // Texto terciario
  gray600: '#ABABAB',      // Texto secundario
  gray700: '#C8C8C8',      // Texto normal
  gray800: '#E2E2E2',      // Texto enfatizado
  gray900: '#F5F5F5',      // Texto muy enfatizado

  // Semantic colors
  success: '#5DBF8A',
  green50: '#1F2E26',      // Verde fondo oscuro suave
  error: '#E86B6B',        // Rojo suave
  warning: '#E8915C',
  info: '#6AADEB',

  // Backgrounds (escala suave)
  backgroundSecondary: '#242424',  // Fondo elevado
  backgroundTertiary: '#2E2E2E',   // Fondo terciario

  // Text
  text: '#F5F5F5',         // Texto principal (no blanco puro)
  textSecondary: '#B8B8B8', // Gris claro
  textTertiary: '#858585',  // Gris medio
  textQuaternary: '#525252', // Gris oscuro

  // Borders
  border: '#2E2E2E',       // Separador sutil
  borderLight: '#242424',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.55)',
  overlayLight: 'rgba(0, 0, 0, 0.25)',

  // Card
  card: '#242424',
  cardBorder: 'rgba(255, 255, 255, 0.06)',

  // Shadow
  shadowColor: '#000000',
} as const;

export type ColorName = keyof typeof colors;
