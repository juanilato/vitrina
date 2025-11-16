import React, { useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader, Circle, Marker } from '@react-google-maps/api';

interface InteractiveMapProps {
  center: {
    lat: number;
    lng: number;
  };
  onCircleChange: (radius: number, center: { lat: number; lng: number }) => void;
  initialRadius?: number;
  height?: string;
}
// Mapa interactivo con circulos indicando precio envío
const InteractiveMap: React.FC<InteractiveMapProps> = ({
  center,
  onCircleChange,
  initialRadius = 3000, // 3km en metros
  height = '400px'
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [radius, setRadius] = useState(initialRadius);

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  };

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    
    // Centrar y hacer zoom en la ubicación de la empresa
    map.setCenter(center);
    map.setZoom(14);
    
    console.log('🗺️ [MAP] Mapa cargado y centrado en:', center);
  };

  // El círculo ya no es arrastrable, solo se controla con el slider

  const onRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    onCircleChange(newRadius, center);
  };

  const calculateDistance = (radiusInMeters: number): number => {
    // Convertir metros a kilómetros
    return Math.round((radiusInMeters / 1000) * 10) / 10;
  };

  if (!isLoaded) {
    return (
      <div style={{ height, position: 'relative' }}>
        <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '12px' }} />
      </div>
    );
  }

  return (
    <div className="interactive-map-container">
      <div className="map-controls">
        <div className="radius-control">
          <label>Radio de envío: {calculateDistance(radius)} km</label>
          <input
            type="range"
            min="1000"
            max="20000"
            step="500"
            value={radius}
            onChange={(e) => onRadiusChange(parseInt(e.target.value))}
            className="radius-slider"
          />
          <div className="radius-labels">
            <span>1 km</span>
            <span>20 km</span>
          </div>
        </div>
      </div>

      <div style={{ height, position: 'relative' }}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={14}
          onLoad={onMapLoad}
          options={mapOptions}
        >
          {/* Marcador de la ubicación de la empresa */}
          <Marker
            position={center}
            title="Ubicación de la empresa"
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="18" fill="#FF6B35" stroke="#fff" stroke-width="4"/>
                  <circle cx="20" cy="20" r="8" fill="#fff"/>
                  <text x="20" y="25" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#FF6B35">🏢</text>
                </svg>
              `),
              scaledSize: new google.maps.Size(40, 40),
              anchor: new google.maps.Point(20, 20),
            }}
          />

          {/* Círculo de envío (solo controlado por slider) */}
          <Circle
            center={center}
            radius={radius}
            options={{
              fillColor: '#FF6B35',
              fillOpacity: 0.15,
              strokeColor: '#FF6B35',
              strokeOpacity: 0.9,
              strokeWeight: 3,
              draggable: false,
              clickable: false,
            }}
          />
        </GoogleMap>

        {/* Overlay con información */}
        <div className="map-overlay">
          <div className="overlay-content">
            <div className="zone-info">
              <div className="zone-header">
                <span className="zone-icon">🚚</span>
                <h4>Zona de Envío</h4>
              </div>
              <div className="zone-details">
                <div className="detail-row">
                  <span className="label">Radio:</span>
                  <span className="value">{calculateDistance(radius)} km</span>
                </div>
              </div>
              <p className="instruction">Usa el slider para ajustar el radio de envío</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
