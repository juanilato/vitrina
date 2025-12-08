/**
 * Home Screen - Modern Categories Dashboard
 * Rediseño con categorías destacadas y navegación mejorada
 */

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCategories } from '../../src/hooks/useCategories';
import { useCompanies } from '../../src/hooks/useCompanies';
import { CategoryCard3D, CategorySelector } from '../../src/components/categories';
import { MenuDrawer } from '../../src/components/navigation/MenuDrawer';
import { LocationsDrawer } from '../../src/components/navigation/LocationsDrawer';
import { textStyles, spacing, SIZES, COLORS } from '../../src/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLocation } from '../../src/contexts/LocationContext';
import { useActiveOrder } from '../../src/hooks/useActiveOrder';
import { useOrders } from '../../src/hooks/useOrders';
import { CompactActiveOrderCard } from '../../src/components/orders/CompactActiveOrderCard';
import { Logo } from '../../src/components/common/Logo';
import { LinearGradient } from 'expo-linear-gradient';
import { normalize } from '../../src/utils/responsive';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { categories, loading, refresh } = useCategories();
  const { companies } = useCompanies();
  const { selectedLocation } = useLocation();
  const { activeOrder, loading: loadingOrder, refresh: refreshOrder } = useActiveOrder();
  const { orders } = useOrders();
  const [refreshing, setRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [showLocationsDrawer, setShowLocationsDrawer] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Animaciones
  const navbarAnim = useRef(new Animated.Value(-50)).current;
  const headerAnim = useRef(new Animated.Value(30)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  // Animaciones para categorías (izquierda y derecha)
  const categoryLeftAnim = useRef(new Animated.Value(-width * 0.6)).current;
  const categoryRightAnim = useRef(new Animated.Value(width * 0.6)).current;
  const activeOrderAnim = useRef(new Animated.Value(0)).current;

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  // Animar entrada inicial (solo una vez)
  useEffect(() => {
    // Animación de entrada coordinada - más simple y clara
    const animations = [
      // 1. Navbar entra desde arriba
      Animated.spring(navbarAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      // 2. Header entra y categorías en paralelo
      Animated.parallel([
        // Header animation
        Animated.parallel([
          Animated.timing(headerOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(headerAnim, {
            toValue: 0,
            tension: 45,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        // Categorías entran desde los lados
        Animated.timing(categoryLeftAnim, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(categoryRightAnim, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
    ];

    Animated.sequence(animations).start();
  }, []);

  // Animar active order cuando llega
  useEffect(() => {
    if (activeOrder && !loadingOrder) {
      Animated.spring(activeOrderAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [activeOrder, loadingOrder]);

  // Obtener empresas para cada categoría (máximo 5)
  const getCategoryCompanies = (categoryId: string) => {
    return companies
      .filter((c) => c.categoriaId === categoryId)
      .map(c => ({ id: c.id, name: c.name, logo: c.logo }))
      .slice(0, 5);
  };

  // Obtener empresas recientes de los pedidos
  const getRecentCompanies = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    // Agrupar empresas únicas por ID, preservando el orden más reciente
    const companyMap = new Map();

    orders.forEach((order) => {
      if (order.empresa && order.empresa.id) {
        if (!companyMap.has(order.empresa.id)) {
          companyMap.set(order.empresa.id, order.empresa);
        }
      }
    });

    // Convertir a array y limitar a 6 empresas recientes
    return Array.from(companyMap.values()).slice(0, 6);
  }, [orders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refresh(), refreshOrder()]);
    setRefreshing(false);
  };

  const handleOpenLocationDrawer = () => {
    setShowLocationsDrawer(true);
  };

  const handleOpenMenuDrawer = () => {
    setShowMenuDrawer(true);
  };

  const renderCategoryGrid = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando categorías...</Text>
        </View>
      );
    }

    if (!categories || categories.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="grid-outline" size={normalize(64)} color={colors.textQuaternary} />
          <Text style={styles.emptyTitle}>No hay categorías</Text>
          <Text style={styles.emptySubtitle}>Intenta refrescar la pantalla</Text>
        </View>
      );
    }

    // Filtrar categorías válidas (con id)
    let validCategories = categories.filter(cat => cat && cat.id);

    // Aplicar filtro de búsqueda
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      validCategories = validCategories.filter(cat =>
        cat.nombre.toLowerCase().includes(query)
      );
    }

    if (validCategories.length === 0) {
      const isSearching = searchTerm.trim().length > 0;
      console.error('❌ No hay categorías válidas con ID');
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name={isSearching ? "search-outline" : "grid-outline"}
            size={normalize(64)}
            color={colors.textQuaternary}
          />
          <Text style={styles.emptyTitle}>
            {isSearching ? 'No hay resultados' : 'Error al cargar categorías'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {isSearching
              ? `No encontramos categorías con "${searchTerm}"`
              : 'Intenta refrescar la pantalla'
            }
          </Text>
        </View>
      );
    }

    // Crear carrusel horizontal - una al lado de la otra
    return (
      <View>
        <View style={styles.carouselTitleSection}>
          <Text style={styles.carouselTitle}>Categorías</Text>
        </View>
        <View style={styles.carouselSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
          >
            {validCategories.map((cat) => (
              <CategoryCard3D
                key={cat.id}
                id={cat.id}
                nombre={cat.nombre}
                icono={cat.icono}
                companies={getCategoryCompanies(cat.id)}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Modern Glass Navbar with Logo Card - Animated */}
      <Animated.View
        style={[
          styles.navbar,
          {
            transform: [{ translateY: navbarAnim }],
          }
        ]}
      >
        <LinearGradient
          colors={isDark
            ? ['rgba(30, 30, 30, 0.95)', 'rgba(30, 30, 30, 0.85)']
            : ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']
          }
          style={styles.navbarGradient}
        >
          {/* Logo Card */}
          <View style={styles.logoCard}>
            <View style={styles.logoIconContainer}>
              <Logo variant="icon" size={28} />
            </View>
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoTitle}>Vitrina</Text>
              {selectedLocation && (
                <View style={styles.locationBadge}>
                  <Ionicons name="location" size={10} color={colors.primary} />
                  <Text style={styles.locationBadgeText} numberOfLines={1}>
                    {selectedLocation.nombre}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.navActions}>
            <TouchableOpacity
              style={styles.glassButton}
              onPress={handleOpenLocationDrawer}
              activeOpacity={0.7}
            >
              <Ionicons name="location-outline" size={normalize(20)} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.glassButton}
              onPress={handleOpenMenuDrawer}
              activeOpacity={0.7}
            >
              <Ionicons name="menu-outline" size={normalize(20)} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Scroll Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header con animación */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerAnim }]
            }
          ]}
        >
          <Text style={styles.greeting}>Hola!</Text>
          <TextInput
            style={styles.subtitle}
            placeholder="¿Qué estás buscando hoy?"
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor={colors.textTertiary}
          />
        </Animated.View>

        {/* Active Order Card - Animated */}
        {activeOrder && !loadingOrder && (
          <Animated.View
            style={[
              styles.activeOrderSection,
              {
                opacity: activeOrderAnim,
                transform: [
                  {
                    translateY: activeOrderAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [60, 0],
                    }),
                  }
                ],
              }
            ]}
          >
            <CompactActiveOrderCard order={activeOrder} />
          </Animated.View>
        )}

        {/* Horizontal Carousel */}
        {renderCategoryGrid()}

        {/* Featured Section - Recent Companies */}
        {getRecentCompanies.length > 0 && (
          <View style={styles.featuredSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tus empresas frecuentes</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
            >
              {getRecentCompanies.map((empresa) => (
                <TouchableOpacity
                  key={empresa.id}
                  style={styles.companyCardRecent}
                  onPress={() => router.push(`/company/${empresa.name.replace(/\s+/g, '')}`)}
                  activeOpacity={0.7}
                >
                  {empresa.logo ? (
                    <Image
                      source={{ uri: empresa.logo }}
                      style={styles.companyLogoRecent}
                    />
                  ) : (
                    <View style={[styles.companyLogoRecent, styles.companyLogoPlaceholder]}>
                      <Text style={styles.companyLogoText}>
                        {empresa.name?.charAt(0).toUpperCase() || '?'}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.companyNameRecent} numberOfLines={1}>
                    {empresa.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Bottom spacer for floating tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Drawers */}
      <MenuDrawer visible={showMenuDrawer} onClose={() => setShowMenuDrawer(false)} />
      <LocationsDrawer
        visible={showLocationsDrawer}
        onClose={() => setShowLocationsDrawer(false)}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Navbar Styles - Cute & Soft
  navbar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    shadowColor: isDark ? colors.black : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  navbarGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: normalize(14),
    borderRadius: normalize(24),
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    backgroundColor: isDark ? 'rgba(42, 42, 42, 0.4)' : 'rgba(255, 255, 255, 0.8)',
  },

  // Logo Card Styles - Cute & Friendly
  logoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(10),
    borderRadius: normalize(20),
    gap: normalize(12),
    flex: 1,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
  },
  logoIconContainer: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(14),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  logoTextContainer: {
    flex: 1,
  },
  logoTitle: {
    ...textStyles.body,
    fontSize: normalize(20),
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    gap: normalize(4),
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(2),
    borderRadius: normalize(8),
  },
  locationBadgeText: {
    ...textStyles.caption1,
    fontSize: normalize(10),
    color: colors.primary,
    fontWeight: '700',
  },

  // Action Buttons - Cute & Friendly
  navActions: {
    flexDirection: 'row',
    gap: normalize(8),
  },
  glassButton: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(14),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.primary}12`,
    borderWidth: 1,
    borderColor: `${colors.primary}20`,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },

  // Legacy styles (kept for compatibility)
  navButton: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(8),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
  },
  navCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  appTitle: {
    ...textStyles.body,
    fontSize: normalize(16),
    color: colors.text,
    fontWeight: '700',
  },
  locationText: {
    ...textStyles.caption1,
    fontSize: normalize(11),
    color: colors.textSecondary,
    marginTop: 1,
  },
  navRight: {
    flexDirection: 'row',
    gap: normalize(8),
  },

  // Search Bar Styles
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: normalize(8),
    paddingHorizontal: spacing.sm,
    paddingVertical: normalize(8),
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...textStyles.body,
    fontSize: normalize(14),
    color: colors.text,
  },

  // Header Styles - Cute & Friendly
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greeting: {
    ...textStyles.headline,
    fontSize: normalize(28),
    color: colors.text,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -1,
  },
  subtitle: {
    ...textStyles.subheadline,
    fontSize: normalize(15),
    color: colors.textSecondary,
    fontWeight: '500',
    paddingHorizontal: spacing.xs,
  },

  // Active Order Section
  activeOrderSection: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
  },

  // Grid Styles - Cute spacing
  scrollView: {
    flex: 1,
  },
  grid: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },

  // Feed Style - Facebook/Instagram
  feedContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },

  // Carousel Style - Horizontal scrolling
  carouselTitleSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  carouselTitle: {
    ...textStyles.headline,
    fontSize: normalize(22),
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  carouselSection: {
    height: normalize(200),
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },

  // Featured Section
  featuredSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...textStyles.headline,
    fontSize: normalize(20),
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  seeAll: {
    ...textStyles.body,
    fontSize: normalize(13),
    fontWeight: '700',
    color: colors.primary,
  },
  companyCardRecent: {
    width: normalize(110),
    alignItems: 'center',
    marginRight: spacing.md,
    paddingVertical: spacing.sm,
  },
  companyLogoRecent: {
    width: normalize(80),
    height: normalize(80),
    borderRadius: normalize(16),
    backgroundColor: colors.gray100,
    marginBottom: spacing.sm,
  },
  companyLogoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.primary}15`,
  },
  companyLogoText: {
    fontSize: normalize(28),
    fontWeight: '700',
    color: colors.primary,
  },
  companyNameRecent: {
    ...textStyles.caption1,
    fontSize: normalize(12),
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  // Loading & Empty States - Cute & Friendly
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
    backgroundColor: `${colors.primary}05`,
    borderRadius: 20,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    borderWidth: 1,
    borderColor: `${colors.primary}10`,
  },
  loadingText: {
    ...textStyles.subheadline,
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontSize: normalize(14),
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
    backgroundColor: `${colors.primary}05`,
    borderRadius: 20,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    borderWidth: 1,
    borderColor: `${colors.primary}10`,
  },
  emptyTitle: {
    ...textStyles.headline,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    fontSize: normalize(20),
    fontWeight: '700',
  },
  emptySubtitle: {
    ...textStyles.subheadline,
    color: colors.textSecondary,
    fontSize: normalize(14),
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },

});
