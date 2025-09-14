import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_CONFIG, isGoogleMapsConfigured } from '../../../../../config/googleMaps.config';
import './GoogleMapsSelector.css';

interface GoogleMapsSelectorProps {
  onLocationSelect: (location: {
    direccion: string;
    lat: number;
    lng: number;
  }) => void;
  initialLocation?: {
    direccion: string;
    lat: number;
    lng: number;
  } | null;
  height?: string;
}

declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
}

const GoogleMapsSelector: React.FC<GoogleMapsSelectorProps> = ({
  onLocationSelect,
  initialLocation,
  height = '400px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [geocoder, setGeocoder] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    direccion: string;
    lat: number;
    lng: number;
  } | null>(initialLocation || null);

  // Cargar Google Maps API
  useEffect(() => {
    if (!isGoogleMapsConfigured()) {
      console.error('Google Maps API key not configured');
      return;
    }

    const loadGoogleMaps = async () => {
      try {
        console.log('🔄 Iniciando carga de Google Maps...');
        setIsLoading(true);
        setLoadError(null);
        
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_CONFIG.apiKey,
          version: 'weekly',
          libraries: GOOGLE_MAPS_CONFIG.libraries,
          // Optimizaciones para carga más rápida
          region: 'AR', // Argentina
          language: 'es', // Español
        });

        await loader.load();
        console.log('✅ Google Maps cargado exitosamente');
        initializeMap();
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Error loading Google Maps:', error);
        setIsLoading(false);
        
        // Mostrar error más específico
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
        setLoadError(errorMessage);
      }
    };

    // Cargar con un pequeño delay para no bloquear la UI
    const timeoutId = setTimeout(loadGoogleMaps, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) {
      console.log('⚠️ No se puede inicializar el mapa: ref o google no disponibles');
      return;
    }

    console.log('🗺️ Inicializando mapa...');
    
    const defaultCenter = initialLocation 
      ? { lat: initialLocation.lat, lng: initialLocation.lng }
      : GOOGLE_MAPS_CONFIG.defaultCenter;

    // Configuración optimizada para carga más rápida
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      zoom: GOOGLE_MAPS_CONFIG.defaultZoom,
      center: defaultCenter,
      // Configuración optimizada
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false, // Deshabilitado para carga más rápida
      streetViewControl: false, // Deshabilitado para carga más rápida
      fullscreenControl: false, // Deshabilitado para carga más rápida
      // Optimizaciones de rendimiento
      gestureHandling: 'cooperative',
      clickableIcons: false,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    const geocoderInstance = new window.google.maps.Geocoder();
    setGeocoder(geocoderInstance);
    setMap(mapInstance);

    // Crear marcador inicial
    const markerInstance = new window.google.maps.Marker({
      position: defaultCenter,
      map: mapInstance,
      draggable: true,
      title: 'Arrastra para seleccionar ubicación'
    });

    setMarker(markerInstance);

    // Evento cuando se arrastra el marcador
    markerInstance.addListener('dragend', () => {
      const position = markerInstance.getPosition();
      reverseGeocode(position.lat(), position.lng());
    });

    // Evento cuando se hace clic en el mapa
    mapInstance.addListener('click', (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      markerInstance.setPosition({ lat, lng });
      reverseGeocode(lat, lng);
    });

    // Si hay ubicación inicial, centrar el mapa
    if (initialLocation) {
      mapInstance.setCenter({ lat: initialLocation.lat, lng: initialLocation.lng });
      reverseGeocode(initialLocation.lat, initialLocation.lng);
    }

    setIsLoaded(true);
    
    // Obtener ubicación actual si no hay ubicación inicial
    if (!initialLocation) {
      getCurrentLocation();
    }
  };

  // Función para obtener la ubicación actual del usuario
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.warn('Geolocalización no soportada por este navegador');
      return;
    }

    setIsGettingLocation(true);
    console.log('📍 Obteniendo ubicación actual...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('✅ Ubicación obtenida:', { latitude, longitude });
        
        // Centrar el mapa en la ubicación actual
        if (map) {
          const currentLocation = { lat: latitude, lng: longitude };
          map.setCenter(currentLocation);
          map.setZoom(15);
          
          // Mover el marcador
          if (marker) {
            marker.setPosition(currentLocation);
          }
          
          // Obtener dirección de la ubicación
          reverseGeocode(latitude, longitude);
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('❌ Error al obtener ubicación:', error);
        setIsGettingLocation(false);
        
        let errorMessage = 'No se pudo obtener tu ubicación';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permisos de ubicación denegados';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado';
            break;
        }
        
        // Mostrar mensaje temporal
        alert(`⚠️ ${errorMessage}. Puedes seleccionar una ubicación manualmente.`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    );
  };

  const reverseGeocode = (lat: number, lng: number) => {
    if (!geocoder) return;

    geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        const address = results[0].formatted_address;
        const location = { direccion: address, lat, lng };
        setSelectedLocation(location);
        onLocationSelect(location);
      }
    });
  };

  const handleSearch = () => {
    if (!geocoder || !searchQuery.trim()) return;

    geocoder.geocode({ address: searchQuery }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        const address = results[0].formatted_address;

        if (map) {
          map.setCenter({ lat, lng });
          map.setZoom(15);
        }

        if (marker) {
          marker.setPosition({ lat, lng });
        }

        const locationData = { direccion: address, lat, lng };
        setSelectedLocation(locationData);
        onLocationSelect(locationData);
        setSearchQuery('');
      } else {
        alert('No se pudo encontrar la ubicación. Intenta con una dirección más específica.');
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Mostrar error de configuración
  if (!isGoogleMapsConfigured()) {
    return (
      <div className="google-maps-selector">
        <div className="maps-error">
          <div className="error-icon">⚠️</div>
          <h3>Google Maps no configurado</h3>
          <p>Para usar la selección de ubicaciones con mapas, necesitas configurar la API key de Google Maps.</p>
          <div className="error-instructions">
            <p><strong>Pasos para configurar:</strong></p>
            <ol>
              <li>Obtén una API key de Google Maps en <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
              <li>Habilita las APIs: Maps JavaScript API y Geocoding API</li>
              <li>Agrega la variable <code>REACT_APP_GOOGLE_MAPS_API_KEY</code> a tu archivo .env</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error de carga
  if (loadError) {
    return (
      <div className="google-maps-selector">
        <div className="maps-error">
          <div className="error-icon">❌</div>
          <h3>Error al cargar Google Maps</h3>
          <p>{loadError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="google-maps-selector">
      <div className="maps-search-container">
        <div className="search-input-group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Buscar dirección..."
            className="search-input"
            disabled={!isLoaded}
          />
          <button
            onClick={handleSearch}
            disabled={!isLoaded || !searchQuery.trim()}
            className="search-button"
          >
            🔍
          </button>
          <button
            onClick={getCurrentLocation}
            disabled={!isLoaded || isGettingLocation}
            className="location-button"
            title="Usar mi ubicación actual"
          >
            {isGettingLocation ? '⏳' : '📍'}
          </button>
        </div>
        
        {selectedLocation && (
          <div className="selected-location-info">
            <div className="location-address">
              <span className="address-icon">📍</span>
              <span className="address-text">{selectedLocation.direccion}</span>
            </div>
            <div className="location-coordinates">
              <span className="coords-text">
                Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div 
        ref={mapRef} 
        className="google-map"
        style={{ height }}
      />
      
      {(isLoading || !isLoaded) && (
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <p>
            {isLoading ? 'Cargando Google Maps...' : 'Inicializando mapa...'}
          </p>
          <small>Esto puede tomar unos segundos</small>
        </div>
      )}

      <div className="map-instructions">
        <p>💡 <strong>Instrucciones:</strong></p>
        <ul>
          <li>Busca una dirección en el campo de búsqueda</li>
          <li>Haz clic en el mapa para seleccionar una ubicación</li>
          <li>Arrastra el marcador para ajustar la posición</li>
        </ul>
      </div>
    </div>
  );
};

export default GoogleMapsSelector;
