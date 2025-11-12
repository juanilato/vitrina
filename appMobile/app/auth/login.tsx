/**
 * Login Screen
 * iOS Modern Design - Vitrina Style
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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button, Input } from '../../src/components/common';
import { Logo } from '../../src/components/common/Logo';
import { colors, spacing, textStyles } from '../../src/theme';
import { useGoogleSignIn } from '../../src/hooks/useGoogleSignIn';
import { normalize } from '../../src/utils/responsive';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
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
    <View style={styles.container}>
      <LinearGradient
        colors={['#F9F9F9', '#FFFFFF', '#F5F9FC']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Logo Section */}
              <View style={styles.logoSection}>
                <View style={styles.logoCard}>
                  <View style={styles.logoIconContainer}>
                    <Logo variant="icon" size={normalize(42)} />
                  </View>
                </View>
                <Text style={styles.brandName}>Vitrina</Text>
              </View>

              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>¡Hola de nuevo! 👋</Text>
                <Text style={styles.subtitle}>Inicia sesión y descubre lo mejor cerca de ti</Text>
              </View>

              {/* Form Card */}
              <View style={styles.formCard}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
                  style={styles.formCardGradient}
                >
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
                    <TouchableOpacity
                      style={styles.googleButton}
                      onPress={async () => {
                        try {
                          await signInWithGoogle();
                          // La navegación se maneja automáticamente por AuthContext
                        } catch (error: any) {
                          console.error('Google login error:', error);
                          const errorMessage =
                            error.response?.data?.message ||
                            error.message ||
                            'No se pudo iniciar sesión con Google';

                          // Si el error es que el usuario no existe, sugerir registro
                          if (errorMessage.includes('No existe una cuenta')) {
                            Alert.alert(
                              'Cuenta No Encontrada',
                              'No existe una cuenta con este email. ¿Deseas registrarte?',
                              [
                                { text: 'Cancelar', style: 'cancel' },
                                {
                                  text: 'Registrarse',
                                  onPress: () => router.replace('/auth/register'),
                                },
                              ]
                            );
                          } else {
                            Alert.alert('Error', errorMessage);
                          }
                        }
                      }}
                      disabled={loading || googleDisabled || googleLoading}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={['#FFFFFF', '#F9F9F9']}
                        style={styles.googleButtonGradient}
                      >
                        {googleLoading ? (
                          <Text style={styles.googleButtonText}>Cargando...</Text>
                        ) : (
                          <>
                            <Ionicons name="logo-google" size={normalize(20)} color="#DB4437" />
                            <Text style={styles.googleButtonText}>Continuar con Google</Text>
                          </>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
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
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  gradient: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },

  logoCard: {
    width: normalize(72),
    height: normalize(72),
    borderRadius: normalize(18),
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },

  logoIconContainer: {
    width: normalize(60),
    height: normalize(60),
    borderRadius: normalize(15),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandName: {
    fontSize: normalize(22),
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },

  // Header
  header: {
    marginBottom: spacing.md,
  },

  title: {
    fontSize: normalize(22),
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: normalize(13),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: normalize(18),
  },

  // Form Card
  formCard: {
    borderRadius: normalize(18),
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  formCardGradient: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: normalize(18),
  },

  form: {
    gap: spacing.xs,
  },

  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.sm,
    marginTop: -spacing.xs,
  },

  forgotPasswordText: {
    fontSize: normalize(12),
    color: colors.primary,
    fontWeight: '600',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },

  dividerText: {
    fontSize: normalize(11),
    color: colors.textTertiary,
    marginHorizontal: spacing.sm,
    fontWeight: '500',
  },

  // Google Button
  googleButton: {
    borderRadius: normalize(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  googleButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(13),
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: normalize(12),
  },

  googleButtonText: {
    fontSize: normalize(13),
    fontWeight: '600',
    color: colors.gray800,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: spacing.md,
  },

  footerText: {
    fontSize: normalize(13),
    color: colors.textSecondary,
  },

  footerLink: {
    fontSize: normalize(13),
    color: colors.primary,
    fontWeight: '700',
  },
});
