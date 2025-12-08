/**
 * SearchBar Component
 * Modern Design - Vitrina Style
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
import { COLORS, SIZES, SHADOWS } from '../../theme';

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
        size={SIZES.iconMd}
        color={COLORS.textSecondary}
        style={styles.searchIcon}
      />

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textTertiary}
        returnKeyType="search"
        {...props}
      />

      {value && value.length > 0 && (
        <TouchableOpacity
          onPress={onClear}
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={SIZES.iconMd} color={COLORS.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.base,
    height: SIZES.searchBarHeight,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },

  searchIcon: {
    marginRight: SIZES.md,
  },

  input: {
    flex: 1,
    fontSize: SIZES.fontBase,
    color: COLORS.textPrimary,
    fontWeight: SIZES.fontWeightRegular,
    padding: 0,
  },

  clearButton: {
    marginLeft: SIZES.sm,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
