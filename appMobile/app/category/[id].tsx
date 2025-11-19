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
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCompanies } from '../../src/hooks/useCompanies';
import { useCategoryById } from '../../src/hooks/useCategoryById';
import { BusinessHours } from '../../src/components/companies/BusinessHours';
import { RatingStars } from '../../src/components/common/RatingStars';
import { colors, textStyles, spacing, shadows, borderRadius } from '../../src/theme';
import { LinearGradient } from 'expo-linear-gradient';

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
    const filtered = companies.filter((c) => c.categoriaId === categoryId);
    console.log('[CategoryScreen] Empresas filtradas por categoría:', {
      categoryId,
      totalCompanies: companies.length,
      filteredCount: filtered.length,
      companies: filtered.map(c => ({ id: c.id, name: c.name, categoriaId: c.categoriaId }))
    });
    return filtered;
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

  const handleCompanyPress = (company: Company) => {
    // Remove spaces from company name for the URL
    const normalizedName = company.name.replace(/\s+/g, '');
    console.log('[CategoryScreen] Navegando a empresa:', {
      original: company.name,
      normalized: normalizedName,
      companyId: company.id
    });
    router.push(`/company/${normalizedName}`);
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
  const renderCompanyCard = ({ item }: { item: Company }) => {
    const dashboardFoto = item.preferenciasWeb?.dashboardFoto;

    if (dashboardFoto) {
      // Versión con dashboard foto (como en CompanyCard)
      return (
        <TouchableOpacity
          style={styles.companyCard}
          onPress={() => handleCompanyPress(item)}
          activeOpacity={0.7}
        >
          <ImageBackground
            source={{ uri: dashboardFoto }}
            style={styles.backgroundImage}
            resizeMode="cover"
            imageStyle={styles.backgroundImageStyle}
          >
            <View style={styles.gradientOverlay}>
              {/* Logo con borde blanco */}
              <View style={styles.logoWrapper}>
                {item.logo ? (
                  <Image
                    source={{ uri: item.logo }}
                    style={styles.logoSmall}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.logoPlaceholder}>
                    <Ionicons name="business" size={24} color={colors.gray400} />
                  </View>
                )}
              </View>

              {/* Content */}
              <View style={styles.contentWithBackground}>
                {/* Nombre en estilo chip */}
                <View style={styles.nameChip}>
                  <Text style={styles.nameChipText} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
                {item.alias && (
                  <Text style={styles.aliasText} numberOfLines={1}>
                    @{item.alias}
                  </Text>
                )}

                {/* Horarios - Compact */}
                {item.preferenciasWeb?.horarios && (
                  <View style={styles.hoursCompact}>
                    <BusinessHours horarios={item.preferenciasWeb.horarios} compact />
                  </View>
                )}

                {/* Social Links Row */}
                {item.redesSociales && item.redesSociales.length > 0 && (
                  <View style={styles.socialLinksRowCard}>
                    {item.redesSociales.slice(0, 4).map((social, index) => {
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

                      return (
                        <View key={index} style={styles.socialIconCard}>
                          <Ionicons
                            name={getSocialIcon(social.key)}
                            size={16}
                            color={colors.white}
                          />
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>

              {/* Arrow */}
              <View style={styles.arrowWhite}>
                <Ionicons name="chevron-forward" size={20} color={colors.white} />
              </View>
            </View>

            {/* Rating Chip - Positioned at bottom right */}
            {item.rating !== undefined && item.rating > 0 && (
              <View style={styles.ratingChipAbsolute}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingChipText}>
                  {item.rating.toFixed(1)}
                </Text>
                {item.reviewCount !== undefined && item.reviewCount > 0 && (
                  <Text style={styles.ratingChipCount}>
                    ({item.reviewCount})
                  </Text>
                )}
              </View>
            )}
          </ImageBackground>
        </TouchableOpacity>
      );
    }

    // Versión sin dashboard foto (diseño normal)
    return (
      <TouchableOpacity
        style={styles.companyCard}
        onPress={() => handleCompanyPress(item)}
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
          </View>

          {/* Arrow */}
          <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
        </View>

        {/* Rating Chip - Positioned at bottom right */}
        {item.rating !== undefined && item.rating > 0 && (
          <View style={styles.ratingChipAbsoluteSimple}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingChipTextSimple}>
              {item.rating.toFixed(1)}
            </Text>
            {item.reviewCount !== undefined && item.reviewCount > 0 && (
              <Text style={styles.ratingChipCountSimple}>
                ({item.reviewCount})
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.gray500} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar "
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
      {/* Modern Category Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
          style={styles.headerGradient}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.categoryBadge}>
            {currentCategory?.icono && (
              <View style={styles.categoryIconContainer}>
                <Text style={styles.categoryIcon}>{currentCategory.icono}</Text>
              </View>
            )}
            <View style={styles.categoryTextContainer}>
              <Text style={styles.categoryLabel}>Categoría</Text>
              <Text style={styles.categoryTitle} numberOfLines={1}>
                {name || currentCategory?.nombre || 'Categoría'}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight} />
        </LinearGradient>
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

  // Header Styles - Modern Glass Design
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Category Badge
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 10,
    flex: 1,
    marginHorizontal: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryTextContainer: {
    flex: 1,
    
  },
  categoryLabel: {
    ...textStyles.caption1,
    fontSize: 10,
    fontWeight: '600',
    color: colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,

  },
  categoryTitle: {
    ...textStyles.body,
    fontSize: 12,
    fontWeight: '800',
    color: colors.gray900,
    marginTop: 2,
    width: 900,
  },

  // Legacy styles (kept for compatibility)
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
    paddingBottom: 100, // Space for floating tab bar
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

  // Estilos para versión CON dashboard foto
  backgroundImage: {
    position: 'relative',
  },

  backgroundImageStyle: {
    transform: [{ scale: 1.2 }],
  },

  gradientOverlay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: 40, // Espacio para el chip de rating
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  logoWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'transparent',
    padding: 3,
    marginRight: spacing.md,
    borderWidth: 0,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  logoSmall: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },

  logoPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },

  contentWithBackground: {
    flex: 1,
    justifyContent: 'center',
  },

  nameChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs / 1.5,
    borderRadius: 20,
    marginBottom: spacing.xs / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },

  nameChipText: {
    ...textStyles.callout,
    color: colors.white,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  aliasText: {
    ...textStyles.footnote,
    color: colors.white,
    fontWeight: '500',
    opacity: 0.85,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  hoursCompact: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },

  socialLinksRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.xs,
  },

  socialIconCard: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrowWhite: {
    justifyContent: 'center',
    marginLeft: spacing.xs,
    opacity: 0.7,
  },

  // Rating Chip - Versión con dashboard foto
  ratingChipAbsolute: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  ratingChipText: {
    ...textStyles.caption1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.gray900,
  },
  ratingChipCount: {
    ...textStyles.caption1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.gray600,
  },

  // Rating Chip - Versión sin dashboard foto
  ratingChipAbsoluteSimple: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#FFD700',
  },
  ratingChipTextSimple: {
    ...textStyles.caption1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.gray900,
  },
  ratingChipCountSimple: {
    ...textStyles.caption1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.gray600,
  },
});
