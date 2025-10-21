/**
 * Profile Screen
 * Placeholder for FASE 5
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, textStyles, spacing } from '../../src/theme';
import { Button } from '../../src/components/common';
import { useAuth } from '../../src/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.subtitle}>Hola, {user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.spacer} />

        <Button title="Cerrar Sesión" variant="outline" onPress={logout} fullWidth />

        <View style={styles.note}>
          <Text style={styles.noteText}>Más funcionalidades - FASE 5</Text>
        </View>
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
    ...textStyles.headline,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  email: {
    ...textStyles.body,
    color: colors.textTertiary,
    marginBottom: spacing.xl,
  },
  spacer: {
    height: spacing['2xl'],
  },
  note: {
    marginTop: spacing.xl,
  },
  noteText: {
    ...textStyles.footnote,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
