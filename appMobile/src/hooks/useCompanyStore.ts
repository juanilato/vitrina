/**
 * useCompanyStore Hook
 * Fetch company with products
 */

import { useState, useEffect } from 'react';
import { companyService } from '../services/company.service';
import { CompanyWithProducts } from '../types/company';

export const useCompanyStore = (companyId: string) => {
  const [company, setCompany] = useState<CompanyWithProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCompany = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await companyService.getCompanyWithProducts(companyId);
      setCompany(data);
    } catch (err: any) {
      console.error('Error fetching company:', err);
      setError(err.response?.data?.message || 'Error al cargar empresa');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchCompany();
    }
  }, [companyId]);

  const refresh = () => {
    fetchCompany(true);
  };

  return {
    company,
    loading,
    error,
    refreshing,
    refresh,
  };
};
