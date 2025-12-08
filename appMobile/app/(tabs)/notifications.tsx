/**
 * Notifications Screen
 * Modern organized view with grouping by date and order
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useNotifications } from '../../src/contexts/NotificationsContext';
import { Notification } from '../../src/types/notification';
import { spacing } from '../../src/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { textStyles as typography } from '../../src/theme/typography';
import { EmptyState } from '../../src/components/common';

// Tipos para las secciones
interface NotificationSection {
  title: string;
  data: Notification[];
  isToday?: boolean;
  isYesterday?: boolean;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    // Después de marcar todas como leídas, si estamos filtrando solo no leídas, cambiar a ver todas
    if (showOnlyUnread) {
      setShowOnlyUnread(false);
    }
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.leida) {
      await markAsRead(notification.id);
    }

    // Navigate based on type
    if (notification.tipo.includes('pedido') || notification.tipo.includes('order')) {
      if (notification.metadata?.pedidoId) {
        router.push(`/order/${notification.metadata.pedidoId}` as any);
      }
    }
  };

  const getNotificationStyle = (tipo: string) => {
    switch (tipo) {
      case 'pedido_creado':
      case 'order_created':
        return {
          icon: 'checkmark-circle' as const,
          gradientColors: ['#10b981', '#059669'],
        };
      case 'pedido_actualizado':
      case 'order_updated':
        return {
          icon: 'reload-circle' as const,
          gradientColors: ['#3b82f6', '#2563eb'],
        };
      case 'pedido_rechazado':
      case 'order_cancelled':
        return {
          icon: 'close-circle' as const,
          gradientColors: ['#ef4444', '#dc2626'],
        };
      case 'order_delivered':
        return {
          icon: 'checkmark-done-circle' as const,
          gradientColors: ['#8b5cf6', '#7c3aed'],
        };
      default:
        return {
          icon: 'notifications' as const,
          gradientColors: [colors.primary, colors.secondary],
        };
    }
  };

  const formatTime = (date: string | Date) => {
    const d = new Date(date);
    const diffMs = Date.now() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;

    return d.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Agrupar notificaciones por fecha
  const sections = useMemo(() => {
    // Filtrar primero si es necesario
    const filtered = showOnlyUnread
      ? notifications.filter(n => !n.leida)
      : notifications;

    // Agrupar por fecha
    const grouped: { [key: string]: Notification[] } = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    filtered.forEach(notif => {
      const notifDate = new Date(notif.createdAt);
      const notifDay = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate());

      let key: string;
      if (notifDay.getTime() === today.getTime()) {
        key = 'Hoy';
      } else if (notifDay.getTime() === yesterday.getTime()) {
        key = 'Ayer';
      } else if (notifDay.getTime() > yesterday.getTime() - 7 * 24 * 60 * 60 * 1000) {
        key = notifDate.toLocaleDateString('es-AR', { weekday: 'long' });
        key = key.charAt(0).toUpperCase() + key.slice(1);
      } else {
        key = notifDate.toLocaleDateString('es-AR', {
          day: '2-digit',
          month: 'long',
        });
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(notif);
    });

    // Convertir a formato de secciones
    return Object.entries(grouped).map(([title, data]) => ({
      title,
      data: data.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
      isToday: title === 'Hoy',
      isYesterday: title === 'Ayer',
    }));
  }, [notifications, showOnlyUnread]);

  const renderNotification = ({ item }: { item: Notification }) => {
    const style = getNotificationStyle(item.tipo);

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.leida && styles.notificationCardUnread]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.8}
      >
        {/* Letter Header */}
        <View style={styles.letterHeader}>
          <View style={styles.letterHeaderContent}>
            <LinearGradient
              colors={style.gradientColors as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconContainer}
            >
              {item.metadata?.icono ? (
                <Text style={styles.iconEmoji}>{item.metadata.icono}</Text>
              ) : (
                <Ionicons name={style.icon} size={20} color="#fff" />
              )}
            </LinearGradient>
            <View style={styles.headerTextContent}>
              <Text style={[styles.title, !item.leida && styles.titleUnread]} numberOfLines={1}>
                {item.titulo}
              </Text>
              <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
            </View>
          </View>
          {!item.leida && <View style={styles.unreadIndicator} />}
        </View>

        {/* Letter Body */}
        <View style={styles.letterBody}>
          <Text style={styles.message} numberOfLines={3}>
            {item.mensaje}
          </Text>
          {item.metadata?.totalAmount && (
            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>Monto:</Text>
              <Text style={styles.totalAmount}>
                ${item.metadata.totalAmount.toLocaleString('es-AR')}
              </Text>
            </View>
          )}
        </View>

        {/* Letter Footer */}
        <View style={styles.letterFooter}>
          <Text style={styles.viewDetailsText}>Ver detalles</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: NotificationSection }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionBadge}>
        <Text style={styles.sectionCount}>{section.data.length}</Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <LinearGradient
            colors={isDark
              ? ['rgba(30, 30, 30, 0.95)', 'rgba(30, 30, 30, 0.85)']
              : ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']
            }
            style={styles.headerGradient}
          >
            <View style={styles.notificationBadge}>
              <View style={styles.notificationIconContainer}>
                <Ionicons name="notifications" size={22} color={colors.primary} />
              </View>
              <View style={styles.notificationTextContainer}>
                <Text style={styles.notificationLabel}>NOTIFICACIONES</Text>
                <Text style={styles.notificationTitle}>Cargando...</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const totalNotifications = showOnlyUnread
    ? notifications.filter(n => !n.leida).length
    : notifications.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Modern Glass Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={isDark
            ? ['rgba(30, 30, 30, 0.95)', 'rgba(30, 30, 30, 0.85)']
            : ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']
          }
          style={styles.headerGradient}
        >
          <View style={styles.headerRow}>
            <View style={styles.notificationBadge}>
              <View style={styles.notificationIconContainer}>
                <Ionicons name="notifications" size={24} color={colors.white} />
                {unreadCount > 0 && (
                  <View style={styles.notificationCountBadge}>
                    <Text style={styles.notificationCountText}>{unreadCount}</Text>
                  </View>
                )}
              </View>
              <View style={styles.notificationTextContainer}>
                <Text style={styles.notificationLabel}>NOTIFICACIONES</Text>
                <Text style={styles.notificationTitle}>
                  {totalNotifications} {totalNotifications === 1 ? 'notificación' : 'notificaciones'}
                </Text>
              </View>
            </View>
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
              <Ionicons name="checkmark-done" size={20} color={colors.white} />
              <Text style={styles.markAllButtonText}>Marcar todas leídas</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>

      {/* Filter Toggle */}
      {unreadCount > 0 && (
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterChip, !showOnlyUnread && styles.filterChipActive]}
            onPress={() => setShowOnlyUnread(false)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, !showOnlyUnread && styles.filterChipTextActive]}>
              Todas
            </Text>
            <View style={[styles.filterBadge, !showOnlyUnread && styles.filterBadgeActive]}>
              <Text style={[styles.filterBadgeText, !showOnlyUnread && styles.filterBadgeTextActive]}>
                {notifications.length}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, showOnlyUnread && styles.filterChipActive]}
            onPress={() => setShowOnlyUnread(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, showOnlyUnread && styles.filterChipTextActive]}>
              No leídas
            </Text>
            {unreadCount > 0 && (
              <View style={[styles.filterBadge, showOnlyUnread && styles.filterBadgeActive]}>
                <Text style={[styles.filterBadgeText, showOnlyUnread && styles.filterBadgeTextActive]}>
                  {unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications List */}
      {sections.length === 0 ? (
        <EmptyState
          icon="notifications-off-outline"
          title={showOnlyUnread ? 'No hay notificaciones sin leer' : 'No tienes notificaciones'}
          message={
            showOnlyUnread
              ? 'Todas las notificaciones están marcadas como leídas'
              : 'Aquí verás actualizaciones sobre tus pedidos'
          }
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header - Cute & Soft
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    shadowColor: isDark ? colors.black : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerGradient: {
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    backgroundColor: isDark ? 'rgba(42, 42, 42, 0.4)' : 'rgba(255, 255, 255, 0.8)',
    gap: spacing.md,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Notification Badge - Cute & Friendly
  notificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 12,
    flex: 1,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
  },
  notificationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationCountBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.secondary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: isDark ? colors.background : colors.white,
  },
  notificationCountText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationLabel: {
    ...typography.caption1,
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  notificationTitle: {
    ...typography.body,
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginTop: 3,
    letterSpacing: -0.5,
  },

  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  markAllButtonText: {
    ...typography.bodySmall,
    fontSize: 13,
    fontWeight: '800',
    color: colors.white,
  },

  // Filter - Cute & Soft
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background,
  },

  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 18,
    backgroundColor: `${colors.primary}08`,
    borderWidth: 1.5,
    borderColor: `${colors.primary}15`,
  },

  filterChipActive: {
    backgroundColor: `${colors.primary}12`,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },

  filterChipText: {
    ...typography.bodySmall,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '700',
  },

  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },

  filterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: `${colors.primary}12`,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
  },

  filterBadgeActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  filterBadgeText: {
    ...typography.caption1,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '800',
  },

  filterBadgeTextActive: {
    color: colors.white,
  },

  // Loading - Cute & Friendly
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    backgroundColor: `${colors.primary}05`,
    borderRadius: 20,
    padding: spacing.xl,
  },

  // List - Cute spacing
  listContent: {
    padding: spacing.lg,
    paddingBottom: 120,
    gap: spacing.sm,
  },

  // Section Header - Cute & Friendly
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    marginBottom: spacing.sm,
  },

  sectionTitle: {
    ...typography.bodyMedium,
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    textTransform: 'capitalize',
    letterSpacing: -0.5,
  },

  sectionBadge: {
    backgroundColor: `${colors.primary}12`,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
  },

  sectionCount: {
    ...typography.caption1,
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },

  // Letter Card - Paper Style
  notificationCard: {
    backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
    borderRadius: 8,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: isDark ? '#3a3a3a' : '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },

  notificationCardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: colors.secondary,
    backgroundColor: isDark ? '#2d2a2f' : '#fef9f9',
  },

  // Letter Header
  letterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: isDark ? '#252525' : '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#3a3a3a' : '#e5e7eb',
  },

  letterHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },

  iconEmoji: {
    fontSize: 22,
  },

  headerTextContent: {
    flex: 1,
  },

  title: {
    ...typography.bodyMedium,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: -0.2,
    marginBottom: 2,
  },

  titleUnread: {
    fontWeight: '800',
    color: colors.text,
  },

  time: {
    ...typography.caption1,
    fontSize: 10,
    color: colors.textTertiary,
    fontWeight: '600',
  },

  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
    flexShrink: 0,
  },

  // Letter Body
  letterBody: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
  },

  message: {
    ...typography.bodySmall,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },

  amountSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: isDark ? '#333' : '#f3f4f6',
  },

  amountLabel: {
    ...typography.caption1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  totalAmount: {
    ...typography.bodyMedium,
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -0.5,
  },

  // Letter Footer
  letterFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: isDark ? '#252525' : '#fafafa',
    borderTopWidth: 1,
    borderTopColor: isDark ? '#3a3a3a' : '#e5e7eb',
  },

  viewDetailsText: {
    ...typography.caption1,
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
