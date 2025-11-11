/**
 * VerificationModal Component
 * Modal para verificar código de 6 dígitos enviado por email
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../common';
import { colors, spacing, textStyles, borderRadius } from '../../theme';
import { normalize } from '../../utils/responsive';
import api from '../../config/axios.config';

interface VerificationModalProps {
  visible: boolean;
  onClose: () => void;
  email: string;
  userType: 'cliente' | 'empresa' | 'repartidor';
  onVerificationSuccess: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  visible,
  onClose,
  email,
  userType,
  onVerificationSuccess,
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (!code.trim() || code.length !== 6) {
      Alert.alert('Error', 'Por favor ingresa el código de 6 dígitos');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/verify', {
        email,
        code: code.trim(),
        userType,
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert(
          'Verificación Exitosa',
          '¡Tu cuenta ha sido verificada! Ya puedes iniciar sesión.',
          [
            {
              text: 'Continuar',
              onPress: () => {
                onVerificationSuccess();
                handleClose();
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Error en verificación:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Código inválido o expirado. Por favor intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    try {
      const response = await api.post('/auth/resend-code', {
        email,
        userType,
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Código Reenviado', 'Hemos enviado un nuevo código a tu email. Revisa tu bandeja de entrada.');
      }
    } catch (error: any) {
      console.error('Error en reenvío:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo reenviar el código. Por favor intenta nuevamente.'
      );
    } finally {
      setResending(false);
    }
  };

  const handleClose = () => {
    setCode('');
    onClose();
  };

  const handleCodeChange = (text: string) => {
    // Solo permitir números y máximo 6 dígitos
    const numericValue = text.replace(/[^0-9]/g, '').slice(0, 6);
    setCode(numericValue);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
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
                <Text style={styles.headerTitle}>Verificar Cuenta</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={28} color={colors.gray800} />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={styles.content}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                  <Ionicons name="mail-outline" size={normalize(60)} color={colors.primary} />
                </View>

                {/* Instructions */}
                <Text style={styles.title}>Revisa tu Email</Text>
                <Text style={styles.subtitle}>
                  Hemos enviado un código de verificación de 6 dígitos a{' '}
                  <Text style={styles.emailText}>{email}</Text>
                </Text>

                {/* Code Input */}
                <View style={styles.codeInputContainer}>
                  <TextInput
                    style={styles.codeInput}
                    value={code}
                    onChangeText={handleCodeChange}
                    placeholder="000000"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoComplete="one-time-code"
                    textContentType="oneTimeCode"
                    editable={!loading}
                    autoFocus
                  />
                </View>

                {/* Verify Button */}
                <Button
                  title="Verificar Código"
                  onPress={handleVerify}
                  loading={loading}
                  disabled={loading || code.length !== 6}
                  fullWidth
                  size="lg"
                />

                {/* Resend Button */}
                <TouchableOpacity
                  onPress={handleResendCode}
                  disabled={resending}
                  style={styles.resendButton}
                >
                  {resending ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Text style={styles.resendButtonText}>Reenviar Código</Text>
                  )}
                </TouchableOpacity>

                {/* Help Text */}
                <View style={styles.helpContainer}>
                  <Text style={styles.helpTitle}>¿No recibiste el código?</Text>
                  <Text style={styles.helpText}>• Revisa tu carpeta de spam</Text>
                  <Text style={styles.helpText}>• Verifica que el email sea correcto</Text>
                  <Text style={styles.helpText}>• Haz clic en "Reenviar Código"</Text>
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </View>
      </View>
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
    maxHeight: '85%',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: normalize(20),
    fontWeight: '700',
    color: colors.gray900,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: normalize(24),
    fontWeight: '700',
    color: colors.gray900,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: normalize(14),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: normalize(20),
    marginBottom: spacing.xl,
  },
  emailText: {
    fontWeight: '600',
    color: colors.primary,
  },
  codeInputContainer: {
    marginBottom: spacing.lg,
  },
  codeInput: {
    height: normalize(64),
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    fontSize: normalize(32),
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: normalize(8),
    color: colors.gray900,
  },
  resendButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  resendButtonText: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: colors.primary,
  },
  helpContainer: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
  },
  helpTitle: {
    fontSize: normalize(13),
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  helpText: {
    fontSize: normalize(12),
    color: colors.textSecondary,
    lineHeight: normalize(18),
    marginTop: spacing.xs,
  },
});
