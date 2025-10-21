/**
 * Order Detail Screen
 * Detalle completo de un pedido
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '../../src/services/order.service';
import { PedidoWithDetails } from '../../src/types/order';
import { OrderStatusBadge } from '../../src/components/orders/OrderStatusBadge';
import { OrderTimeline } from '../../src/components/orders/OrderTimeline';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { textStyles as typography } from '../../src/theme/typography';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<PedidoWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getOrderById(id);
      setOrder(data);
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError(err.response?.data?.message || 'No se pudo cargar el pedido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.gray900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle del pedido</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.gray900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle del pedido</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorMessage}>{error || 'Pedido no encontrado'}</Text>
          <TouchableOpacity onPress={fetchOrder} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pedido #{order.id.slice(0, 8)}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status */}
        <View style={styles.section}>
          <OrderStatusBadge status={order.estado as any} />
          <Text style={styles.dateText}>{formatDate(order.createdAt)}</Text>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado del pedido</Text>
          <OrderTimeline
            currentStatus={order.estado as any}
            createdAt={order.createdAt}
            updatedAt={order.updatedAt}
          />
        </View>

        {/* Company Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Empresa</Text>
          <View style={styles.companyCard}>
            {order.empresa?.logo && (
              <Image
                source={{ uri: order.empresa.logo }}
                style={styles.companyLogo}
              />
            )}
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>{order.empresa?.name || 'Empresa'}</Text>
              {order.empresa?.address && (
                <View style={styles.companyAddressRow}>
                  <Ionicons name="location-outline" size={14} color={colors.gray600} />
                  <Text style={styles.companyAddress}>{order.empresa.address}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productos ({order.items?.length || 0})</Text>
          <View style={styles.productsContainer}>
            {order.items?.map((item, index) => (
              <View key={index} style={styles.productItem}>
                <View style={styles.productInfo}>
                  <Text style={styles.productQuantity}>{item.cantidad}x</Text>
                  <Text style={styles.productName}>{item.producto?.name || 'Producto'}</Text>
                </View>
                <Text style={styles.productPrice}>
                  ${(item.precioUnitario * item.cantidad).toLocaleString('es-AR', {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Delivery Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de entrega</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons
                name={order.tipoEntrega === 'delivery' ? 'bicycle' : 'bag-handle'}
                size={20}
                color={colors.gray700}
              />
              <Text style={styles.infoLabel}>
                {order.tipoEntrega === 'delivery' ? 'Delivery' : 'Retiro en local'}
              </Text>
            </View>

            {order.tipoEntrega === 'delivery' && order.direccionEntrega && (
              <>
                <View style={styles.infoRow}>
                  <Ionicons name="location" size={20} color={colors.gray700} />
                  <Text style={styles.infoText}>{order.direccionEntrega}</Text>
                </View>
                {order.referenciaEntrega && (
                  <View style={styles.infoRow}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.gray700} />
                    <Text style={styles.infoText}>{order.referenciaEntrega}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de pago</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons
                name={order.metodoPago === 'efectivo' ? 'cash' : 'card'}
                size={20}
                color={colors.gray700}
              />
              <Text style={styles.infoLabel}>
                {order.metodoPago === 'efectivo' ? 'Efectivo' : 'Transferencia'}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {order.notas && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{order.notas}</Text>
            </View>
          </View>
        )}

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                ${order.subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            {order.costoEnvio > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Envío</Text>
                <Text style={styles.summaryValue}>
                  ${order.costoEnvio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            )}

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ${order.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },

  headerTitle: {
    ...typography.h3,
    color: colors.gray900,
    fontWeight: '700',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },

  errorTitle: {
    ...typography.h3,
    color: colors.error,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  errorMessage: {
    ...typography.bodyMedium,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },

  retryButtonText: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: '600',
  },

  section: {
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    ...typography.h3,
    color: colors.gray900,
    fontWeight: '700',
    marginBottom: spacing.md,
  },

  dateText: {
    ...typography.bodySmall,
    color: colors.gray600,
    marginTop: spacing.sm,
  },

  companyCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  companyLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gray100,
    marginRight: spacing.md,
  },

  companyInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  companyName: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: spacing.xs,
  },

  companyAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  companyAddress: {
    ...typography.bodySmall,
    color: colors.gray600,
    flex: 1,
  },

  productsContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },

  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },

  productQuantity: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.primary,
    minWidth: 32,
  },

  productName: {
    ...typography.bodyMedium,
    color: colors.gray900,
    flex: 1,
  },

  productPrice: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.gray900,
  },

  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
    gap: spacing.md,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },

  infoLabel: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.gray900,
    flex: 1,
  },

  infoText: {
    ...typography.bodyMedium,
    color: colors.gray700,
    flex: 1,
  },

  notesCard: {
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: spacing.md,
  },

  notesText: {
    ...typography.bodyMedium,
    color: colors.gray800,
    lineHeight: 22,
  },

  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  summaryLabel: {
    ...typography.bodyMedium,
    color: colors.gray600,
  },

  summaryValue: {
    ...typography.bodyMedium,
    color: colors.gray900,
    fontWeight: '600',
  },

  totalRow: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    marginTop: spacing.xs,
    marginBottom: 0,
  },

  totalLabel: {
    ...typography.bodyLarge,
    color: colors.gray900,
    fontWeight: '700',
  },

  totalValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
  },
});
