/**
 * ActiveOrderCard Component
 * Componente para mostrar el pedido activo con animaciones
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PedidoWithDetails, OrderStatus } from '../../types/order';
import { colors, textStyles, spacing } from '../../theme';
import { formatPrice } from '../../utils/formatPrice';
import { OrderStatusTimeline } from './OrderStatusTimeline';

interface ActiveOrderCardProps {
  order: PedidoWithDetails;
}

// Configuración de estados del pedido
const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    gradientColors: string[];
    pulseColor: string;
  }
> = {
  pendiente_confirmacion: {
    label: 'Esperando confirmación',
    icon: 'time-outline',
    gradientColors: ['#F26B1D', '#F4843D'],
    pulseColor: '#F26B1D',
  },
  confirmado: {
    label: 'Confirmado',
    icon: 'checkmark-circle-outline',
    gradientColors: ['#2E9D66', '#3DB378'],
    pulseColor: '#2E9D66',
  },
  en_proceso: {
    label: 'En preparación',
    icon: 'restaurant-outline',
    gradientColors: ['#007ACC', '#1A8FDB'],
    pulseColor: '#007ACC',
  },
  esperando_delivery: {
    label: 'Esperando repartidor',
    icon: 'bicycle-outline',
    gradientColors: ['#F26B1D', '#F4843D'],
    pulseColor: '#F26B1D',
  },
  en_camino: {
    label: 'En camino',
    icon: 'bicycle',
    gradientColors: ['#0A2A43', '#0D3354'],
    pulseColor: '#0A2A43',
  },
  entregado: {
    label: 'Entregado',
    icon: 'checkmark-done-circle',
    gradientColors: ['#2E9D66', '#3DB378'],
    pulseColor: '#2E9D66',
  },
  esperando_retiro: {
    label: 'Listo para retiro',
    icon: 'storefront-outline',
    gradientColors: ['#2E9D66', '#3DB378'],
    pulseColor: '#2E9D66',
  },
  no_confirmado: {
    label: 'No confirmado',
    icon: 'close-circle-outline',
    gradientColors: ['#DC2626', '#EF4444'],
    pulseColor: '#DC2626',
  },
  cancelado: {
    label: 'Cancelado',
    icon: 'ban-outline',
    gradientColors: ['#737373', '#A3A3A3'],
    pulseColor: '#737373',
  },
};

export const ActiveOrderCard: React.FC<ActiveOrderCardProps> = ({ order }) => {
  const router = useRouter();
  const statusConfig = ORDER_STATUS_CONFIG[order.estado];

  // Animaciones
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in al montar
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Animación de pulso continua solo para estados activos
    const activeStates: OrderStatus[] = [
      'pendiente_confirmacion',
      'confirmado',
      'en_proceso',
      'esperando_delivery',
      'en_camino',
      'esperando_retiro',
    ];

    if (activeStates.includes(order.estado)) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    }
  }, [order.estado]);

  const handlePress = () => {
    router.push(`/order/${order.id}`);
  };

  // Calcular total
  const total = order.total || 0;
  const itemCount = order.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0;

  // Verificar si el estado es activo
  const activeStates: OrderStatus[] = [
    'pendiente_confirmacion',
    'confirmado',
    'en_proceso',
    'esperando_delivery',
    'en_camino',
    'esperando_retiro',
  ];
  const isActiveState = activeStates.includes(order.estado);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <LinearGradient
          colors={statusConfig.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          {/* Header con estado - Compacto */}
          <View style={styles.header}>
            <View style={styles.statusContainer}>
              {isActiveState && (
                <>
                  <Animated.View
                    style={[
                      styles.pulseCircle,
                      {
                        backgroundColor: statusConfig.pulseColor,
                        transform: [{ scale: pulseAnim }],
                      },
                    ]}
                  />
                  <Ionicons
                    name={statusConfig.icon}
                    size={20}
                    color={colors.white}
                    style={styles.statusIcon}
                  />
                </>
              )}
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusLabel}>
                  {order.empresa?.name || 'Pedido'} • {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </Text>
              </View>
            </View>
            <View style={styles.rightSection}>
              <Text style={styles.totalAmount}>{formatPrice(total)}</Text>
            </View>
          </View>

          {/* Timeline Compacto Animado */}
          <View style={styles.timelineContainer}>
            <OrderStatusTimeline
              currentStatus={order.estado}
              tipoEntrega={order.tipoEntrega}
              compact={true}
            />
          </View>

          {/* Footer con tipo de entrega */}
          <View style={styles.footer}>
            <View style={styles.infoRow}>
              <View style={styles.infoBadge}>
                <Ionicons
                  name={order.tipoEntrega === 'delivery' ? 'bicycle' : 'walk'}
                  size={12}
                  color={colors.white}
                />
                <Text style={styles.badgeText}>
                  {order.tipoEntrega === 'delivery' ? 'Delivery' : 'Retiro'}
                </Text>
              </View>

              {/* Tiempo estimado si está disponible */}
              {order.tiempoTotalEstimado && order.tiempoTotalEstimado > 0 && (
                <View style={styles.etaBadge}>
                  <Ionicons name="time-outline" size={12} color={colors.white} />
                  <Text style={styles.etaText}>
                    {order.tiempoTotalEstimado} min
                  </Text>
                </View>
              )}

              <Ionicons name="chevron-forward" size={16} color={colors.white} />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  gradientCard: {
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pulseCircle: {
    position: 'absolute',
    left: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.3,
  },
  statusIcon: {
    marginRight: spacing.xs,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    ...textStyles.caption2,
    fontSize: 10,
    color: colors.white,
    opacity: 0.85,
    fontWeight: '500',
    marginTop: 1,
  },
  statusText: {
    ...textStyles.subheadline,
    fontSize: 13,
    color: colors.white,
    fontWeight: '700',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    ...textStyles.headline,
    fontSize: 16,
    color: colors.white,
    fontWeight: '800',
  },
  timelineContainer: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    ...textStyles.caption2,
    fontSize: 11,
    color: colors.white,
    fontWeight: '600',
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: 6,
  },
  etaText: {
    ...textStyles.caption2,
    fontSize: 11,
    color: colors.white,
    fontWeight: '700',
  },
  detailsLink: {
    ...textStyles.caption1,
    fontSize: 11,
    color: colors.white,
    fontWeight: '600',
    opacity: 0.9,
  },
});
