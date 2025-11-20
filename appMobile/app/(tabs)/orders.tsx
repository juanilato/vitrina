/**
 * Orders Screen - My Orders (Modernized)
 * Lista de pedidos del usuario con diseño moderno
 */

import React, { useState, useEffect, useMemo } from 'react';
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
import { spacing } from '../../src/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { textStyles as typography } from '../../src/theme/typography';
import { useRatingRequest, RatingModal } from '../../src/components/ratings';
import ratingService from '../../src/services/rating.service';
import { PedidoWithDetails } from '../../src/types/order';

type FilterOption = 'all' | 'active' | 'completed' | 'cancelled';

interface FilterOptionConfig {
  value: FilterOption;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export default function OrdersScreen() {
  const { colors, isDark } = useTheme();

  const filterOptions: FilterOptionConfig[] = useMemo(() => [
    { value: 'all', label: 'Todos', icon: 'receipt-outline', color: colors.primary },
    { value: 'active', label: 'Activos', icon: 'time-outline', color: '#FF9500' },
    { value: 'completed', label: 'Entregados', icon: 'checkmark-circle-outline', color: '#34C759' },
    { value: 'cancelled', label: 'Cancelados', icon: 'close-circle-outline', color: '#FF3B30' },
  ], [colors.primary]);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
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

  // Estado para manejar calificaciones manuales
  const [manualRatingOrder, setManualRatingOrder] = useState<PedidoWithDetails | null>(null);
  const [showManualRatingModal, setShowManualRatingModal] = useState(false);
  const [orderRatings, setOrderRatings] = useState<Record<string, { promedio: number; totalValoraciones: number }>>({});

  // Cargar calificaciones para todos los pedidos entregados
  useEffect(() => {
    const loadRatings = async () => {
      const deliveredOrders = orders.filter(order => order.estado === 'entregado');

      for (const order of deliveredOrders) {
        try {
          const rating = await ratingService.getRatingByOrder(order.id);
          if (rating) {
            setOrderRatings(prev => ({
              ...prev,
              [order.id]: {
                promedio: rating.calificacionEmpresa,
                totalValoraciones: 1
              }
            }));
          }
        } catch (error) {
          console.error(`Error loading rating for order ${order.id}:`, error);
        }
      }
    };

    if (orders.length > 0) {
      loadRatings();
    }
  }, [orders]);

  const handleRatePress = (order: PedidoWithDetails) => {
    setManualRatingOrder(order);
    setShowManualRatingModal(true);
  };

  const handleManualRatingSuccess = async () => {
    setShowManualRatingModal(false);
    const orderId = manualRatingOrder?.id;
    setManualRatingOrder(null);

    // Cargar la nueva valoración inmediatamente
    if (orderId) {
      try {
        const rating = await ratingService.getRatingByOrder(orderId);
        if (rating) {
          setOrderRatings(prev => ({
            ...prev,
            [orderId]: {
              promedio: rating.calificacionEmpresa,
              totalValoraciones: 1
            }
          }));
        }
      } catch (error) {
        console.error('Error loading new rating:', error);
      }
    }

    refresh(); // Refrescar pedidos después de calificar
  };

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
            colors={isDark
              ? ['rgba(30, 30, 30, 0.95)', 'rgba(30, 30, 30, 0.85)']
              : ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']
            }
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
            colors={isDark
              ? ['rgba(30, 30, 30, 0.95)', 'rgba(30, 30, 30, 0.85)']
              : ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']
            }
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

      {/* Compact Filters - Modern Grid Layout */}
      <View style={styles.filtersContainer}>
        <View style={styles.filtersGrid}>
          {filterOptions.map((item, index) => {
            const isActive = filter === item.value;
            const count = item.value === 'all' ? stats.total :
                         item.value === 'active' ? stats.active :
                         item.value === 'completed' ? stats.completed :
                         stats.cancelled;

            // Patrón: largo, corto, corto, largo
            const widthStyle = index === 0 || index === 3
              ? { width: '58%' as const }
              : { width: '40%' as const };

            return (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.filterChip,
                  widthStyle,
                  isActive && [styles.filterChipActive, { backgroundColor: `${item.color}10` }],
                ]}
                onPress={() => setFilter(item.value)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon}
                  size={16}
                  color={isActive ? item.color : colors.gray500}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && { color: item.color, fontWeight: '700' },
                  ]}
                  numberOfLines={1}
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
              </TouchableOpacity>
            );
          })}
        </View>
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
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              rating={orderRatings[item.id]}
              onRatePress={() => handleRatePress(item)}
            />
          )}
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

      {/* Modal de calificación automático (después de 10 minutos) */}
      {shouldShowRatingModal && orderToRate && (
        <RatingModal
          visible={shouldShowRatingModal}
          onClose={dismissRatingRequest}
          pedidoId={orderToRate.id}
          empresaNombre={orderToRate.empresa?.name || 'la empresa'}
          tipoEntrega={orderToRate.tipoEntrega}
          productos={(orderToRate.items || orderToRate.ItemPedido || []).map((item: any) => ({
            id: item.id,
            producto: {
              id: item.producto?.id || item.productoId || '',
              nombre: item.producto?.nombre || 'Producto'
            }
          }))}
          onSuccess={async () => {
            markAsRated();

            // Cargar la nueva valoración inmediatamente
            try {
              const rating = await ratingService.getRatingByOrder(orderToRate.id);
              if (rating) {
                setOrderRatings(prev => ({
                  ...prev,
                  [orderToRate.id]: {
                    promedio: rating.calificacionEmpresa,
                    totalValoraciones: 1
                  }
                }));
              }
            } catch (error) {
              console.error('Error loading new rating:', error);
            }

            refresh(); // Refrescar pedidos después de calificar
          }}
        />
      )}

      {/* Modal de calificación manual (al presionar botón) */}
      {showManualRatingModal && manualRatingOrder && (
        <RatingModal
          visible={showManualRatingModal}
          onClose={() => {
            setShowManualRatingModal(false);
            setManualRatingOrder(null);
          }}
          pedidoId={manualRatingOrder.id}
          empresaNombre={manualRatingOrder.empresa?.name || 'la empresa'}
          tipoEntrega={manualRatingOrder.tipoEntrega}
          productos={(manualRatingOrder.items || manualRatingOrder.ItemPedido || []).map((item: any) => ({
            id: item.id,
            producto: {
              id: item.producto?.id || item.productoId || '',
              nombre: item.producto?.nombre || 'Producto'
            }
          }))}
          onSuccess={handleManualRatingSuccess}
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

  // Modern Glass Header
  navbar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: isDark ? colors.black : '#000',
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
    borderColor: isDark ? 'rgba(58, 58, 58, 0.5)' : 'rgba(255, 255, 255, 0.5)',
  },

  // Orders Badge
  ordersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(42, 42, 42, 0.6)' : 'rgba(255, 255, 255, 0.6)',
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
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ordersTitle: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  headerRight: {
    width: 36,
  },

  // Compact Filters Container
  filtersContainer: {
    backgroundColor: colors.card,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },

  // Compact Filter Chips
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.gray50,
    gap: 5,
  },
  filterChipActive: {
    borderWidth: 1.5,
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    shadowColor: isDark ? colors.black : '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  filterChipText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: colors.gray200,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontSize: 10,
    color: colors.text,
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
    color: colors.textSecondary,
    marginTop: spacing.md,
  },

  // List Content
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
});
