/**
 * Register Screen
 * iOS Modern Design - Cliente only
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
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button, Input } from '../../src/components/common';
import { colors, spacing, textStyles } from '../../src/theme';
import { useGoogleSignIn } from '../../src/hooks/useGoogleSignIn';

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const { signInWithGoogle, loading: googleLoading, disabled: googleDisabled } = useGoogleSignIn();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!name) {
      newErrors.name = 'El nombre es requerido';
    } else if (name.length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
      });
      // Navigation is handled by AuthContext
    } catch (error: any) {
      console.error('Register error:', error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Error al crear la cuenta. Intenta nuevamente.';

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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Regístrate como cliente</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Nombre completo"
              placeholder="Juan Pérez"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              error={errors.name}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!loading}
            />

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
              placeholder="Mínimo 6 caracteres"
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

            <Input
              label="Confirmar contraseña"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
              }}
              error={errors.confirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            {/* Terms */}
            <Text style={styles.termsText}>
              Al registrarte, aceptas nuestros{' '}
              <Text style={styles.termsLink}>Términos de Servicio</Text> y{' '}
              <Text style={styles.termsLink}>Política de Privacidad</Text>
            </Text>

            {/* Register Button */}
            <Button
              title="Crear Cuenta"
              onPress={handleRegister}
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
                  Alert.alert('Error', 'No se pudo registrar con Google');
                }
              }}
              disabled={loading || googleDisabled}
              loading={googleLoading}
              fullWidth
            />
          </View>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <Link href="/auth/login" asChild>
              <TouchableOpacity disabled={loading}>
                <Text style={styles.footerLink}>Inicia Sesión</Text>
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
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.xl,
  },

  header: {
    marginBottom: spacing['3xl'],
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
    marginBottom: spacing.lg,
  },

  termsText: {
    ...textStyles.footnote,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 18,
  },

  termsLink: {
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
    paddingTop: spacing.lg,
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
