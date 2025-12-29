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
import { Logo } from '../../src/components/common/Logo';
import { normalize } from '../../src/utils/responsive';

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
                <Text style={styles.logoText}>Vitrina • Pedidos</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando pedidos...</Text>
        </View>
      </View>
    );
  }

  if (error) {
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
                <Text style={styles.logoText}>Vitrina • Pedidos</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
        <EmptyState
          icon="alert-circle-outline"
          title="Error al cargar"
          message={error}
          actionLabel="Reintentar"
          onAction={refresh}
        />
      </View>
    );
  }

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
              <Text style={styles.logoText}>Vitrina • Pedidos</Text>
            </View>
          </View>

          {/* Info de pedidos */}
          {stats.total > 0 && (
            <View style={styles.ordersInfo}>
              <Text style={styles.ordersInfoText}>
                {stats.total} {stats.total === 1 ? 'pedido' : 'pedidos'}
                {stats.active > 0 && ` • ${stats.active} activos`}
              </Text>
            </View>
          )}

          {/* Filtros integrados en el header */}
          <View style={styles.headerFilters}>
            {filterOptions.map((item) => {
              const isActive = filter === item.value;
              const count = item.value === 'all' ? stats.total :
                           item.value === 'active' ? stats.active :
                           item.value === 'completed' ? stats.completed :
                           stats.cancelled;

              return (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.headerFilterChip,
                    isActive && styles.headerFilterChipActive,
                  ]}
                  onPress={() => setFilter(item.value)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.icon}
                    size={normalize(14)}
                    color={isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)'}
                  />
                  <Text
                    style={[
                      styles.headerFilterText,
                      isActive && styles.headerFilterTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {count > 0 && (
                    <View style={[
                      styles.headerFilterBadge,
                      isActive && styles.headerFilterBadgeActive
                    ]}>
                      <Text style={styles.headerFilterBadgeText}>
                        {count}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </SafeAreaView>
      </LinearGradient>

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

  // Orders Info - Simple y limpio
  ordersInfo: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: normalize(12),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  ordersInfoText: {
    ...typography.body,
    fontSize: normalize(14),
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
  },

  // Filtros en el header
  headerFilters: {
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

  // Loading State - Cute & Friendly
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    backgroundColor: `${colors.primary}05`,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${colors.primary}10`,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontSize: 14,
    fontWeight: '600',
  },

  // List Content - Cute spacing
  listContent: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
});
