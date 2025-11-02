/**
 * Category Subcategories Screen
 * Muestra subcategorías con cards modernas y buscador
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCompanies } from '../../src/hooks/useCompanies';
import { colors, textStyles, spacing } from '../../src/theme';

const { width } = Dimensions.get('window');
const CARD_MARGIN = spacing.md;
const NUM_COLUMNS = 2;
const CARD_WIDTH = (width - (CARD_MARGIN * (NUM_COLUMNS + 1))) / NUM_COLUMNS;

interface Subcategoria {
  id: string;
  nombre: string;
  icono?: string;
  descripcion?: string;
  companiesCount: number;
}

export default function CategoryScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();
  const {
    companies,
    loading,
    error,
    refreshing,
    refresh,
  } = useCompanies();

  const [searchQuery, setSearchQuery] = useState('');

  // Obtener subcategorías únicas de las empresas filtradas por categoría
  const subcategories = useMemo(() => {
    const companiesInCategory = companies.filter((c) => c.categoriaId === id);

    const subs = companiesInCategory
      .map((c) => c.subcategoria)
      .filter((s): s is NonNullable<typeof s> => !!s && !!s.id);

    const uniqueSubs = Array.from(
      new Map(subs.map((s) => [s.id, s])).values()
    );

    // Contar empresas por subcategoría
    const subsWithCount: Subcategoria[] = uniqueSubs.map((sub) => ({
      ...sub,
      companiesCount: companiesInCategory.filter((c) => c.subcategoriaId === sub.id).length,
    }));

    return subsWithCount;
  }, [companies, id]);

  // Filtrar subcategorías por búsqueda
  const filteredSubcategories = useMemo(() => {
    if (!searchQuery.trim()) return subcategories;

    const query = searchQuery.toLowerCase().trim();
    return subcategories.filter((sub) =>
      sub.nombre.toLowerCase().includes(query)
    );
  }, [subcategories, searchQuery]);

  const handleSubcategoryPress = (subcategory: Subcategoria) => {
    // Navegar a la pantalla de empresas de esa subcategoría
    router.push({
      pathname: '/subcategory/[id]',
      params: {
        id: subcategory.id,
        categoryId: id,
        name: subcategory.nombre,
        categoryName: name,
      },
    });
  };

  const handleViewAllPress = () => {
    // Ver todas las empresas de la categoría sin filtrar por subcategoría
    router.push({
      pathname: '/subcategory/[id]',
      params: {
        id: 'all',
        categoryId: id,
        name: 'Todas',
        categoryName: name,
      },
    });
  };

  const renderSubcategoryCard = ({ item }: { item: Subcategoria }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleSubcategoryPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Icon Container */}
        <View style={styles.iconContainer}>
          {item.icono ? (
            <Text style={styles.categoryIcon}>{item.icono}</Text>
          ) : (
            <Ionicons name="pricetag" size={28} color={colors.primary} />
          )}
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.nombre}
          </Text>
          <Text style={styles.cardCount}>
            {item.companiesCount} {item.companiesCount === 1 ? 'empresa' : 'empresas'}
          </Text>
        </View>

        {/* Arrow */}
        <View style={styles.cardArrow}>
          <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.gray500} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar subcategorías..."
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

      {/* Ver todas las empresas */}
      <TouchableOpacity style={styles.viewAllCard} onPress={handleViewAllPress} activeOpacity={0.7}>
        <View style={styles.viewAllContent}>
          <View style={styles.viewAllIconContainer}>
            <Ionicons name="grid" size={24} color={colors.white} />
          </View>
          <View style={styles.viewAllInfo}>
            <Text style={styles.viewAllTitle}>Ver todas las empresas</Text>
            <Text style={styles.viewAllSubtitle}>
              {companies.filter((c) => c.categoriaId === id).length} empresas en total
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.white} />
        </View>
      </TouchableOpacity>

      {/* Section Title */}
      {filteredSubcategories.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Subcategorías</Text>
          <Text style={styles.sectionSubtitle}>
            {filteredSubcategories.length} {filteredSubcategories.length === 1 ? 'disponible' : 'disponibles'}
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => {
    if (loading) return null;

    const isSearching = searchQuery.trim().length > 0;

    return (
      <View style={styles.emptyState}>
        <Ionicons
          name={isSearching ? 'search-outline' : 'albums-outline'}
          size={64}
          color={colors.textQuaternary}
        />
        <Text style={styles.emptyTitle}>
          {error ? 'Error al cargar' : isSearching ? 'No hay resultados' : 'No hay subcategorías'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {error
            ? error
            : isSearching
            ? `No encontramos subcategorías con "${searchQuery}"`
            : 'Esta categoría no tiene subcategorías disponibles'}
        </Text>
        {error && (
          <TouchableOpacity onPress={() => refresh()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.gray700} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subtitle}>Selecciona una subcategoría</Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredSubcategories}
          keyExtractor={(item) => item.id}
          renderItem={renderSubcategoryCard}
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
  },
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

  // List Styles
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  listHeader: {
    marginBottom: spacing.md,
  },
  row: {
    justifyContent: 'space-between',
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...textStyles.body,
    fontSize: 15,
    color: colors.gray900,
  },
  clearButton: {
    padding: 4,
  },

  // View All Card
  viewAllCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  viewAllContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  viewAllInfo: {
    flex: 1,
  },
  viewAllTitle: {
    ...textStyles.body,
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 2,
  },
  viewAllSubtitle: {
    ...textStyles.caption1,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },

  // Section Header
  sectionHeader: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...textStyles.body,
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 2,
  },
  sectionSubtitle: {
    ...textStyles.caption1,
    fontSize: 13,
    color: colors.gray600,
  },

  // Card Styles
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardContent: {
    padding: spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  categoryIcon: {
    fontSize: 28,
  },
  cardInfo: {
    flex: 1,
    marginBottom: spacing.xs,
  },
  cardTitle: {
    ...textStyles.body,
    fontSize: 15,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 4,
  },
  cardCount: {
    ...textStyles.caption1,
    fontSize: 12,
    color: colors.gray600,
  },
  cardArrow: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing.xl,
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
  },
  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  retryButtonText: {
    ...textStyles.body,
    color: colors.white,
    fontWeight: '600',
  },
});
