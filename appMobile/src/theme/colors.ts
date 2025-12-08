/**
 * Vitrina Brand Colors
 * Based on Brandbook - Manual de Identidad Visual
 * Paleta de colores para transmitir confianza, innovación y dinamismo
 * Inspirado en diseño limpio, luminoso y comercial
 */

export const colors = {
  // ============================================
  // COLORES PRINCIPALES
  // ============================================

  // Primary - Azul oscuro de marca (Vitrina)
  primary: '#0A2A43',
  primaryLight: '#0D3354',
  primaryDark: '#071D2F',

  // Secondary - Verde (Productos/Servicios)
  secondary: '#2E9D66',
  secondaryLight: '#3DB378',
  secondaryDark: '#258652',

  // Tertiary - Azul brillante (Interactivo)
  tertiary: '#007ACC',
  tertiaryLight: '#1A8FDB',
  tertiaryDark: '#0066B3',

  // Quaternary - Naranja (CTAs destacados)
  quaternary: '#F26B1D',
  quaternaryLight: '#F4843D',
  quaternaryDark: '#D85F19',

  // ============================================
  // COLORES PASTEL PARA ACCESOS RÁPIDOS
  // ============================================

  pastelBlue: '#E3F2FD',      // Fondo Productos
  pastelGreen: '#ECFDF5',     // Fondo Servicios
  pastelCyan: '#E0F7FA',      // Fondo Pedidos
  pastelOrange: '#FFF3E0',    // Fondo Promociones

  // ============================================
  // COLORES NEUTRALES
  // ============================================

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Background
  background: '#F8F9FA',       // Gris muy claro
  backgroundLight: '#FFFFFF',
  backgroundDark: '#F3F4F6',
  backgroundSecondary: '#FFFFFF',
  backgroundTertiary: '#F9F9F9',

  // Grays
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',

  // ============================================
  // COLORES DE ESTADO
  // ============================================

  success: '#2E9D66',          // Verde
  successLight: '#3DB378',
  successDark: '#258652',
  green50: '#ECFDF5',

  warning: '#F26B1D',          // Naranja
  warningLight: '#F4843D',
  warningDark: '#D85F19',

  error: '#F44336',            // Rojo
  errorLight: '#E57373',
  errorDark: '#D32F2F',

  info: '#007ACC',             // Azul
  infoLight: '#1A8FDB',
  infoDark: '#0066B3',

  // ============================================
  // TEXT COLORS
  // ============================================

  textPrimary: '#212121',      // gray-900
  textSecondary: '#757575',    // gray-600
  textLight: '#9E9E9E',        // gray-500
  textWhite: '#FFFFFF',
  text: '#333333',
  textTertiary: '#8E8E93',
  textQuaternary: '#C7C7CC',

  // ============================================
  // BORDER COLORS
  // ============================================

  border: '#EEEEEE',           // gray-200
  borderLight: '#F5F5F5',      // gray-100
  borderDark: '#E0E0E0',       // gray-300

  // ============================================
  // OVERLAYS Y SOMBRAS
  // ============================================

  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowMedium: 'rgba(0, 0, 0, 0.12)',
  shadowStrong: 'rgba(0, 0, 0, 0.16)',
  shadowColor: '#0A2A43',
  overlay: 'rgba(10, 42, 67, 0.5)',
  overlayLight: 'rgba(10, 42, 67, 0.3)',

  // White overlays para glassmorphism
  whiteOverlay80: 'rgba(255, 255, 255, 0.8)',
  whiteOverlay90: 'rgba(255, 255, 255, 0.9)',

  // Card
  card: '#FFFFFF',
  cardBorder: 'rgba(10, 42, 67, 0.04)',

  // ============================================
  // GRADIENTS (para uso con linear-gradient)
  // ============================================

  gradientBlueGreen: ['#E3F2FD', '#ECFDF5'],
  gradientCyanOrange: ['#E0F7FA', '#FFF3E0'],

  // Accent colors (alias para compatibilidad)
  accent: '#007ACC',
  accentLight: '#1A8FDB',
  accentDark: '#0066B3',
  orange: '#F26B1D',
  orangeLight: '#F4843D',
  orangeDark: '#D85F19',
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
