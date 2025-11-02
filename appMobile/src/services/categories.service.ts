/**
 * Categories Service
 * Handles category and subcategory API calls
 */

import api from '../config/axios.config';


export interface Subcategoria {
  id: string;
  nombre: string;
  categoriaId: string;
  icono?: string;
  orden: number;
  activo: boolean;
}

export interface Categoria {
  id: string;
  nombre: string;
  icono?: string;
  orden: number;
  activo: boolean;
  subcategorias?: Subcategoria[];
}

class CategoriesService {
  /**
   * Get all active categories
   */
  async getAllCategories(): Promise<Categoria[]> {
    try {
      const response = await api.get<Categoria[]>('/categorias');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get category by ID with subcategories
   */
  async getCategoryById(id: string): Promise<Categoria> {
    try {
      const response = await api.get<Categoria>(`/categorias/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  /**
   * Get subcategories for a category
   */
  async getSubcategoriesByCategory(categoryId: string): Promise<Subcategoria[]> {
    try {
      const response = await api.get<Subcategoria[]>(`/categorias/${categoryId}/subcategorias`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      throw error;
    }
  }
}

export const categoriesService = new CategoriesService();
