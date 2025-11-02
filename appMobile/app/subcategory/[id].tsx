/**
 * Subcategory Companies Screen
 * Muestra empresas filtradas por subcategoría
 */

import React from 'react';
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
import { useSubcategoryCompanies } from '../../src/hooks/useSubcategoryCompanies';
import { CompanyCard } from '../../src/components/companies/CompanyCard';
import { colors, textStyles, spacing } from '../../src/theme';

export default function SubcategoryScreen() {
  const router = useRouter();
  const { id, categoryId, name, categoryName } = useLocalSearchParams();

  // Si id es 'all', usar el hook de todas las empresas, sino usar el hook de subcategoría
  const allCompaniesHook = useCompanies();
  const subcategoryHook = useSubcategoryCompanies(id !== 'all' ? id : undefined);

  // Determinar qué hook usar según el id
  const isAllCompanies = id === 'all';
  const companies = isAllCompanies
    ? allCompaniesHook.allCompanies.filter((c) => c.categoriaId === categoryId)
    : subcategoryHook.companies;
  const loading = isAllCompanies ? allCompaniesHook.loading : subcategoryHook.loading;
  const error = isAllCompanies ? allCompaniesHook.error : subcategoryHook.error;
  const refreshing = isAllCompanies ? allCompaniesHook.refreshing : subcategoryHook.refreshing;
  const refresh = isAllCompanies ? allCompaniesHook.refresh : subcategoryHook.refresh;

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
            {categoryName} • {companies.length} {companies.length === 1 ? 'empresa' : 'empresas'}
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
