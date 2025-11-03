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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PedidoWithDetails, OrderStatus } from '../../types/order';
import { colors, textStyles, spacing } from '../../theme';
import { formatPrice } from '../../utils/formatPrice';

const { width } = Dimensions.get('window');

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

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <LinearGradient
          colors={statusConfig.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          {/* Header con estado */}
          <View style={styles.header}>
            <View style={styles.statusContainer}>
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
                size={24}
                color={colors.white}
                style={styles.statusIcon}
              />
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusLabel}>Pedido Activo</Text>
                <Text style={styles.statusText}>{statusConfig.label}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handlePress}>
              <Ionicons name="chevron-forward" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Información del pedido */}
          <View style={styles.content}>
            {/* Empresa */}
            {order.empresa && (
              <View style={styles.row}>
                <Ionicons name="storefront" size={18} color={colors.white} />
                <Text style={styles.infoText}>{order.empresa.name}</Text>
              </View>
            )}

            {/* Número de artículos */}
            <View style={styles.row}>
              <Ionicons name="cart" size={18} color={colors.white} />
              <Text style={styles.infoText}>
                {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
              </Text>
            </View>

            {/* Tipo de entrega */}
            <View style={styles.row}>
              <Ionicons
                name={order.tipoEntrega === 'delivery' ? 'bicycle' : 'walk'}
                size={18}
                color={colors.white}
              />
              <Text style={styles.infoText}>
                {order.tipoEntrega === 'delivery' ? 'Delivery' : 'Retiro en local'}
              </Text>
            </View>

            {/* Total */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{formatPrice(total)}</Text>
            </View>
          </View>

          {/* Footer - Ver detalles */}
          <TouchableOpacity style={styles.detailsButton} onPress={handlePress}>
            <Text style={styles.detailsButtonText}>Ver detalles del pedido</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </TouchableOpacity>
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
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pulseCircle: {
    position: 'absolute',
    left: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    opacity: 0.3,
  },
  statusIcon: {
    marginRight: spacing.sm,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    ...textStyles.caption2,
    fontSize: 11,
    color: colors.white,
    opacity: 0.9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusText: {
    ...textStyles.subheadline,
    fontSize: 16,
    color: colors.white,
    fontWeight: '700',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.white,
    opacity: 0.2,
    marginBottom: spacing.md,
  },
  content: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoText: {
    ...textStyles.body,
    fontSize: 14,
    color: colors.white,
    fontWeight: '500',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  totalLabel: {
    ...textStyles.body,
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
  totalAmount: {
    ...textStyles.headline,
    fontSize: 20,
    color: colors.white,
    fontWeight: '700',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    gap: spacing.xs,
  },
  detailsButtonText: {
    ...textStyles.body,
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
});
