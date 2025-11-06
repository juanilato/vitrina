/**
 * useCompanies Hook
 * Fetch and filter companies
 */

import { useState, useEffect, useMemo } from 'react';
import { companyService } from '../services/company.service';
import { Company } from '../types/company';

export type SortBy = 'name' | 'newest' | 'rating';

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');

  const fetchCompanies = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await companyService.getAllCompanies();

      // Mapear las subcategorías para aplanar la estructura anidada
      const mappedData = data.map((company: any) => ({
        ...company,
        subcategorias: company.subcategorias?.map((item: any) => item.subcategoria) || [],
      }));

      setCompanies(mappedData);
    } catch (err: any) {
      console.error('Error fetching companies:', err);
      setError(err.response?.data?.message || 'Error al cargar empresas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = companies
      .map((c) => c.category)
      .filter((c): c is string => !!c);
    return ['all', ...Array.from(new Set(cats))];
  }, [companies]);

  // Filtered and sorted companies
  const filteredCompanies = useMemo(() => {
    let filtered = [...companies];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (company) =>
          company.name.toLowerCase().includes(search) ||
          company.description?.toLowerCase().includes(search) ||
          company.category?.toLowerCase().includes(search)
      );
    }

    // Category filter
    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(
        (company) => company.category === categoryFilter
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [companies, searchTerm, categoryFilter, sortBy]);

  const refresh = () => {
    fetchCompanies(true);
  };

  return {
    companies: filteredCompanies,
    allCompanies: companies,
    loading,
    error,
    refreshing,
    refresh,
    // Filters
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    categories,
  };
};
