/**
 * AuthModal Component
 * Modal para login y registro cuando el usuario intenta continuar sin autenticación
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input } from '../common';
import { Logo } from '../common/Logo';
import { VerificationModal } from './VerificationModal';
import { colors, spacing, textStyles, borderRadius } from '../../theme';
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn';
import { normalize } from '../../utils/responsive';

const { width } = Dimensions.get('window');

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthMode = 'login' | 'register';

export const AuthModal: React.FC<AuthModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { login, register } = useAuth();
  const { signInWithGoogle, loading: googleLoading, disabled: googleDisabled } = useGoogleSignIn();

  const [mode, setMode] = useState<AuthMode>('register');
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

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrors({});
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateLoginForm = (): boolean => {
    const newErrors: any = {};

    if (!email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = (): boolean => {
    const newErrors: any = {};

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

  const handleLogin = async () => {
    if (!validateLoginForm()) return;

    setLoading(true);
    try {
      await login({ email, password });
      resetForm();
      onSuccess?.();
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Error al iniciar sesión'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateRegisterForm()) return;

    setLoading(true);
    try {
      // El registro ahora devuelve un mensaje de verificación pendiente
      const response = await register({ name, email, password });

      // Si el backend devuelve que necesita verificación
      if (response?.message?.includes('verificación')) {
        setRegisteredEmail(email);
        setShowVerificationModal(true);
        Alert.alert(
          'Verificación Requerida',
          'Hemos enviado un código de verificación a tu email. Por favor verifica tu cuenta para continuar.'
        );
      } else {
        // Si no requiere verificación (por ejemplo, login automático después de registro)
        resetForm();
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Register error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Error al crear la cuenta'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    resetForm();
    setShowVerificationModal(false);
    Alert.alert(
      '¡Cuenta Verificada!',
      'Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión.',
      [
        {
          text: 'Iniciar Sesión',
          onPress: () => {
            setMode('login');
            setEmail(registeredEmail);
          },
        },
      ]
    );
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      resetForm();
      onSuccess?.();
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar sesión con Google');
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setErrors({});
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#F9F9F9', '#FFFFFF', '#F5F9FC']}
            style={styles.gradient}
          >
            <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={28} color={colors.gray800} />
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {/* Logo Section */}
                <View style={styles.logoSection}>
                  <View style={styles.logoCard}>
                    <View style={styles.logoIconContainer}>
                      <Logo variant="icon" size={normalize(40)} />
                    </View>
                  </View>
                  <Text style={styles.brandName}>Vitrina</Text>
                </View>

                {/* Title */}
                <View style={styles.titleSection}>
                  <Text style={styles.title}>
                    {mode === 'login' ? 'Inicia Sesión' : 'Crear Cuenta'}
                  </Text>
                  <Text style={styles.subtitle}>
                    {mode === 'login'
                      ? 'Ingresa para continuar con tu pedido'
                      : 'Regístrate para continuar con tu pedido'}
                  </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                  {mode === 'register' && (
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
                  )}

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
                    placeholder={mode === 'login' ? 'Tu contraseña' : 'Mínimo 6 caracteres'}
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

                  {mode === 'register' && (
                    <Input
                      label="Confirmar contraseña"
                      placeholder="Repite tu contraseña"
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (errors.confirmPassword)
                          setErrors({ ...errors, confirmPassword: undefined });
                      }}
                      error={errors.confirmPassword}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  )}

                  {mode === 'register' && (
                    <Text style={styles.termsText}>
                      Al registrarte, aceptas nuestros{' '}
                      <Text style={styles.termsLink}>Términos de Servicio</Text> y{' '}
                      <Text style={styles.termsLink}>Política de Privacidad</Text>
                    </Text>
                  )}

                  {/* Action Button */}
                  <Button
                    title={mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    onPress={mode === 'login' ? handleLogin : handleRegister}
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
                    onPress={handleGoogleSignIn}
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

                {/* Switch Mode */}
                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                  </Text>
                  <TouchableOpacity onPress={switchMode} disabled={loading}>
                    <Text style={styles.footerLink}>
                      {mode === 'login' ? 'Regístrate' : 'Inicia Sesión'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>

      {/* Modal de Verificación */}
      <VerificationModal
        visible={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        email={registeredEmail}
        userType="cliente"
        onVerificationSuccess={handleVerificationSuccess}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '95%',
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['2xl'],
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoCard: {
    width: normalize(80),
    height: normalize(80),
    borderRadius: normalize(20),
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  logoIconContainer: {
    width: normalize(64),
    height: normalize(64),
    borderRadius: normalize(16),
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
  titleSection: {
    marginBottom: spacing.lg,
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
  form: {
    gap: spacing.xs,
  },
  termsText: {
    fontSize: normalize(11),
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
    lineHeight: normalize(16),
  },
  termsLink: {
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
    fontSize: normalize(12),
    color: colors.textTertiary,
    marginHorizontal: spacing.md,
    fontWeight: '500',
  },
  googleButton: {
    borderRadius: normalize(14),
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
    paddingVertical: normalize(15),
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: normalize(14),
  },
  googleButtonText: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: colors.gray800,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: normalize(14),
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: normalize(14),
    color: colors.primary,
    fontWeight: '700',
  },
});
