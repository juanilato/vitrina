/**
 * useSubcategoryById Hook
 * Hook especializado para obtener una subcategoría específica por ID
 * dentro de una categoría
 */

import { useMemo } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { Categoria, Subcategoria } from '../services/categories.service';

interface UseSubcategoryByIdResult {
  subcategory: Subcategoria | undefined;
  category: Categoria | undefined;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook para obtener una subcategoría específica por ID desde el contexto global
 * @param categoryId - ID de la categoría padre
 * @param subcategoryId - ID de la subcategoría a buscar
 * @returns Objeto con la subcategoría, categoría padre, estado de carga, error y función de refresh
 */
export const useSubcategoryById = (
  categoryId: string | undefined,
  subcategoryId: string | undefined
): UseSubcategoryByIdResult => {
  const { categories, categoriesLoading, categoriesError, refreshCategories } = useAppData();

  const result = useMemo(() => {
    if (!categoryId || !subcategoryId) {
      return { category: undefined, subcategory: undefined };
    }

    const category = categories.find((cat) => cat.id === categoryId);

    if (!category) {
      if (!categoriesLoading) {
        console.warn('[useSubcategoryById] Category not found:', categoryId);
      }
      return { category: undefined, subcategory: undefined };
    }

    const subcategory = category.subcategorias?.find((sub) => sub.id === subcategoryId);

    if (!subcategory && !categoriesLoading) {
      console.warn('[useSubcategoryById] Subcategory not found:', subcategoryId);
    }

    return { category, subcategory };
  }, [categories, categoryId, subcategoryId, categoriesLoading]);

  return {
    subcategory: result.subcategory,
    category: result.category,
    loading: categoriesLoading,
    error: categoriesError,
    refresh: refreshCategories,
  };
};
