/**
 * Orders Screen - My Orders (Modernized)
 * Lista de pedidos del usuario con diseño moderno
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useOrders } from '../../src/hooks/useOrders';
import { OrderCard } from '../../src/components/orders/OrderCard';
import { EmptyState } from '../../src/components/common/EmptyState';
import { colors, spacing } from '../../src/theme';
import { textStyles as typography } from '../../src/theme/typography';
import { useRatingRequest, RatingModal } from '../../src/components/ratings';

type FilterOption = 'all' | 'active' | 'completed' | 'cancelled';

interface FilterOptionConfig {
  value: FilterOption;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const filterOptions: FilterOptionConfig[] = [
  { value: 'all', label: 'Todos', icon: 'receipt-outline', color: colors.primary },
  { value: 'active', label: 'Activos', icon: 'time-outline', color: '#FF9500' },
  { value: 'completed', label: 'Entregados', icon: 'checkmark-circle-outline', color: '#34C759' },
  { value: 'cancelled', label: 'Cancelados', icon: 'close-circle-outline', color: '#FF3B30' },
];

export default function OrdersScreen() {
  const {
    orders,
    filteredOrders,
    loading,
    error,
    refreshing,
    refresh,
    filter,
    setFilter,
  } = useOrders();

  // Sistema de calificación de pedidos
  const { shouldShowRatingModal, orderToRate, dismissRatingRequest, markAsRated } = useRatingRequest(orders);

  // Obtener estadísticas de pedidos
  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      active: orders.filter(o =>
        o.estado === 'pendiente_confirmacion' ||
        o.estado === 'confirmado' ||
        o.estado === 'en_proceso' ||
        o.estado === 'esperando_delivery' ||
        o.estado === 'en_camino' ||
        o.estado === 'esperando_retiro'
      ).length,
      completed: orders.filter(o => o.estado === 'entregado').length,
      cancelled: orders.filter(o => o.estado === 'cancelado' || o.estado === 'no_confirmado').length,
    };
    return stats;
  };

  const stats = getOrderStats();

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Modern Glass Header */}
        <View style={styles.navbar}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
            style={styles.navbarGradient}
          >
            <View style={styles.ordersBadge}>
              <View style={styles.ordersIconContainer}>
                <Ionicons name="receipt" size={22} color={colors.primary} />
              </View>
              <View style={styles.ordersTextContainer}>
                <Text style={styles.ordersLabel}>MIS PEDIDOS</Text>
                <Text style={styles.ordersTitle}>Cargando...</Text>
              </View>
            </View>
            <View style={styles.headerRight} />
          </LinearGradient>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando pedidos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Modern Glass Header */}
        <View style={styles.navbar}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
            style={styles.navbarGradient}
          >
            <View style={styles.ordersBadge}>
              <View style={styles.ordersIconContainer}>
                <Ionicons name="receipt" size={22} color={colors.primary} />
              </View>
              <View style={styles.ordersTextContainer}>
                <Text style={styles.ordersLabel}>MIS PEDIDOS</Text>
                <Text style={styles.ordersTitle}>Error</Text>
              </View>
            </View>
            <View style={styles.headerRight} />
          </LinearGradient>
        </View>
        <EmptyState
          icon="alert-circle-outline"
          title="Error al cargar"
          message={error}
          actionLabel="Reintentar"
          onAction={refresh}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Modern Glass Header */}
      <View style={styles.navbar}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
          style={styles.navbarGradient}
        >
          <View style={styles.ordersBadge}>
            <View style={styles.ordersIconContainer}>
              <Ionicons name="receipt" size={22} color={colors.primary} />
              {stats.total > 0 && (
                <View style={styles.ordersCountBadge}>
                  <Text style={styles.ordersCountText}>{stats.total}</Text>
                </View>
              )}
            </View>
            <View style={styles.ordersTextContainer}>
              <Text style={styles.ordersLabel}>MIS PEDIDOS</Text>
              <Text style={styles.ordersTitle}>
                {stats.total === 0 ? 'Sin pedidos' : `${stats.total} ${stats.total === 1 ? 'pedido' : 'pedidos'}`}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight} />
        </LinearGradient>
      </View>

      {/* Modern Filters with Icons */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={filterOptions}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => {
            const isActive = filter === item.value;
            const count = item.value === 'all' ? stats.total :
                         item.value === 'active' ? stats.active :
                         item.value === 'completed' ? stats.completed :
                         stats.cancelled;

            return (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  isActive && [styles.filterChipActive, { borderColor: item.color }],
                ]}
                onPress={() => setFilter(item.value)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.filterIconContainer,
                  isActive && { backgroundColor: item.color }
                ]}>
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={isActive ? colors.white : item.color}
                  />
                </View>
                <View style={styles.filterTextContainer}>
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {count > 0 && (
                    <View style={[
                      styles.countBadge,
                      isActive && { backgroundColor: item.color }
                    ]}>
                      <Text style={[
                        styles.countBadgeText,
                        isActive && styles.countBadgeTextActive
                      ]}>
                        {count}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        />
      </View>

      {/* Orders List or Empty State */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={filter === 'all' ? 'receipt-outline' : 'search-outline'}
          title={filter === 'all' ? 'No tienes pedidos' : 'No hay pedidos'}
          message={
            filter === 'all'
              ? 'Tus pedidos aparecerán aquí cuando hagas una compra'
              : `No tienes pedidos en la categoría "${filterOptions.find(f => f.value === filter)?.label}"`
          }
          actionLabel={filter !== 'all' ? 'Ver todos' : undefined}
          onAction={filter !== 'all' ? () => setFilter('all') : undefined}
        />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal de calificación */}
      {shouldShowRatingModal && orderToRate && (
        <RatingModal
          visible={shouldShowRatingModal}
          onClose={dismissRatingRequest}
          pedidoId={orderToRate.id}
          empresaNombre={orderToRate.empresa?.name || 'la empresa'}
          tipoEntrega={orderToRate.tipoEntrega}
          productos={orderToRate.ItemPedido || []}
          onSuccess={() => {
            markAsRated();
            refresh(); // Refrescar pedidos después de calificar
          }}
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

  // Modern Glass Header
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

  // Orders Badge
  ordersBadge: {
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
  ordersIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ordersCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  ordersCountText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  ordersTextContainer: {
    flex: 1,
  },
  ordersLabel: {
    ...typography.caption1,
    fontSize: 10,
    fontWeight: '600',
    color: colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ordersTitle: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '800',
    color: colors.gray900,
    marginTop: 2,
  },
  headerRight: {
    width: 36,
  },

  // Filters Container
  filtersContainer: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  filtersContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },

  // Modern Filter Chips
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.gray50,
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing.xs,
  },
  filterChipActive: {
    backgroundColor: colors.white,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  filterChipText: {
    ...typography.bodySmall,
    color: colors.gray700,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.gray900,
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: colors.gray200,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    ...typography.caption1,
    fontSize: 11,
    color: colors.gray700,
    fontWeight: '700',
  },
  countBadgeTextActive: {
    color: colors.white,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.gray600,
    marginTop: spacing.md,
  },

  // List Content
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
});
