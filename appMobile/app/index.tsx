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
import { useCategories } from '../src/hooks/useCategories';
import { CategoryCard } from '../src/components/categories/CategoryCard';
import { MenuDrawer } from '../src/components/navigation/MenuDrawer';
import { LocationsDrawer } from '../src/components/navigation/LocationsDrawer';
import { colors, textStyles, spacing } from '../src/theme';
import { useLocation } from '../src/contexts/LocationContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { categories, loading, refresh } = useCategories();
  const { selectedLocation } = useLocation();
  const [refreshing, setRefreshing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [showLocationsDrawer, setShowLocationsDrawer] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    // Navegar a pantalla de empresas filtradas por categoría
    console.log(categoryId, "categoria");
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

    if (categories.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="grid-outline" size={64} color={colors.textQuaternary} />
          <Text style={styles.emptyTitle}>No hay categorías</Text>
          <Text style={styles.emptySubtitle}>Intenta refrescar la pantalla</Text>
        </View>
      );
    }

    // Crear patrón alternado: 2 normales, 1 wide, 2 normales, 1 wide...
    const grid = [];
    let i = 0;

    while (i < categories.length) {
      const row = [];

      // Cada 3 filas (6 categorías), insertar una categoría wide
      if (i > 0 && i % 6 === 0 && i < categories.length) {
        grid.push(
          <View key={`row-wide-${i}`} style={styles.row}>
            <CategoryCard
              id={categories[i].id}
              nombre={categories[i].nombre}
              icono={categories[i].icono}
              onPress={() => handleCategoryPress(categories[i].id, categories[i].nombre)}
              variant="wide"
            />
          </View>
        );
        i++;
      } else {
        // Fila normal con 2 categorías
        if (i < categories.length) {
          row.push(
            <CategoryCard
              key={categories[i].id}
              id={categories[i].id}
              nombre={categories[i].nombre}
              icono={categories[i].icono}
              onPress={() => handleCategoryPress(categories[i].id, categories[i].nombre)}
            />
          );
          i++;
        }

        if (i < categories.length) {
          row.push(
            <CategoryCard
              key={categories[i].id}
              id={categories[i].id}
              nombre={categories[i].nombre}
              icono={categories[i].icono}
              onPress={() => handleCategoryPress(categories[i].id, categories[i].nombre)}
            />
          );
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
            onPress={() => setShowSearch(!showSearch)}
            activeOpacity={0.7}
          >
            <Ionicons name="search-outline" size={20} color={colors.gray700} />
          </TouchableOpacity>

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
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar categorías o empresas..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor={colors.textTertiary}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola!</Text>
        <Text style={styles.subtitle}>¿Qué estás buscando hoy?</Text>
      </View>

      {/* Categories Grid */}
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
