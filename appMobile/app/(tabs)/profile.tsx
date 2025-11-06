/**
 * Profile Screen
 * Configuración de perfil con métodos de pago, notificaciones y seguridad
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing } from '../../src/theme';
import { textStyles as typography } from '../../src/theme/typography';
import { useAuth } from '../../src/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();

  // Estados para notificaciones
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [ordersEnabled, setOrdersEnabled] = useState(true);
  const [promotionsEnabled, setPromotionsEnabled] = useState(false);

  // Estados para cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handler para cambio de contraseña
  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Aquí iría la lógica para cambiar la contraseña en el backend
    Alert.alert(
      'Contraseña actualizada',
      'Tu contraseña se ha cambiado exitosamente',
      [
        {
          text: 'OK',
          onPress: () => {
            setShowPasswordModal(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Modern Glass Header */}
      <View style={styles.navbar}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
          style={styles.navbarGradient}
        >
          <View style={styles.profileBadge}>
            <View style={styles.profileIconContainer}>
              <Ionicons name="person" size={22} color={colors.primary} />
            </View>
            <View style={styles.profileTextContainer}>
              <Text style={styles.profileLabel}>MI PERFIL</Text>
              <Text style={styles.profileTitle}>Configuración</Text>
            </View>
          </View>
          <View style={styles.headerRight} />
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={colors.white} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Métodos de Pago */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MÉTODOS DE PAGO</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert('Agregar tarjeta', 'Funcionalidad en desarrollo')}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.success + '15' }]}>
                  <Ionicons name="card-outline" size={22} color={colors.success} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuLabel}>Tarjetas de crédito/débito</Text>
                  <Text style={styles.menuSubtitle}>Agrega o administra tus tarjetas</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert('Efectivo', 'Pagar en efectivo al recibir')}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#34C759' + '15' }]}>
                  <Ionicons name="cash-outline" size={22} color="#34C759" />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuLabel}>Efectivo</Text>
                  <Text style={styles.menuSubtitle}>Paga al recibir tu pedido</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notificaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICACIONES</Text>
          <View style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.menuLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#5856D6' + '15' }]}>
                  <Ionicons name="notifications" size={22} color="#5856D6" />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuLabel}>Notificaciones push</Text>
                  <Text style={styles.menuSubtitle}>Recibe alertas en tu dispositivo</Text>
                </View>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: colors.gray300, true: colors.primary + '50' }}
                thumbColor={pushEnabled ? colors.primary : colors.gray100}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.menuLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#FF9500' + '15' }]}>
                  <Ionicons name="mail" size={22} color="#FF9500" />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuLabel}>Notificaciones por email</Text>
                  <Text style={styles.menuSubtitle}>Recibe correos informativos</Text>
                </View>
              </View>
              <Switch
                value={emailEnabled}
                onValueChange={setEmailEnabled}
                trackColor={{ false: colors.gray300, true: colors.primary + '50' }}
                thumbColor={emailEnabled ? colors.primary : colors.gray100}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.menuLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.accent + '15' }]}>
                  <Ionicons name="receipt" size={22} color={colors.accent} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuLabel}>Estado de pedidos</Text>
                  <Text style={styles.menuSubtitle}>Actualizaciones de tus pedidos</Text>
                </View>
              </View>
              <Switch
                value={ordersEnabled}
                onValueChange={setOrdersEnabled}
                trackColor={{ false: colors.gray300, true: colors.primary + '50' }}
                thumbColor={ordersEnabled ? colors.primary : colors.gray100}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.menuLeft}>
                <View style={[styles.iconContainer, { backgroundColor: '#FF3B30' + '15' }]}>
                  <Ionicons name="pricetag" size={22} color="#FF3B30" />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuLabel}>Promociones y ofertas</Text>
                  <Text style={styles.menuSubtitle}>Descuentos especiales</Text>
                </View>
              </View>
              <Switch
                value={promotionsEnabled}
                onValueChange={setPromotionsEnabled}
                trackColor={{ false: colors.gray300, true: colors.primary + '50' }}
                thumbColor={promotionsEnabled ? colors.primary : colors.gray100}
              />
            </View>
          </View>
        </View>

        {/* Cambio de Contraseña */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SEGURIDAD</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowPasswordModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.gray700 + '15' }]}>
                  <Ionicons name="lock-closed" size={22} color={colors.gray700} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuLabel}>Cambiar contraseña</Text>
                  <Text style={styles.menuSubtitle}>Actualiza tu contraseña</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal de Cambio de Contraseña */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cambiar contraseña</Text>
              <TouchableOpacity
                onPress={() => setShowPasswordModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.gray700} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Contraseña actual */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contraseña actual</Text>
                <View style={styles.passwordInput}>
                  <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={!showCurrentPassword}
                    placeholder="Ingresa tu contraseña actual"
                    placeholderTextColor={colors.gray400}
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showCurrentPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={colors.gray500}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Nueva contraseña */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nueva contraseña</Text>
                <View style={styles.passwordInput}>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={colors.gray400}
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showNewPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={colors.gray500}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirmar contraseña */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirmar contraseña</Text>
                <View style={styles.passwordInput}>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    placeholder="Repite la nueva contraseña"
                    placeholderTextColor={colors.gray400}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={colors.gray500}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Botones */}
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleChangePassword}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>Guardar cambios</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPasswordModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },

  // Navbar - Modern Glass Design
  navbar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  navbarGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },

  // Profile Badge
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 10,
    flex: 1,
    marginRight: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTextContainer: {
    flex: 1,
  },
  profileLabel: {
    ...typography.caption1,
    fontSize: 10,
    fontWeight: '600',
    color: colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileTitle: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '800',
    color: colors.gray900,
    marginTop: 2,
  },
  headerRight: {
    width: 36,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: spacing['2xl'],
  },

  // User Card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    ...typography.h3,
    color: colors.gray900,
    fontWeight: '700',
    marginBottom: 4,
  },

  userEmail: {
    ...typography.bodyMedium,
    color: colors.gray600,
  },

  // Sections
  section: {
    marginTop: spacing.lg,
  },

  sectionTitle: {
    ...typography.bodySmall,
    color: colors.gray600,
    fontWeight: '700',
    letterSpacing: 0.8,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },

  card: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  // Menu Items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },

  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  menuTextContainer: {
    flex: 1,
  },

  menuLabel: {
    ...typography.bodyMedium,
    color: colors.gray900,
    fontWeight: '600',
    marginBottom: 2,
  },

  menuSubtitle: {
    ...typography.bodySmall,
    color: colors.gray600,
    fontSize: 13,
  },

  // Setting Items (with Switch)
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },

  divider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginLeft: spacing.lg + 44 + spacing.md, // Alinear con el texto
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },

  modalTitle: {
    ...typography.h3,
    color: colors.gray900,
    fontWeight: '700',
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalBody: {
    padding: spacing.lg,
  },

  // Input Groups
  inputGroup: {
    marginBottom: spacing.lg,
  },

  inputLabel: {
    ...typography.bodyMedium,
    color: colors.gray700,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },

  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  input: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.gray900,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    height: 48,
  },

  eyeButton: {
    padding: spacing.sm,
    paddingRight: spacing.md,
  },

  // Buttons
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  saveButtonText: {
    ...typography.bodyLarge,
    color: colors.white,
    fontWeight: '700',
  },

  cancelButton: {
    backgroundColor: colors.gray100,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.sm,
  },

  cancelButtonText: {
    ...typography.bodyMedium,
    color: colors.gray700,
    fontWeight: '600',
  },
});
