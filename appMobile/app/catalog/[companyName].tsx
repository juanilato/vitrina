/**
 * Catalog Screen
 * Pantalla de catálogo público sin autenticación
 * Solo muestra productos con preferencias web de la empresa
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SectionList,
  RefreshControl,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePublicCatalog } from '../../src/hooks/usePublicCatalog';
import { ProductCard } from '../../src/components/products/ProductCard';
import { BusinessHours } from '../../src/components/companies/BusinessHours';
import { FloatingSocialLinks } from '../../src/components/companies/FloatingSocialLinks';
import { textStyles, spacing, shadows, borderRadius } from '../../src/theme';
import { Product } from '../../src/types/company';
import { useTheme } from '../../src/contexts/ThemeContext';
import { normalize } from '../../src/utils/responsive';

export default function CatalogScreen() {
  const { companyName } = useLocalSearchParams<{ companyName: string }>();
  const { colors, isDark } = useTheme();

  const { company, loading, error, refreshing, refresh } = usePublicCatalog(companyName || '');

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const [searchQuery, setSearchQuery] = useState('');
  const [socialLinksExpanded, setSocialLinksExpanded] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const buttonColor = useMemo(
    () => company?.preferenciasWeb?.colorBotones || colors.primary,
    [company]
  );

  const isColorDark = (hex: string) => {
    if (!hex) return false;
    const cleaned = hex.replace('#', '');
    const bigint = parseInt(cleaned.length === 3
      ? cleaned.split('').map(c => c + c).join('')
      : cleaned, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    return luma < 140;
  };

  // Filtrar productos por búsqueda y categoría
  const filteredProducts = useMemo(() => {
    let allProducts = company?.products || [];

    // Filtrar por categoría si hay una seleccionada
    if (selectedCategoryId) {
      allProducts = allProducts.filter((product) => {
        return product.categorias?.some((catRelation) => catRelation.categoria.id === selectedCategoryId);
      });
    }

    // Filtrar por búsqueda si hay texto
    if (!searchQuery.trim()) {
      return allProducts;
    }

    const query = searchQuery.toLowerCase().trim();
    return allProducts.filter((product) =>
      product.nombre.toLowerCase().includes(query) ||
      product.descripcion?.toLowerCase().includes(query)
    );
  }, [company?.products, searchQuery, selectedCategoryId]);

  const activeProducts = filteredProducts.filter((p) => p.activo);

  // Obtener todas las categorías únicas
  const allCategories = useMemo(() => {
    const categoriesMap = new Map();
    company?.products?.forEach((product) => {
      product.categorias?.forEach((catRelation) => {
        if (!categoriesMap.has(catRelation.categoria.id)) {
          categoriesMap.set(catRelation.categoria.id, catRelation.categoria);
        }
      });
    });
    return Array.from(categoriesMap.values()).sort((a, b) => a.orden - b.orden);
  }, [company?.products]);

  // Agrupar productos por categorías
  const productsByCategory = useMemo(() => {
    const categoriesMap = new Map<string, { category: any; products: Product[] }>();
    const uncategorizedProducts: Product[] = [];

    activeProducts.forEach(product => {
      if (product.categorias && product.categorias.length > 0) {
        product.categorias.forEach(catRelation => {
          const catId = catRelation.categoria.id;
          if (!categoriesMap.has(catId)) {
            categoriesMap.set(catId, {
              category: catRelation.categoria,
              products: []
            });
          }
          categoriesMap.get(catId)!.products.push(product);
        });
      } else {
        uncategorizedProducts.push(product);
      }
    });

    const categorizedGroups = Array.from(categoriesMap.values()).sort(
      (a, b) => a.category.orden - b.category.orden
    );

    return { categorizedGroups, uncategorizedProducts };
  }, [activeProducts]);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const fondo = company?.preferenciasWeb?.colorFondo || buttonColor;
  const fondoOscuro = isColorDark(fondo);
  const textoColor = fondoOscuro ? colors.white : colors.text;

  if (error || !company) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorMessage}>{error || 'No se pudo cargar el catálogo'}</Text>
          <TouchableOpacity onPress={refresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const dashboardFoto = company.preferenciasWeb?.dashboardFoto;

  return (
    <View style={styles.container}>
      {/* Dashboard Background */}
      {dashboardFoto && (
        <ImageBackground
          source={{ uri: dashboardFoto }}
          style={styles.fullBackground}
          resizeMode="cover"
          blurRadius={3}
        >
          <View style={styles.backgroundOverlay} />
        </ImageBackground>
      )}

      {/* Header */}
      <View style={styles.headerContainer}>
        {company.preferenciasWeb?.dashboardFoto ? (
          <ImageBackground
            source={{ uri: company.preferenciasWeb.dashboardFoto }}
            style={styles.headerBackground}
            resizeMode="cover"
          >
            <SafeAreaView edges={['top']}>
              {/* Badge Catálogo - Top Right */}
              <View style={styles.catalogBadgeTopRight}>
                <Ionicons name="book-outline" size={14} color={colors.white} />
                <Text style={styles.catalogBadgeText}>Catálogo</Text>
              </View>

              {/* Branding */}
              <View style={styles.brandingSoft}>
                {company.logo ? (
                  <View style={styles.brandAvatar}>
                    <Image source={{ uri: company.logo }} style={styles.brandAvatarImg} />
                  </View>
                ) : (
                  <View
                    style={[
                      styles.brandAvatar,
                      {
                        backgroundColor: fondoOscuro ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                      },
                    ]}
                  >
                    <Text style={[styles.brandAvatarMono, { color: textoColor }]}>
                      {company.name?.slice(0, 2)?.toUpperCase() ?? 'C'}
                    </Text>
                  </View>
                )}

                <View style={styles.nameBackdrop}>
                  <Text
                    numberOfLines={1}
                    style={[styles.brandTitleSoft, { color: textoColor }]}
                  >
                    {company.name}
                  </Text>
                </View>
              </View>
            </SafeAreaView>
          </ImageBackground>
        ) : (
          <View style={styles.headerNoPhotoContainer}>
            <LinearGradient
              colors={[
                buttonColor,
                fondoOscuro ? `${buttonColor}F5` : `${buttonColor}E8`,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.headerClean}
            >
              <SafeAreaView edges={['top']}>
                {/* Badge Catálogo - Top Right */}
                <View style={styles.catalogBadgeTopRight}>
                  <Ionicons name="book-outline" size={14} color={colors.white} />
                  <Text style={styles.catalogBadgeText}>Catálogo</Text>
                </View>

                <View style={styles.brandingClean}>
                  {company.logo ? (
                    <View style={[
                      styles.avatarClean,
                      {
                        backgroundColor: colors.white,
                        shadowColor: fondoOscuro ? '#000' : buttonColor,
                      }
                    ]}>
                      <Image source={{ uri: company.logo }} style={styles.avatarImage} />
                    </View>
                  ) : (
                    <View style={[
                      styles.avatarClean,
                      {
                        backgroundColor: colors.white,
                        shadowColor: fondoOscuro ? '#000' : buttonColor,
                      }
                    ]}>
                      <Text style={styles.avatarInitials}>
                        {company.name?.slice(0, 2)?.toUpperCase() ?? 'C'}
                      </Text>
                    </View>
                  )}

                  <Text numberOfLines={2} style={[styles.titleClean, { color: textoColor }]}>
                    {company.name}
                  </Text>
                </View>
              </SafeAreaView>
            </LinearGradient>
          </View>
        )}
      </View>

      {/* Products List */}
      <SectionList
        sections={[
          ...productsByCategory.categorizedGroups.map(group => ({
            title: group.category.nombre,
            icon: group.category.icono,
            data: group.products
          })),
          ...(productsByCategory.uncategorizedProducts.length > 0 ? [{
            title: 'Otros productos',
            icon: '📦',
            data: productsByCategory.uncategorizedProducts
          }] : [])
        ]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => {}}
            onAddToCart={undefined}
            buttonColor={buttonColor}
          />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.categoryHeader}>
            {section.icon && <Text style={styles.categoryIcon}>{section.icon}</Text>}
            <Text style={styles.categoryTitle} numberOfLines={1}>{section.title}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Business Hours */}
            <BusinessHours horarios={company.preferenciasWeb?.horarios} />

            {/* Description */}
            {company.description && (
              <View style={styles.descriptionCard}>
                <Text style={styles.description}>{company.description}</Text>
              </View>
            )}

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.gray500} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar productos..."
                placeholderTextColor={colors.gray500}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color={colors.gray400} />
                </TouchableOpacity>
              )}
            </View>

            {/* Category Chips */}
            {allCategories.length > 0 && (
              <View style={styles.categoryChipsContainer}>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={[{ id: null, nombre: 'Todas', icono: '🏪' }, ...allCategories]}
                  keyExtractor={(item) => item.id || 'all'}
                  contentContainerStyle={styles.categoryChipsList}
                  renderItem={({ item }) => {
                    const isSelected = selectedCategoryId === item.id;
                    return (
                      <TouchableOpacity
                        style={[
                          styles.categoryChip,
                          isSelected && styles.categoryChipSelected,
                          { borderColor: isSelected ? buttonColor : colors.gray200 }
                        ]}
                        onPress={() => setSelectedCategoryId(item.id)}
                        activeOpacity={0.7}
                      >
                        {item.icono && (
                          <Text style={styles.categoryChipIcon}>{item.icono}</Text>
                        )}
                        <Text
                          style={[
                            styles.categoryChipText,
                            isSelected && styles.categoryChipTextSelected,
                            { color: isSelected ? buttonColor : colors.gray600 }
                          ]}
                          numberOfLines={1}
                        >
                          {item.nombre}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name={searchQuery.trim() ? "search-outline" : "fast-food-outline"}
              size={64}
              color={colors.textQuaternary}
            />
            <Text style={styles.emptyTitle}>
              {searchQuery.trim() ? 'No hay resultados' : 'No hay productos'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery.trim()
                ? `No encontramos productos con "${searchQuery}"`
                : 'Esta empresa aún no ha agregado productos'
              }
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={buttonColor}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Social Links */}
      {company.redesSociales && company.redesSociales.length > 0 && (
        <FloatingSocialLinks
          socialLinks={company.redesSociales}
          isExpanded={socialLinksExpanded}
          onToggle={() => setSocialLinksExpanded(!socialLinksExpanded)}
          buttonColor={buttonColor}
        />
      )}
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  fullBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  backgroundOverlay: {
    flex: 1,
    backgroundColor: isDark ? 'rgba(18, 18, 18, 0.85)' : 'rgba(255, 255, 255, 0.85)',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  headerContainer: {
    position: 'relative',
  },

  headerBackground: {
    width: '100%',
  },

  headerNoPhotoContainer: {
    overflow: 'hidden',
  },

  headerClean: {
    paddingBottom: spacing.xl,
  },

  brandingClean: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },

  avatarClean: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },

  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },

  avatarInitials: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.gray800,
    letterSpacing: 0.5,
  },

  titleClean: {
    ...textStyles.title2,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 30,
  },

  brandingSoft: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    gap: 4,
  },

  nameBackdrop: {
    backgroundColor: 'rgba(253, 253, 253, 0.4)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginTop: 4,
    marginBottom: spacing.xs,
  },

  brandTitleSoft: {
    ...textStyles.title2,
    fontWeight: '800',
    fontSize: 22,
    letterSpacing: -0.3,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  brandAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },

  brandAvatarImg: {
    width: 76,
    height: 76,
    borderRadius: 38,
    resizeMode: 'cover',
  },

  brandAvatarMono: {
    fontWeight: '700',
    fontSize: 22,
    letterSpacing: 0.2,
  },

  catalogBadgeTopRight: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  catalogBadgeText: {
    ...textStyles.caption1,
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
  },

  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },

  descriptionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: isDark ? colors.black : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: isDark ? colors.gray200 : colors.gray100,
  },

  description: {
    ...textStyles.body,
    color: colors.textSecondary,
    lineHeight: 22,
    fontSize: 15,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: isDark ? colors.gray200 : colors.gray200,
    shadowColor: isDark ? colors.black : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 8,
  },

  searchIcon: {
    marginRight: spacing.sm,
  },

  searchInput: {
    flex: 1,
    ...textStyles.body,
    fontSize: 15,
    color: colors.text,
  },

  clearButton: {
    padding: 4,
  },

  categoryChipsContainer: {
    marginTop: 0,
    marginBottom: spacing.sm,
  },

  categoryChipsList: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },

  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: isDark ? colors.gray200 : colors.gray200,
    backgroundColor: isDark ? colors.gray100 : colors.gray50,
    marginRight: spacing.xs,
    gap: 4,
  },

  categoryChipSelected: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    ...shadows.sm,
  },

  categoryChipIcon: {
    fontSize: 14,
  },

  categoryChipText: {
    ...textStyles.caption,
    fontWeight: '600',
    color: colors.gray600,
    letterSpacing: 0.2,
  },

  categoryChipTextSelected: {
    fontWeight: '700',
    color: colors.gray900,
  },

  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    marginTop: 0,
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },

  categoryIcon: {
    fontSize: 18,
    opacity: 0.9,
  },

  categoryTitle: {
    ...textStyles.subheadline,
    fontWeight: '700',
    color: colors.gray800,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    fontSize: 12,
  },

  productCardWrapper: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: isDark ? colors.black : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: isDark ? colors.gray200 : colors.gray100,
  },

  productImageContainer: {
    width: 100,
    height: 100,
    backgroundColor: colors.gray100,
  },

  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
  },

  productInfo: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },

  productName: {
    ...textStyles.subheadline,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },

  productDescription: {
    ...textStyles.caption1,
    color: colors.textSecondary,
    marginBottom: 6,
  },

  productPrice: {
    ...textStyles.body,
    fontWeight: '700',
    fontSize: 18,
  },

  inactiveTag: {
    backgroundColor: colors.gray200,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: 'flex-start',
  },

  inactiveTagText: {
    ...textStyles.caption2,
    color: colors.gray600,
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
