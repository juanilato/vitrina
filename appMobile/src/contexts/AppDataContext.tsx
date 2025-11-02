/**
 * AppDataContext
 * Mantiene en estado global las categorías, subcategorías y ubicaciones del usuario
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { categoriesService, Categoria } from '../services/categories.service';
import { locationService, SavedLocation } from '../services/location.service';

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

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      const data = await categoriesService.getAllCategories();
      setCategories(data);
      console.log('[AppDataContext] Categories loaded:', data.length);
    } catch (err: any) {
      console.error('[AppDataContext] Error fetching categories:', err);
      setCategoriesError(err.response?.data?.message || 'Error al cargar categorías');
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Fetch User GPS Location
  const fetchLocation = useCallback(async () => {
    try {
      setLocationLoading(true);
      setLocationError(null);
      const location = await locationService.getCurrentLocation();

      if (location) {
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: location.timestamp,
        });
        console.log('[AppDataContext] GPS Location loaded:', location.coords);
      }
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

  // Update Location (from other components)
  const updateLocation = useCallback((location: Location) => {
    setUserLocation(location);
    console.log('[AppDataContext] GPS Location updated:', location);
  }, []);

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
