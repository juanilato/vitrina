/**
 * Register Screen
 * iOS Modern Design - Vitrina Style - Cliente only
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
import { VerificationModal } from '../../src/components/auth/VerificationModal';
import { colors, spacing, textStyles } from '../../src/theme';
import { useGoogleSignIn } from '../../src/hooks/useGoogleSignIn';
import { normalize } from '../../src/utils/responsive';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const { register, loginAfterVerification } = useAuth();
  const router = useRouter();
  const { signInWithGoogle, loading: googleLoading, disabled: googleDisabled } = useGoogleSignIn('register');

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

  // Estado para modal de verificación
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

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
      // El registro ahora devuelve un mensaje de verificación pendiente
      const response = await register({
        name,
        email,
        password,
      });

      // Si el backend devuelve que necesita verificación
      if (response?.message?.includes('verificación')) {
        setRegisteredEmail(email);
        setShowVerificationModal(true);
        Alert.alert(
          'Verificación Requerida',
          'Hemos enviado un código de verificación a tu email. Por favor verifica tu cuenta para continuar.'
        );
      } else if (response?.accessToken) {
        // Si no requiere verificación (por ejemplo, login automático después de registro con Google)
        // La navegación se maneja automáticamente por AuthContext
      }
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

  const handleVerificationSuccess = async (verificationResponse: any) => {
    try {
      setShowVerificationModal(false);

      // Auto-login con los tokens de la respuesta de verificación
      await loginAfterVerification(verificationResponse);

      // La navegación se maneja automáticamente por el AuthContext
      Alert.alert(
        '¡Cuenta Verificada!',
        'Tu cuenta ha sido verificada exitosamente. ¡Bienvenido a Vitrina!'
      );
    } catch (error: any) {
      console.error('Error en auto-login:', error);
      Alert.alert(
        'Error',
        'Hubo un problema al iniciar sesión. Por favor intenta iniciar sesión manualmente.',
        [
          {
            text: 'Ir a Login',
            onPress: () => {
              router.replace('/auth/login');
            },
          },
        ]
      );
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
                    <Logo variant="icon" size={normalize(30)} />
                  </View>
                </View>
                <Text style={styles.brandName}>Vitrina</Text>
              </View>

              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Crear Cuenta ✨</Text>
                <Text style={styles.subtitle}>Únete y descubre lugares increíbles</Text>
              </View>

              {/* Form Card */}
              <View style={styles.formCard}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']}
                  style={styles.formCardGradient}
                >
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
                      <Text style={styles.termsLink}>Términos</Text> y{' '}
                      <Text style={styles.termsLink}>Privacidad</Text>
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
                    <TouchableOpacity
                      style={styles.googleButton}
                      onPress={async () => {
                        try {
                          await signInWithGoogle();
                          // La navegación se maneja automáticamente por AuthContext
                        } catch (error: any) {
                          console.error('Google register error:', error);
                          const errorMessage =
                            error.response?.data?.message ||
                            error.message ||
                            'No se pudo registrar con Google';

                          // Si el error es que el usuario ya existe, sugerir login
                          if (errorMessage.includes('ya está registrado')) {
                            Alert.alert(
                              'Cuenta Existente',
                              'Ya tienes una cuenta con este email. ¿Deseas iniciar sesión?',
                              [
                                { text: 'Cancelar', style: 'cancel' },
                                {
                                  text: 'Iniciar Sesión',
                                  onPress: () => router.replace('/auth/login'),
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
      </LinearGradient>

      {/* Modal de Verificación */}
      <VerificationModal
        visible={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        email={registeredEmail}
        userType="cliente"
        onVerificationSuccess={handleVerificationSuccess}
      />
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xs,
    marginTop: 0,
  },

  logoCard: {
    width: normalize(52),
    height: normalize(52),
    borderRadius: normalize(13),
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxs,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },

  logoIconContainer: {
    width: normalize(42),
    height: normalize(42),
    borderRadius: normalize(11),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandName: {
    fontSize: normalize(17),
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },

  // Header
  header: {
    marginBottom: spacing.xs,
  },

  title: {
    fontSize: normalize(19),
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: spacing.xxs,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: normalize(11),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: normalize(15),
  },

  // Form Card
  formCard: {
    borderRadius: normalize(16),
    overflow: 'hidden',
    marginBottom: spacing.xs,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  formCardGradient: {
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: normalize(16),
  },

  form: {
    gap: spacing.xxs,
  },

  termsText: {
    fontSize: normalize(9),
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxs,
    marginTop: spacing.xxs,
    lineHeight: normalize(12),
  },

  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },

  dividerText: {
    fontSize: normalize(9),
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
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },

  googleButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(10),
    paddingHorizontal: spacing.sm,
    gap: spacing.xxs,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: normalize(12),
  },

  googleButtonText: {
    fontSize: normalize(11),
    fontWeight: '600',
    color: colors.gray800,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: spacing.xs,
  },

  footerText: {
    fontSize: normalize(11),
    color: colors.textSecondary,
  },

  footerLink: {
    fontSize: normalize(11),
    color: colors.primary,
    fontWeight: '700',
  },
});
