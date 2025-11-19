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
import { colors, fontSizes, fontWeights, borderRadius, spacing } from '../../theme';
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

  const iconColor = variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white;

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
        <View style={styles.content}>
          {icon && (
            <Ionicons
              name={icon}
              size={size === 'sm' ? 18 : size === 'lg' ? 24 : 20}
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
    borderRadius: borderRadius.lg,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  icon: {
    marginRight: 4,
  },

  // Variants (Brandbook: naranja para CTAs, verde para secundario)
  primary: {
    backgroundColor: colors.orange,  // Naranja - CTAs principales
  },
  secondary: {
    backgroundColor: colors.secondary,  // Verde - Acciones secundarias
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,  // Azul oscuro para borde
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
    height: 44,
    paddingHorizontal: spacing.lg,
  },
  lg: {
    height: 50,
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
    fontSize: normalize(15),
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
