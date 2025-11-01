/**
 * Location Context
 * Contexto para manejar la ubicación seleccionada del usuario
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { locationService, SavedLocation } from '../services/location.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocationContextType {
  selectedLocation: SavedLocation | null;
  locations: SavedLocation[];
  loading: boolean;
  setSelectedLocation: (location: SavedLocation | null) => void;
  loadLocations: () => Promise<void>;
  refreshLocations: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const SELECTED_LOCATION_KEY = '@vitrina_selected_location';

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedLocation, setSelectedLocationState] = useState<SavedLocation | null>(null);
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar ubicación guardada al iniciar
  useEffect(() => {
    loadInitialLocation();
  }, []);

  const loadInitialLocation = async () => {
    try {
      // Primero cargar todas las ubicaciones
      const locs = await locationService.getAll();
      setLocations(locs);

      // Intentar cargar la ubicación guardada en AsyncStorage
      const savedLocationId = await AsyncStorage.getItem(SELECTED_LOCATION_KEY);

      if (savedLocationId) {
        const savedLoc = locs.find(loc => loc.id === parseInt(savedLocationId));
        if (savedLoc) {
          setSelectedLocationState(savedLoc);
          return;
        }
      }

      // Si no hay ubicación guardada, usar la principal
      const principal = locs.find(loc => loc.esPrincipal);
      if (principal) {
        setSelectedLocationState(principal);
        await AsyncStorage.setItem(SELECTED_LOCATION_KEY, principal.id.toString());
      } else if (locs.length > 0) {
        // Si no hay principal, usar la primera
        setSelectedLocationState(locs[0]);
        await AsyncStorage.setItem(SELECTED_LOCATION_KEY, locs[0].id.toString());
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLocations = async () => {
    try {
      const locs = await locationService.getAll();
      setLocations(locs);

      // Actualizar la ubicación seleccionada si cambió
      if (selectedLocation) {
        const updated = locs.find(loc => loc.id === selectedLocation.id);
        if (updated) {
          setSelectedLocationState(updated);
        } else if (locs.length > 0) {
          // Si la ubicación seleccionada fue eliminada, seleccionar la primera
          setSelectedLocationState(locs[0]);
          await AsyncStorage.setItem(SELECTED_LOCATION_KEY, locs[0].id.toString());
        } else {
          setSelectedLocationState(null);
          await AsyncStorage.removeItem(SELECTED_LOCATION_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const refreshLocations = async () => {
    setLoading(true);
    await loadLocations();
    setLoading(false);
  };

  const setSelectedLocation = async (location: SavedLocation | null) => {
    setSelectedLocationState(location);
    if (location) {
      await AsyncStorage.setItem(SELECTED_LOCATION_KEY, location.id.toString());
    } else {
      await AsyncStorage.removeItem(SELECTED_LOCATION_KEY);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        locations,
        loading,
        setSelectedLocation,
        loadLocations,
        refreshLocations,
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
