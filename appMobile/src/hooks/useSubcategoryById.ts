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
      console.warn('[useSubcategoryById] Missing categoryId or subcategoryId');
      return { category: undefined, subcategory: undefined };
    }

    const category = categories.find((cat) => cat.id === categoryId);

    if (!category) {
      console.warn('[useSubcategoryById] Category not found with id:', categoryId);
      return { category: undefined, subcategory: undefined };
    }

    const subcategory = category.subcategorias?.find((sub) => sub.id === subcategoryId);

    if (!subcategory) {
      console.warn('[useSubcategoryById] Subcategory not found with id:', subcategoryId);
      return { category, subcategory: undefined };
    }

    console.log('[useSubcategoryById] Subcategory found:', {
      category: category.nombre,
      subcategory: subcategory.nombre,
    });

    return { category, subcategory };
  }, [categories, categoryId, subcategoryId]);

  return {
    subcategory: result.subcategory,
    category: result.category,
    loading: categoriesLoading,
    error: categoriesError,
    refresh: refreshCategories,
  };
};
