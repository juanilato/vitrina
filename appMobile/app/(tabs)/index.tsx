/**
 * Home Screen - Modern Categories Dashboard
 * Rediseño con categorías destacadas y navegación mejorada
 */

import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCategories } from '../../src/hooks/useCategories';
import { CategoryCard } from '../../src/components/categories/CategoryCard';
import { MenuDrawer } from '../../src/components/navigation/MenuDrawer';
import { LocationsDrawer } from '../../src/components/navigation/LocationsDrawer';
import { colors, textStyles, spacing } from '../../src/theme';
import { useLocation } from '../../src/contexts/LocationContext';
import { useActiveOrder } from '../../src/hooks/useActiveOrder';
import { ActiveOrderCard } from '../../src/components/orders/ActiveOrderCard';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { categories, loading, refresh } = useCategories();
  const { selectedLocation } = useLocation();
  const { activeOrder, loading: loadingOrder, refresh: refreshOrder } = useActiveOrder();
  const [refreshing, setRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [showLocationsDrawer, setShowLocationsDrawer] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refresh(), refreshOrder()]);
    setRefreshing(false);
  };

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    console.log('[HomeScreen] Category pressed:', {
      id: categoryId,
      name: categoryName,
    });

    // Validar que tenemos un ID válido
    if (!categoryId) {
      console.error('[HomeScreen] Cannot navigate: categoryId is undefined');
      return;
    }

    // Navegar a pantalla de empresas filtradas por categoría
    router.push({
      pathname: '/category/[id]',
      params: { id: categoryId, name: categoryName },
    });
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
          <Ionicons name="grid-outline" size={64} color={colors.textQuaternary} />
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
            size={64}
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

    // Crear patrón alternado: 2 normales, 1 wide, 2 normales, 1 wide...
    const grid = [];
    let i = 0;

    while (i < validCategories.length) {
      const row = [];

      // Cada 3 filas (6 categorías), insertar una categoría wide
      if (i > 0 && i % 6 === 0 && i < validCategories.length) {
        const cat = validCategories[i];
        // Validar que cat existe y tiene id antes de renderizar
        if (cat && cat.id) {
          grid.push(
            <View key={`row-wide-${cat.id}`} style={styles.row}>
              <CategoryCard
                id={cat.id}
                nombre={cat.nombre}
                icono={cat.icono}
                onPress={() => handleCategoryPress(cat.id, cat.nombre)}
                variant="wide"
              />
            </View>
          );
        }
        i++;
      } else {
        // Fila normal con 2 categorías
        if (i < validCategories.length) {
          const cat = validCategories[i];
          // Validar que cat existe y tiene id antes de renderizar
          if (cat && cat.id) {
            row.push(
              <CategoryCard
                key={cat.id}
                id={cat.id}
                nombre={cat.nombre}
                icono={cat.icono}
                onPress={() => handleCategoryPress(cat.id, cat.nombre)}
              />
            );
          }
          i++;
        }

        if (i < validCategories.length) {
          const cat = validCategories[i];
          // Validar que cat existe y tiene id antes de renderizar
          if (cat && cat.id) {
            row.push(
              <CategoryCard
                key={cat.id}
                id={cat.id}
                nombre={cat.nombre}
                icono={cat.icono}
                onPress={() => handleCategoryPress(cat.id, cat.nombre)}
              />
            );
          }
          i++;
        }

        if (row.length > 0) {
          grid.push(
            <View key={`row-${i}`} style={styles.row}>
              {row}
            </View>
          );
        }
      }
    }

    return <View style={styles.grid}>{grid}</View>;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Custom Navbar */}
      <View style={styles.navbar}>
        {/* Left Side - Location Drawer Button */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={handleOpenLocationDrawer}
          activeOpacity={0.7}
        >
          <Ionicons name="location-outline" size={20} color={colors.gray700} />
        </TouchableOpacity>

        {/* Center - Logo & Location */}
        <View style={styles.navCenter}>
          <Text style={styles.appTitle}>Vitrina</Text>
          {selectedLocation && (
            <Text style={styles.locationText} numberOfLines={1}>
              {selectedLocation.nombre}
            </Text>
          )}
        </View>

        {/* Right Side - Search & Menu */}
        <View style={styles.navRight}>


          <TouchableOpacity
            style={styles.navButton}
            onPress={handleOpenMenuDrawer}
            activeOpacity={0.7}
          >
            <Ionicons name="menu-outline" size={20} color={colors.gray700} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar (Expandible) */}
  

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
              <View style={styles.header}>
          <Text style={styles.greeting}>Hola!</Text>
          <TextInput
              style={styles.subtitle}
              placeholder="¿Qué estás buscando hoy?"
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor={colors.textTertiary}
            />
        </View>
        {/* Active Order Card */}
        {activeOrder && !loadingOrder && (
          <View style={styles.activeOrderSection}>
            <ActiveOrderCard order={activeOrder} />
          </View>
        )}

        {/* Header */}


        {/* Categories Grid */}
        {renderCategoryGrid()}

        {/* Bottom spacer */}
        <View style={{ height: spacing.xl }} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Navbar Styles
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
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
    fontSize: 16,
    color: colors.gray900,
    fontWeight: '700',
  },
  locationText: {
    ...textStyles.caption1,
    fontSize: 11,
    color: colors.gray600,
    marginTop: 1,
  },
  navRight: {
    flexDirection: 'row',
    gap: 8,
  },

  // Search Bar Styles
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...textStyles.body,
    fontSize: 14,
    color: colors.gray900,
  },

  // Header Styles
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  greeting: {
    ...textStyles.headline,
    fontSize: 20,
    color: colors.gray900,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    ...textStyles.subheadline,
    fontSize: 14,
    color: colors.gray600,
    fontWeight: '400',
  },

  // Active Order Section
  activeOrderSection: {
    paddingTop: spacing.md,
  },

  // Grid Styles
  scrollView: {
    flex: 1,
  },
  grid: {
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  loadingText: {
    ...textStyles.subheadline,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyContainer: {
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
  },
});
