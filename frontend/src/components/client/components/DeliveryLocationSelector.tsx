import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGoogleMaps } from '../../../hooks/useGoogleMaps';
import { ShippingService } from '../../../services/shippingService';
import { ShippingPriceResponse, DeliveryLocation } from '../types';
import './DeliveryLocationSelector.css';

interface DeliveryLocationSelectorProps {
  onLocationSelect: (location: {
    direccion: string;
    lat: number;
    lng: number;
    shippingPrice?: ShippingPriceResponse | null;
  }) => void;
  onClose: () => void;
  empresaId: string;
  empresaName: string;
  empresaLogo?: string;
  empresaUbicaciones: Array<{
    id: number;
    direccion: string;
    lat: number;
    lng: number;
  }>;
}

declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
}

const DeliveryLocationSelector: React.FC<DeliveryLocationSelectorProps> = ({
  onLocationSelect,
  onClose,
  empresaId,
  empresaName,
  empresaLogo,
  empresaUbicaciones
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [geocoder, setGeocoder] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    direccion: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [shippingPrice, setShippingPrice] = useState<ShippingPriceResponse | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Usar el hook personalizado para Google Maps
  const { isLoaded, isLoading, loadError, google } = useGoogleMaps({
    libraries: ['places']
  });

  const calculateShippingPrice = useCallback(async (location: DeliveryLocation) => {
    setIsCalculatingPrice(true);
    
    try {
      console.log('🚚 [FRONTEND] Calculando precio de envío:', {
        location,
        empresaId,
        empresaUbicaciones
      });

      // Encontrar la ubicación más cercana de la empresa
      const closestLocation = ShippingService.findClosestLocation(location, empresaUbicaciones);
      console.log('🚚 [FRONTEND] Ubicación más cercana:', closestLocation);

      // Llamar al backend para calcular precio
      const response = await ShippingService.calculateShippingPrice(empresaId, {
        clienteLat: location.lat,
        clienteLng: location.lng,
        ubicacionId: closestLocation.id
      });

      console.log('🚚 [FRONTEND] Respuesta del backend:', response);
      setShippingPrice(response);
    } catch (error) {
      console.error('❌ [FRONTEND] Error calculando precio de envío:', error);
      setShippingPrice({
        price: null,
        isEstimated: false,
        message: `Estimado no disponible. ${empresaName} confirmará precio de envío.`
      });
    } finally {
      setIsCalculatingPrice(false);
    }
  }, [empresaId, empresaName, empresaUbicaciones]);

  const reverseGeocode = useCallback((lat: number, lng: number) => {
    if (!geocoder) {
      console.warn('⚠️ Geocoder no disponible, no se puede obtener la dirección');
      // No mostrar nada si no hay geocoder disponible
      const location = { 
        direccion: `Ubicación sin dirección`, 
        lat, 
        lng 
      };
      calculateShippingPrice(location);
      return;
    }

    // Timeout de seguridad para evitar que quede en "Cargando dirección..." indefinidamente
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Timeout en geocoding, no se pudo obtener la dirección');
      // No mostrar nada si no se puede obtener la dirección
      // Solo calcular el precio con las coordenadas
      const location = { 
        direccion: `Ubicación sin dirección`, 
        lat, 
        lng 
      };
      calculateShippingPrice(location);
    }, 5000); // Aumentado a 5 segundos para dar más tiempo al geocoding

    console.log('🔍 Iniciando geocoding para:', { lat, lng });

    geocoder.geocode({ 
      location: { lat, lng },
      language: 'es',
      region: 'AR'
    }, (results: any[], status: string) => {
      // Limpiar el timeout ya que obtuvimos respuesta
      clearTimeout(timeoutId);
      
      console.log('📍 Geocoding resultado:', { status, resultsCount: results?.length || 0 });
      
      if (status === 'OK' && results && results.length > 0) {
        const direccion = results[0].formatted_address;
        const location = { direccion, lat, lng };
        console.log('✅ Dirección obtenida:', direccion);
        setSelectedLocation(location);
        // Calcular precio automáticamente cuando se selecciona una ubicación
        calculateShippingPrice(location);
      } else {
        // Manejar errores de geocoding - no mostrar nada si no se puede obtener la dirección
        console.warn('⚠️ Error en geocoding:', status, 'No se pudo obtener la dirección');
        // No actualizar selectedLocation si no tenemos una dirección real
        // Solo calcular el precio con las coordenadas
        const location = { 
          direccion: `Ubicación sin dirección`, 
          lat, 
          lng 
        };
        calculateShippingPrice(location);
      }
    });
  }, [geocoder, calculateShippingPrice]);

  // Función para obtener la ubicación actual del usuario
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocalización no soportada por este navegador');
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
          
          // Establecer ubicación inicial y obtener dirección
          setSelectedLocation({ direccion: 'Cargando dirección...', lat: latitude, lng: longitude });
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
    console.log('🔍 [DEBUG] initializeMap called', {
      mapRef: !!mapRef.current,
      google: !!google,
      empresaUbicaciones: empresaUbicaciones?.length || 0
    });

    if (!mapRef.current || !google) {
      console.log('⚠️ No se puede inicializar el mapa: ref o google no disponibles');
      return;
    }

    console.log('🗺️ Inicializando mapa de delivery...');
    
    // Centro por defecto (Buenos Aires) - se cambiará si obtenemos ubicación del usuario
    const defaultCenter = { lat: -34.6037, lng: -58.3816 };

    // Configuración optimizada para carga más rápida
    const mapInstance = new google.maps.Map(mapRef.current, {
      zoom: 15,
      center: defaultCenter,
      // Configuración optimizada
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: false,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
      mapTypeControl: false, // Deshabilitado para carga más rápida
      streetViewControl: false, // Deshabilitado para carga más rápida
      fullscreenControl: false, // Deshabilitado para carga más rápida
      // Optimizaciones de rendimiento
      gestureHandling: 'greedy',
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

    // Crear marcador para ubicación del cliente
    const markerInstance = new google.maps.Marker({
      position: defaultCenter,
      map: mapInstance,
      draggable: true,
      title: 'Arrastra para seleccionar tu ubicación',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="#fff" stroke-width="4"/>
            <circle cx="20" cy="20" r="8" fill="#fff"/>
            <text x="20" y="25" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#3B82F6">📍</text>
          </svg>
        `),
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 20),
      }
    });

    setMarker(markerInstance);

    // Evento cuando se arrastra el marcador
    markerInstance.addListener('dragend', () => {
      const position = markerInstance.getPosition();
      const lat = position.lat();
      const lng = position.lng();
      // Actualizar ubicación seleccionada inmediatamente y calcular precio
      setSelectedLocation({ direccion: 'Cargando dirección...', lat, lng });
      reverseGeocode(lat, lng);
    });

    // Evento cuando se hace clic en el mapa
    mapInstance.addListener('click', (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      markerInstance.setPosition({ lat, lng });
      // Actualizar ubicación seleccionada inmediatamente y calcular precio
      setSelectedLocation({ direccion: 'Cargando dirección...', lat, lng });
      reverseGeocode(lat, lng);
    });

    // Mostrar ubicaciones de la empresa
    empresaUbicaciones.forEach((ubicacion, index) => {
      // Crear icono personalizado con logo de la empresa
      let iconUrl;
      if (empresaLogo) {
        // Si hay logo, crear un marcador con la imagen
        iconUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <clipPath id="circleClip">
                <circle cx="20" cy="20" r="18"/>
              </clipPath>
            </defs>
            <circle cx="20" cy="20" r="18" fill="#FF6B35" stroke="#fff" stroke-width="3"/>
            <circle cx="20" cy="20" r="16" fill="#fff"/>
            <image href="${empresaLogo}" x="4" y="4" width="32" height="32" clip-path="url(#circleClip)"/>
            <circle cx="20" cy="20" r="16" fill="none" stroke="#FF6B35" stroke-width="2"/>
          </svg>
        `);
      } else {
        // Si no hay logo, usar el emoji por defecto
        iconUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <circle cx="15" cy="15" r="12" fill="#FF6B35" stroke="#fff" stroke-width="3"/>
            <circle cx="15" cy="15" r="6" fill="#fff"/>
            <text x="15" y="18" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="#FF6B35">🏢</text>
          </svg>
        `);
      }

      new google.maps.Marker({
        position: { lat: ubicacion.lat, lng: ubicacion.lng },
        map: mapInstance,
        title: `Ubicación ${empresaName}`,
        icon: {
          url: iconUrl,
          scaledSize: new google.maps.Size(empresaLogo ? 40 : 30, empresaLogo ? 40 : 30),
          anchor: new google.maps.Point(empresaLogo ? 20 : 15, empresaLogo ? 20 : 15),
        }
      });
    });

    // Obtener ubicación del usuario automáticamente al inicializar
    if (navigator.geolocation) {
      console.log('📍 Obteniendo ubicación del usuario automáticamente...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('✅ Ubicación del usuario obtenida:', { latitude, longitude });
          
          // Centrar el mapa en la ubicación del usuario
          const userLocation = { lat: latitude, lng: longitude };
          mapInstance.setCenter(userLocation);
          mapInstance.setZoom(15);
          
          // Mover el marcador a la ubicación del usuario
          if (markerInstance) {
            markerInstance.setPosition(userLocation);
          }
          
          // Establecer ubicación inicial y obtener dirección
          setSelectedLocation({ direccion: 'Cargando dirección...', lat: latitude, lng: longitude });
          reverseGeocode(latitude, longitude);
        },
        (error) => {
          console.warn('⚠️ No se pudo obtener ubicación del usuario:', error);
          // Si no se puede obtener la ubicación, usar el centro por defecto
          console.log('📍 Usando ubicación por defecto');
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 60000 // 1 minuto
        }
      );
    } else {
      console.log('📍 Geolocalización no soportada, usando ubicación por defecto');
    }
  }, [empresaUbicaciones, empresaName, empresaLogo, reverseGeocode, google]);


  // Inicializar mapa cuando esté cargado
  useEffect(() => {
    console.log('🔍 [DEBUG] useEffect initializeMap', {
      isLoaded,
      mapRef: !!mapRef.current,
      google: !!google,
      mapInitialized
    });

    if (!isLoaded || !mapRef.current || !google || mapInitialized) return;

    console.log('🗺️ Inicializando mapa después de carga...');
    initializeMap();
    setMapInitialized(true);
  }, [isLoaded, google, mapInitialized, initializeMap]);



  const handleConfirmLocation = () => {
    if (selectedLocation) {
      // Pasar la ubicación junto con el precio de envío
      onLocationSelect({
        ...selectedLocation,
        shippingPrice: shippingPrice
      });
    }
  };

  const handleSearch = () => {
    if (!geocoder || !searchQuery.trim()) return;

    geocoder.geocode({ 
      address: searchQuery,
      language: 'es',
      region: 'AR'
    }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        // Actualizar ubicación seleccionada inmediatamente
        setSelectedLocation({ direccion: 'Cargando dirección...', lat, lng });
        
        if (marker) {
          marker.setPosition({ lat, lng });
        }
        if (map) {
          map.setCenter({ lat, lng });
          map.setZoom(15);
        }
        
        reverseGeocode(lat, lng);
      } else {
        // Manejar error en búsqueda
        console.warn('⚠️ Error en búsqueda:', status);
        alert(`No se pudo encontrar la dirección "${searchQuery}". Intenta con una búsqueda más específica.`);
      }
    });
  };

  if (loadError) {
    return (
      <div className="delivery-location-selector">
        <div className="delivery-location-header">
         
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="error-message">
          <p>❌ {loadError}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !isLoaded) {
    return (
      <div className="delivery-location-selector">
        <div className="delivery-location-header">

          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-location-selector">
      {/* Header flotante */}
      <div className="delivery-location-header-floating">
  
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      {/* Contenedor principal del mapa */}
      <div className="map-fullscreen-container">
        <div ref={mapRef} className="delivery-map-fullscreen" />

        {/* Controles flotantes sobre el mapa */}
        <div className="map-controls-overlay">
          {/* Búsqueda */}
          <div className="search-control-floating">
            <div className="search-input-group-floating">
              <input
                type="text"
                placeholder="Buscar dirección..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="search-input-floating"
              />
              <button onClick={handleSearch} className="search-btn-floating">
                🔍
              </button>
            </div>
          </div>

          {/* Botón de ubicación actual */}
          <button 
            onClick={getCurrentLocation} 
            className="current-location-btn-floating"
            disabled={isGettingLocation}
            title="Usar mi ubicación actual"
          >
            <span className="location-btn-text">Ubicación actual</span>
            <span className="location-btn-icon">{isGettingLocation ? '⏳' : '📍'}</span>
          </button>

          {/* Información de precio y confirmar */}
          {selectedLocation && selectedLocation.direccion !== 'Ubicación sin dirección' && (
            <div className="price-info-floating">
              {isCalculatingPrice ? (
                <div className="price-calculating-floating">
                  <div className="loading-spinner small"></div>
                  <span>Calculando precio...</span>
                </div>
              ) : shippingPrice ? (
                <div className="shipping-price-floating">
                  {shippingPrice.price ? (
                    <div className="price-available-floating">
                      <div className="price-amount-floating">
                        ${shippingPrice.price.toFixed(2)}
                      </div>
                      {shippingPrice.isEstimated && (
                        <div className="price-note-floating">*Estimado</div>
                      )}
                    </div>
                  ) : (
                    <div className="price-unavailable-floating">
                      <span>A confirmar</span>
                    </div>
                  )}
                </div>
              ) : null}

              <button 
                onClick={handleConfirmLocation}
                className="confirm-location-btn-floating"
                disabled={!selectedLocation}
              >
                Confirmar ubicación
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryLocationSelector;
