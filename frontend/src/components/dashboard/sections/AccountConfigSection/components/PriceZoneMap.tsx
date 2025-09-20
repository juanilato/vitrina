import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, CircleF } from '@react-google-maps/api';
import './PriceZoneMap.css';

interface PriceZoneMapProps {
  center: { lat: number; lng: number };
  onSave: (data: { distancia: number; precio: number }) => void;
  onCancel: () => void;
  initialRadius?: number;
  initialPrice?: number;
  height?: string;
  saving?: boolean;
}

const PriceZoneMap: React.FC<PriceZoneMapProps> = ({
  center,
  onSave,
  onCancel,
  initialRadius = 3000,
  initialPrice = 0,
  height = '500px',
  saving = false
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  const [radius, setRadius] = useState(initialRadius);
  const [precio, setPrecio] = useState(initialPrice);

  const zoom = 12;

  const distanciaKm = useMemo(() => Math.round((radius / 1000) * 10) / 10, [radius]);

  // Sincroniza cuando cambian props iniciales
  useEffect(() => {
    setRadius(initialRadius);
    setPrecio(initialPrice);
  }, [initialRadius, initialPrice]);

  // Evita centro inválido
  const isValidCenter =
    typeof center?.lat === 'number' &&
    typeof center?.lng === 'number' &&
    !Number.isNaN(center.lat) &&
    !Number.isNaN(center.lng);

  const handleSave = useCallback(() => {
    if (precio <= 0) {
      alert('Por favor ingresa un precio válido');
      return;
    }
    onSave({ distancia: distanciaKm, precio });
  }, [precio, distanciaKm, onSave]);

  const minRadius = 500;
  const maxRadius = 30000;
  const stepRadius = 100;

  if (loadError) {
    return <div className="price-zone-map-container">Error cargando Google Maps</div>;
  }

  if (!isLoaded || !isValidCenter) {
    return (
      <div className="price-zone-map-container">
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loading-spinner"></div>
          <span style={{ marginLeft: 10 }}>
            { !isLoaded ? 'Cargando mapa...' : 'Cargando ubicación...' }
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="price-zone-map-container">
      {/* Controles */}
      <div className="map-controls">
        <div className="control-section">
          <h4>Configurar Zona de Envío</h4>
          <p>Selecciona el radio de envío y establece el precio</p>
        </div>

        <div className="controls-grid">
          <div className="control-group">
            <label>Radio de Envío: {distanciaKm} km</label>
            <div className="radius-slider-container">
              <div className="slider-labels">
                <span className="slider-min">0.5 km</span>
                <span className="slider-max">30 km</span>
              </div>
              <input
                type="range"
                min={minRadius}
                max={maxRadius}
                step={stepRadius}
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="radius-slider"
                disabled={saving}
              />
              <div className="slider-value">
                <span className="current-value">{distanciaKm} km</span>
              </div>
            </div>
          </div>

          <div className="control-group">
            <label>Precio de Envío ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={precio}
              onChange={(e) => setPrecio(parseFloat(e.target.value) || 0)}
              className="price-input"
              placeholder="Ej: 150.00"
              disabled={saving}
            />
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn btn-secondary" onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || precio <= 0}>
            {saving ? 'Guardando...' : 'Guardar Precio'}
          </button>
        </div>
      </div>

      {/* Mapa */}
      <div style={{ height, position: 'relative' }}>
        <GoogleMap
          key={`${center.lat},${center.lng}`}  // re-mount sólo si cambia el centro
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={zoom}
          options={{ streetViewControl: false, mapTypeControl: false }}
          onLoad={() => console.log('[Map] loaded')}
        >
          <MarkerF
            position={center}
            label={{ text: 'Local', fontWeight: '700' }}
            onLoad={() => console.log('[Marker] loaded')}
          />

          <CircleF
            center={center}
            radius={radius}
            options={{
              fillColor: '#FF6B35',
              fillOpacity: 0.15,
              strokeColor: '#FF6B35',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              clickable: false,
            }}
            onLoad={() => console.log('[Circle] loaded')}
          />
        </GoogleMap>

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
                  <span className="value">{distanciaKm} km</span>
                </div>
                <div className="detail-row">
                  <span className="label">Precio:</span>
                  <span className="value">${precio}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
};

export default PriceZoneMap;
