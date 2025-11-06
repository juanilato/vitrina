/**
 * Input Component - iOS Modern Design
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { colors, fontSizes, fontWeights, borderRadius, spacing } from '../../theme';
import { normalize } from '../../utils/responsive';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  helperText,
  style,
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  const hasError = !!error;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          hasError && styles.inputContainerError,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, leftIcon && styles.inputWithLeftIcon, style]}
          placeholderTextColor={colors.textTertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isSecure}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={() => setIsSecure(!isSecure)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.showHideText}>{isSecure ? 'Mostrar' : 'Ocultar'}</Text>
          </TouchableOpacity>
        )}

        {!secureTextEntry && rightIcon && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {!error && helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },

  label: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: normalize(52),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },

  inputContainerError: {
    borderColor: colors.error,
  },

  input: {
    flex: 1,
    fontSize: fontSizes.base,
    color: colors.text,
    fontWeight: fontWeights.regular,
  },

  inputWithLeftIcon: {
    marginLeft: spacing.sm,
  },

  leftIcon: {
    marginRight: spacing.xs,
  },

  rightIcon: {
    marginLeft: spacing.xs,
  },

  showHideText: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },

  errorText: {
    fontSize: fontSizes.xs,
    color: colors.error,
    marginTop: spacing.xs,
    fontWeight: fontWeights.regular,
  },

  helperText: {
    fontSize: fontSizes.xs,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    fontWeight: fontWeights.regular,
  },
});
