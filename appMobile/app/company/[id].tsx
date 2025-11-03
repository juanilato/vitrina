/**
 * Company Store Screen
 * Muestra los productos de una empresa específica con todas sus preferencias
 */

import React, { useState, useMemo } from 'react';
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
  ImageBackground,
  Linking,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCompanyStore } from '../../src/hooks/useCompanyStore';
import { useCart } from '../../src/contexts/CartContext';
import { ProductCard } from '../../src/components/products/ProductCard';
import { ProductModal } from '../../src/components/products/ProductModal';
import { BusinessHours } from '../../src/components/companies/BusinessHours';
import { FloatingCartButton } from '../../src/components/cart/FloatingCartButton';
import { colors, textStyles, spacing, shadows, borderRadius } from '../../src/theme';
import { Product, Agregado } from '../../src/types/company';
import { CartIngredienteExtra } from '../../src/types/cart';
import { Animated, Easing } from 'react-native';
export default function CompanyStoreScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { company, loading, error, refreshing, refresh } = useCompanyStore(id);
  const { addItem, cart } = useCart();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Obtener colores personalizados de las preferencias
  const buttonColor = useMemo(() => {
    return company?.preferenciasWeb?.colorBotones || colors.primary;
  }, [company]);


  const handleQuickAddToCart = (productId: string) => {
    if (!company) return;

    const product = company.products?.find((p) => p.id === productId);
    if (!product) return;

    if (!product.activo) {
      Alert.alert('Producto no disponible', 'Este producto no está disponible en este momento');
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
    Alert.alert('Producto agregado', `${product.nombre} se agregó al carrito`);
  };

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };
    const iconCount = company?.redesSociales?.length || 0;
    const iconWidth = 20; // ancho aproximado de cada botón + gap
    const totalMenuWidth = iconCount * iconWidth;

  const [socialMenuOpen, setSocialMenuOpen] = useState(false);
  const slideAnim = useState(new Animated.Value(0))[0]; // controla el desplazamiento vertical del logo/título
  const fadeAnim = useState(new Animated.Value(0))[0]; // controla opacidad del menú

  const toggleSocialMenu = () => {
    const toValue = socialMenuOpen ? 0 : 1;
    setSocialMenuOpen(!socialMenuOpen);

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue,
        duration: 400,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAddToCartFromModal = (
    quantity: number,
    selectedAgregados: Agregado[],
    notes: string,
    ingredientesExtras?: CartIngredienteExtra[]
  ) => {
    if (!company || !selectedProduct) return;

    addItem(selectedProduct, company.id, company.name, quantity, selectedAgregados, notes, ingredientesExtras);
    Alert.alert('Producto agregado', `${selectedProduct.nombre} se agregó al carrito`);
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

  // Filtrar productos por búsqueda
  const filteredProducts = useMemo(() => {
    const allProducts = company.products || [];

    if (!searchQuery.trim()) {
      return allProducts;
    }

    const query = searchQuery.toLowerCase().trim();
    return allProducts.filter((product) =>
      product.nombre.toLowerCase().includes(query) ||
      product.descripcion?.toLowerCase().includes(query)
    );
  }, [company.products, searchQuery]);

  const activeProducts = filteredProducts.filter((p) => p.activo);
  const inactiveProducts = filteredProducts.filter((p) => !p.activo);

  // Debug: ver qué datos llegan
  console.log('🏢 Company data:', {
    name: company.name,
    logo: company.logo,
    dashboardFoto: company.preferenciasWeb?.dashboardFoto,
    colorBotones: company.preferenciasWeb?.colorBotones,
    colorFondo: company.preferenciasWeb?.colorFondo,
  });

  const dashboardFoto = company.preferenciasWeb?.dashboardFoto;

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
            <LinearGradient
              colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.75)']}
              style={styles.headerGradient}
            >
              <SafeAreaView edges={['top']}>
                {/* Top Bar */}
                <View style={styles.topBar}>
                  <TouchableOpacity onPress={() => router.back()} style={styles.backButtonModern}>
                    <Ionicons name="arrow-back" size={24} color={colors.white} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.cartButtonModern, { backgroundColor: buttonColor }]}
                    onPress={() => router.push('/(tabs)/cart')}
                  >
                    <Ionicons name="cart-outline" size={22} color={colors.white} />
                    {cart.totalItems > 0 && (
                      <View style={styles.cartBadgeModern}>
                        <Text style={styles.cartBadgeText}>
                          {cart.totalItems > 99 ? '99+' : cart.totalItems}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Company Info Centrado */}
<Animated.View
  style={[
    styles.companyInfoContainer,
    {
      transform: [
        {
          translateY: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -60], // se eleva 30px cuando se abre el menú
          }),
        },
      ],
    },
  ]}
>
  {company.logo && (
    <View style={styles.logoContainer}>
      <Image source={{ uri: company.logo }} style={styles.logoLarge} />
    </View>
  )}
  <Text style={styles.companyNameLarge} numberOfLines={2}>
    {company.name}
  </Text>

