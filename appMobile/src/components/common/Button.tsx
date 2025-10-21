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
} from 'react-native';
import { colors, fontSizes, fontWeights, borderRadius, spacing } from '../../theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  ...props
}) => {
  const isDisabled = disabled || loading;

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
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white}
        />
      ) : (
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
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
  },

  // Variants
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.accent,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },

  // Sizes
  sm: {
    height: 36,
    paddingHorizontal: spacing.md,
  },
  md: {
    height: 48,
    paddingHorizontal: spacing.lg,
  },
  lg: {
    height: 56,
    paddingHorizontal: spacing.xl,
  },

  // Text styles
  text: {
    fontWeight: fontWeights.semibold,
  },
  primaryText: {
    color: colors.white,
    fontSize: fontSizes.base,
  },
  secondaryText: {
    color: colors.white,
    fontSize: fontSizes.base,
  },
  outlineText: {
    color: colors.primary,
    fontSize: fontSizes.base,
  },
  ghostText: {
    color: colors.primary,
    fontSize: fontSizes.base,
  },

  // Size text
  smText: {
    fontSize: fontSizes.sm,
  },
  mdText: {
    fontSize: fontSizes.base,
  },
  lgText: {
    fontSize: fontSizes.lg,
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
