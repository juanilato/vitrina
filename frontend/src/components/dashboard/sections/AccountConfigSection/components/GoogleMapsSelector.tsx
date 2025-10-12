import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGoogleMaps } from '../../../../../hooks/useGoogleMaps';
import './GoogleMapsSelector.css';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import MyLocationOutlinedIcon from '@mui/icons-material/MyLocationOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';

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
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    direccion: string;
    lat: number;
    lng: number;
  } | null>(initialLocation || null);

  // Usar el hook personalizado para Google Maps
  const { isLoaded, isLoading, loadError, google } = useGoogleMaps({
    libraries: ['places']
  });

  const reverseGeocode = useCallback((lat: number, lng: number) => {
    if (!geocoder) return;

    geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        const address = results[0].formatted_address;
        const location = { direccion: address, lat, lng };
        setSelectedLocation(location);
        onLocationSelect(location);
      }
    });
  }, [geocoder, onLocationSelect]);

  // Función para obtener la ubicación actual del usuario
  const getCurrentLocation = useCallback(() => {
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
  }, [map, marker, reverseGeocode]);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || !google) {
      console.log('⚠️ No se puede inicializar el mapa: ref o google no disponibles');
      return;
    }

    console.log('🗺️ Inicializando mapa...');
    
    const defaultCenter = initialLocation 
      ? { lat: initialLocation.lat, lng: initialLocation.lng }
      : { lat: -34.6037, lng: -58.3816 }; // Buenos Aires

    // Configuración optimizada para carga más rápida
    const mapInstance = new google.maps.Map(mapRef.current, {
      zoom: 15,
      center: defaultCenter,
      // Configuración optimizada
      mapTypeId: google.maps.MapTypeId.ROADMAP,
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

    const geocoderInstance = new google.maps.Geocoder();
    setGeocoder(geocoderInstance);
    setMap(mapInstance);

    // Crear marcador inicial
    const markerInstance = new google.maps.Marker({
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
    
    // Obtener ubicación actual si no hay ubicación inicial
    if (!initialLocation) {
      getCurrentLocation();
    }
  }, [google, initialLocation, getCurrentLocation, reverseGeocode]);

  // Inicializar mapa cuando esté cargado
  useEffect(() => {
    if (isLoaded && mapRef.current && google) {
      initializeMap();
    }
  }, [isLoaded, google, initializeMap]);

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
  if (loadError && loadError.includes('not configured')) {
    return (
<div className="google-maps-selector">
  <div className="maps-search-container card">
    <div className="search-input-group sidebar-search">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Buscar dirección…"
        className="sidebar-search-input"
        disabled={!isLoaded}
      />
      <button
        onClick={handleSearch}
        disabled={!isLoaded || !searchQuery.trim()}
        className="icon-btn"
        title="Buscar"
      >
        <SearchOutlinedIcon fontSize="small" />
      </button>
      <button
        onClick={getCurrentLocation}
        disabled={!isLoaded || isGettingLocation}
        className="icon-btn"
        title="Usar mi ubicación"
      >
        <MyLocationOutlinedIcon fontSize="small" />
      </button>
    </div>

    {selectedLocation && (
      <div className="selected-location-info">
        <div className="location-address">
          <PlaceOutlinedIcon className="inline-icon" />
          <span className="address-text">{selectedLocation.direccion}</span>
        </div>
        <div className="location-coordinates">
          <MapOutlinedIcon className="inline-icon" />
          <span className="coords-text">
            Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
          </span>
        </div>
      </div>
    )}
  </div>

  <div ref={mapRef} className="google-map bordered" style={{ height }} />

  {(isLoading || !isLoaded) && (
    <div className="map-loading">
      <div className="loading-spinner"></div>
      <p>{isLoading ? 'Cargando Google Maps…' : 'Inicializando mapa…'}</p>
      <small className="muted">Esto puede tomar unos segundos</small>
    </div>
  )}

  <div className="map-instructions card subtle">
    <p><strong>Instrucciones:</strong></p>
    <ul>
      <li>Buscá una dirección</li>
      <li>Click en el mapa para seleccionar</li>
      <li>Arrastrá el marcador para ajustar</li>
    </ul>
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
