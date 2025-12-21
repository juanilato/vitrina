/**
 * Home Screen - Clean & Organized
 * Pedido actual en header, categorías pequeñas y organizadas
 */

import React, { useState, useMemo } from 'react';
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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCategories } from '../../src/hooks/useCategories';
import { useCompanies } from '../../src/hooks/useCompanies';
import { CategoryCard3D } from '../../src/components/categories';
import { MenuDrawer } from '../../src/components/navigation/MenuDrawer';
import { LocationsDrawer } from '../../src/components/navigation/LocationsDrawer';
import { textStyles, spacing } from '../../src/theme';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [showLocationsDrawer, setShowLocationsDrawer] = useState(false);

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const getCategoryCompanies = (categoryId: string) => {
    return companies
      .filter((c) => c.categoriaId === categoryId)
      .map(c => ({ id: c.id, name: c.name, logo: c.logo }))
      .slice(0, 5);
  };

  const getRecentCompanies = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    const companyMap = new Map();
    orders.forEach((order) => {
      if (order.empresa && order.empresa.id) {
        if (!companyMap.has(order.empresa.id)) {
          companyMap.set(order.empresa.id, order.empresa);
        }
      }
    });
    return Array.from(companyMap.values()).slice(0, 6);
  }, [orders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refresh(), refreshOrder()]);
    setRefreshing(false);
  };

  const renderCategories = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (!categories || categories.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="apps-outline" size={normalize(60)} color={colors.gray400} />
          <Text style={styles.emptyText}>Desliza para actualizar</Text>
        </View>
      );
    }

    let validCategories = categories.filter(cat => cat && cat.id);

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      validCategories = validCategories.filter(cat =>
        cat.nombre.toLowerCase().includes(query)
      );
    }

    if (validCategories.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={normalize(60)} color={colors.gray400} />
          <Text style={styles.emptyText}>Sin resultados</Text>
        </View>
      );
    }

    // Grid organizado de 2 columnas
    return (
      <View style={styles.categoriesGrid}>
        {validCategories.map((cat) => (
          <View key={cat.id} style={styles.categoryItem}>
            <CategoryCard3D
              id={cat.id}
              nombre={cat.nombre}
              icono={cat.icono}
              companies={getCategoryCompanies(cat.id)}
            />
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header con degradado azul y bordes redondeados estilo burbuja */}
      <LinearGradient
        colors={['#0A2A43', '#0D3354']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          {/* Top bar - Logo a la izquierda, botones a la derecha */}
          <View style={styles.topBar}>
            {/* Logo y nombre */}
            <View style={styles.logoSection}>
              <Logo variant="icon" size={20} />
              <Text style={styles.logoText}>Vitrina</Text>
            </View>

            {/* Botones de acción */}
            <View style={styles.actionsButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowMenuDrawer(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="menu" size={normalize(20)} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowLocationsDrawer(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="location" size={normalize(20)} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search bar - solo si NO hay pedido activo */}
          {!activeOrder && (
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={normalize(20)} color={colors.gray500} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholderTextColor={colors.gray500}
              />
              {searchTerm.length > 0 && (
                <TouchableOpacity onPress={() => setSearchTerm('')}>
                  <Ionicons name="close-circle" size={normalize(20)} color={colors.gray400} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Active Order Card dentro del header - fusionado con el diseño */}
          {activeOrder && !loadingOrder && (
            <View style={styles.activeOrderInHeader}>
              <CompactActiveOrderCard order={activeOrder} />
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>

      {/* Content - Scroll */}
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
        {/* Categorías organizadas */}
        <View style={styles.content}>
          {renderCategories()}
        </View>

        {/* Empresas recientes */}
        {getRecentCompanies.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recientes</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentScroll}
            >
              {getRecentCompanies.map((empresa) => (
                <TouchableOpacity
                  key={empresa.id}
                  style={styles.recentCard}
                  onPress={() => router.push(`/company/${empresa.name.replace(/\s+/g, '')}`)}
                  activeOpacity={0.8}
                >
                  {empresa.logo ? (
                    <Image
                      source={{ uri: empresa.logo }}
                      style={styles.recentLogo}
                    />
                  ) : (
                    <View style={[styles.recentLogo, styles.recentLogoPlaceholder]}>
                      <Text style={styles.recentLogoText}>
                        {empresa.name?.charAt(0).toUpperCase() || '?'}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.recentName} numberOfLines={1}>
                    {empresa.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Drawers */}
      <MenuDrawer visible={showMenuDrawer} onClose={() => setShowMenuDrawer(false)} />
      <LocationsDrawer
        visible={showLocationsDrawer}
        onClose={() => setShowLocationsDrawer(false)}
      />
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header azul con bordes redondeados estilo burbuja
  headerGradient: {
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: normalize(32),
    borderBottomRightRadius: normalize(32),
    // Sombra suave
    shadowColor: '#0A2A43',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
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
  },
  actionsButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionButton: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(8),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    // Sin borde
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  logoText: {
    ...textStyles.headline,
    fontSize: normalize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(14),
    paddingHorizontal: spacing.md,
    paddingVertical: normalize(12),
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    ...textStyles.body,
    fontSize: normalize(15),
    color: colors.text,
  },

  // Active Order en header - sin márgenes para que se fusione
  activeOrderInHeader: {
    marginTop: spacing.md,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.md,
  },

  // Content
  content: {
    paddingHorizontal: spacing.lg,
  },

  // Categorías - Grid organizado 2 columnas
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
  },

  // Recientes
  recentSection: {
    marginTop: spacing['2xl'],
    paddingLeft: spacing.lg,
  },
  recentTitle: {
    ...textStyles.headline,
    fontSize: normalize(18),
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  recentScroll: {
    paddingRight: spacing.lg,
    gap: spacing.md,
  },
  recentCard: {
    alignItems: 'center',
    width: normalize(90),
  },
  recentLogo: {
    width: normalize(64),
    height: normalize(64),
    borderRadius: normalize(32),
    backgroundColor: colors.gray100,
    marginBottom: spacing.xs,
  },
  recentLogoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.primary}15`,
  },
  recentLogoText: {
    fontSize: normalize(24),
    fontWeight: '700',
    color: colors.primary,
  },
  recentName: {
    ...textStyles.caption1,
    fontSize: normalize(11),
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },

  // Loading & Empty
  loadingContainer: {
    paddingVertical: spacing['4xl'],
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: spacing['4xl'],
    alignItems: 'center',
  },
  emptyText: {
    ...textStyles.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontSize: normalize(14),
  },
});
