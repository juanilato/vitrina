/**
 * useCategoryById Hook
 * Hook especializado para obtener una categoría específica por ID
 * incluyendo sus subcategorías
 */

import { useMemo } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { Categoria } from '../services/categories.service';

interface UseCategoryByIdResult {
  category: Categoria | undefined;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook para obtener una categoría específica por ID desde el contexto global
 * @param categoryId - ID de la categoría a buscar
 * @returns Objeto con la categoría, estado de carga, error y función de refresh
 */
export const useCategoryById = (categoryId: string | undefined): UseCategoryByIdResult => {
  const { categories, categoriesLoading, categoriesError, refreshCategories } = useAppData();

  const category = useMemo(() => {
    if (!categoryId) return undefined;

    const found = categories.find((cat) => cat.id === categoryId);

    if (!found && !categoriesLoading) {
      console.warn('[useCategoryById] Category not found:', categoryId);
    }

    return found;
  }, [categories, categoryId, categoriesLoading]);

  return {
    category,
    loading: categoriesLoading,
    error: categoriesError,
    refresh: refreshCategories,
  };
};
