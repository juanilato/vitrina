/**
 * Login Screen
 * iOS Modern Design
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button, Input } from '../../src/components/common';
import { Logo } from '../../src/components/common/Logo';
import { colors, spacing, textStyles } from '../../src/theme';
import { useGoogleSignIn } from '../../src/hooks/useGoogleSignIn';

export default function LoginScreen() {
  const { login } = useAuth();
  const { signInWithGoogle, loading: googleLoading, disabled: googleDisabled } = useGoogleSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login({ email, password });
      // Navigation is handled by AuthContext
    } catch (error: any) {
      console.error('Login error:', error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Error al iniciar sesión. Verifica tus credenciales.';

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Logo variant="full" size={180} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Bienvenido</Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="tu@email.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <Input
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              error={errors.password}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Button
              title="Iniciar Sesión"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              fullWidth
              size="lg"
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o continúa con</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In */}
            <Button
              title="Continuar con Google"
              variant="outline"
              onPress={async () => {
                try {
                  await signInWithGoogle();
                } catch (error) {
                  Alert.alert('Error', 'No se pudo iniciar sesión con Google');
                }
              }}
              disabled={loading || googleDisabled}
              loading={googleLoading}
              fullWidth
            />
          </View>

          {/* Sign Up Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes cuenta? </Text>
            <Link href="/auth/register" asChild>
              <TouchableOpacity disabled={loading}>
                <Text style={styles.footerLink}>Regístrate</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  header: {
    marginBottom: spacing['2xl'],
  },

  title: {
    ...textStyles.largeTitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  subtitle: {
    ...textStyles.body,
    color: colors.textSecondary,
  },

  form: {
    marginBottom: spacing.xl,
  },

  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
    marginTop: -spacing.sm,
  },

  forgotPasswordText: {
    ...textStyles.subheadline,
    color: colors.primary,
    fontWeight: '600',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },

  dividerText: {
    ...textStyles.subheadline,
    color: colors.textTertiary,
    marginHorizontal: spacing.md,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: spacing.xl,
  },

  footerText: {
    ...textStyles.body,
    color: colors.textSecondary,
  },

  footerLink: {
    ...textStyles.body,
    color: colors.primary,
    fontWeight: '600',
  },
});
