/**
 * Cart Screen
 * Pantalla del carrito de compras
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../src/contexts/CartContext';
import { CartItem } from '../../src/components/cart/CartItem';
import { Button } from '../../src/components/common/Button';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { textStyles as typography } from '../../src/theme/typography';
import { formatPrice } from '../../src/utils/formatPrice';

export default function CartScreen() {
  const router = useRouter();
  const {
    cart,
    updateQuantity,
    updateItemNotes,
    removeItem,
    clearCart,
  } = useCart();

  const handleClearCart = () => {
    Alert.alert(
      'Vaciar carrito',
      '¿Estás seguro de que deseas eliminar todos los productos del carrito?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Vaciar',
          style: 'destructive',
          onPress: clearCart,
        },
      ]
    );
  };

  const handleCheckout = () => {
    // TODO: FASE 3 - Navegar a checkout
    router.push('/checkout' as any);
  };

  if (cart.items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Carrito</Text>
        </View>

        {/* Empty State */}
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={80} color={colors.gray300} />
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.emptySubtitle}>
            Explora nuestras empresas y agrega productos a tu carrito
          </Text>
          <Button
            title="Explorar empresas"
            onPress={() => router.push('/(tabs)')}
            style={styles.exploreButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Carrito</Text>
        <TouchableOpacity onPress={handleClearCart} activeOpacity={0.7}>
          <Text style={styles.clearButton}>Vaciar</Text>
        </TouchableOpacity>
      </View>

      {/* Company Info */}
      {cart.items.length > 0 && (
        <View style={styles.companyInfo}>
          <Ionicons name="storefront" size={20} color={colors.gray600} />
          <Text style={styles.companyName}>{cart.items[0].companyName}</Text>
        </View>
      )}

      {/* Cart Items */}
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.product.id}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onUpdateQuantity={(quantity) => updateQuantity(item.product.id, quantity)}
            onUpdateNotes={(notes) => updateItemNotes(item.product.id, notes)}
            onRemove={() => removeItem(item.product.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Summary */}
      <View style={styles.bottomContainer}>
        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              ${formatPrice(cart.subtotal)}
            </Text>
          </View>

          {cart.deliveryFee > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Envío</Text>
              <Text style={styles.summaryValue}>
                ${formatPrice(cart.deliveryFee)}
              </Text>
            </View>
          )}

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ${formatPrice(cart.total)}
            </Text>
          </View>
        </View>

        {/* Checkout Button */}
        <Button
          title="Continuar con el pedido"
          onPress={handleCheckout}
          style={styles.checkoutButton}
        />

        <Text style={styles.itemsCount}>
          {cart.totalItems} {cart.totalItems === 1 ? 'producto' : 'productos'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    ...typography.h2,
    color: colors.primary,
    fontWeight: '700',
  },

  clearButton: {
    ...typography.bodyMedium,
    color: colors.error,
    fontWeight: '600',
  },

  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.secondary + '15',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },

  companyName: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
  },

  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },

  emptyTitle: {
    ...typography.h3,
    color: colors.gray900,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  emptySubtitle: {
    ...typography.bodyMedium,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  exploreButton: {
    paddingHorizontal: spacing.xl,
  },

  bottomContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },

  summary: {
    marginBottom: spacing.md,
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
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    marginTop: spacing.xs,
  },

  totalLabel: {
    ...typography.bodyLarge,
    color: colors.gray900,
    fontWeight: '700',
  },

  totalValue: {
    ...typography.h3,
    color: colors.orange,
    fontWeight: '700',
  },

  checkoutButton: {
    marginBottom: spacing.sm,
  },

  itemsCount: {
    ...typography.bodySmall,
    color: colors.gray600,
    textAlign: 'center',
  },
});
