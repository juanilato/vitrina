/**
 * SearchBar Component
 * iOS Modern Design
 */

import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSizes, fontWeights } from '../../theme';

interface SearchBarProps extends TextInputProps {
  onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Buscar...',
  ...props
}) => {
  return (
    <View style={styles.container}>
      <Ionicons
        name="search"
        size={20}
        color={colors.textTertiary}
        style={styles.searchIcon}
      />

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        returnKeyType="search"
        {...props}
      />

      {value && value.length > 0 && (
        <TouchableOpacity
          onPress={onClear}
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 44,
  },

  searchIcon: {
    marginRight: spacing.sm,
  },

  input: {
    flex: 1,
    fontSize: fontSizes.base,
    color: colors.text,
    fontWeight: fontWeights.regular,
  },

  clearButton: {
    marginLeft: spacing.xs,
  },
});
