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
import { Logo } from '../../src/components/common/Logo';
import { normalize } from '../../src/utils/responsive';

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
      <View style={styles.container}>
        {/* Header con degradado azul igual al home */}
        <LinearGradient
          colors={['#0A2A43', '#0D3354']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <SafeAreaView edges={['top']} style={styles.safeArea}>
            <View style={styles.topBar}>
              <View style={styles.logoSection}>
                <Logo variant="icon" size={20} />
                <Text style={styles.logoText}>Vitrina • Notificaciones</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  const totalNotifications = showOnlyUnread
    ? notifications.filter(n => !n.leida).length
    : notifications.length;

  return (
    <View style={styles.container}>
      {/* Header con degradado azul igual al home */}
      <LinearGradient
        colors={['#0A2A43', '#0D3354']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.topBar}>
            <View style={styles.logoSection}>
              <Logo variant="icon" size={20} />
              <Text style={styles.logoText}>Vitrina • Notificaciones</Text>
            </View>
          </View>

          {/* Info de notificaciones */}
          {totalNotifications > 0 && (
            <View style={styles.notificationsInfo}>
              <Text style={styles.notificationsInfoText}>
                {totalNotifications} {totalNotifications === 1 ? 'notificación' : 'notificaciones'}
                {unreadCount > 0 && ` • ${unreadCount} sin leer`}
              </Text>
            </View>
          )}

          {/* Filtros y acción en el header */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerFilterChip, !showOnlyUnread && styles.headerFilterChipActive]}
              onPress={() => setShowOnlyUnread(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.headerFilterText, !showOnlyUnread && styles.headerFilterTextActive]}>
                Todas
              </Text>
              <View style={[styles.headerFilterBadge, !showOnlyUnread && styles.headerFilterBadgeActive]}>
                <Text style={styles.headerFilterBadgeText}>{notifications.length}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerFilterChip, showOnlyUnread && styles.headerFilterChipActive]}
              onPress={() => setShowOnlyUnread(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.headerFilterText, showOnlyUnread && styles.headerFilterTextActive]}>
                No leídas
              </Text>
              {unreadCount > 0 && (
                <View style={[styles.headerFilterBadge, showOnlyUnread && styles.headerFilterBadgeActive]}>
                  <Text style={styles.headerFilterBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
                <Ionicons name="checkmark-done" size={normalize(16)} color="rgba(255, 255, 255, 0.95)" />
                <Text style={styles.markAllButtonText}>Marcar leídas</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

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
    </View>
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

  // Top bar - Logo a la izquierda
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  logoText: {
    ...typography.headline,
    fontSize: normalize(20),
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: -0.5,
  },

  // Notifications Info - Simple y limpio
  notificationsInfo: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: normalize(12),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  notificationsInfoText: {
    ...typography.body,
    fontSize: normalize(14),
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
  },

  // Acciones en el header
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  headerFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(6),
    borderRadius: normalize(12),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerFilterChipActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  headerFilterText: {
    ...typography.caption1,
    fontSize: normalize(11),
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  headerFilterTextActive: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '700',
  },
  headerFilterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: normalize(8),
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(2),
    minWidth: normalize(18),
    alignItems: 'center',
  },
  headerFilterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerFilterBadgeText: {
    ...typography.caption1,
    fontSize: normalize(10),
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.95)',
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(6),
    borderRadius: normalize(12),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  markAllButtonText: {
    ...typography.caption1,
    fontSize: normalize(11),
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
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
