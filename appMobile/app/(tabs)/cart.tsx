/**
 * Cart Screen - Pantalla del carrito de compras
 * Muestra los items del carrito y el resumen de compra
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useGlobalSearchParams } from 'expo-router';
import { useCart } from '../../src/contexts/CartContext';
import { textStyles, spacing, borderRadius, shadows } from '../../src/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { formatPrice } from '../../src/utils/formatPrice';
import { LinearGradient } from 'expo-linear-gradient';
import { Logo } from '../../src/components/common/Logo';
import { normalize } from '../../src/utils/responsive';

export default function CartScreen() {
  const router = useRouter();
  const localParams = useLocalSearchParams();
  const globalParams = useGlobalSearchParams();

  // Prefer local params, fallback to global params
  const params = localParams.from ? localParams : globalParams;
  const { from, companyName } = params;

  const { colors, isDark } = useTheme();
  const { cart, loading, removeItem, updateQuantity } = useCart();
  const [refreshing, setRefreshing] = useState(false);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  // Agrupar items por empresa
  const itemsByCompany = useMemo(() => {
    const grouped = cart.items.reduce((acc, item) => {
      const key = item.companyId;
      if (!acc[key]) {
        acc[key] = {
          companyId: item.companyId,
          companyName: item.companyName,
          items: [],
          subtotal: 0,
          totalDiscount: 0,
          totalItems: 0,
        };
      }

      // Calcular precio del item
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

      const itemTotal = (basePrice + agregadosPrice + ingredientesExtrasPrice) * item.quantity;

      acc[key].items.push(item);
      acc[key].subtotal += itemTotal;
      acc[key].totalDiscount += (item.discount || 0);
      acc[key].totalItems += item.quantity;

      return acc;
    }, {} as Record<string, { companyId: string; companyName: string; items: typeof cart.items; subtotal: number; totalDiscount: number; totalItems: number }>);

    return Object.values(grouped);
  }, [cart.items]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular una recarga del carrito
    await new Promise(resolve => setTimeout(resolve, 500));
    setRefreshing(false);
  };

  const handleCheckoutByCompany = (companyId: string) => {
    // Navegar a checkout con una empresa específica
    router.push(`/checkout?companyId=${companyId}`);
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
              <View>
                {item.discount && item.discount > 0 ? (
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={[styles.itemPrice, { textDecorationLine: 'line-through', color: colors.textTertiary, fontSize: 12 }]}>
                        ${formatPrice(unitPrice)}
                      </Text>
                      <Text style={[styles.itemPrice, { color: colors.success }]}>
                        ${formatPrice(unitPrice - (item.discount / item.quantity))}
                      </Text>
                    </View>
                    {item.appliedPromotion && (
                      <Text style={{ fontSize: 10, color: colors.success, fontWeight: '600' }}>
                        {item.appliedPromotion}
                      </Text>
                    )}
                  </View>
                ) : (
                  <Text style={styles.itemPrice}>${formatPrice(unitPrice)}</Text>
                )}
              </View>

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
    <View style={styles.container}>
      {/* Header con degradado azul igual al home */}
      <LinearGradient
        colors={['#0A2A43', '#0D3354']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          {/* Top bar - Logo Vitrina a la izquierda, botón volver a la derecha */}
          <View style={styles.topBar}>
            <View style={styles.logoSection}>
              <Logo variant="icon" size={20} />
              <Text style={styles.logoText}>Vitrina • Carrito</Text>
            </View>

            <View style={styles.actionsButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  if (from === 'company') {
                    router.back();
                  } else {
                    router.push('/(tabs)/');
                  }
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={normalize(20)} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Info del carrito */}
          {cart.totalItems > 0 && (
            <View style={styles.cartInfo}>
              <Text style={styles.cartInfoText}>
                {cart.totalItems} {cart.totalItems === 1 ? 'producto' : 'productos'} • ${formatPrice(cart.total)}
              </Text>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      {cart.items.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
          >
            {/* Pedidos agrupados por empresa */}
            {itemsByCompany.map((company) => (
              <View key={company.companyId} style={styles.companyOrderSection}>
                {/* Company Header */}
                <View style={styles.companyHeader}>
                  <View style={styles.companyTitleRow}>
                    <Ionicons name="business" size={20} color={colors.primary} />
                    <Text style={styles.companyName}>{company.companyName}</Text>
                  </View>
                  <Text style={styles.companyItemCount}>
                    {company.totalItems} {company.totalItems === 1 ? 'producto' : 'productos'}
                  </Text>
                </View>

                {/* Cart Items de esta empresa */}
                <View style={styles.itemsList}>
                  {company.items.map(renderCartItem)}
                </View>

                {/* Resumen y botón para esta empresa */}
                <View style={styles.companySummary}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>${formatPrice(company.subtotal)}</Text>
                  </View>
                  {company.totalDiscount > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={[styles.summaryLabel, { color: colors.success }]}>Descuento</Text>
                      <Text style={[styles.summaryValue, { color: colors.success }]}>-${formatPrice(company.totalDiscount)}</Text>
                    </View>
                  )}
                  <View style={[styles.summaryRow, { marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }]}>
                    <Text style={[styles.summaryLabel, { fontWeight: '700' }]}>Total</Text>
                    <Text style={[styles.summaryValue, { fontSize: 20 }]}>${formatPrice(company.subtotal - company.totalDiscount)}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.companyCheckoutButton}
                    onPress={() => handleCheckoutByCompany(company.companyId)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.companyCheckoutButtonText}>
                      Continuar con este pedido
                    </Text>
                    <Text style={styles.companyCheckoutButtonPrice}>
                      ${formatPrice(company.subtotal - company.totalDiscount)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={{ height: 20 }} />
          </ScrollView>
        </>
      )}
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header premium igual al home
  headerGradient: {
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  safeArea: {
    paddingHorizontal: spacing.lg,
  },

  // Top bar - Logo a la izquierda, botones a la derecha
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  actionsButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  logoText: {
    ...textStyles.headline,
    fontSize: normalize(20),
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: -0.5,
  },

  // Cart Info - Simple y limpio
  cartInfo: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: normalize(12),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  cartInfoText: {
    ...textStyles.body,
    fontSize: normalize(14),
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
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
    color: colors.text,
    fontWeight: '700',
  },
  subtitle: {
    ...textStyles.caption1,
    fontSize: 11,
    color: colors.textSecondary,
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
    backgroundColor: colors.card,
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
    borderColor: colors.cardBorder,
  },
  companyName: {
    ...textStyles.body,
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },

  // Items List
  itemsList: {
    gap: spacing.md,
  },

  // Cart Item - Modern Design
  cartItem: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: isDark ? colors.black : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
    shadowColor: isDark ? colors.black : '#000',
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
    color: colors.text,
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

  // Summary Container (deprecated)
  summaryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  // Company Order Section - Separación por empresa
  companyOrderSection: {
    backgroundColor: colors.card,
    borderRadius: 20,
    marginBottom: spacing.lg,
    padding: spacing.md,
    shadowColor: isDark ? colors.black : '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },

  companyHeader: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? colors.gray200 : colors.border,
  },

  companyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },

  companyItemCount: {
    ...textStyles.caption1,
    color: colors.textSecondary,
    fontSize: 12,
  },

  companySummary: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: isDark ? colors.gray200 : colors.border,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },

  summaryLabel: {
    ...textStyles.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  summaryValue: {
    ...textStyles.callout,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 18,
  },

  companyCheckoutButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  companyCheckoutButtonText: {
    ...textStyles.body,
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },

  companyCheckoutButtonPrice: {
    ...textStyles.callout,
    color: colors.white,
    fontWeight: '800',
    fontSize: 17,
  },

  // All Orders Container - Botón final para todos los pedidos
  allOrdersContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    shadowColor: isDark ? colors.black : '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: isDark ? 0.3 : 0.15,
    shadowRadius: 16,
    elevation: 12,
    borderTopWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.primary + '30',
  },

  allOrdersSummary: {
    marginBottom: spacing.md,
  },

  allOrdersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },

  allOrdersLabel: {
    ...textStyles.body,
    color: colors.text,
    fontWeight: '600',
  },

  allOrdersTotal: {
    ...textStyles.title2,
    color: colors.primary,
    fontWeight: '800',
  },

  allOrdersSubtitle: {
    ...textStyles.caption1,
    color: colors.textSecondary,
    fontSize: 12,
  },

  allOrdersButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  allOrdersButtonText: {
    ...textStyles.headline,
    color: colors.white,
    fontWeight: '800',
    fontSize: 16,
  },
});
