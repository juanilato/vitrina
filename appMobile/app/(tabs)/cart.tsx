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
import { LinearGradient } from 'expo-linear-gradient';

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

  const renderCartItem = (item: typeof cart.items[0]) => {
    // Calcular precio unitario con agregados e ingredientes extras
    const basePrice = typeof item.product.precio === 'string'
      ? parseFloat(item.product.precio)
      : (item.product.precio || item.product.price || 0);

    const agregadosPrice = item.agregados?.reduce((sum, a) => {
      const aPrecio = typeof a.precio === 'string' ? parseFloat(a.precio) : a.precio;
      return sum + aPrecio;
    }, 0) || 0;

    const ingredientesExtrasPrice = item.ingredientesExtras?.reduce((sum, ie) => {
      const precioExtra = ie.productoIngrediente.precioExtra;
      const precio = typeof precioExtra === 'string' ? parseFloat(precioExtra) : (precioExtra || 0);
      return sum + (precio * ie.cantidad);
    }, 0) || 0;

    const unitPrice = basePrice + agregadosPrice + ingredientesExtrasPrice;

    return (
      <View key={item.product.id} style={styles.cartItem}>
        {/* Remove Button - Positioned absolutely at top right */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item.product.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>

        {/* Main Content Row */}
        <View style={styles.itemMainRow}>
          {/* Image */}
          <View style={styles.itemImageContainer}>
            {(item.product.fotoUrl || (item.product.images && item.product.images[0])) ? (
              <Image
                source={{ uri: item.product.fotoUrl || item.product.images![0] }}
                style={styles.itemImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.itemImagePlaceholder}>
                <Ionicons name="restaurant" size={24} color={colors.textTertiary} />
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.itemContent}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.product.nombre}
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
            {item.ingredientesExtras && item.ingredientesExtras.length > 0 && (
              <Text style={styles.itemExtras} numberOfLines={1}>
                + {item.ingredientesExtras.map(ie =>
                  `${ie.productoIngrediente.ingrediente.nombre} (x${ie.cantidad})`
                ).join(', ')}
              </Text>
            )}

            {/* Price and Quantity Row */}
            <View style={styles.itemFooter}>
              <Text style={styles.itemPrice}>${formatPrice(unitPrice)}</Text>

              {/* Quantity Controls */}
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={16} color={colors.primary} />
                </TouchableOpacity>

                <Text style={styles.quantityText}>{item.quantity}</Text>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

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
      {/* Modern Glass Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
          style={styles.headerGradient}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.cartBadge}>
            <View style={styles.cartIconContainer}>
              <Ionicons name="cart" size={22} color={colors.primary} />
              {cart.totalItems > 0 && (
                <View style={styles.cartCountBadge}>
                  <Text style={styles.cartCountText}>{cart.totalItems}</Text>
                </View>
              )}
            </View>
            <View style={styles.cartTextContainer}>
              <Text style={styles.cartLabel}>TU CARRITO</Text>
              <Text style={styles.cartTitle}>
                {cart.totalItems === 0
                  ? 'Vacío'
                  : `${cart.totalItems} ${cart.totalItems === 1 ? 'producto' : 'productos'}`
                }
              </Text>
            </View>
          </View>

          <View style={styles.headerRight} />
        </LinearGradient>
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
            {cart.items.length > 0 && cart.items[0].companyName && (
              <View style={styles.companySection}>
                <Ionicons name="business" size={20} color={colors.primary} />
                <Text style={styles.companyName}>{cart.items[0].companyName}</Text>
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

  // Header - Modern Glass Design
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Cart Badge
  cartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 10,
    flex: 1,
    marginHorizontal: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cartIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartCountText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  cartTextContainer: {
    flex: 1,
  },
  cartLabel: {
    ...textStyles.caption1,
    fontSize: 10,
    fontWeight: '600',
    color: colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cartTitle: {
    ...textStyles.body,
    fontSize: 16,
    fontWeight: '800',
    color: colors.gray900,
    marginTop: 2,
  },

  // Legacy styles (kept for compatibility)
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

  // Company Section - Modern Card
  companySection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.md,
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
  },
  companyName: {
    ...textStyles.body,
    color: colors.gray900,
    fontWeight: '700',
    fontSize: 15,
  },

  // Items List
  itemsList: {
    gap: spacing.md,
  },

  // Cart Item - Modern Design
  cartItem: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.gray100,
    position: 'relative',
  },
  itemMainRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  itemImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexShrink: 0,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: `${colors.primary}10`,
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
    marginBottom: 4,
    fontSize: 14,
  },
  itemNotes: {
    ...textStyles.caption1,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 2,
    fontSize: 11,
  },
  itemExtras: {
    ...textStyles.caption1,
    color: colors.textTertiary,
    marginBottom: 2,
    fontSize: 11,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  itemPrice: {
    ...textStyles.callout,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },

  // Quantity Controls - Horizontal
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flexShrink: 0,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  quantityText: {
    ...textStyles.body,
    color: colors.gray900,
    fontWeight: '700',
    minWidth: 20,
    textAlign: 'center',
    fontSize: 14,
  },

  // Remove Button
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    padding: spacing.xs,
    backgroundColor: `${colors.error}10`,
    borderRadius: 8,
    zIndex: 10,
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
