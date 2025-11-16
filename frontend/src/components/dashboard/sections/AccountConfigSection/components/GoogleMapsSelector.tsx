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
  }
}
// Selector de mapas para cargar distintos precios de envío
const GoogleMapsSelector: React.FC<GoogleMapsSelectorProps> = ({
  onLocationSelect,
  initialLocation,
  height = '400px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  // flags para evitar loops
  const initializedRef = useRef(false);
  const geoRequestedRef = useRef(false);
  const reverseGeocodeTimerRef = useRef<number | null>(null);

  // memos de último valor para no disparar setState inútil
  const lastCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const lastAddressRef = useRef<string | null>(null);

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    direccion: string;
    lat: number;
    lng: number;
  } | null>(initialLocation || null);

  const { isLoaded, isLoading, loadError, google } = useGoogleMaps({
    libraries: ['places']
  });

  // -------- helpers puros (no cambian identidad) --------
  const roughlyEqual = (a: number, b: number, eps = 1e-6) =>
    Math.abs(a - b) < eps;

  const setSelectedIfChanged = (direccion: string, lat: number, lng: number) => {
    const last = lastCoordsRef.current;
    const lastAddr = lastAddressRef.current;

    const sameCoords =
      last && roughlyEqual(last.lat, lat) && roughlyEqual(last.lng, lng);
    const sameAddress = lastAddr === direccion;

    if (sameCoords && sameAddress) return; // nada cambió

    lastCoordsRef.current = { lat, lng };
    lastAddressRef.current = direccion;

    const loc = { direccion, lat, lng };
    setSelectedLocation(loc);
    onLocationSelect(loc);
  };

  // -------- reverse geocode con debounce + guardas --------
  const reverseGeocode = useCallback((lat: number, lng: number) => {
    if (!geocoderRef.current) return;
    // debounce 200ms
    if (reverseGeocodeTimerRef.current) {
      window.clearTimeout(reverseGeocodeTimerRef.current);
    }
    reverseGeocodeTimerRef.current = window.setTimeout(() => {
      geocoderRef.current.geocode(
        { location: { lat, lng } },
        (results: any[], status: string) => {
          if (status === 'OK' && results && results[0]) {
            const address = results[0].formatted_address || 'Sin dirección';
            setSelectedIfChanged(address, lat, lng);
          } else {
            // En caso de fallo, al menos actualizamos coords si cambiaron
            setSelectedIfChanged('Sin dirección', lat, lng);
          }
        }
      );
    }, 200);
  }, []); // sin deps para identidad estable

  // -------- geolocalización una sola vez --------
  const getCurrentLocation = useCallback(() => {
    if (geoRequestedRef.current) return; // ya lo pedimos
    if (!navigator.geolocation) return;

    geoRequestedRef.current = true;
    setIsGettingLocation(true);
    console.log('📍 Obteniendo ubicación actual...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('✅ Ubicación obtenida:', { latitude, longitude });

        const map = mapInstanceRef.current;
        const marker = markerRef.current;
        if (map && marker) {
          const current = { lat: latitude, lng: longitude };
          map.setCenter(current);
          map.setZoom(15);
          marker.setPosition(current);
        }
        reverseGeocode(latitude, longitude);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('❌ Error al obtener ubicación:', error);
        setIsGettingLocation(false);
        alert('⚠️ No se pudo obtener tu ubicación. Podés seleccionar manualmente.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }, [reverseGeocode]);

  // -------- inicialización del mapa (solo una vez) --------
  useEffect(() => {
    if (!isLoaded || !google || !mapRef.current) return;
    if (initializedRef.current) return; // evita re-init
    initializedRef.current = true;

    console.log('🗺️ Inicializando mapa...');

    const defaultCenter = initialLocation
      ? { lat: initialLocation.lat, lng: initialLocation.lng }
      : { lat: -34.6037, lng: -58.3816 };

    const map = new google.maps.Map(mapRef.current, {
      zoom: 15,
      center: defaultCenter,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      gestureHandling: 'cooperative',
      clickableIcons: false,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
      ]
    });

    const geocoder = new google.maps.Geocoder();
    const marker = new google.maps.Marker({
      position: defaultCenter,
      map,
      draggable: true,
      title: 'Arrastra para seleccionar ubicación'
    });

    mapInstanceRef.current = map;
    geocoderRef.current = geocoder;
    markerRef.current = marker;

    // eventos
    marker.addListener('dragend', () => {
      const pos = marker.getPosition();
      reverseGeocode(pos.lat(), pos.lng());
    });

    map.addListener('click', (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      marker.setPosition({ lat, lng });
      reverseGeocode(lat, lng);
    });

    // Si hay ubicación inicial, la usamos. Si no, pedimos geolocalización una vez.
    if (initialLocation) {
      map.setCenter({ lat: initialLocation.lat, lng: initialLocation.lng });
      reverseGeocode(initialLocation.lat, initialLocation.lng);
    } else {
      getCurrentLocation();
    }
  }, [isLoaded, google, initialLocation, getCurrentLocation, reverseGeocode]);

  // -------- búsqueda por texto --------
  const handleSearch = () => {
    if (!geocoderRef.current || !searchQuery.trim()) return;
    geocoderRef.current.geocode({ address: searchQuery }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        const loc = results[0].geometry.location;
        const lat = loc.lat();
        const lng = loc.lng();
        const address = results[0].formatted_address;

        const map = mapInstanceRef.current;
        const marker = markerRef.current;
        if (map && marker) {
          map.setCenter({ lat, lng });
          map.setZoom(15);
          marker.setPosition({ lat, lng });
        }
        setSearchQuery('');
        setSelectedIfChanged(address, lat, lng);
      } else {
        alert('No se pudo encontrar la dirección. Probá con otra más específica.');
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  // -------- UI de errores de carga --------
  if (loadError) {
    return (
      <div className="google-maps-selector">
        <div className="maps-error">
          <div className="error-icon">❌</div>
          <h3>Error al cargar Google Maps</h3>
          <p>{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="google-maps-selector">
      <div className="maps-search-container card">
        <div className="search-input-group sidebar-search">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
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
        <div className="map-loading" style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
          <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '12px' }} />
        </div>
      )}

  
    </div>
  );
};

export default GoogleMapsSelector;
