/**
 * Register Screen
 * Modern Design with Animations - Vitrina Style
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
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

const { width, height } = Dimensions.get('window');

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

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const formSlide = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(formSlide, {
        toValue: 0,
        tension: 35,
        friction: 8,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
        colors={['#FAFBFC', '#F5F7FA', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
              {/* Logo Section con animación */}
              <Animated.View
                style={[
                  styles.logoSection,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateY: slideAnim },
                      { scale: logoScale }
                    ]
                  }
                ]}
              >
                <View style={styles.logoCard}>
                  <LinearGradient
                    colors={[colors.primary, '#6366F1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.logoGradient}
                  >
                    <Logo variant="icon" size={normalize(36)} />
                  </LinearGradient>
                </View>
                <Text style={styles.brandName}>Vitrina</Text>
                <Text style={styles.tagline}>Tu marketplace favorito</Text>
              </Animated.View>

              {/* Header con animación */}
              <Animated.View
                style={[
                  styles.header,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <Text style={styles.title}>Crear tu cuenta</Text>
                <Text style={styles.subtitle}>Únete a nuestra comunidad</Text>
              </Animated.View>

              {/* Form Card con animación */}
              <Animated.View
                style={[
                  styles.formCard,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: formSlide }]
                  }
                ]}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
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
              </Animated.View>

              {/* Login Link con animación */}
              <Animated.View
                style={[
                  styles.footer,
                  {
                    opacity: fadeAnim,
                  }
                ]}
              >
                <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
                <Link href="/auth/login" asChild>
                  <TouchableOpacity disabled={loading}>
                    <Text style={styles.footerLink}>Inicia Sesión</Text>
                  </TouchableOpacity>
                </Link>
              </Animated.View>
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
    backgroundColor: '#FAFBFC',
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },

  logoCard: {
    width: normalize(80),
    height: normalize(80),
    borderRadius: normalize(24),
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },

  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: normalize(24),
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandName: {
    fontSize: normalize(28),
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -1,
    marginBottom: spacing.xs / 2,
  },

  tagline: {
    fontSize: normalize(13),
    fontWeight: '500',
    color: colors.textTertiary,
    letterSpacing: 0.3,
    marginTop: spacing.xs,
  },

  // Header
  header: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },

  title: {
    fontSize: normalize(26),
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: spacing.xs,
    textAlign: 'center',
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: normalize(15),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: normalize(22),
    fontWeight: '400',
  },

  // Form Card
  formCard: {
    borderRadius: normalize(28),
    overflow: 'hidden',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },

  formCardGradient: {
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: normalize(28),
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },

  form: {
    gap: spacing.md,
  },

  termsText: {
    fontSize: normalize(12),
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
    lineHeight: normalize(18),
    fontWeight: '400',
  },

  termsLink: {
    color: colors.primary,
    fontWeight: '600',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },

  dividerText: {
    fontSize: normalize(13),
    color: colors.textTertiary,
    marginHorizontal: spacing.md,
    fontWeight: '500',
  },

  // Google Button
  googleButton: {
    borderRadius: normalize(16),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  googleButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(16),
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: normalize(16),
  },

  googleButtonText: {
    fontSize: normalize(15),
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
    fontSize: normalize(15),
    color: colors.textSecondary,
    fontWeight: '400',
  },

  footerLink: {
    fontSize: normalize(15),
    color: colors.primary,
    fontWeight: '700',
  },
});
