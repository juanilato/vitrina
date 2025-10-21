/**
 * Orders Screen - My Orders
 * Placeholder for FASE 4
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, textStyles, spacing } from '../../src/theme';

export default function OrdersScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Mis Pedidos</Text>
        <Text style={styles.subtitle}>Próximamente - FASE 4</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...textStyles.largeTitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
});
