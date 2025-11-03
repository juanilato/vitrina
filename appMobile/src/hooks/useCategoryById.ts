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
    if (!categoryId) {
      console.warn('[useCategoryById] ⚠️ No category ID provided');
      return undefined;
    }

    console.log('[useCategoryById] Searching for category:', {
      searchingId: categoryId,
      totalCategories: categories.length,
      categoriesLoaded: !categoriesLoading,
    });

    const found = categories.find((cat) => cat.id === categoryId);

    if (found) {
      console.log('[useCategoryById] ✅ Category found:', {
        id: found.id,
        nombre: found.nombre,
        subcategorias: found.subcategorias?.length || 0,
        subcategoriasData: found.subcategorias?.map(s => ({ id: s.id, nombre: s.nombre })),
      });
    } else {
      console.warn('[useCategoryById] ⚠️ Category not found with id:', categoryId, {
        availableIds: categories.map(c => ({ id: c.id, nombre: c.nombre })),
      });
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
