import { useEffect, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_CONFIG, isGoogleMapsConfigured } from '../config/googleMaps.config';

interface UseGoogleMapsOptions {
  libraries?: string[];
  region?: string;
  language?: string;
}

interface UseGoogleMapsReturn {
  isLoaded: boolean;
  isLoading: boolean;
  loadError: string | null;
  google: typeof window.google | null;
}

// Variable global para rastrear el estado de carga
let globalLoadPromise: Promise<void> | null = null;
let globalIsLoaded = false;
let globalLoadError: string | null = null;

export const useGoogleMaps = (options: UseGoogleMapsOptions = {}): UseGoogleMapsReturn => {
  const [isLoaded, setIsLoaded] = useState(globalIsLoaded);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(globalLoadError);

  const {
    libraries = GOOGLE_MAPS_CONFIG.libraries,
    region = 'AR',
    language = 'es'
  } = options;

  const loadGoogleMaps = useCallback(async () => {
    // Si ya está cargado, no hacer nada
    if (globalIsLoaded && window.google) {
      setIsLoaded(true);
      return;
    }

    // Si ya hay una carga en progreso, esperar a que termine
    if (globalLoadPromise) {
      try {
        await globalLoadPromise;
        setIsLoaded(globalIsLoaded);
        setLoadError(globalLoadError);
        return;
      } catch (error) {
        setLoadError(globalLoadError);
        return;
      }
    }

    // Si hay un error previo, no intentar cargar de nuevo
    if (globalLoadError) {
      setLoadError(globalLoadError);
      return;
    }

    if (!isGoogleMapsConfigured()) {
      const error = 'Google Maps API key not configured';
      globalLoadError = error;
      setLoadError(error);
      return;
    }

    try {
      console.log('🔄 Iniciando carga de Google Maps...');
      setIsLoading(true);
      setLoadError(null);

      const loader = new Loader({
        apiKey: GOOGLE_MAPS_CONFIG.apiKey,
        version: 'weekly',
        libraries: libraries as any,
        region,
        language,
      });

      globalLoadPromise = loader.load().then(() => {});

      await globalLoadPromise;
      
      console.log('✅ Google Maps cargado exitosamente');
      globalIsLoaded = true;
      globalLoadError = null;
      setIsLoaded(true);
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error loading Google Maps:', error);
      
      let errorMessage = 'Error al cargar Google Maps';
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'Problema con la API key de Google Maps';
        } else if (error.message.includes('quota')) {
          errorMessage = 'Límite de cuota excedido';
        } else if (error.message.includes('network')) {
          errorMessage = 'Error de conexión a internet';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      globalLoadError = errorMessage;
      setLoadError(errorMessage);
      setIsLoading(false);
    } finally {
      globalLoadPromise = null;
    }
  }, [libraries, region, language]);

  useEffect(() => {
    loadGoogleMaps();
  }, [loadGoogleMaps]);

  return {
    isLoaded,
    isLoading,
    loadError,
    google: window.google || null
  };
};
