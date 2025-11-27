/**
 * Login Screen
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
import { colors, spacing, textStyles } from '../../src/theme';
import { useGoogleSignIn } from '../../src/hooks/useGoogleSignIn';
import { normalize } from '../../src/utils/responsive';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const { signInWithGoogle, loading: googleLoading, disabled: googleDisabled } = useGoogleSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

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
                <Text style={styles.title}>¡Bienvenido de nuevo!</Text>
                <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
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
              </Animated.View>

              {/* Sign Up Link con animación */}
              <Animated.View
                style={[
                  styles.footer,
                  {
                    opacity: fadeAnim,
                  }
                ]}
              >
                <Text style={styles.footerText}>¿No tienes cuenta? </Text>
                <Link href="/auth/register" asChild>
                  <TouchableOpacity disabled={loading}>
                    <Text style={styles.footerLink}>Regístrate</Text>
                  </TouchableOpacity>
                </Link>
              </Animated.View>
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.md,
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

  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xs,
    marginTop: -spacing.xs,
  },

  forgotPasswordText: {
    fontSize: normalize(13),
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
    paddingTop: spacing.lg,
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
