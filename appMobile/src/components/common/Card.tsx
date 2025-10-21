/**
 * Card Component - iOS Modern Design
 */

import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors, borderRadius, spacing, shadows } from '../../theme';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: keyof typeof spacing;
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'md',
  style,
  children,
  ...props
}) => {
  return (
    <View
      style={[
        styles.base,
        styles[variant],
        { padding: spacing[padding] },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
  },

  elevated: {
    ...shadows.md,
  },

  outlined: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },

  flat: {
    backgroundColor: colors.backgroundSecondary,
  },
});
