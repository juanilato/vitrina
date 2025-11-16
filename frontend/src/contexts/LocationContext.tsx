import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LocationService, SavedLocation } from '../services/locationService';
import { useAuth } from './AuthContext';

interface LocationContextType {
  locations: SavedLocation[];
  selectedLocation: SavedLocation | null;
  principalLocation: SavedLocation | null;
  loading: boolean;
  error: string | null;
  setSelectedLocation: (location: SavedLocation | null) => void;
  loadLocations: () => Promise<void>;
  createLocation: (data: Omit<SavedLocation, 'id' | 'clienteId' | 'createdAt' | 'updatedAt'>) => Promise<SavedLocation>;
  updateLocation: (id: number, data: Partial<SavedLocation>) => Promise<SavedLocation>;
  deleteLocation: (id: number) => Promise<void>;
  setPrincipalLocation: (id: number) => Promise<void>;
  toggleFavorite: (id: number, esFavorita: boolean) => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [selectedLocation, setSelectedLocationState] = useState<SavedLocation | null>(null);
  const [principalLocation, setPrincipalLocationState] = useState<SavedLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar ubicaciones cuando el usuario está autenticado
  useEffect(() => {
    if (user) {
      loadLocations();
    } else {
      setLocations([]);
      setSelectedLocationState(null);
      setPrincipalLocationState(null);
    }
  }, [user]);

  // Cargar ubicación seleccionada desde localStorage
  useEffect(() => {
    const savedLocationId = localStorage.getItem('vitrina_selected_location');
    if (savedLocationId && locations.length > 0) {
      const location = locations.find(loc => loc.id === parseInt(savedLocationId));
      if (location) {
        setSelectedLocationState(location);
      }
    }
  }, [locations]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      setError(null);

      const [allLocations, principal] = await Promise.all([
        LocationService.getAll(),
        LocationService.getPrincipal()
      ]);

      setLocations(allLocations);
      setPrincipalLocationState(principal);

      // Si hay ubicación principal y no hay seleccionada, usar la principal
      if (principal && !selectedLocation) {
        setSelectedLocationState(principal);
        localStorage.setItem('vitrina_selected_location', principal.id.toString());
      }
    } catch (err) {
      console.error('Error loading locations:', err);
      setError('Error al cargar ubicaciones');
    } finally {
      setLoading(false);
    }
  };

  const setSelectedLocation = (location: SavedLocation | null) => {
    setSelectedLocationState(location);
    if (location) {
      localStorage.setItem('vitrina_selected_location', location.id.toString());
    } else {
      localStorage.removeItem('vitrina_selected_location');
    }
  };

  const createLocation = async (data: Omit<SavedLocation, 'id' | 'clienteId' | 'createdAt' | 'updatedAt'>): Promise<SavedLocation> => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      const newLocation = await LocationService.create({
        clienteId: user.id,
        nombre: data.nombre,
        direccion: data.direccion,
        lat: data.lat,
        lng: data.lng,
        referencia: data.referencia,
        esPrincipal: data.esPrincipal
      });

      await loadLocations();
      return newLocation;
    } catch (err) {
      console.error('Error creating location:', err);
      setError('Error al crear ubicación');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (id: number, data: Partial<SavedLocation>): Promise<SavedLocation> => {
    try {
      setLoading(true);
      setError(null);

      const updatedLocation = await LocationService.update(id, data);
      await loadLocations();

      // Si actualizamos la ubicación seleccionada, actualizarla
      if (selectedLocation?.id === id) {
        setSelectedLocationState(updatedLocation);
      }

      return updatedLocation;
    } catch (err) {
      console.error('Error updating location:', err);
      setError('Error al actualizar ubicación');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteLocation = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await LocationService.delete(id);

      // Si eliminamos la ubicación seleccionada, limpiarla
      if (selectedLocation?.id === id) {
        setSelectedLocationState(null);
        localStorage.removeItem('vitrina_selected_location');
      }

      await loadLocations();
    } catch (err) {
      console.error('Error deleting location:', err);
      setError('Error al eliminar ubicación');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const setPrincipalLocation = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const updatedLocation = await LocationService.setPrincipal(id);
      setPrincipalLocationState(updatedLocation);
      await loadLocations();
    } catch (err) {
      console.error('Error setting principal location:', err);
      setError('Error al establecer ubicación principal');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (id: number, esFavorita: boolean): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await LocationService.toggleFavorite(id, esFavorita);
      await loadLocations();
    } catch (err) {
      console.error('Error toggling favorite location:', err);
      setError('Error al marcar/desmarcar ubicación como favorita');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: LocationContextType = {
    locations,
    selectedLocation,
    principalLocation,
    loading,
    error,
    setSelectedLocation,
    loadLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    setPrincipalLocation,
    toggleFavorite
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};
