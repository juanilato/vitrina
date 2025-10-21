/**
 * Company Store Screen
 * Muestra los productos de una empresa específica
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCompanyStore } from '../../src/hooks/useCompanyStore';
import { useCart } from '../../src/contexts/CartContext';
import { ProductCard } from '../../src/components/products/ProductCard';
import { FloatingCartButton } from '../../src/components/cart/FloatingCartButton';
import { colors, textStyles, spacing, shadows } from '../../src/theme';

export default function CompanyStoreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { company, loading, error, refreshing, refresh } = useCompanyStore(id);
  const { addItem, cart } = useCart();

  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const handleAddToCart = (productId: string) => {
    if (!company) return;

    const product = company.products?.find((p) => p.id === productId);
    if (!product) return;

    if (!product.activo) {
      Alert.alert('Producto no disponible', 'Este producto no está disponible en este momento');
      return;
    }

    addItem(product, company.id, company.name, 1);
    Alert.alert('Producto agregado', `${product.name} se agregó al carrito`);
  };

  const handleProductPress = (productId: string) => {
    setSelectedProduct(productId);
    // TODO: Abrir modal con detalles del producto
    Alert.alert('Detalles', 'Modal de producto - FASE 3');
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !company) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorMessage}>{error || 'No se pudo cargar la empresa'}</Text>
          <TouchableOpacity onPress={refresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const activeProducts = company.products?.filter((p) => p.activo) || [];
  const inactiveProducts = company.products?.filter((p) => !p.activo) || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          {company.logo && (
            <Image source={{ uri: company.logo }} style={styles.logo} />
          )}
          <View style={styles.headerText}>
            <Text style={styles.companyName} numberOfLines={1}>
              {company.name}
            </Text>
            {company.description && (
              <Text style={styles.companyDescription} numberOfLines={1}>
                {company.description}
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push('/(tabs)/cart')}
        >
          <Ionicons name="cart-outline" size={24} color={colors.text} />
          {cart.totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cart.totalItems > 99 ? '99+' : cart.totalItems}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <FlatList
        data={[...activeProducts, ...inactiveProducts]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => handleProductPress(item.id)}
            onAddToCart={() => handleAddToCart(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Productos</Text>
            <Text style={styles.productCount}>
              {activeProducts.length} disponibles
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="fast-food-outline" size={64} color={colors.textQuaternary} />
            <Text style={styles.emptyTitle}>No hay productos</Text>
            <Text style={styles.emptySubtitle}>
              Esta empresa aún no ha agregado productos
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Cart Button */}
      <FloatingCartButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.sm,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },

  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },

  headerText: {
    flex: 1,
  },

  companyName: {
    ...textStyles.headline,
    color: colors.primary,
    fontWeight: '700',
  },

  companyDescription: {
    ...textStyles.caption1,
    color: colors.textSecondary,
  },

  cartButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    position: 'relative',
  },

  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.white,
  },

  cartBadgeText: {
    ...textStyles.caption2,
    color: colors.white,
    fontWeight: '700',
    fontSize: 11,
  },

  listContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },

  listHeader: {
    marginBottom: spacing.md,
  },

  sectionTitle: {
    ...textStyles.title2,
    color: colors.primary,
    marginBottom: 4,
    fontWeight: '700',
  },

  productCount: {
    ...textStyles.subheadline,
    color: colors.secondary,
    fontWeight: '600',
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },

  emptyTitle: {
    ...textStyles.headline,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },

  emptySubtitle: {
    ...textStyles.subheadline,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: spacing['2xl'],
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },

  errorTitle: {
    ...textStyles.title2,
    color: colors.error,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  errorMessage: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.orange,
    borderRadius: 12,
  },

  retryButtonText: {
    ...textStyles.body,
    color: colors.white,
    fontWeight: '600',
  },
});
