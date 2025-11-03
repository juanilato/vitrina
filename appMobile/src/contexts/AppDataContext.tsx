/**
 * AppDataContext
 * Mantiene en estado global las categorías, subcategorías y ubicaciones del usuario
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { categoriesService, Categoria } from '../services/categories.service';
import { locationService, SavedLocation } from '../services/location.service';
import { companyService } from '../services/company.service';
import { Company } from '../types/company';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: number;
}

interface AppDataContextType {
  // Categories & Subcategories
  categories: Categoria[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  refreshCategories: () => Promise<void>;
  getCategoryById: (id: string) => Categoria | undefined;
  getSubcategoryById: (categoryId: string, subcategoryId: string) => { categoria: Categoria; subcategoria: any } | undefined;

  // User GPS Location (current position)
  userLocation: Location | null;
  locationLoading: boolean;
  locationError: string | null;
  refreshLocation: () => Promise<void>;
  updateLocation: (location: Location) => void;

  // Saved Locations (from backend)
  savedLocations: SavedLocation[];
  savedLocationsLoading: boolean;
  savedLocationsError: string | null;
  refreshSavedLocations: () => Promise<void>;

  // Nearby Companies (based on location)
  nearbyCompanies: Company[];
  nearbyCompaniesLoading: boolean;
  nearbyCompaniesError: string | null;
  fetchNearbyCompanies: (lat: number, lng: number, radiusKm?: number) => Promise<void>;
  refreshNearbyCompanies: () => Promise<void>;

  // Global refresh
  refreshAll: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Categories State
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // GPS Location State
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Saved Locations State
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [savedLocationsLoading, setSavedLocationsLoading] = useState(true);
  const [savedLocationsError, setSavedLocationsError] = useState<string | null>(null);

  // Nearby Companies State
  const [nearbyCompanies, setNearbyCompanies] = useState<Company[]>([]);
  const [nearbyCompaniesLoading, setNearbyCompaniesLoading] = useState(false);
  const [nearbyCompaniesError, setNearbyCompaniesError] = useState<string | null>(null);
  const [lastSearchLocation, setLastSearchLocation] = useState<{ lat: number; lng: number; radius: number } | null>(null);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      const data = await categoriesService.getAllCategories();

      // Validar que todas las categorías tengan ID
      const categoriesWithoutId = data.filter(cat => !cat?.id);
      if (categoriesWithoutId.length > 0) {
        console.error('[AppDataContext] ⚠️ Categories without ID found:', categoriesWithoutId);
      }

      // Filtrar solo categorías válidas con ID
      const validCategories = data.filter(cat => cat && cat.id);

      // Log detallado de categorías cargadas
      console.log('[AppDataContext] ✅ Categories loaded:', {
        total: validCategories.length,
        withSubcategories: validCategories.filter(cat => cat.subcategorias && cat.subcategorias.length > 0).length,
        categories: validCategories.map(cat => ({
          id: cat.id,
          nombre: cat.nombre,
          subcategorias: cat.subcategorias?.length || 0,
        })),
      });

      setCategories(validCategories);
    } catch (err: any) {
      console.error('[AppDataContext] ❌ Error fetching categories:', err);
      setCategoriesError(err.response?.data?.message || 'Error al cargar categorías');
      setCategories([]); // Set empty array on error
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Fetch User GPS Location
  const fetchLocation = useCallback(async () => {
    try {
      setLocationLoading(true);
      setLocationError(null);
      // Note: GPS location is now handled by expo-location directly in components
      // This is kept for compatibility but doesn't fetch anything
      console.log('[AppDataContext] GPS Location fetch skipped (handled by components)');
    } catch (err: any) {
      console.error('[AppDataContext] Error fetching GPS location:', err);
      setLocationError(err.message || 'Error al obtener ubicación GPS');
    } finally {
      setLocationLoading(false);
    }
  }, []);

  // Fetch Saved Locations (from backend)
  const fetchSavedLocations = useCallback(async () => {
    try {
      setSavedLocationsLoading(true);
      setSavedLocationsError(null);
      const locations = await locationService.getAll();
      setSavedLocations(locations);
      console.log('[AppDataContext] Saved locations loaded:', locations.length);
    } catch (err: any) {
      console.error('[AppDataContext] Error fetching saved locations:', err);
      setSavedLocationsError(err.response?.data?.message || 'Error al cargar ubicaciones guardadas');
    } finally {
      setSavedLocationsLoading(false);
    }
  }, []);

  // Refresh Categories
  const refreshCategories = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);

  // Refresh Location
  const refreshLocation = useCallback(async () => {
    await fetchLocation();
  }, [fetchLocation]);

  // Refresh Saved Locations
  const refreshSavedLocations = useCallback(async () => {
    await fetchSavedLocations();
  }, [fetchSavedLocations]);

  // Fetch Nearby Companies
  const fetchNearbyCompanies = useCallback(async (lat: number, lng: number, radiusKm: number = 10) => {
    try {
      setNearbyCompaniesLoading(true);
      setNearbyCompaniesError(null);
      console.log(`[AppDataContext] Fetching nearby companies at (${lat}, ${lng}) within ${radiusKm}km`);

      const companies = await companyService.getCompaniesByLocation(lat, lng, radiusKm);
      setNearbyCompanies(companies);
      setLastSearchLocation({ lat, lng, radius: radiusKm });

      console.log('[AppDataContext] Nearby companies loaded:', companies.length);
    } catch (err: any) {
      console.error('[AppDataContext] Error fetching nearby companies:', err);
      setNearbyCompaniesError(err.response?.data?.message || 'Error al cargar empresas cercanas');
    } finally {
      setNearbyCompaniesLoading(false);
    }
  }, []);

  // Refresh Nearby Companies (using last search location)
  const refreshNearbyCompanies = useCallback(async () => {
    if (lastSearchLocation) {
      await fetchNearbyCompanies(
        lastSearchLocation.lat,
        lastSearchLocation.lng,
        lastSearchLocation.radius
      );
    } else if (userLocation) {
      // Si no hay búsqueda previa, usar la ubicación actual del usuario
      await fetchNearbyCompanies(userLocation.latitude, userLocation.longitude);
    } else {
      console.warn('[AppDataContext] No location available to refresh nearby companies');
    }
  }, [lastSearchLocation, userLocation, fetchNearbyCompanies]);

  // Update Location (from other components)
  const updateLocation = useCallback((location: Location) => {
    setUserLocation(location);
    console.log('[AppDataContext] GPS Location updated:', location);
  }, []);

  // Get Category by ID
  const getCategoryById = useCallback((id: string): Categoria | undefined => {
    console.log('[AppDataContext] Looking for category with id:', id, 'Available:', categories.length);
    const category = categories.find((cat) => cat.id === id);
    if (category) {
      console.log('[AppDataContext] ✅ Category found:', {
        id: category.id,
        nombre: category.nombre,
        subcategorias: category.subcategorias?.length || 0,
      });
    } else {
      console.warn('[AppDataContext] ⚠️ Category not found with id:', id, {
        availableIds: categories.map(c => c.id),
      });
    }
    return category;
  }, [categories]);

  // Get Subcategory by ID within a Category
  const getSubcategoryById = useCallback((categoryId: string, subcategoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) {
      console.warn('[AppDataContext] Category not found with id:', categoryId);
      return undefined;
    }

    const subcategory = category.subcategorias?.find((sub) => sub.id === subcategoryId);
    if (!subcategory) {
      console.warn('[AppDataContext] Subcategory not found with id:', subcategoryId);
      return undefined;
    }

    console.log('[AppDataContext] Subcategory found:', subcategory.nombre);
    return { categoria: category, subcategoria: subcategory };
  }, [categories]);

  // Refresh All
  const refreshAll = useCallback(async () => {
    console.log('[AppDataContext] Refreshing all data...');
    await Promise.all([
      fetchCategories(),
      fetchSavedLocations(),
      // GPS location is optional, don't block on it
    ]);
  }, [fetchCategories, fetchSavedLocations]);

  // Initial Load
  useEffect(() => {
    console.log('[AppDataContext] Initial data load...');
    refreshAll();
  }, []);

  const value: AppDataContextType = {
    // Categories
    categories,
    categoriesLoading,
    categoriesError,
    refreshCategories,
    getCategoryById,
    getSubcategoryById,

    // GPS Location
    userLocation,
    locationLoading,
    locationError,
    refreshLocation,
    updateLocation,

    // Saved Locations
    savedLocations,
    savedLocationsLoading,
    savedLocationsError,
    refreshSavedLocations,

    // Nearby Companies
    nearbyCompanies,
    nearbyCompaniesLoading,
    nearbyCompaniesError,
    fetchNearbyCompanies,
    refreshNearbyCompanies,

    // Global
    refreshAll,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

// Hook to use the context
export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};

// Helper hooks for specific data
export const useCategories = () => {
  const { categories, categoriesLoading, categoriesError, refreshCategories } = useAppData();
  return {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    refresh: refreshCategories,
  };
};

export const useUserLocation = () => {
  const {
    userLocation,
    locationLoading,
    locationError,
    refreshLocation,
    updateLocation,
  } = useAppData();
  return {
    location: userLocation,
    loading: locationLoading,
    error: locationError,
    refresh: refreshLocation,
    updateLocation,
  };
};

export const useSavedLocations = () => {
  const {
    savedLocations,
    savedLocationsLoading,
    savedLocationsError,
    refreshSavedLocations,
  } = useAppData();
  return {
    savedLocations,
    loading: savedLocationsLoading,
    error: savedLocationsError,
    refresh: refreshSavedLocations,
  };
};

export const useNearbyCompanies = () => {
  const {
    nearbyCompanies,
    nearbyCompaniesLoading,
    nearbyCompaniesError,
    fetchNearbyCompanies,
    refreshNearbyCompanies,
  } = useAppData();
  return {
    companies: nearbyCompanies,
    loading: nearbyCompaniesLoading,
    error: nearbyCompaniesError,
    fetchNearby: fetchNearbyCompanies,
    refresh: refreshNearbyCompanies,
  };
};
