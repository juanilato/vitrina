/**
 * useSubcategoryCompanies Hook
 * Obtiene empresas de una subcategoría específica
 */

import { useState, useEffect } from 'react';
import axios from '../config/axios.config';
import { Company } from '../types/company';

export const useSubcategoryCompanies = (subcategoryId: string | string[] | undefined) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCompanies = async (isRefreshing = false) => {
    if (!subcategoryId || subcategoryId === 'all') {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const id = Array.isArray(subcategoryId) ? subcategoryId[0] : subcategoryId;
      const response = await axios.get(`/categorias/subcategorias/${id}/empresas`);
      setCompanies(response.data);
    } catch (err: any) {
      console.error('Error fetching subcategory companies:', err);
      setError(err.response?.data?.message || 'Error al cargar empresas de la subcategoría');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [subcategoryId]);

  const refresh = () => {
    fetchCompanies(true);
  };

  return {
    companies,
    loading,
    error,
    refreshing,
    refresh,
  };
};
