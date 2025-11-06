/**
 * Spacing System
 * 8px grid system with responsive scaling
 */

import { responsiveSpacing } from '../utils/responsive';

export const spacing = {
  xs: responsiveSpacing(4),
  sm: responsiveSpacing(8),
  md: responsiveSpacing(16),
  lg: responsiveSpacing(24),
  xl: responsiveSpacing(32),
  '2xl': responsiveSpacing(40),
  '3xl': responsiveSpacing(48),
  '4xl': responsiveSpacing(64),
};

export const borderRadius = {
  none: 0,
  sm: responsiveSpacing(4),
  md: responsiveSpacing(8),
  lg: responsiveSpacing(12),
  xl: responsiveSpacing(16),
  '2xl': responsiveSpacing(20),
  '3xl': responsiveSpacing(24),
  full: 9999,
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};
