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
import { RatingStars } from '../common/RatingStars';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { textStyles as typography } from '../../theme/typography';

interface OrderCardProps {
  order: PedidoWithDetails;
  rating?: { promedio: number; totalValoraciones: number } | null;
  onRatePress?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, rating, onRatePress }) => {
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
      {/* Header con estado y fecha */}
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
        <OrderStatusBadge status={order.estado as any} />
      </View>

      {/* Company Info - Destacada */}
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
        </View>
      </View>

      {/* Lista de productos */}
      {order.items && order.items.length > 0 && (
        <View style={styles.productsSection}>
          <Text style={styles.productsTitle}>Productos:</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.productItem}>
              <View style={styles.productQuantityBadge}>
                <Text style={styles.productQuantityText}>{item.cantidad}x</Text>
              </View>
              <Text style={styles.productName} numberOfLines={1}>
                {item.producto?.nombre || item.customizacion?.nombre || 'Producto'}
              </Text>
              <Text style={styles.productPrice}>
                ${(item.precioUnitario * item.cantidad).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Delivery Info */}
      <View style={styles.deliverySection}>
        <View style={styles.deliveryRow}>
          <Ionicons
            name={order.tipoEntrega === 'delivery' ? 'bicycle' : 'bag-handle'}
            size={18}
            color={colors.primary}
          />
          <Text style={styles.deliveryText}>
            {order.tipoEntrega === 'delivery' ? 'Delivery' : 'Retiro en local'}
          </Text>
        </View>

        {order.tipoEntrega === 'delivery' && order.direccionEntrega && (
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={14} color={colors.gray600} />
            <Text style={styles.address} numberOfLines={2}>
              {order.direccionEntrega}
            </Text>
          </View>
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

      {/* Rating Section - Solo para pedidos entregados */}
      {order.estado === 'entregado' && (
        <View style={styles.ratingSection}>
          {rating ? (
            // Mostrar calificación existente
            <View style={styles.ratingDisplay}>
              <View style={styles.ratingHeader}>
                <Ionicons name="star" size={18} color={colors.orange} />
                <Text style={styles.ratingTitle}>Tu calificación</Text>
              </View>
              <View style={styles.ratingContent}>
                <RatingStars rating={rating.promedio} size="md" readonly />
                <Text style={styles.ratingValue}>{rating.promedio.toFixed(1)}</Text>
              </View>
            </View>
          ) : (
            // Botón para calificar
            <TouchableOpacity
              style={styles.rateButton}
              onPress={(e) => {
                e.stopPropagation();
                onRatePress?.();
              }}
              activeOpacity={0.7}
            >
              <View style={styles.rateButtonContent}>
                <Ionicons name="star-outline" size={20} color={colors.orange} />
                <Text style={styles.rateButtonText}>Calificar pedido</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.orange} />
            </TouchableOpacity>
          )}
        </View>
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
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  date: {
    ...typography.bodySmall,
    fontSize: 12,
    color: colors.gray500,
    fontWeight: '500',
  },

  companySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary + '20',
    backgroundColor: colors.primary + '05',
    padding: spacing.sm,
    borderRadius: 12,
  },

  companyLogo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.white,
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary + '30',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  companyInfo: {
    flex: 1,
  },

  companyName: {
    ...typography.h3,
    fontWeight: '800',
    color: colors.primary,
    fontSize: 18,
    letterSpacing: -0.5,
  },

  productsSection: {
    marginBottom: spacing.md,
    backgroundColor: colors.gray50,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray100,
  },

  productsTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.gray700,
    marginBottom: spacing.sm,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },

  productQuantityBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 36,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },

  productQuantityText: {
    ...typography.bodySmall,
    fontSize: 12,
    fontWeight: '800',
    color: colors.white,
  },

  productName: {
    ...typography.bodyMedium,
    flex: 1,
    color: colors.gray900,
    fontSize: 14,
    fontWeight: '600',
  },

  productPrice: {
    ...typography.bodyMedium,
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },

  deliverySection: {
    marginBottom: spacing.md,
  },

  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary + '10',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '20',
    marginBottom: spacing.xs,
  },

  deliveryText: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },

  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.gray50,
    padding: spacing.sm,
    borderRadius: 10,
  },

  address: {
    ...typography.bodySmall,
    fontSize: 13,
    color: colors.gray700,
    fontWeight: '500',
    flex: 1,
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

  // Rating Section
  ratingSection: {
    marginBottom: spacing.md,
  },

  ratingDisplay: {
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray100,
  },

  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },

  ratingTitle: {
    ...typography.bodyMedium,
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray700,
  },

  ratingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  ratingValue: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '800',
    color: colors.gray900,
  },

  rateButton: {
    backgroundColor: colors.orange + '10',
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: colors.orange + '30',
    borderStyle: 'dashed',
  },

  rateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  rateButtonText: {
    ...typography.bodyMedium,
    fontSize: 14,
    fontWeight: '700',
    color: colors.orange,
  },
});
