/**
 * Order Card Component
 * Tarjeta que muestra la información de un pedido
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { PedidoWithDetails } from '../../types/order';
import { OrderStatusBadge } from './OrderStatusBadge';
import { RatingStars } from '../common/RatingStars';
import { useTheme } from '../../contexts/ThemeContext';
import { SIZES, SHADOWS } from '../../theme';
import { textStyles as typography } from '../../theme/typography';

interface OrderCardProps {
  order: PedidoWithDetails;
  rating?: { promedio: number; totalValoraciones: number } | null;
  onRatePress?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, rating, onRatePress }) => {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

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
      {/* Paper Header - Company Name & Logo */}
      <LinearGradient
        colors={isDark
          ? ['rgba(42, 42, 42, 0.95)', 'rgba(30, 30, 30, 0.9)']
          : ['rgba(255, 255, 255, 0.98)', 'rgba(249, 250, 251, 0.95)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.paperHeader}
      >
        {order.empresa?.logo && (
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: order.empresa.logo }}
              style={styles.companyLogo}
            />
          </View>
        )}
        <View style={styles.companyInfo}>
          <Text style={styles.companyName} numberOfLines={1}>
            {order.empresa?.name || 'Empresa'}
          </Text>
          <View style={styles.dateContainer}>
            <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Estado Badge */}
      <View style={styles.statusSection}>
        <OrderStatusBadge status={order.estado as any} />
      </View>

      {/* Lista de productos */}
      {order.items && order.items.length > 0 && (
        <View style={styles.productsSection}>
          {order.items.map((item, index) => (
            <View key={index} style={styles.productItem}>
              <View style={styles.productQuantityBadge}>
                <Text style={styles.productQuantityText}>{item.cantidad}x</Text>
              </View>
              <Text style={styles.productName} numberOfLines={1}>
                {item.producto?.nombre || 'Producto'}
              </Text>
              <View style={{ alignItems: 'flex-end' }}>
                {item.descuento && item.descuento > 0 ? (
                  <>
                    <Text style={[styles.productPrice, { textDecorationLine: 'line-through', color: '#9ca3af', fontSize: 12 }]}>
                      ${(item.precio * item.cantidad).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </Text>
                    <Text style={[styles.productPrice, { color: '#10b981' }]}>
                      ${((item.precio * item.cantidad) - item.descuento).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </Text>
                    {item.promocionAplicada && (
                      <Text style={{ fontSize: 10, color: '#10b981', fontWeight: '600', marginTop: 2 }}>
                        {item.promocionAplicada}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.productPrice}>
                    ${(item.precio * item.cantidad).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </Text>
                )}
              </View>
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
                <Ionicons name="star-outline" size={18} color={colors.orange} />
                <Text style={styles.rateButtonText}>Calificar</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.orange} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Promociones aplicadas - Abajo */}
      {(order.descuento || 0) > 0 && order.promocionesAplicadas && order.promocionesAplicadas.length > 0 && (
        <View style={styles.promosSection}>
          {order.promocionesAplicadas.map((promo, index) => (
            <View key={index} style={styles.promoItem}>
              <Ionicons name="pricetag" size={12} color="#10b981" />
              <Text style={styles.promoName}>{promo.nombre}</Text>
              <Text style={styles.promoDiscount}>
                -${((order.descuento || 0) / order.promocionesAplicadas!.length).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          ))}
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
          <Ionicons name="chevron-forward" size={20} color={colors.white} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  // Paper Sheet Style - Friendly Invoice
  container: {
    backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
    borderRadius: SIZES.radiusMd,
    padding: 0,
    marginBottom: SIZES.lg,
    borderWidth: 1,
    borderColor: isDark ? '#3a3a3a' : '#e5e7eb',
    ...SHADOWS.md,
    overflow: 'hidden',
  },

  // Paper Header - Premium Style with Gradient
  paperHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.lg,
    paddingHorizontal: SIZES.xl,
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.xl,
    borderBottomWidth: 3,
    borderBottomColor: isDark ? '#3a3a3a' : '#e5e7eb',
    borderStyle: 'dashed',
  },

  logoContainer: {
    padding: 4,

    elevation: 4,
  },

  companyLogo: {
    width: 64,
    height: 64,

   

    flexShrink: 0,
  },

  companyInfo: {
    flex: 1,
  },

  companyName: {
    ...typography.h3,
    fontWeight: '900',
    color: colors.text,
    fontSize: 19,
    letterSpacing: -0.8,
    marginBottom: 8,
    textShadowColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
    backgroundColor: `${colors.primary}08`,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: `${colors.primary}15`,
  },

  date: {
    ...typography.bodySmall,
    fontSize: 11,
    color: colors.text,
    fontWeight: '700',
  },

  // Status Section - Friendly
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#f3f4f6',
  },

  // Products List - Friendly Invoice Style
  productsSection: {
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.md,
    paddingBottom: SIZES.md,
    backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
  },

  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.md,
    gap: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#f3f4f6',
  },

  productQuantityBadge: {
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
    flexShrink: 0,
  },

  productQuantityText: {
    ...typography.bodySmall,
    fontSize: 12,
    fontWeight: '900',
    color: colors.primary,
  },

  productName: {
    ...typography.bodyMedium,
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
    lineHeight: 20,
  },

  productPrice: {
    ...typography.bodyMedium,
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },

  // Delivery Section - Friendly Style
  deliverySection: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    backgroundColor: isDark ? '#272727' : '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: isDark ? '#333' : '#e5e7eb',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#333' : '#e5e7eb',
  },

  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.xs,
  },

  deliveryText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0,
  },

  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.sm,
    paddingLeft: SIZES.lg,
    paddingTop: SIZES.xs,
  },

  address: {
    ...typography.bodySmall,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },

  // Promos Section - Friendly Style
  promosSection: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    backgroundColor: isDark ? '#1f3a2c' : '#f0fdf4',
    borderTopWidth: 1,
    borderTopColor: isDark ? '#2d5a3f' : '#d1fae5',
    gap: SIZES.xs,
  },

  promoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.xs,
    paddingHorizontal: SIZES.sm,
    backgroundColor: isDark ? '#254133' : '#dcfce7',
    borderRadius: 8,
    gap: SIZES.xs,
  },

  promoName: {
    ...typography.bodySmall,
    fontSize: 12,
    color: isDark ? '#86efac' : '#166534',
    fontWeight: '600',
    flex: 1,
  },

  promoDiscount: {
    ...typography.bodySmall,
    fontSize: 12,
    fontWeight: '800',
    color: '#10b981',
    flexShrink: 0,
  },

  // Footer - Friendly Total Style
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.lg,
    backgroundColor: isDark ? '#252525' : '#f9fafb',
    borderTopWidth: 3,
    borderTopColor: isDark ? '#3a3a3a' : '#e5e7eb',
    borderStyle: 'dashed',
  },

  totalSection: {
    flexDirection: 'column',
    gap: SIZES.xs,
  },

  totalLabel: {
    ...typography.bodySmall,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  totalAmount: {
    ...typography.h2,
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -1,
    textShadowColor: `${colors.primary}20`,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  arrowContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    flexShrink: 0,
  },

  trackingBanner: {
    backgroundColor: colors.orange,
    marginHorizontal: SIZES.lg,
    marginVertical: SIZES.md,
    borderRadius: 14,
    padding: SIZES.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },

  trackingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
  },

  trackingText: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: -0.5,
  },

  // Rating Section - Invoice Style
  ratingSection: {
    marginHorizontal: SIZES.lg,
    marginVertical: SIZES.md,
  },

  ratingDisplay: {
    backgroundColor: `${colors.primary}08`,
    borderRadius: 12,
    padding: SIZES.sm,
    borderWidth: 1,
    borderColor: `${colors.primary}15`,
  },

  ratingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.md,
  },

  ratingValue: {
    ...typography.h3,
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.8,
  },

  rateButton: {
    backgroundColor: `${colors.primary}08`,
    borderRadius: 12,
    padding: SIZES.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
  },

  rateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },

  rateButtonText: {
    ...typography.bodyMedium,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
});
