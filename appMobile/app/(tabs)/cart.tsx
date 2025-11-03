/**
 * Cart Screen - Pantalla del carrito de compras
 * Muestra los items del carrito y el resumen de compra
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '../../src/contexts/CartContext';
import { CartSummary } from '../../src/components/cart/CartSummary';
import { colors, textStyles, spacing, borderRadius, shadows } from '../../src/theme';
import { formatPrice } from '../../src/utils/formatPrice';

export default function CartScreen() {
  const router = useRouter();
  const { cart, loading, removeItem, updateQuantity, deliveryFee } = useCart();

  const handleCheckout = () => {
    // Navegar a la pantalla de checkout
    router.push('/checkout');
  };

  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={80} color={colors.textQuaternary} />
      <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
      <Text style={styles.emptySubtitle}>
        Agrega productos para comenzar tu pedido
      </Text>
      <TouchableOpacity
        style={styles.continueShoppingButton}
        onPress={() => router.push('/(tabs)/')}
        activeOpacity={0.8}
      >
        <Text style={styles.continueShoppingText}>Explorar categorías</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCartItem = (item: typeof cart.items[0]) => (
    <View key={item.id} style={styles.cartItem}>
      {/* Image */}
      <View style={styles.itemImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
        ) : (
          <View style={styles.itemImagePlaceholder}>
            <Ionicons name="restaurant" size={24} color={colors.textTertiary} />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.itemContent}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        {item.notes && (
          <Text style={styles.itemNotes} numberOfLines={2}>
            {item.notes}
          </Text>
        )}
        {item.agregados && item.agregados.length > 0 && (
          <Text style={styles.itemExtras} numberOfLines={1}>
            + {item.agregados.map(a => a.nombre).join(', ')}
          </Text>
        )}
        <Text style={styles.itemPrice}>${formatPrice(item.price)}</Text>
      </View>

      {/* Quantity Controls */}
      <View style={styles.quantityControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
          activeOpacity={0.7}
        >
          <Ionicons name="remove" size={18} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.quantityText}>{item.quantity}</Text>

        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Remove Button */}
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.id)}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.gray700} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.title}>Mi Carrito</Text>
          {cart.totalItems > 0 && (
            <Text style={styles.subtitle}>
              {cart.totalItems} {cart.totalItems === 1 ? 'producto' : 'productos'}
            </Text>
          )}
        </View>

        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      {cart.items.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Company Info */}
            {cart.companyName && (
              <View style={styles.companySection}>
                <Ionicons name="business" size={20} color={colors.primary} />
                <Text style={styles.companyName}>{cart.companyName}</Text>
              </View>
            )}

            {/* Cart Items */}
            <View style={styles.itemsList}>
              {cart.items.map(renderCartItem)}
            </View>

            {/* Spacer for bottom summary */}
            <View style={{ height: 220 }} />
          </ScrollView>

          {/* Cart Summary */}
          <View style={styles.summaryContainer}>
            <CartSummary
              subtotal={cart.subtotal}
              deliveryFee={deliveryFee}
              discount={0}
              total={cart.total + deliveryFee}
              itemCount={cart.totalItems}
              onCheckout={handleCheckout}
              buttonText="Continuar al pago"
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  headerRight: {
    width: 36,
  },
  title: {
    ...textStyles.body,
    fontSize: 16,
    color: colors.gray900,
    fontWeight: '700',
  },
  subtitle: {
    ...textStyles.caption1,
    fontSize: 11,
    color: colors.gray600,
    marginTop: 1,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },

  // Company Section
  companySection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  companyName: {
    ...textStyles.body,
    color: colors.text,
    fontWeight: '600',
  },

  // Items List
  itemsList: {
    gap: spacing.md,
  },

  // Cart Item
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
    gap: spacing.md,
  },
  itemImageContainer: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    ...textStyles.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemNotes: {
    ...textStyles.caption1,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  itemExtras: {
    ...textStyles.caption1,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  itemPrice: {
    ...textStyles.callout,
    color: colors.primary,
    fontWeight: '700',
  },

  // Quantity Controls
  quantityControls: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    ...textStyles.body,
    color: colors.text,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },

  // Remove Button
  removeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    padding: spacing.xs,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  emptyTitle: {
    ...textStyles.title3,
    color: colors.text,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  continueShoppingButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    ...shadows.md,
  },
  continueShoppingText: {
    ...textStyles.body,
    color: colors.white,
    fontWeight: '700',
  },

  // Summary Container
  summaryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
