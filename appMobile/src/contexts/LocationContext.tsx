/**
 * Location Context
 * Contexto para manejar la ubicación seleccionada del usuario
 * Usa AppDataContext como fuente única de verdad para las ubicaciones guardadas
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { locationService, SavedLocation, UpdateLocationDto } from '../services/location.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSavedLocations } from './AppDataContext';

interface LocationContextType {
  selectedLocation: SavedLocation | null;
  locations: SavedLocation[];
  loading: boolean;
  setSelectedLocation: (location: SavedLocation | null) => void;
  refreshLocations: () => Promise<void>;
  deleteLocation: (locationId: number) => Promise<void>;
  setMainLocation: (locationId: number) => Promise<void>;
  updateLocation: (locationId: number, data: UpdateLocationDto) => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const SELECTED_LOCATION_KEY = '@vitrina_selected_location';

export function LocationProvider({ children }: { children: ReactNode }) {
  // Usar AppDataContext como fuente única de verdad
  const { savedLocations, loading: savedLocationsLoading, refresh: refreshSavedLocations } = useSavedLocations();
  const [selectedLocation, setSelectedLocationState] = useState<SavedLocation | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Sincronizar con savedLocations de AppDataContext
  useEffect(() => {
    if (!savedLocationsLoading && initializing) {
      loadInitialLocation();
    }
  }, [savedLocationsLoading, savedLocations]);

  // Actualizar selectedLocation cuando savedLocations cambia
  useEffect(() => {
    if (selectedLocation && savedLocations.length > 0) {
      const updated = savedLocations.find(loc => loc.id === selectedLocation.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedLocation)) {
        setSelectedLocationState(updated);
      } else if (!updated) {
        // La ubicación seleccionada fue eliminada
        selectDefaultLocation(savedLocations);
      }
    }
  }, [savedLocations]);

  const loadInitialLocation = async () => {
    try {
      // Intentar cargar la ubicación guardada en AsyncStorage
      const savedLocationId = await AsyncStorage.getItem(SELECTED_LOCATION_KEY);

      if (savedLocationId) {
        const savedLoc = savedLocations.find(loc => loc.id === parseInt(savedLocationId));
        if (savedLoc) {
          setSelectedLocationState(savedLoc);
          return;
        }
      }

      // Si no hay ubicación guardada, seleccionar la predeterminada
      selectDefaultLocation(savedLocations);
    } catch (error) {
      console.error('[LocationContext] Error loading initial location:', error);
      selectDefaultLocation(savedLocations);
    } finally {
      setInitializing(false);
    }
  };

  const selectDefaultLocation = async (locs: SavedLocation[]) => {
    // Usar la principal o la primera disponible
    const principal = locs.find(loc => loc.esPrincipal);
    const defaultLoc = principal || locs[0];

    if (defaultLoc) {
      setSelectedLocationState(defaultLoc);
      await AsyncStorage.setItem(SELECTED_LOCATION_KEY, defaultLoc.id.toString());
    } else {
      setSelectedLocationState(null);
      await AsyncStorage.removeItem(SELECTED_LOCATION_KEY);
    }
  };

  const refreshLocations = async () => {
    // Delegar al AppDataContext que es la fuente de verdad
    await refreshSavedLocations();
  };

  const setSelectedLocation = async (location: SavedLocation | null) => {
    setSelectedLocationState(location);
    if (location) {
      await AsyncStorage.setItem(SELECTED_LOCATION_KEY, location.id.toString());
    } else {
      await AsyncStorage.removeItem(SELECTED_LOCATION_KEY);
    }
  };

  const deleteLocation = async (locationId: number) => {
    try {
      await locationService.delete(locationId);
      // Refrescar desde AppDataContext (fuente de verdad)
      await refreshSavedLocations();
    } catch (error) {
      console.error('[LocationContext] Error deleting location:', error);
      throw error;
    }
  };

  const setMainLocation = async (locationId: number) => {
    try {
      await locationService.setAsPrincipal(locationId);
      // Refrescar desde AppDataContext (fuente de verdad)
      await refreshSavedLocations();
    } catch (error) {
      console.error('[LocationContext] Error setting main location:', error);
      throw error;
    }
  };

  const updateLocation = async (locationId: number, data: UpdateLocationDto) => {
    try {
      await locationService.update(locationId, data);
      // Refrescar desde AppDataContext (fuente de verdad)
      await refreshSavedLocations();
    } catch (error) {
      console.error('[LocationContext] Error updating location:', error);
      throw error;
    }
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        locations: savedLocations, // Usar directamente de AppDataContext
        loading: savedLocationsLoading || initializing, // Combinar ambos estados
        setSelectedLocation,
        refreshLocations,
        deleteLocation,
        setMainLocation,
        updateLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
