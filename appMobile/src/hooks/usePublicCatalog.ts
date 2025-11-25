/**
 * usePublicCatalog Hook
 * Fetch company catalog by name without authentication
 */

import { useState, useEffect } from 'react';
import publicApi from '../config/axios.public.config';
import { CompanyWithProducts } from '../types/company';

export const usePublicCatalog = (companyName: string) => {
  const [company, setCompany] = useState<CompanyWithProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCatalog = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch company data
      const companyResponse = await publicApi.get(
        `/auth/companies/by-name/${encodeURIComponent(companyName)}`
      );
      const companyData = companyResponse.data;

      // Fetch products
      const productsResponse = await publicApi.get(
        `/productos/empresa/${companyData.id}`
      );
      const products = productsResponse.data;

      setCompany({
        ...companyData,
        products,
      });
    } catch (err: any) {
      console.error('Error fetching catalog:', err);
      setError(err.response?.data?.message || 'Error al cargar el catálogo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (companyName) {
      fetchCatalog();
    }
  }, [companyName]);

  const refresh = () => {
    fetchCatalog(true);
  };

  return {
    company,
    loading,
    error,
    refreshing,
    refresh,
  };
};
