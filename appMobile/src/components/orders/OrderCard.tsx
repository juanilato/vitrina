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
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray50,
  },

  headerLeft: {
    flex: 1,
  },

  orderNumber: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },

  date: {
    ...typography.bodySmall,
    fontSize: 12,
    color: colors.gray500,
  },

  companySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray50,
  },

  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.gray50,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray100,
  },

  companyInfo: {
    flex: 1,
  },

  companyName: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: spacing.xs,
    fontSize: 15,
  },

  itemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.gray50,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },

  itemsText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: colors.gray700,
    fontWeight: '600',
  },

  deliverySection: {
    marginBottom: spacing.md,
    backgroundColor: colors.gray50,
    padding: spacing.sm,
    borderRadius: 10,
  },

  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },

  deliveryText: {
    ...typography.bodySmall,
    color: colors.gray900,
    fontWeight: '600',
    fontSize: 13,
  },

  address: {
    ...typography.bodySmall,
    fontSize: 12,
    color: colors.gray600,
    marginLeft: 24,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray50,
  },

  totalSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },

  totalLabel: {
    ...typography.bodyMedium,
    fontSize: 13,
    color: colors.gray600,
    fontWeight: '500',
  },

  totalAmount: {
    ...typography.h3,
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.5,
  },

  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },

  trackingBanner: {
    backgroundColor: colors.orange,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  trackingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  trackingText: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: '700',
  },
});
