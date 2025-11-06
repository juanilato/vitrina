/**
 * Responsive Utilities for Web and Mobile
 * Ensures proper scaling across all platforms
 */

import { Platform, Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Detect if we're running on web
 */
export const isWeb = Platform.OS === 'web';

/**
 * Get device type based on screen width
 */
export const getDeviceType = () => {
  if (!isWeb) return 'mobile';

  if (SCREEN_WIDTH >= 1024) return 'desktop';
  if (SCREEN_WIDTH >= 768) return 'tablet';
  return 'mobile';
};

/**
 * Normalize size for responsive design
 * On mobile native: uses scale based on device width
 * On web: uses larger base scale to make everything more visible
 */
export const normalize = (size: number): number => {
  if (isWeb) {
    const deviceType = getDeviceType();

    // On desktop/tablet web, scale up significantly
    if (deviceType === 'desktop') {
      return size * 1.4; // 40% larger on desktop
    }
    if (deviceType === 'tablet') {
      return size * 1.2; // 20% larger on tablet
    }

    // On mobile web, scale up slightly
    return size * 1.15; // 15% larger on mobile web
  }

  // On native mobile, use standard scaling
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * scale;

  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }

  return Math.round(newSize);
};

/**
 * Responsive font size
 */
export const responsiveFontSize = (size: number): number => {
  return normalize(size);
};

/**
 * Responsive spacing
 */
export const responsiveSpacing = (size: number): number => {
  return normalize(size);
};

/**
 * Responsive width percentage
 */
export const wp = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

/**
 * Responsive height percentage
 */
export const hp = (percentage: number): number => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

/**
 * Get responsive dimensions for common use cases
 */
export const responsive = {
  // Font sizes
  fontSize: {
    xs: responsiveFontSize(12),
    sm: responsiveFontSize(14),
    base: responsiveFontSize(16),
    lg: responsiveFontSize(18),
    xl: responsiveFontSize(20),
    '2xl': responsiveFontSize(24),
    '3xl': responsiveFontSize(28),
    '4xl': responsiveFontSize(32),
    '5xl': responsiveFontSize(36),
  },

  // Spacing
  spacing: {
    xs: responsiveSpacing(4),
    sm: responsiveSpacing(8),
    md: responsiveSpacing(16),
    lg: responsiveSpacing(24),
    xl: responsiveSpacing(32),
    '2xl': responsiveSpacing(40),
    '3xl': responsiveSpacing(48),
    '4xl': responsiveSpacing(64),
  },

  // Border radius
  borderRadius: {
    none: 0,
    sm: responsiveSpacing(4),
    md: responsiveSpacing(8),
    lg: responsiveSpacing(12),
    xl: responsiveSpacing(16),
    '2xl': responsiveSpacing(20),
    '3xl': responsiveSpacing(24),
    full: 9999,
  },

  // Common dimensions
  button: {
    sm: responsiveSpacing(36),
    md: responsiveSpacing(48),
    lg: responsiveSpacing(56),
  },

  icon: {
    xs: responsiveSpacing(16),
    sm: responsiveSpacing(20),
    md: responsiveSpacing(24),
    lg: responsiveSpacing(28),
    xl: responsiveSpacing(32),
  },
};

/**
 * Check if device is small (width < 350)
 */
export const isSmallDevice = SCREEN_WIDTH < 350;

/**
 * Check if device is large (width > 768)
 */
export const isLargeDevice = SCREEN_WIDTH > 768;

/**
 * Get screen dimensions
 */
export const screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
};
