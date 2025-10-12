import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, CircleF } from '@react-google-maps/api';
import './PriceZoneMap.css';

type Zone = { distancia: number; precio: number };

interface PriceZoneMapProps {
  center: { lat: number; lng: number };
  onSave: (data: { distancia: number; precio: number }) => void;
  onCancel: () => void;
  initialRadius?: number;     // en metros
  initialPrice?: number;
  height?: string;
  saving?: boolean;
  onChange?: (data: { distancia: number; precio: number }) => void;
  hideActions?: boolean;
  /** Zonas guardadas (distancia en km) para dibujar anillos */
  zones?: Zone[];
}

const PriceZoneMap: React.FC<PriceZoneMapProps> = ({
  center,
  onSave,
  onCancel,
  initialRadius = 3000,
  initialPrice = 0,
  height = '500px',
  saving = false,
  onChange,
  hideActions = false,
  zones = []
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  });

  const [radius, setRadius] = useState(initialRadius); // metros
  const [precio, setPrecio] = useState(initialPrice);

  const minRadius = 500;
  const maxRadius = 30000;
  const stepRadius = 100;

  const distanciaKm = useMemo(() => Math.round((radius / 1000) * 10) / 10, [radius]);

  const sortedZones = useMemo(
    () => [...zones].sort((a, b) => a.distancia - b.distancia),
    [zones]
  );

  // Primera zona con distancia >= radio actual
  const activeZoneIndex = useMemo(() => {
    const km = distanciaKm;
    return sortedZones.findIndex(z => z.distancia >= km);
  }, [sortedZones, distanciaKm]);

  const activeZone = activeZoneIndex >= 0 ? sortedZones[activeZoneIndex] : null;

  useEffect(() => {
    if (onChange) onChange({ distancia: distanciaKm, precio });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distanciaKm, precio]);

  useEffect(() => {
    if (initialRadius !== radius) setRadius(initialRadius);
    if (initialPrice !== precio) setPrecio(initialPrice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRadius, initialPrice]);

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

  if (loadError) {
    return <div className="pzm-container">Error cargando Google Maps</div>;
  }
  if (!isLoaded || !isValidCenter) {
    return (
      <div className="pzm-container">
        <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loading-spinner" />
          <span style={{ marginLeft: 10 }}>
            {!isLoaded ? 'Cargando mapa...' : 'Cargando ubicación...'}
          </span>
        </div>
      </div>
    );
  }

  // Progreso visual del range (0–100)
  const pct =
    Math.max(0, Math.min(100, ((radius - minRadius) / (maxRadius - minRadius)) * 100));

  return (
    <div className="pzm-container">
      {/* Controles superiores */}
      <div className="pzm-controls">
        <div className="pzm-row">
          {/* Radio */}
          <div className="pzm-field pzm-range">
            <label className="pzm-label">Radio: {distanciaKm} km</label>
            <input
              className="range"
              type="range"
              min={minRadius}
              max={maxRadius}
              step={stepRadius}
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              disabled={saving}
              style={{
                background: `linear-gradient(90deg, var(--primary) 0%, var(--primary) ${pct}%, var(--border) ${pct}%)`
              }}
            />
            <div className="range-meta">
              <span className="pzm-badge">0.5 km</span>
              <span className="pzm-badge">30 km</span>
            </div>
          </div>

          {/* Precio */}
          <div className="pzm-field pzm-field-price">
            <label className="pzm-label">Precio de envío ($)</label>
            <div className="pzm-pricewrap">
              <span className="pzm-currency">$</span>
              <input
                className="pzm-price"
                type="number"
                step="0.01"
                min="0"
                value={precio}
                onChange={(e) => setPrecio(parseFloat(e.target.value) || 0)}
                placeholder="Ej: 150.00"
                disabled={saving}
              />
            </div>
          </div>

          {/* Acciones */}
          {!hideActions && (
            <div className="pzm-actions">
              <button className="btn btn-secondary btn-pill" onClick={onCancel} disabled={saving}>
                Cancelar
              </button>
              <button
                className="btn btn-primary btn-pill"
                onClick={handleSave}
                disabled={saving || precio <= 0}
              >
                {saving ? 'Guardando…' : 'Guardar precio'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mapa + chip resumen */}
      <div className="pzm-map" style={{ height }}>
        <GoogleMap
          key={`${center.lat},${center.lng}`}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={12}
          options={{ streetViewControl: false, mapTypeControl: false }}
        >
          <MarkerF position={center} label={{ text: 'Local', fontWeight: '700' }} />

          {/* Anillos de zonas (contorno) */}
          {sortedZones.map((z, i) => {
            const isActive = i === activeZoneIndex;
            return (
              <CircleF
                key={`zone-${i}-${z.distancia}`}
                center={center}
                radius={z.distancia * 1000}
                options={{
                  fillOpacity: 0,
                  strokeColor: '#3B82F6',
                  strokeOpacity: 1,
                  strokeWeight: isActive ? 3 : 1.5,
                  clickable: false,
                  zIndex: isActive ? 2 : 1,
                }}
              />
            );
          })}

          {/* Cursor del radio actual */}
          <CircleF
            center={center}
            radius={radius}
            options={{
              fillOpacity: 0,
              strokeColor: '#0EA5E9',
              strokeOpacity: 1,
              strokeWeight: 2.5,
              clickable: false,
              zIndex: 3,
            }}
          />
        </GoogleMap>

        {/* Chip resumen (arriba-derecha) */}
        <div className="pzm-chip">
          <span className="dot" />
          <span>Radio: {distanciaKm} km</span>
          <span className="dot" style={{ background: '#3B82F6' }} />
          <span>
            {activeZone ? `Precio: $${activeZone.precio}` : 'Fuera de zonas'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PriceZoneMap;

