/**
 * Button Component - iOS Modern Design
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../theme';
import { normalize } from '../../utils/responsive';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const iconColor = variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.white}
        />
      ) : (
        <View style={styles.content}>
          {icon && (
            <Ionicons
              name={icon}
              size={size === 'sm' ? SIZES.iconSm : size === 'lg' ? SIZES.iconLg : SIZES.iconMd}
              color={iconColor}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              styles.text,
              styles[`${variant}Text`],
              styles[`${size}Text`],
              isDisabled && styles.disabledText,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radiusButton,
    ...SHADOWS.md,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },

  icon: {
    marginRight: SIZES.xs,
  },

  // Variants (Vitrina: naranja para CTAs, verde para secundario)
  primary: {
    backgroundColor: COLORS.quaternary,  // Naranja - CTAs principales
  },
  secondary: {
    backgroundColor: COLORS.secondary,  // Verde - Acciones secundarias
  },
  outline: {
    backgroundColor: COLORS.transparent,
    borderWidth: 1.5,
    borderColor: COLORS.primary,  // Azul oscuro para borde
  },
  ghost: {
    backgroundColor: COLORS.transparent,
  },

  // Sizes
  sm: {
    height: SIZES.buttonHeightSm,
    paddingHorizontal: SIZES.base,
  },
  md: {
    height: SIZES.buttonHeightMd,
    paddingHorizontal: SIZES.lg,
  },
  lg: {
    height: SIZES.buttonHeightLg,
    paddingHorizontal: SIZES.xl,
  },

  // Text styles
  text: {
    fontWeight: SIZES.fontWeightSemibold,
  },
  primaryText: {
    color: COLORS.white,
    fontSize: SIZES.fontBase,
  },
  secondaryText: {
    color: COLORS.white,
    fontSize: SIZES.fontBase,
  },
  outlineText: {
    color: COLORS.primary,
    fontSize: SIZES.fontBase,
  },
  ghostText: {
    color: COLORS.primary,
    fontSize: SIZES.fontBase,
  },

  // Size text
  smText: {
    fontSize: SIZES.fontSm,
  },
  mdText: {
    fontSize: SIZES.fontBase,
  },
  lgText: {
    fontSize: SIZES.fontLg,
  },

  // States
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },

  // Layout
  fullWidth: {
    width: '100%',
  },
});