</Animated.View>

{/* Botón de menú de redes */}
<TouchableOpacity
  onPress={toggleSocialMenu}
  style={styles.socialMenuButton}
  activeOpacity={0.8}
>
  <Ionicons
    name={socialMenuOpen ? 'close' :'ellipsis-horizontal'}
    size={15}
    color={colors.white}
  />
</TouchableOpacity>

{/* Menú lateral de redes */}
<Animated.View
  style={[
    styles.socialMenuContainer,
    {
      opacity: fadeAnim,
    
      right: spacing.md + totalMenuWidth, // ✅ acá se aplica dinámicamente
    
      transform: [
        {
          translateX: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [totalMenuWidth, 0], // entra desde el costado derecho
          }),
        },
      ],
    },
  ]}
>
  {company.redesSociales?.map((social, index) => {
    const getSocialIcon = (key: string) => {
      const iconMap: Record<string, any> = {
        instagram: 'logo-instagram',
        facebook: 'logo-facebook',
        twitter: 'logo-twitter',
        whatsapp: 'logo-whatsapp',
        tiktok: 'logo-tiktok',
        web: 'globe-outline',
      };
      return iconMap[key.toLowerCase()] || 'link-outline';
    };

    const getSocialUrl = (key: string, value: string) => {
      const urlMap: Record<string, (v: string) => string> = {
        instagram: (v) => `https://instagram.com/${v.replace('@', '')}`,
        facebook: (v) => `https://facebook.com/${v}`,
        twitter: (v) => `https://twitter.com/${v.replace('@', '')}`,
        whatsapp: (v) => `https://wa.me/${v}`,
        tiktok: (v) => `https://tiktok.com/@${v.replace('@', '')}`,
      };
      return urlMap[key.toLowerCase()]?.(value) || value;
    };

    return (
      <TouchableOpacity
        key={index}
        onPress={async () => {
          const url = getSocialUrl(social.key, social.value);
          const canOpen = await Linking.canOpenURL(url);
          if (canOpen) await Linking.openURL(url);
          else Alert.alert('Error', 'No se pudo abrir el enlace');
        }}
        style={styles.socialMenuIcon}
        activeOpacity={0.8}
      >
        <Ionicons
          name={getSocialIcon(social.key)}
          size={22}
          color={colors.white}
        />
      </TouchableOpacity>
    );
  })}
</Animated.View>
              </SafeAreaView>
            </LinearGradient>
          </ImageBackground>
        ) : (
          <LinearGradient
            colors={[buttonColor, `${buttonColor}CC`]}
            style={styles.headerGradient}
          >
            <SafeAreaView edges={['top']}>
              {/* Top Bar */}
              <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButtonModern}>
                  <Ionicons name="arrow-back" size={24} color={colors.white} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.cartButtonModern, { backgroundColor: 'rgba(255,255,255,0.3)' }]}
                  onPress={() => router.push('/(tabs)/cart')}
                >
                  <Ionicons name="cart-outline" size={22} color={colors.white} />
                  {cart.totalItems > 0 && (
                    <View style={styles.cartBadgeModern}>
                      <Text style={styles.cartBadgeText}>
                        {cart.totalItems > 99 ? '99+' : cart.totalItems}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Company Info Centrado */}
              <View style={styles.companyInfoContainer}>
                {company.logo && (
                  <View style={styles.logoContainer}>
                    <Image source={{ uri: company.logo }} style={styles.logoLarge} />
                  </View>
                )}
                <Text style={styles.companyNameLarge} numberOfLines={2}>
                  {company.name}
                </Text>
                {company.alias && (
                  <Text style={styles.companyAliasLarge}>
                    @{company.alias}
                  </Text>
                )}
              </View>
            </SafeAreaView>
          </LinearGradient>
        )}
      </View>

      {/* Products List */}
      <FlatList
        data={[...activeProducts, ...inactiveProducts]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => handleProductPress(item)}
            onAddToCart={() => handleQuickAddToCart(item.id)}
            buttonColor={buttonColor}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Business Hours */}
{company.preferenciasWeb?.horarios && (
  <BusinessHours horarios={company.preferenciasWeb.horarios} />
)}



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
      <FloatingCartButton buttonColor={buttonColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
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

  backButtonModern: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cartButtonModern: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 22,
    position: 'relative',
    ...shadows.md,
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
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.white,
    padding: 3,
    marginBottom: spacing.sm,
    ...shadows.lg,
  },

  logoLarge: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },

  companyNameLarge: {
    ...textStyles.title1,
    color: colors.white,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs / 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  companyAliasLarge: {
    ...textStyles.footnote,
    color: colors.white,
    fontWeight: '500',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },

  descriptionCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },

  description: {
    ...textStyles.body,
    color: colors.text,
    lineHeight: 22,
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
    ...shadows.sm,
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
});
