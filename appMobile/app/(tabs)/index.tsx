/**
 * Home Screen - Companies List
 * FASE 2 Implementation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCompanies, SortBy } from '../../src/hooks/useCompanies';
import { CompanyCard } from '../../src/components/companies/CompanyCard';
import { SearchBar } from '../../src/components/common';
import { colors, textStyles, spacing } from '../../src/theme';

export default function HomeScreen() {
  const {
    companies,
    loading,
    error,
    refreshing,
    refresh,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    categories,
  } = useCompanies();

  const [showFilters, setShowFilters] = useState(false);

  const renderSortOption = (option: SortBy, label: string) => (
    <TouchableOpacity
      key={option}
      style={[
        styles.filterChip,
        sortBy === option && styles.filterChipActive,
      ]}
      onPress={() => setSortBy(option)}
    >
      <Text
        style={[
          styles.filterChipText,
          sortBy === option && styles.filterChipTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderCategoryOption = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.filterChip,
        categoryFilter === category && styles.filterChipActive,
      ]}
      onPress={() => setCategoryFilter(category)}
    >
      <Text
        style={[
          styles.filterChipText,
          categoryFilter === category && styles.filterChipTextActive,
        ]}
      >
        {category === 'all' ? 'Todas' : category}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyState}>
        <Ionicons name="business-outline" size={64} color={colors.textQuaternary} />
        <Text style={styles.emptyTitle}>
          {error ? 'Error al cargar' : 'No hay empresas'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {error || 'No se encontraron empresas que coincidan con tu búsqueda'}
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
        <Text style={styles.title}>Empresas</Text>
        <Text style={styles.subtitle}>
          {companies.length} {companies.length === 1 ? 'empresa' : 'empresas'}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchTerm}
          onChangeText={setSearchTerm}
          onClear={() => setSearchTerm('')}
          placeholder="Buscar empresas..."
        />

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name={showFilters ? 'close' : 'options-outline'}
            size={24}
            color={colors.white}
          />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {/* Sort */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Ordenar por</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChips}
            >
              {renderSortOption('name', 'Nombre')}
              {renderSortOption('rating', 'Valoración')}
              {renderSortOption('newest', 'Más nuevas')}
            </ScrollView>
          </View>

          {/* Categories */}
          {categories.length > 1 && (
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Categoría</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterChips}
              >
                {categories.map(renderCategoryOption)}
              </ScrollView>
            </View>
          )}
        </View>
      )}

      {/* List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={companies}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CompanyCard company={item} />}
          contentContainerStyle={styles.listContent}
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

  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },

  title: {
    ...textStyles.largeTitle,
    color: colors.primary,
    marginBottom: 4,
    fontWeight: '700',
  },

  subtitle: {
    ...textStyles.subheadline,
    color: colors.textSecondary,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },

  filterButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 12,
  },

  filtersContainer: {
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },

  filterSection: {
    marginBottom: spacing.md,
  },

  filterLabel: {
    ...textStyles.subheadline,
    color: colors.textSecondary,
    fontWeight: '600',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },

  filterChips: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },

  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  filterChipText: {
    ...textStyles.subheadline,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  filterChipTextActive: {
    color: colors.white,
  },

  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

  retryButton: {
    marginTop: spacing.lg,
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
