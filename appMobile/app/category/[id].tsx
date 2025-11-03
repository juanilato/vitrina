/**
 * Category Companies Screen with Horizontal Subcategory Filter
 * Muestra empresas con filtro horizontal de subcategorías tipo toast
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
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCompanies } from '../../src/hooks/useCompanies';
import { useCategoryById } from '../../src/hooks/useCategoryById';
import { colors, textStyles, spacing } from '../../src/theme';

const { width } = Dimensions.get('window');

import type { Company, Subcategoria } from '../../src/types/company';

export default function CategoryScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();
  const categoryId = typeof id === 'string' ? id : id?.[0];

  // Usar el nuevo hook para obtener la categoría por ID
  const { category: currentCategory, loading: categoryLoading, refresh: refreshCategory } = useCategoryById(categoryId);
  const { companies, loading: companiesLoading } = useCompanies();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('all');

  // Obtener subcategorías desde la categoría cargada del contexto
  const subcategories = useMemo(() => {
    if (!categoryId || !currentCategory?.subcategorias) return [];

    console.log('[CategoryScreen] Subcategorías cargadas desde contexto:', currentCategory.subcategorias.length);
    return currentCategory.subcategorias;
  }, [currentCategory, categoryId]);

  // Obtener empresas de la categoría
  const categoryCompanies = useMemo(() => {
    return companies.filter((c) => c.categoriaId === categoryId);
  }, [companies, categoryId]);

  // Filtrar empresas por subcategoría seleccionada
  const filteredCompanies = useMemo(() => {
    let filtered = categoryCompanies;

    // Filtrar por subcategoría
    if (selectedSubcategoryId !== 'all') {
      filtered = filtered.filter((company) =>
        (company.subcategorias || []).some((s) => s.id === selectedSubcategoryId)
      );
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((company) =>
        company.name.toLowerCase().includes(query) ||
        company.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [categoryCompanies, selectedSubcategoryId, searchQuery]);

  const loading = categoryLoading || companiesLoading;

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshCategory();
    setRefreshing(false);
  };

  const handleSubcategoryPress = (subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
  };

  const handleCompanyPress = (companyId: string) => {
    router.push(`/company/${companyId}`);
  };

  // Renderizar chip de subcategoría en la barra horizontal
  const renderSubcategoryChip = (subcategory: Subcategoria | { id: string; nombre: string; icono?: string }) => {
    const isSelected = selectedSubcategoryId === subcategory.id;

    return (
      <TouchableOpacity
        key={subcategory.id}
        style={[styles.subcategoryChip, isSelected && styles.subcategoryChipSelected]}
        onPress={() => handleSubcategoryPress(subcategory.id)}
        activeOpacity={0.7}
      >
        <View style={styles.chipIconContainer}>
          {subcategory.icono ? (
            <Text style={[styles.chipIcon, isSelected && styles.chipIconSelected]}>
              {subcategory.icono}
            </Text>
          ) : (
            <Ionicons
              name={subcategory.id === 'all' ? 'grid' : 'pricetag'}
              size={18}
              color={isSelected ? colors.white : colors.primary}
            />
          )}
        </View>
        <Text style={[styles.chipText, isSelected && styles.chipTextSelected]} numberOfLines={1}>
          {subcategory.nombre}
        </Text>
      </TouchableOpacity>
    );
  };

  // Renderizar tarjeta de empresa
  const renderCompanyCard = ({ item }: { item: Company }) => (
    <TouchableOpacity
      style={styles.companyCard}
      onPress={() => handleCompanyPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.companyCardContent}>
        {/* Logo */}
        {item.logo ? (
          <Image source={{ uri: item.logo }} style={styles.companyLogo} />
        ) : (
          <View style={styles.companyLogoPlaceholder}>
            <Ionicons name="business" size={24} color={colors.gray400} />
          </View>
        )}

        {/* Info */}
        <View style={styles.companyInfo}>
          <Text style={styles.companyName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.description && (
            <Text style={styles.companyDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          {item.subcategorias && item.subcategorias.length > 0 && (
            <View style={styles.companyTags}>
              {item.subcategorias.slice(0, 2).map((sub, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText} numberOfLines={1}>
                    {sub.nombre}
                  </Text>
                </View>
              ))}
              {item.subcategorias.length > 2 && (
                <Text style={styles.moreTagsText}>+{item.subcategorias.length - 2}</Text>
              )}
            </View>
          )}
        </View>

        {/* Arrow */}
        <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
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
          placeholder="Buscar empresas..."
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

      {/* Horizontal Subcategory Filter Bar */}
      {subcategories.length > 0 && (
        <View style={styles.horizontalFilterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalFilterContent}
          >
            {/* Todas opción */}
            {renderSubcategoryChip({ id: 'all', nombre: 'Todas', icono: '📋' })}

            {/* Subcategorías */}
            {subcategories.map((sub) => renderSubcategoryChip(sub))}
          </ScrollView>
        </View>
      )}

      {/* Results count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredCompanies.length} {filteredCompanies.length === 1 ? 'empresa' : 'empresas'}
        </Text>
        {selectedSubcategoryId !== 'all' && (
          <TouchableOpacity onPress={() => setSelectedSubcategoryId('all')}>
            <Text style={styles.clearFilter}>Limpiar filtro</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => {
    if (loading) return null;

    const isSearching = searchQuery.trim().length > 0;
    const hasFilter = selectedSubcategoryId !== 'all';

    return (
      <View style={styles.emptyState}>
        <Ionicons
          name={isSearching ? 'search-outline' : 'business-outline'}
          size={64}
          color={colors.textQuaternary}
        />
        <Text style={styles.emptyTitle}>
          {isSearching || hasFilter ? 'No hay resultados' : 'No hay empresas'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {isSearching
            ? `No encontramos empresas con "${searchQuery}"`
            : hasFilter
            ? 'No hay empresas en esta subcategoría'
            : 'Esta categoría no tiene empresas disponibles'}
        </Text>
        {(hasFilter || isSearching) && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setSelectedSubcategoryId('all');
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Limpiar filtros</Text>
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
          <Text style={styles.title}>{name || currentCategory?.nombre || 'Categoría'}</Text>
          <Text style={styles.subtitle}>
            {categoryCompanies.length} {categoryCompanies.length === 1 ? 'empresa' : 'empresas'}
          </Text>
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
          data={filteredCompanies}
          keyExtractor={(item) => item.id}
          renderItem={renderCompanyCard}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
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
    marginBottom: spacing.sm,
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

  // Horizontal Subcategory Filter Bar
  horizontalFilterContainer: {
    marginBottom: spacing.md,
  },
  horizontalFilterContent: {
    paddingHorizontal: 2,
    gap: spacing.sm,
  },
  subcategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: spacing.xs,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  subcategoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  chipIconContainer: {
    marginRight: 6,
  },
  chipIcon: {
    fontSize: 16,
  },
  chipIconSelected: {
    // Mantener el icono igual cuando está seleccionado
  },
  chipText: {
    ...textStyles.body,
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray700,
  },
  chipTextSelected: {
    color: colors.white,
  },

  // Results Header
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  resultsCount: {
    ...textStyles.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
  },
  clearFilter: {
    ...textStyles.caption1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  // Company Card Styles
  companyCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  companyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  companyLogo: {
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: spacing.md,
  },
  companyLogoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  companyInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  companyName: {
    ...textStyles.body,
    fontSize: 15,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 4,
  },
  companyDescription: {
    ...textStyles.caption1,
    fontSize: 13,
    color: colors.gray600,
    marginBottom: 6,
  },
  companyTags: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    backgroundColor: `${colors.primary}10`,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    ...textStyles.caption1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  moreTagsText: {
    ...textStyles.caption1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.gray500,
    marginLeft: 4,
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
