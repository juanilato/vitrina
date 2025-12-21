/**
 * Tamaños y Espaciados - Vitrina Design System
 * Sistema de diseño consistente para toda la aplicación
 */

import { colors } from './colors';

export const SIZES = {
  // ============================================
  // SPACING
  // ============================================
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,

  // Screen Padding
  screenPadding: 20,
  screenPaddingSm: 16,

  // ============================================
  // BORDER RADIUS - Modernos y amigables
  // ============================================
  radiusXs: 6,            // Elementos muy pequeños
  radiusSm: 10,           // Pequeños elementos (badges, chips)
  radiusMd: 14,           // Cards medianas, buttons
  radiusLg: 18,           // Cards grandes
  radiusXl: 24,           // Cards destacadas, modales
  radius2xl: 28,          // Elementos principales
  radius3xl: 32,          // Super redondeado
  radiusFull: 9999,       // Círculos perfectos
  radiusButton: 14,       // Botones
  radiusInput: 12,        // Inputs
  radiusPill: 24,         // Pills/badges grandes

  // ============================================
  // FONT SIZES
  // ============================================
  fontXs: 11,             // Labels muy pequeños
  fontSm: 13,             // Labels secundarios
  fontBase: 15,           // Texto base
  fontMd: 16,             // Texto principal
  fontLg: 18,             // Subtítulos
  fontXl: 20,             // Títulos de sección
  font2xl: 24,            // Títulos principales
  font3xl: 28,            // Headers destacados
  font4xl: 32,            // Números grandes

  // ============================================
  // LINE HEIGHTS
  // ============================================
  lineHeightTight: 1.2,   // Títulos
  lineHeightNormal: 1.5,  // Texto base
  lineHeightRelaxed: 1.75, // Textos largos

  // ============================================
  // FONT WEIGHTS
  // ============================================
  fontWeightRegular: '400' as const,
  fontWeightMedium: '500' as const,
  fontWeightSemibold: '600' as const,
  fontWeightBold: '700' as const,
  fontWeightExtrabold: '800' as const,
  fontWeightBlack: '900' as const,

  // ============================================
  // ICON SIZES
  // ============================================
  iconXs: 12,
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,
  icon2xl: 48,

  // ============================================
  // BUTTON HEIGHTS
  // ============================================
  buttonHeightSm: 36,
  buttonHeightMd: 44,
  buttonHeightLg: 52,

  // ============================================
  // INPUT HEIGHTS
  // ============================================
  inputHeight: 44,
  inputHeightSm: 36,
  inputHeightLg: 52,
  searchBarHeight: 52,

  // ============================================
  // COMPONENT SPECIFIC SIZES
  // ============================================

  // Header
  headerHeight: 140,

  // Avatar
  avatarXs: 32,
  avatarSm: 44,
  avatarMd: 56,
  avatarLg: 80,
  avatarXl: 100,

  // Quick Actions
  quickActionIcon: 68,
  quickActionIconEmoji: 32,

  // Cards
  cardImageHeight: 140,
  productCardWidth: 140,
  serviceCardWidth: 260,
  itemCardWidth: 100,

  // Bottom Navigation
  bottomNavHeight: 68,
  bottomNavIconSize: 24,

  // Notification Badge
  badgeSize: 16,
  badgeLarge: 20,

} as const;

// ============================================
// SHADOWS - Sistema profesional y sutil
// ============================================
export const SHADOWS = {
  // Shadow XS - Elementos muy sutiles (badges, chips)
  xs: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Shadow Small - Elementos sutiles (buttons pequeños)
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },

  // Shadow Medium - Cards y botones principales
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },

  // Shadow Large - Cards destacadas y modales
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },

  // Shadow Extra Large - Headers, navigation, overlays
  xl: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    elevation: 12,
  },

  // Shadow 2XL - Elementos flotantes principales
  '2xl': {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 36,
    elevation: 16,
  },

  // Shadow None - Sin sombra
  none: {
    shadowColor: colors.transparent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  // Sombras colored para elementos interactivos
  primary: {
    shadowColor: '#1E88E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },

  success: {
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },

  error: {
    shadowColor: '#EF5350',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
} as const;

// Legacy exports for compatibility
export const spacing = {
  xs: SIZES.xs,
  sm: SIZES.sm,
  md: SIZES.base,
  lg: SIZES.xl,
  xl: SIZES['2xl'],
  '2xl': SIZES['3xl'],
  '3xl': SIZES['4xl'],
  '4xl': SIZES['4xl'],
};

export const borderRadius = {
  none: 0,
  sm: SIZES.radiusSm,
  md: SIZES.radiusMd,
  lg: SIZES.radiusLg,
  xl: SIZES.radiusXl,
  '2xl': SIZES.radiusXl,
  '3xl': SIZES.radiusXl,
  full: SIZES.radiusFull,
};

export const shadows = SHADOWS;

export default SIZES;
