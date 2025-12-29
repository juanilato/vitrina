/**
 * Settings Screen
 * Pantalla de configuración y preferencias del usuario
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing } from '../src/theme';
import { textStyles as typography } from '../src/theme/typography';
import { useAuth } from '../src/contexts/AuthContext';
import { usePreferences } from '../src/contexts/PreferencesContext';
import { useTheme } from '../src/contexts/ThemeContext';
import { Logo } from '../src/components/common/Logo';
import { normalize } from '../src/utils/responsive';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const {
    preferences,
    theme,
    loading,
    toggleTheme,
    updateNotifications,
    updatePrivacy,
  } = usePreferences();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [savingTheme, setSavingTheme] = useState(false);

  const isGoogleUser = user?.authMethod === 'google';

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const handleToggleTheme = async () => {
    try {
      setSavingTheme(true);
      await toggleTheme();
    } catch (error) {
      Alert.alert('Error', 'No se pudo cambiar el tema');
    } finally {
      setSavingTheme(false);
    }
  };

  const handleToggleNotification = async (
    key: keyof typeof preferences,
    value: boolean,
  ) => {
    try {
      await updateNotifications({ [key]: value });
    } catch (error) {
      Alert.alert('Error', 'No se pudieron actualizar las notificaciones');
    }
  };

  const handleTogglePrivacy = async (
    key: keyof typeof preferences,
    value: boolean,
  ) => {
    try {
      await updatePrivacy({ [key]: value });
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la configuración');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, cerrar sesión',
          style: 'destructive',
          onPress: logout,
        },
      ],
    );
  };

  if (loading && !preferences) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando preferencias...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header con degradado azul */}
      <LinearGradient
        colors={['#0A2A43', '#0D3354']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={normalize(20)} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.logoSection}>
              <Logo variant="icon" size={20} />
              <Text style={styles.logoText}>Vitrina • Configuración</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={colors.white} />
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            {isGoogleUser && (
              <View style={styles.googleBadge}>
                <Ionicons name="logo-google" size={12} color={colors.accent} />
                <Text style={styles.googleBadgeText}>
                  Registrado con Google
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Mi Cuenta Section */}
        <View style={styles.section}>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/locations')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="location"
                  size={22}
                  color={colors.primary}
                  style={styles.menuIcon}
                />
                <Text style={styles.menuText}>Direcciones guardadas</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/change-password')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="key"
                  size={22}
                  color={colors.primary}
                  style={styles.menuIcon}
                />
                <Text style={styles.menuText}>
                  {isGoogleUser ? 'Establecer contraseña' : 'Cambiar contraseña'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferencias Section */}
        <View style={styles.section}>
          <View style={styles.menuContainer}>
            {/* Modo Oscuro */}
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name={theme === 'dark' ? 'moon' : 'sunny'}
                  size={22}
                  color={colors.primary}
                  style={styles.menuIcon}
                />
                <Text style={styles.menuText}>Modo oscuro</Text>
              </View>
              {savingTheme ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Switch
                  value={preferences?.temaOscuro || false}
                  onValueChange={handleToggleTheme}
                  trackColor={{
                    false: colors.gray300,
                    true: colors.primary,
                  }}
                  thumbColor={colors.white}
                />
              )}
            </View>
          </View>
        </View>

        {/* Notificaciones Section */}
        <View style={styles.section}>
          <View style={styles.menuContainer}>
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="notifications"
                  size={22}
                  color={colors.primary}
                  style={styles.menuIcon}
                />
                <Text style={styles.menuText}>Notificaciones push</Text>
              </View>
              <Switch
                value={preferences?.notificacionesPush || false}
                onValueChange={(value) =>
                  handleToggleNotification('notificacionesPush', value)
                }
                trackColor={{ false: colors.gray300, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="mail"
                  size={22}
                  color={colors.primary}
                  style={styles.menuIcon}
                />
                <Text style={styles.menuText}>Notificaciones por email</Text>
              </View>
              <Switch
                value={preferences?.notificacionesEmail || false}
                onValueChange={(value) =>
                  handleToggleNotification('notificacionesEmail', value)
                }
                trackColor={{ false: colors.gray300, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="receipt"
                  size={22}
                  color={colors.primary}
                  style={styles.menuIcon}
                />
                <Text style={styles.menuText}>Estado de pedidos</Text>
              </View>
              <Switch
                value={preferences?.notificarEstadoPedidos || false}
                onValueChange={(value) =>
                  handleToggleNotification('notificarEstadoPedidos', value)
                }
                trackColor={{ false: colors.gray300, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="pricetag"
                  size={22}
                  color={colors.primary}
                  style={styles.menuIcon}
                />
                <Text style={styles.menuText}>Promociones y ofertas</Text>
              </View>
              <Switch
                value={preferences?.notificarPromociones || false}
                onValueChange={(value) =>
                  handleToggleNotification('notificarPromociones', value)
                }
                trackColor={{ false: colors.gray300, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          </View>
        </View>

        {/* Privacidad Section */}
        <View style={styles.section}>
          <View style={styles.menuContainer}>
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="location"
                  size={22}
                  color={colors.primary}
                  style={styles.menuIcon}
                />
                <Text style={styles.menuText}>Compartir ubicación</Text>
              </View>
              <Switch
                value={preferences?.compartirUbicacion || false}
                onValueChange={(value) =>
                  handleTogglePrivacy('compartirUbicacion', value)
                }
                trackColor={{ false: colors.gray300, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="eye"
                  size={22}
                  color={colors.primary}
                  style={styles.menuIcon}
                />
                <Text style={styles.menuText}>Historial de compras visible</Text>
              </View>
              <Switch
                value={preferences?.historialComprasVisible || false}
                onValueChange={(value) =>
                  handleTogglePrivacy('historialComprasVisible', value)
                }
                trackColor={{ false: colors.gray300, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          </View>
        </View>

        {/* Soporte Section */}
        <View style={styles.section}>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert('Ayuda', 'Próximamente')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="help-circle"
                  size={22}
                  color={colors.primary}
                  style={styles.menuIcon}
                />
                <Text style={styles.menuText}>Ayuda y preguntas</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert('Acerca de', 'Vitrina v1.0.0')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name="information-circle"
                  size={22}
                  color={colors.primary}
                  style={styles.menuIcon}
                />
                <Text style={styles.menuText}>Acerca de Vitrina</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out" size={22} color={colors.error} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },

  // Header premium igual al home
  headerGradient: {
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  safeArea: {
    paddingHorizontal: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
    justifyContent: 'center',
  },
  logoText: {
    ...typography.headline,
    fontSize: normalize(20),
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: 12,
    shadowColor: isDark ? colors.black : colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 2,
  },
  userEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  googleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.accent + '15',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  googleBadgeText: {
    ...typography.bodySmall,
    fontSize: 11,
    color: colors.accent,
    marginLeft: 4,
  },
  section: {
    marginTop: spacing.lg,
  },
  menuContainer: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: spacing.md,
  },
  menuText: {
    ...typography.bodyMedium,
    color: colors.text,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: isDark ? colors.gray200 : colors.gray200,
    marginLeft: spacing.lg + 22 + spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutText: {
    ...typography.bodyLarge,
    color: colors.error,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  bottomPadding: {
    height: spacing.xl,
  },
});
