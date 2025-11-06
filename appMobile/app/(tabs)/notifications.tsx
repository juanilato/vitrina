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
import { colors, spacing } from '../../src/theme';
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
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

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
        <View style={styles.notificationContent}>
          {/* Icon con gradiente */}
          <LinearGradient
            colors={style.gradientColors as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            {item.metadata?.icono ? (
              <Text style={styles.iconEmoji}>{item.metadata.icono}</Text>
            ) : (
              <Ionicons name={style.icon} size={24} color="#fff" />
            )}
          </LinearGradient>

          {/* Content */}
          <View style={styles.textContent}>
            <View style={styles.titleRow}>
              <Text style={[styles.title, !item.leida && styles.titleUnread]} numberOfLines={1}>
                {item.titulo}
              </Text>
              {!item.leida && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.message} numberOfLines={2}>
              {item.mensaje}
            </Text>
            <View style={styles.footer}>
              {item.metadata?.totalAmount && (
                <Text style={styles.totalAmount}>
                  ${item.metadata.totalAmount.toLocaleString('es-AR')}
                </Text>
              )}
              <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
            </View>
          </View>

          {/* Chevron */}
          <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
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
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
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
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
          style={styles.headerGradient}
        >
          <View style={styles.notificationBadge}>
            <View style={styles.notificationIconContainer}>
              <Ionicons name="notifications" size={22} color={colors.primary} />
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

          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
              <Ionicons name="checkmark-done" size={18} color={colors.secondary} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header - Modern Glass Design
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },

  // Notification Badge
  notificationBadge: {
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
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.secondary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationCountText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationLabel: {
    ...typography.caption1,
    fontSize: 10,
    fontWeight: '600',
    color: colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notificationTitle: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '800',
    color: colors.gray900,
    marginTop: 2,
  },

  markAllButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Filter
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },

  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  filterChipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },

  filterChipText: {
    ...typography.bodySmall,
    fontSize: 13,
    color: colors.gray700,
    fontWeight: '600',
  },

  filterChipTextActive: {
    color: colors.white,
  },

  filterBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: colors.gray300,
  },

  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  filterBadgeText: {
    ...typography.caption1,
    fontSize: 11,
    color: colors.gray700,
    fontWeight: '700',
  },

  filterBadgeTextActive: {
    color: colors.white,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // List
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100, // Space for tab bar
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },

  sectionTitle: {
    ...typography.bodyMedium,
    fontSize: 15,
    fontWeight: '700',
    color: colors.gray900,
    textTransform: 'capitalize',
  },

  sectionBadge: {
    backgroundColor: colors.gray200,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  sectionCount: {
    ...typography.caption1,
    fontSize: 11,
    fontWeight: '700',
    color: colors.gray700,
  },

  // Notification Card
  notificationCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  notificationCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
    backgroundColor: `${colors.secondary}05`,
  },

  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  iconEmoji: {
    fontSize: 26,
  },

  textContent: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },

  title: {
    ...typography.bodyMedium,
    fontSize: 15,
    fontWeight: '600',
    color: colors.gray700,
    flex: 1,
  },

  titleUnread: {
    fontWeight: '700',
    color: colors.gray900,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },

  message: {
    ...typography.bodySmall,
    fontSize: 13,
    color: colors.gray600,
    lineHeight: 18,
    marginBottom: 6,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  totalAmount: {
    ...typography.bodySmall,
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondary,
  },

  time: {
    ...typography.caption1,
    fontSize: 11,
    color: colors.gray500,
    fontWeight: '500',
  },
});
