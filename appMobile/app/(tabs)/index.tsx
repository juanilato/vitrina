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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCompanies, SortBy } from '../../src/hooks/useCompanies';
import { CompanyCard } from '../../src/components/companies/CompanyCard';
import { SearchBar } from '../../src/components/common';
import { colors, textStyles, spacing } from '../../src/theme';
import { useLocation } from '../../src/contexts/LocationContext';

export default function HomeScreen() {
  const router = useRouter();
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

  const { selectedLocation, locations, setSelectedLocation } = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

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
      {/* Location Selector */}
      <TouchableOpacity
        style={styles.locationSelector}
        onPress={() => setShowLocationModal(true)}
        activeOpacity={0.7}
      >
        <View style={styles.locationLeft}>
          <View style={styles.locationIconContainer}>
            <Ionicons name="location" size={20} color={colors.primary} />
          </View>
          <View style={styles.locationTextContainer}>
            <Text style={styles.locationLabel}>Entregar en</Text>
            <Text style={styles.locationName} numberOfLines={1}>
              {selectedLocation ? selectedLocation.nombre : 'Selecciona una ubicación'}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

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

      {/* Location Selection Modal */}
      <Modal
        visible={showLocationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona tu ubicación</Text>
              <TouchableOpacity
                onPress={() => setShowLocationModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.locationsList}>
              {locations.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  style={[
                    styles.locationItem,
                    selectedLocation?.id === location.id && styles.locationItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedLocation(location);
                    setShowLocationModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.locationItemLeft}>
                    <Ionicons
                      name={selectedLocation?.id === location.id ? 'radio-button-on' : 'radio-button-off'}
                      size={24}
                      color={selectedLocation?.id === location.id ? colors.primary : colors.textTertiary}
                    />
                    <View style={styles.locationItemInfo}>
                      <Text style={styles.locationItemName}>{location.nombre}</Text>
                      <Text style={styles.locationItemAddress} numberOfLines={2}>
                        {location.direccion}
                      </Text>
                      {location.referencia && (
                        <Text style={styles.locationItemReference}>{location.referencia}</Text>
                      )}
                    </View>
                  </View>
                  {location.esPrincipal && (
                    <View style={styles.principalBadge}>
                      <Text style={styles.principalBadgeText}>Principal</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}

              {locations.length === 0 && (
                <View style={styles.emptyLocations}>
                  <Ionicons name="location-outline" size={48} color={colors.textTertiary} />
                  <Text style={styles.emptyLocationsText}>No tienes ubicaciones guardadas</Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.addLocationButton}
              onPress={() => {
                setShowLocationModal(false);
                router.push('/locations');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
              <Text style={styles.addLocationButtonText}>Agregar nueva ubicación</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Location Selector Styles
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationLabel: {
    ...textStyles.caption1,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  locationName: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...textStyles.headline,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  locationsList: {
    maxHeight: 400,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  locationItemSelected: {
    backgroundColor: colors.primary + '08',
  },
  locationItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationItemInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  locationItemName: {
    ...textStyles.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationItemAddress: {
    ...textStyles.subheadline,
    color: colors.textSecondary,
  },
  locationItemReference: {
    ...textStyles.caption1,
    color: colors.textTertiary,
    marginTop: 2,
  },
  principalBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  principalBadgeText: {
    ...textStyles.caption2,
    color: colors.white,
    fontWeight: '600',
  },
  emptyLocations: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  emptyLocationsText: {
    ...textStyles.subheadline,
    color: colors.textTertiary,
    marginTop: spacing.md,
  },
  addLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
  },
  addLocationButtonText: {
    ...textStyles.body,
    color: colors.primary,
    fontWeight: '600',
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
