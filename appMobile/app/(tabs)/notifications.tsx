/**
 * Notifications Screen
 * Displays all user notifications with filtering and actions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNotifications } from '../../src/contexts/NotificationsContext';
import { Notification } from '../../src/types/notification';
import { colors, spacing } from '../../src/theme';
import { textStyles as typography } from '../../src/theme/typography';

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
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      'Marcar todas como leídas',
      '¿Deseas marcar todas las notificaciones como leídas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: markAllAsRead },
      ]
    );
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.leida) {
      await markAsRead(notification.id);
    }

    // Navigate based on type
    if (notification.tipo === 'pedido_creado' || notification.tipo === 'pedido_actualizado') {
      if (notification.metadata?.pedidoId) {
        router.push(`/order/${notification.metadata.pedidoId}` as any);
      }
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    Alert.alert(
      'Eliminar notificación',
      '¿Deseas eliminar esta notificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteNotification(notificationId) },
      ]
    );
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'pedido_creado':
        return { name: 'receipt' as const, color: colors.success, bg: '#E8F5EE' };
      case 'pedido_actualizado':
        return { name: 'refresh-circle' as const, color: colors.accent, bg: '#E5F4FF' };
      case 'pedido_rechazado':
        return { name: 'close-circle' as const, color: colors.error, bg: '#FFE5E5' };
      default:
        return { name: 'notifications' as const, color: colors.primary, bg: '#E8EEF3' };
    }
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;

    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
    });
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter((n) => !n.leida);

  const renderNotification = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.tipo);

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.leida && styles.notificationCardUnread]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: icon.bg }]}>
            {item.metadata?.icono ? (
              <Text style={styles.iconEmoji}>{item.metadata.icono}</Text>
            ) : (
              <Ionicons name={icon.name} size={24} color={icon.color} />
            )}
          </View>

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
            {item.metadata?.totalAmount && (
              <Text style={styles.totalAmount}>
                ${item.metadata.totalAmount.toLocaleString('es-AR')}
              </Text>
            )}
            <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          </View>

          {/* Delete button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteNotification(item.id);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.gray400} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notificaciones</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Marcar todas</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Todas {notifications.length > 0 && `(${notifications.length})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'unread' && styles.filterTabActive]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
            No leídas {unreadCount > 0 && `(${unreadCount})`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={80} color={colors.gray300} />
          <Text style={styles.emptyTitle}>
            {filter === 'all' ? 'No tienes notificaciones' : 'No tienes notificaciones sin leer'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {filter === 'all'
              ? 'Aquí verás actualizaciones sobre tus pedidos'
              : 'Todas las notificaciones están marcadas como leídas'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContent}
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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },

  headerTitle: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '700',
  },

  markAllButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  markAllText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
  },

  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },

  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.gray100,
  },

  filterTabActive: {
    backgroundColor: colors.secondary,
  },

  filterText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },

  filterTextActive: {
    color: colors.white,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  listContent: {
    padding: spacing.lg,
  },

  notificationCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  notificationCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },

  notificationContent: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconEmoji: {
    fontSize: 28,
  },

  textContent: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },

  title: {
    ...typography.bodyMedium,
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
    color: colors.gray600,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },

  totalAmount: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: spacing.xs,
  },

  date: {
    ...typography.caption1,
    color: colors.gray500,
  },

  deleteButton: {
    padding: spacing.xs,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },

  emptyTitle: {
    ...typography.h3,
    color: colors.gray900,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  emptySubtitle: {
    ...typography.bodyMedium,
    color: colors.gray600,
    textAlign: 'center',
  },
});
