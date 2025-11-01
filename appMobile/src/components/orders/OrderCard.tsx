/**
 * Order Card Component
 * Tarjeta que muestra la información de un pedido
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PedidoWithDetails } from '../../types/order';
import { OrderStatusBadge } from './OrderStatusBadge';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { textStyles as typography } from '../../theme/typography';

interface OrderCardProps {
  order: PedidoWithDetails;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/order/${order.id}` as any);
  };

  const handleTrackDelivery = (e: any) => {
    e.stopPropagation();
    router.push(`/order/${order.id}?showMap=true` as any);
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalItems = order.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.orderNumber}>Pedido #{order.id.slice(0, 8)}</Text>
          <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
        </View>
        <OrderStatusBadge status={order.estado as any} />
      </View>

      {/* Company Info */}
      <View style={styles.companySection}>
        {order.empresa?.logo && (
          <Image
            source={{ uri: order.empresa.logo }}
            style={styles.companyLogo}
          />
        )}
        <View style={styles.companyInfo}>
          <Text style={styles.companyName} numberOfLines={1}>
            {order.empresa?.name || 'Empresa'}
          </Text>
          <View style={styles.itemsRow}>
            <Ionicons name="cube-outline" size={14} color={colors.gray600} />
            <Text style={styles.itemsText}>
              {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
            </Text>
          </View>
        </View>
      </View>

      {/* Delivery Info */}
      <View style={styles.deliverySection}>
        <View style={styles.deliveryRow}>
          <Ionicons
            name={order.tipoEntrega === 'delivery' ? 'bicycle' : 'bag-handle'}
            size={16}
            color={colors.gray600}
          />
          <Text style={styles.deliveryText}>
            {order.tipoEntrega === 'delivery' ? 'Delivery' : 'Retiro en local'}
          </Text>
        </View>

        {order.tipoEntrega === 'delivery' && order.direccionEntrega && (
          <Text style={styles.address} numberOfLines={1}>
            {order.direccionEntrega}
          </Text>
        )}
      </View>

      {/* En camino indicator */}
      {order.estado === 'en_camino' && order.tipoEntrega === 'delivery' && (
        <TouchableOpacity
          style={styles.trackingBanner}
          onPress={handleTrackDelivery}
          activeOpacity={0.7}
        >
          <View style={styles.trackingContent}>
            <Ionicons name="location" size={20} color={colors.white} />
            <Text style={styles.trackingText}>Tu pedido está en camino</Text>
          </View>
          <Ionicons name="map" size={20} color={colors.white} />
        </TouchableOpacity>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>
            ${(order.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </Text>
        </View>

        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },

  headerLeft: {
    flex: 1,
  },

  orderNumber: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: spacing.xs,
  },

  date: {
    ...typography.bodySmall,
    color: colors.gray600,
  },

  companySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },

  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    marginRight: spacing.sm,
  },

  companyInfo: {
    flex: 1,
  },

  companyName: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.xs,
  },

  itemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  itemsText: {
    ...typography.bodySmall,
    color: colors.gray600,
  },

  deliverySection: {
    marginBottom: spacing.md,
  },

  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },

  deliveryText: {
    ...typography.bodySmall,
    color: colors.gray700,
    fontWeight: '500',
  },

  address: {
    ...typography.bodySmall,
    color: colors.gray600,
    marginLeft: 24,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },

  totalLabel: {
    ...typography.bodyMedium,
    color: colors.gray600,
  },

  totalAmount: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.primary,
  },

  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  trackingBanner: {
    backgroundColor: colors.orange,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  trackingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  trackingText: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: '600',
  },
});
