import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuthOptimized } from '../hooks/useAuthOptimized';
import productosService from '../services/productosService';
import ingredientesService from '../services/ingredientesService';
import axiosInstance from '../config/axios.config';

// Tipos para los datos pre-cargados
interface DashboardData {
  products: any[];
  productsStats: any;
  ingredients: any[];
  ingredientsStats: any;
  empresaConfig: any;
  categorias: any[];
}

// Estados de carga por sección
interface LoadingStatus {
  products: 'loading' | 'success' | 'error';
  ingredients: 'loading' | 'success' | 'error';
  empresaConfig: 'loading' | 'success' | 'error';
  categorias: 'loading' | 'success' | 'error';
}

interface DashboardDataContextType {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  isDataLoaded: boolean;
  loadingStatus: LoadingStatus;
  refetchData: () => Promise<void>;
  refetchProducts: () => Promise<void>;
  refetchIngredients: () => Promise<void>;
  refetchEmpresaConfig: () => Promise<void>;
}

const DashboardDataContext = createContext<DashboardDataContextType | undefined>(undefined);

export const DashboardDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuthOptimized();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<LoadingStatus>({
    products: 'loading',
    ingredients: 'loading',
    empresaConfig: 'loading',
    categorias: 'loading'
  });

  // Función para cargar todos los datos del dashboard
  const fetchAllData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 [DASHBOARD CONTEXT] Iniciando pre-carga de datos para empresa:', user.id);

      // Inicializar todos los estados como loading
      setLoadingStatus({
        products: 'loading',
        ingredients: 'loading',
        empresaConfig: 'loading',
        categorias: 'loading'
      });

      // Cargar productos
      const loadProductsPromise = Promise.all([
        productosService.getProductosByEmpresa(user.id),
        productosService.getProductosStats(user.id)
      ]).then(([productsData, productsStatsData]) => {
        setLoadingStatus(prev => ({ ...prev, products: 'success' }));
        return { productsData: Array.isArray(productsData) ? productsData : [], productsStatsData };
      }).catch(err => {
        console.error('Error cargando productos:', err);
        setLoadingStatus(prev => ({ ...prev, products: 'error' }));
        return { productsData: [], productsStatsData: { total: 0, activos: 0, inactivos: 0 } };
      });

      // Cargar ingredientes
      const loadIngredientsPromise = Promise.all([
        ingredientesService.getIngredientesByEmpresa(user.id),
        ingredientesService.getIngredientesStats(user.id)
      ]).then(([ingredientsData, ingredientsStatsData]) => {
        setLoadingStatus(prev => ({ ...prev, ingredients: 'success' }));
        return { ingredientsData: Array.isArray(ingredientsData) ? ingredientsData : [], ingredientsStatsData };
      }).catch(err => {
        console.error('Error cargando ingredientes:', err);
        setLoadingStatus(prev => ({ ...prev, ingredients: 'error' }));
        return { ingredientsData: [], ingredientsStatsData: { total: 0, unidades: 0, tiposUnicos: 0 } };
      });

      // Cargar configuración de empresa
      const loadEmpresaConfigPromise = axiosInstance.get(`/empresas/${user.id}`).then(res => {
        setLoadingStatus(prev => ({ ...prev, empresaConfig: 'success' }));
        return res.data;
      }).catch(err => {
        console.error('Error cargando configuración empresa:', err);
        setLoadingStatus(prev => ({ ...prev, empresaConfig: 'error' }));
        return null;
      });

      // Cargar categorías
      const loadCategoriasPromise = axiosInstance.get('/categorias').then(res => {
        setLoadingStatus(prev => ({ ...prev, categorias: 'success' }));
        return Array.isArray(res.data) ? res.data : [];
      }).catch(err => {
        console.error('Error cargando categorías:', err);
        setLoadingStatus(prev => ({ ...prev, categorias: 'error' }));
        return [];
      });

      // Esperar a que todas las promesas se resuelvan
      const [
        { productsData, productsStatsData },
        { ingredientsData, ingredientsStatsData },
        empresaConfigData,
        categoriasData
      ] = await Promise.all([
        loadProductsPromise,
        loadIngredientsPromise,
        loadEmpresaConfigPromise,
        loadCategoriasPromise
      ]);

      const dashboardData: DashboardData = {
        products: productsData,
        productsStats: productsStatsData,
        ingredients: ingredientsData,
        ingredientsStats: ingredientsStatsData,
        empresaConfig: empresaConfigData,
        categorias: categoriasData
      };

      setData(dashboardData);
      setIsDataLoaded(true);

      console.log('✅ [DASHBOARD CONTEXT] Datos pre-cargados exitosamente:', {
        productos: dashboardData.products.length,
        ingredientes: dashboardData.ingredients.length,
        categorias: dashboardData.categorias.length,
        tieneConfiguracion: !!dashboardData.empresaConfig
      });

    } catch (err: any) {
      console.error('❌ [DASHBOARD CONTEXT] Error al pre-cargar datos:', err);
      setError(err.message || 'Error al cargar datos del dashboard');
      setIsDataLoaded(false);
    } finally {
      setLoading(false);
    }
  };

  // Función para refrescar solo productos
  const refetchProducts = async () => {
    if (!user?.id || !data) return;

    try {
      setLoadingStatus(prev => ({ ...prev, products: 'loading' }));

      const [productsData, productsStatsData] = await Promise.all([
        productosService.getProductosByEmpresa(user.id),
        productosService.getProductosStats(user.id)
      ]);

      setData(prev => prev ? {
        ...prev,
        products: Array.isArray(productsData) ? productsData : [],
        productsStats: productsStatsData
      } : prev);

      setLoadingStatus(prev => ({ ...prev, products: 'success' }));
      console.log('✅ [DASHBOARD CONTEXT] Productos actualizados');
    } catch (err) {
      console.error('❌ [DASHBOARD CONTEXT] Error al refrescar productos:', err);
      setLoadingStatus(prev => ({ ...prev, products: 'error' }));
    }
  };

  // Función para refrescar solo ingredientes
  const refetchIngredients = async () => {
    if (!user?.id || !data) return;

    try {
      setLoadingStatus(prev => ({ ...prev, ingredients: 'loading' }));

      const [ingredientsData, ingredientsStatsData] = await Promise.all([
        ingredientesService.getIngredientesByEmpresa(user.id),
        ingredientesService.getIngredientesStats(user.id)
      ]);

      setData(prev => prev ? {
        ...prev,
        ingredients: Array.isArray(ingredientsData) ? ingredientsData : [],
        ingredientsStats: ingredientsStatsData
      } : prev);

      setLoadingStatus(prev => ({ ...prev, ingredients: 'success' }));
      console.log('✅ [DASHBOARD CONTEXT] Ingredientes actualizados');
    } catch (err) {
      console.error('❌ [DASHBOARD CONTEXT] Error al refrescar ingredientes:', err);
      setLoadingStatus(prev => ({ ...prev, ingredients: 'error' }));
    }
  };

  // Función para refrescar solo configuración de empresa
  const refetchEmpresaConfig = async () => {
    if (!user?.id || !data) return;

    try {
      setLoadingStatus(prev => ({ ...prev, empresaConfig: 'loading' }));

      const empresaConfigData = await axiosInstance.get(`/empresas/${user.id}`).then(res => res.data);

      setData(prev => prev ? {
        ...prev,
        empresaConfig: empresaConfigData
      } : prev);

      setLoadingStatus(prev => ({ ...prev, empresaConfig: 'success' }));
      console.log('✅ [DASHBOARD CONTEXT] Configuración de empresa actualizada');
    } catch (err) {
      console.error('❌ [DASHBOARD CONTEXT] Error al refrescar configuración:', err);
      setLoadingStatus(prev => ({ ...prev, empresaConfig: 'error' }));
    }
  };

  // Cargar datos cuando el usuario cambia
  useEffect(() => {
    if (user?.id) {
      fetchAllData();
    }
  }, [user?.id]);

  const value: DashboardDataContextType = {
    data,
    loading,
    error,
    isDataLoaded,
    loadingStatus,
    refetchData: fetchAllData,
    refetchProducts,
    refetchIngredients,
    refetchEmpresaConfig
  };

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useDashboardData = () => {
  const context = useContext(DashboardDataContext);
  if (context === undefined) {
    throw new Error('useDashboardData debe ser usado dentro de un DashboardDataProvider');
  }
  return context;
};
