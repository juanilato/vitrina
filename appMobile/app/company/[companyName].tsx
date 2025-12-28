/**
 * Company Store Screen
 * Muestra los productos de una empresa específica con todas sus preferencias
 */

import React, { useState, useMemo, useEffect } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePublicCompanyStore } from '../../src/hooks/usePublicCompanyStore';
import { useCart } from '../../src/contexts/CartContext';
import { ProductCard } from '../../src/components/products/ProductCard';
import { ProductModal } from '../../src/components/products/ProductModal';
import { BusinessHours } from '../../src/components/companies/BusinessHours';
import { FloatingCartButton } from '../../src/components/cart/FloatingCartButton';
import { FloatingSocialLinks } from '../../src/components/companies/FloatingSocialLinks';
import { Toast } from '../../src/components/common';
import { CategoryLoader } from '../../src/components/categories';
import { textStyles, spacing, shadows, borderRadius } from '../../src/theme';
import { Product, Agregado, Promocion } from '../../src/types/company';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getActivePromociones, isPromocionActiveNow, getPromoScheduleText } from '../../src/utils/promotions';
import { CartIngredienteExtra } from '../../src/types/cart';
import { Animated, Easing, LayoutAnimation, Platform, UIManager } from 'react-native';
import ratingService from '../../src/services/rating.service';
import { RatingStars } from '../../src/components/common/RatingStars';
export default function CompanyStoreScreen() {
  const { companyName } = useLocalSearchParams<{ companyName: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const { company, loading, error, refreshing, refresh } = usePublicCompanyStore(companyName);
  const { addItem, cart } = useCart();

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [socialLinksExpanded, setSocialLinksExpanded] = useState(false);
  const [companyRating, setCompanyRating] = useState<{ promedio: number; totalValoraciones: number } | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const buttonColor = useMemo(
    () => company?.preferenciasWeb?.colorBotones || colors.primary,
    [company]
  );

  // Cargar promedio de calificaciones
  useEffect(() => {
    if (company?.id) {
      ratingService.getCompanyAverage(company.id)
        .then((data) => {
          if (data.totalValoraciones > 0) {
            setCompanyRating(data);
          }
        })
        .catch((error) => {
          console.error('Error loading company rating:', error);
        });
    }
  }, [company?.id]);

  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
  const isColorDark = (hex: string) => {
    if (!hex) return false;
    const cleaned = hex.replace('#', '');
    const bigint = parseInt(cleaned.length === 3
      ? cleaned.split('').map(c => c + c).join('')
      : cleaned, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    // Luma formula
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    return luma < 140; // cuanto más bajo, más oscuro
  };
  // Filtrar productos por búsqueda y categoría - DEBE estar antes de los early returns
  const filteredProducts = useMemo(() => {
    let allProducts = company?.products || [];
    console.log('🔍 [FILTER] selectedCategoryId:', selectedCategoryId);

    // Filtrar por categoría si hay una seleccionada
    if (selectedCategoryId) {
      allProducts = allProducts.filter((product) => {
        const hasCategory = product.categorias?.some((catRelation) => catRelation.categoria.id === selectedCategoryId);
        console.log('🔍 [FILTER] Producto:', product.nombre, 'tiene categoría?', hasCategory);
        return hasCategory;
      });
      console.log('🔍 [FILTER] Productos filtrados por categoría:', allProducts.length);
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
  const inactiveProducts = filteredProducts.filter((p) => !p.activo);

  // Obtener todas las categorías únicas
  const allCategories = useMemo(() => {
    const categoriesMap = new Map();
    console.log('🔍 [DEBUG] Total productos:', company?.products?.length);
    company?.products?.forEach((product) => {
      console.log('🔍 [DEBUG] Producto:', product.nombre, 'Categorías:', product.categorias);
      product.categorias?.forEach((catRelation) => {
        if (!categoriesMap.has(catRelation.categoria.id)) {
          categoriesMap.set(catRelation.categoria.id, catRelation.categoria);
        }
      });
    });
    const categories = Array.from(categoriesMap.values()).sort((a, b) => a.orden - b.orden);
    console.log('🔍 [DEBUG] Categorías encontradas:', categories);
    return categories;
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

    // Convertir Map a array y ordenar por orden de categoría
    const categorizedGroups = Array.from(categoriesMap.values()).sort(
      (a, b) => a.category.orden - b.category.orden
    );

    return { categorizedGroups, uncategorizedProducts };
  }, [activeProducts]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleQuickAddToCart = (productId: string) => {
    if (!company) return;

    const product = company.products?.find((p) => p.id === productId);
    if (!product) return;

    if (!product.activo) {
      showToast('Este producto no está disponible en este momento', 'warning');
      return;
    }

    // Si tiene agregados o ingredientes extras, abrir modal
    const hasAgregados = product.agregados && product.agregados.filter((a) => a.activo).length > 0;
    const hasIngredientesExtras = product.ingredientes && product.ingredientes.filter((pi) => pi.esExtraPermitido).length > 0;

    if (hasAgregados || hasIngredientesExtras) {
      handleProductPress(product);
      return;
    }

    // Agregar directo sin agregados ni ingredientes extras
    addItem(product, company.id, company.name, 1);
    showToast(`${product.nombre} se agregó al carrito`, 'success');
  };

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const handleAddToCartFromModal = (
    quantity: number,
    selectedAgregados: Agregado[],
    notes: string,
    ingredientesExtras?: CartIngredienteExtra[]
  ) => {
    if (!company || !selectedProduct) return;

    addItem(selectedProduct, company.id, company.name, quantity, selectedAgregados, notes, ingredientesExtras);
    showToast(`${selectedProduct.nombre} se agregó al carrito`, 'success');
  };

  if (loading && !refreshing) {
    return (
      <CategoryLoader
        categoryName={company?.categoria?.nombre || 'Cargando'}
        categoryIcon={company?.categoria?.icono}
        isVisible={true}
      />
    );
  }

  const fondo = company?.preferenciasWeb?.colorFondo || buttonColor;
  const fondoOscuro = isColorDark(fondo);
  const textoColor = fondoOscuro ? colors.white : colors.text; // blanco si el fondo es oscuro
  const panelColor = fondoOscuro
    ? 'rgba(255,255,255,0.12)'
    : 'rgba(0,0,0,0.05)';
  if (error || !company) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={textoColor} />
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
  const dashboardFoto = company.preferenciasWeb?.dashboardFoto;
  // Debug: ver qué datos llegan
  console.log('🏢 Company data:', {
    name: company.name,
    logo: company.logo,
    dashboardFoto: company.preferenciasWeb?.dashboardFoto,
    colorBotones: company.preferenciasWeb?.colorBotones,
    colorFondo: company.preferenciasWeb?.colorFondo,
  });


  return (
    <View style={styles.container}>
      {/* Dashboard Background para toda la pantalla */}
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

      {/* Header Moderno con Dashboard Background */}
      <View style={styles.headerContainer}>

        {company.preferenciasWeb?.dashboardFoto ? (
          <ImageBackground
            source={{ uri: company.preferenciasWeb.dashboardFoto }}
            style={styles.headerBackground}
            resizeMode="cover"
          >

            <SafeAreaView edges={['top']}>
              {/* Top Bar */}
              <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButtonModern}>
                  <Ionicons name="arrow-back" size={24} color={textoColor} />
                </TouchableOpacity>

                <View style={styles.spacer} />

              </View>

              {/* Company Info Centrado */}
              {/* Branding iOS SOFT */}
              <View style={styles.brandingSoft}>
                {/* Avatar limpio sin borde blanco */}
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
                      {company.name?.slice(0, 2)?.toUpperCase() ?? 'E'}
                    </Text>
                  </View>
                )}

                {/* Título sobrio + acento mínimo con fondo para contraste */}
                <View style={styles.nameBackdrop}>
                  <Text
                    numberOfLines={1}
                    style={[styles.brandTitleSoft, { color: textoColor }]}
                  >
                    {company.name}
                  </Text>
                </View>

                {/* Acento de color MUY sutil */}

              </View>

              {/* Calificación promedio - Chip positioned at top right */}
              {companyRating && companyRating.totalValoraciones > 0 && (
                <View style={styles.ratingChipTopRight}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.ratingText}>
                    {companyRating.promedio.toFixed(1)}
                  </Text>
                  <Text style={[styles.ratingText, { fontSize: 11, fontWeight: '600', color: colors.gray600 }]}>
                    ({companyRating.totalValoraciones})
                  </Text>
                </View>
              )}

            </SafeAreaView>

          </ImageBackground>
        ) : (
          <View style={styles.headerNoPhotoContainer}>
            {/* Gradiente sutil vertical - estilo iOS minimalista */}
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
                {/* Top Bar - Minimalista */}
                <View style={styles.topBarClean}>
                  <TouchableOpacity onPress={() => router.back()} style={[
                    styles.backButtonClean,
                    { backgroundColor: fondoOscuro ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.35)' }
                  ]}>
                    <Ionicons name="arrow-back" size={22} color={textoColor} />
                  </TouchableOpacity>
                </View>

                {/* Branding Minimalista iOS */}
                <View style={styles.brandingClean}>
                  {/* Avatar limpio */}
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
                        {company.name?.slice(0, 2)?.toUpperCase() ?? 'E'}
                      </Text>
                    </View>
                  )}

                  {/* Título limpio */}
                  <Text numberOfLines={2} style={[styles.titleClean, { color: textoColor }]}>
                    {company.name}
                  </Text>
                </View>

                {/* Calificación promedio - Chip positioned at top right */}
                {companyRating && companyRating.totalValoraciones > 0 && (
                  <View style={styles.ratingChipTopRight}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>
                      {companyRating.promedio.toFixed(1)}
                    </Text>
                    <Text style={[styles.ratingText, { fontSize: 11, fontWeight: '600', color: colors.gray600 }]}>
                      ({companyRating.totalValoraciones})
                    </Text>
                  </View>
                )}
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
          }] : []),
          ...(inactiveProducts.length > 0 ? [{
            title: 'Productos no disponibles',
            icon: '🚫',
            data: inactiveProducts
          }] : [])
        ]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          // 1. Find applicable promotions using time-aware validation
          const activePromotions = company.promociones?.filter(promo => {
            if (!promo.activo) return false;

            // Check if promo is active (day + time, including midnight-crossing schedules)
            if (!isPromocionActiveNow(promo.configuracion)) return false;

            // Check scope
            if (promo.alcance === 'SELECCIONADOS') {
              // Check if product is in the list
              const isIncluded = promo.productos?.some((p: any) => p.productoId === item.id);
              if (!isIncluded) return false;
            }

            return true;
          }) || [];

          // 2. Calculate best discounted price
          let bestPrice = item.precio;
          let hasDiscount = false;

          activePromotions.forEach(promo => {
            let currentPrice = item.precio;

            if (promo.tipo === 'CANTIDAD') {
              // Direct discount (quantity 1) or volume discount
              // If quantity > 1, it's conditional, but we might want to show the potential price?
              // For now, let's strictly apply strike-through only for direct unit discounts (quantity === 1)
              // OR if the user wants to see the "offer" price.
              // The user said: "if it says 10 percent off... price must be crossed out".
              // Let's assume this applies primarily to direct discounts.
              if (promo.configuracion.cantidadCompra === 1 && promo.configuracion.porcentajeDescuento) {
                const discount = (item.precio * promo.configuracion.porcentajeDescuento) / 100;
                currentPrice = item.precio - discount;
              }
            }

            // else if (promo.tipo === 'BXPY') {
            //   // Effective price per unit: (Paga / Lleva) * Precio
            //   if (promo.configuracion.cantidadLleva && promo.configuracion.cantidadPaga) {
            //     const ratio = promo.configuracion.cantidadPaga / promo.configuracion.cantidadLleva;
            //     currentPrice = item.precio * ratio;
            //   }
            // }

            if (currentPrice < bestPrice) {
              bestPrice = currentPrice;
              hasDiscount = true;
            }
          });

          return (
            <ProductCard
              product={item}
              onPress={() => handleProductPress(item)}
              onAddToCart={() => handleQuickAddToCart(item.id)}
              buttonColor={buttonColor}
              promotions={activePromotions}
              discountedPrice={hasDiscount ? bestPrice : undefined}
            />
          );
        }}
        renderSectionHeader={({ section }) => (
          <View style={styles.categoryHeader}>
            {section.icon && <Text style={styles.categoryIcon}>{section.icon}</Text>}
            <Text style={styles.categoryTitle} numberOfLines={1}>{section.title}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Business Hours - Siempre visible */}
            <BusinessHours horarios={company.preferenciasWeb?.horarios} />

            {/* Description */}
            {company.description && (
              <View style={styles.descriptionCard}>
                <Text style={styles.description}>{company.description}</Text>
              </View>
            )}

            {/* Promotions Section - Only show active promos */}
            {(() => {
              const activePromos = company.promociones ? getActivePromociones(company.promociones as Promocion[]) : [];
              if (activePromos.length === 0) return null;

              return (
                <View style={styles.promotionsSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="pricetag" size={14} color={colors.textSecondary} />
                    <Text style={styles.sectionTitle}>Promociones activas</Text>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promotionsList}>
                    {activePromos.map((promo) => (
                      <View key={promo.id} style={styles.promotionCard}>
                        <View style={[styles.promotionIconContainer, { backgroundColor: `${buttonColor}15` }]}>
                          <Ionicons name="gift" size={16} color={buttonColor} />
                        </View>
                        <View style={styles.promotionInfo}>
                          <Text style={styles.promotionName}>{promo.nombre}</Text>
                          {promo.descripcion ? (
                            <Text style={styles.promotionDescription} numberOfLines={2}>
                              {promo.descripcion}
                            </Text>
                          ) : (
                            <Text style={styles.promotionDescription} numberOfLines={1}>
                              {getPromoScheduleText(promo.configuracion)}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              );
            })()}

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

            {/* Category Chips - Solo mostrar si hay categorías */}
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

            {/* Products Section Header */}

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

      {/* Product Modal */}
      <ProductModal
        visible={modalVisible}
        product={selectedProduct}
        onClose={() => {
          setModalVisible(false);
          setSelectedProduct(null);
        }}
        onAddToCart={handleAddToCartFromModal}
        buttonColor={buttonColor}
      />

      {/* Floating Cart Button */}
      <FloatingCartButton
        buttonColor={buttonColor}
        from="company"
        companyName={companyName}
        companyId={company.id}
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

      {/* Toast Notification */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerNoPhotoContainer: {
    overflow: 'hidden',
  },
  // Header limpio y minimalista
  headerClean: {
    paddingBottom: spacing.xl,
  },
  topBarClean: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  backButtonClean: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandingClean: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
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
    paddingTop: spacing.xs,   // antes spacing.sm
    paddingBottom: spacing.sm,    // antes spacing.lg
    gap: 4,                       // antes 6
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

  // Rating chip positioned at top right
  ratingChipTopRight: {
    position: 'absolute',
    top: 70,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.gray900,
  },

  // Avatar limpio sin borde blanco
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
  headerFormal: {
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,   // menor
    shadowRadius: 10,
    elevation: 8,


  },

  formalPanel: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: spacing.lg,
    borderRadius: 24,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,

  },

  logoContainerFormal: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.sm,
  },

  companyNameFormal: {
    ...textStyles.title2,

    fontWeight: '800',
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },


  brandAvatarMono: {
    fontWeight: '700',
    fontSize: 22,
    letterSpacing: 0.2,
  },




  bottomDivider: {

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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  socialChipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    ...shadows.sm,
  },

  socialChipLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  socialChipText: {
    ...textStyles.subheadline,
    color: colors.text,
    fontWeight: '600',
  },

  socialChipIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  socialFloatingContainer: {
    position: 'absolute',
    bottom: spacing.xs, // separación inferior
    left: spacing.xs, // separación del borde derecho
    flexDirection: 'row',
    gap: 10,
  },
  socialMenuButton: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 22,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  socialMenuContainer: {
    position: 'absolute',
    bottom: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  socialMenuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  socialIconFloating: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)', // fondo translúcido elegante
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerContainer: {
    position: 'relative',
  },

  headerBackground: {
    width: '100%',
  },

  headerGradient: {
    paddingBottom: spacing.md,
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },

  spacer: {
    flex: 1,
  },

  backButtonModern: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },

  cartButtonModern: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },

  cartBadgeModern: {
    position: 'absolute',
    top: -6,
    right: -6,
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

  companyInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },

  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    padding: 4,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },

  logoLarge: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  },

  companyNameLarge: {
    ...textStyles.title1,
    color: colors.white,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.xs / 2,
    fontSize: 24,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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

  // Search Bar - Modern Glass
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

  socialLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },

  socialLinkText: {
    ...textStyles.subheadline,
    color: colors.text,
    fontWeight: '600',
  },

  listHeader: {
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },

  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },

  sectionTitle: {
    ...textStyles.title2,
    fontWeight: '700',
  },

  productCount: {
    ...textStyles.subheadline,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  socialIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  socialIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    color: colors.white,
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

  // Category Header Styles - Más sutiles y modernos
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

  // Category Chips Styles - Sutiles y pequeños
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

  promotionsSection: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    gap: 6,
  },
  sectionTitle: {
    ...textStyles.subheadline,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  promotionsList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  promotionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? colors.gray100 : colors.gray50,
    borderRadius: 8,
    padding: spacing.sm,
    width: 240,
    gap: 10,
    borderWidth: 1,
    borderColor: isDark ? colors.gray200 : colors.gray200,
  },
  promotionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promotionInfo: {
    flex: 1,
  },
  promotionName: {
    ...textStyles.caption1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 0,
  },
  promotionDescription: {
    ...textStyles.caption2,
    color: colors.textTertiary,
    fontSize: 11,
    lineHeight: 14,
  },
});
