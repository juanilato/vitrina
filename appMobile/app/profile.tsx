/**
 * Profile Screen
 * Pantalla de perfil del usuario
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing } from '../src/theme';
import { textStyles as typography } from '../src/theme/typography';
import { useAuth } from '../src/contexts/AuthContext';
import { useOrders } from '../src/hooks/useOrders';
import { useTheme } from '../src/contexts/ThemeContext';
import { LocationsDrawer } from '../src/components/navigation/LocationsDrawer';
import { Logo } from '../src/components/common/Logo';
import { normalize } from '../src/utils/responsive';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { activeOrdersCount, refresh: refreshOrders } = useOrders();
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [showLocationsDrawer, setShowLocationsDrawer] = useState(false);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const handleGoBack = () => {
    router.back();
  };

  const handleOpenLocationsDrawer = () => {
    setShowLocationsDrawer(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
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
      ]
    );
  };

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
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={normalize(20)} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.logoSection}>
              <Logo variant="icon" size={20} />
              <Text style={styles.logoText}>Vitrina • Perfil</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* User Info */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color={colors.white} />
            </View>
          </View>

          <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          {activeOrdersCount > 0 && (
            <View style={styles.activeOrdersBadge}>
              <Ionicons name="receipt" size={16} color={colors.accent} />
              <Text style={styles.activeOrdersText}>
                {activeOrdersCount} {activeOrdersCount === 1 ? 'pedido activo' : 'pedidos activos'}
              </Text>
            </View>
          )}
        </View>

        {/* Menu Options */}
        <View style={styles.section}>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/(tabs)/orders')}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: colors.accent + '15' }]}>
                  <Ionicons name="receipt-outline" size={20} color={colors.accent} />
                </View>
                <Text style={styles.menuLabel}>Mis pedidos</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleOpenLocationsDrawer}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#FF9500' + '15' }]}>
                  <Ionicons name="location-outline" size={20} color="#FF9500" />
                </View>
                <Text style={styles.menuLabel}>Mis Ubicaciones</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert('Próximamente', 'Métodos de pago')}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: colors.success + '15' }]}>
                  <Ionicons name="card-outline" size={20} color={colors.success} />
                </View>
                <Text style={styles.menuLabel}>Métodos de pago</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/settings')}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#5856D6' + '15' }]}>
                  <Ionicons name="settings-outline" size={20} color="#5856D6" />
                </View>
                <Text style={styles.menuLabel}>Configuración</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert('Ayuda', 'Centro de ayuda')}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#0066CC' + '15' }]}>
                  <Ionicons name="help-circle-outline" size={20} color="#0066CC" />
                </View>
                <Text style={styles.menuLabel}>Ayuda</Text>
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
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Versión 1.0.0</Text>
      </ScrollView>

      {/* Drawer de ubicaciones */}
      <LocationsDrawer
        visible={showLocationsDrawer}
        onClose={() => setShowLocationsDrawer(false)}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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

  // Top bar - Logo centrado
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
    paddingBottom: spacing['2xl'],
  },

  userCard: {
    backgroundColor: colors.card,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? colors.gray200 : colors.gray200,
    marginBottom: spacing.sm,
  },

  avatarContainer: {
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.card,
  },

  userName: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
    fontSize: 22,
  },

  userEmail: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontSize: 14,
  },

  activeOrdersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accent + '40',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },

  activeOrdersText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '700',
    fontSize: 13,
  },

  section: {
    marginTop: spacing.lg,
  },

  divider: {
    height: 1,
    backgroundColor: isDark ? colors.gray200 : colors.gray100,
  },

  menuContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
    shadowColor: isDark ? colors.black : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? colors.gray200 : colors.gray100,
    backgroundColor: colors.card,
  },

  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: isDark ? colors.black : '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },

  menuLabel: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
    fontSize: 15,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: isDark ? colors.error + '15' : colors.error + '10',
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.error + '40',
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },

  logoutText: {
    ...typography.bodyMedium,
    color: colors.error,
    fontWeight: '700',
    fontSize: 15,
  },

  version: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
