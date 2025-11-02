/**
 * Subcategory Companies Screen
 * Muestra empresas filtradas por subcategoría
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCompanies } from '../../src/hooks/useCompanies';
import { CompanyCard } from '../../src/components/companies/CompanyCard';
import { colors, textStyles, spacing } from '../../src/theme';

export default function SubcategoryScreen() {
  const router = useRouter();
  const { id, categoryId, name, categoryName } = useLocalSearchParams();
  const {
    companies,
    loading,
    error,
    refreshing,
    refresh,
  } = useCompanies();

  // Filtrar empresas por categoría y subcategoría
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesCategory = company.categoriaId === categoryId;

      // Si id es 'all', mostrar todas las empresas de la categoría
      if (id === 'all') {
        return matchesCategory;
      }

      // De lo contrario, filtrar por subcategoría
      const matchesSubcategory = company.subcategoriaId === id;
      return matchesCategory && matchesSubcategory;
    });
  }, [companies, categoryId, id]);

  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyState}>
        <Ionicons name="business-outline" size={64} color={colors.textQuaternary} />
        <Text style={styles.emptyTitle}>
          {error ? 'Error al cargar' : 'No hay empresas'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {error || `No encontramos empresas en ${name}`}
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
          <Text style={styles.subtitle}>
            {categoryName} • {filteredCompanies.length} {filteredCompanies.length === 1 ? 'empresa' : 'empresas'}
          </Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      {/* Companies List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredCompanies}
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    flexGrow: 1,
  },
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
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  retryButtonText: {
    ...textStyles.body,
    color: colors.white,
    fontWeight: '600',
  },
});
