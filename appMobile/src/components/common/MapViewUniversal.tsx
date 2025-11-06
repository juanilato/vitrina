import React, { useEffect, useRef, useState } from 'react';
import { Platform, View, Text } from 'react-native';

let MapView: any = null;
let Marker: any = null;
let Region: any = null;
let Polyline: any = null;
let PROVIDER_GOOGLE: any = null;

// LÓGICA MOBILE - MANTENER INTACTA
if (Platform.OS !== 'web') {
  const RNMaps = require('react-native-maps');
  MapView = RNMaps.default;
  Marker = RNMaps.Marker;
  Region = RNMaps.Region;
  Polyline = RNMaps.Polyline;
  PROVIDER_GOOGLE = RNMaps.PROVIDER_GOOGLE;
}

export { MapView, Marker, Polyline, PROVIDER_GOOGLE, Region };

// ========================================
// GOOGLE MAPS WEB IMPLEMENTATION
// ========================================

const GOOGLE_MAPS_API_KEY = 'AIzaSyANk5MpfxAkPg0krpULl3xUR3e4wDigkOs';

interface MapFallbackProps {
  height?: number;
  mapType?: 'location-picker' | 'location-edit' | 'order-detail' | 'delivery-tracking' | 'simple-location';
  markers?: Array<{
    lat: number;
    lng: number;
    title?: string;
    color?: string;
    icon?: string;
  }>;
  center?: { lat: number; lng: number };
  zoom?: number;
  onMapClick?: (lat: number, lng: number) => void;
  draggableMarker?: boolean;
  showRoute?: boolean;
  routeCoordinates?: Array<{ latitude: number; longitude: number }>;
}

/**
 * Google Maps implementation for web
 */
export const MapFallback: React.FC<MapFallbackProps> = ({
  height = 250,
  markers = [],
  center = { lat: -31.4201, lng: -64.1888 }, // Córdoba por defecto
  zoom = 13,
  onMapClick,
  draggableMarker = false,
  showRoute = false,
  routeCoordinates = [],
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar script de Google Maps
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const loadGoogleMapsScript = () => {
      if (typeof window === 'undefined') return;

      // Si ya está cargado
      if ((window as any).google?.maps) {
        setMapLoaded(true);
        return;
      }

      // Si ya existe el script, esperar a que cargue
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        existingScript.addEventListener('load', () => setMapLoaded(true));
        return;
      }

      // Crear nuevo script
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      script.onerror = () => setError('Error al cargar Google Maps');
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
  }, []);

  // Inicializar mapa cuando esté cargado
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || Platform.OS !== 'web') return;

    try {
      const google = (window as any).google;
      if (!google?.maps) return;

      // Crear mapa
      const mapOptions = {
        center: center,
        zoom: zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      };

      googleMapRef.current = new google.maps.Map(mapRef.current, mapOptions);

      // Click en mapa
      if (onMapClick) {
        googleMapRef.current.addListener('click', (e: any) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          onMapClick(lat, lng);
        });
      }
    } catch (err) {
      console.error('Error inicializando mapa:', err);
      setError('Error al inicializar el mapa');
    }
  }, [mapLoaded, center, zoom, onMapClick]);

  // Actualizar marcadores
  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded || Platform.OS !== 'web') return;

    const google = (window as any).google;
    if (!google?.maps) return;

    // Limpiar marcadores anteriores
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Agregar nuevos marcadores
    markers.forEach((markerData, index) => {
      const marker = new google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map: googleMapRef.current,
        title: markerData.title || '',
        draggable: draggableMarker && index === 0, // Solo el primer marcador es draggable
        icon: markerData.color
          ? {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: markerData.color,
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }
          : undefined,
      });

      // Evento de arrastre
      if (draggableMarker && index === 0 && onMapClick) {
        marker.addListener('dragend', (e: any) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          onMapClick(lat, lng);
        });
      }

      markersRef.current.push(marker);
    });

    // Ajustar bounds si hay múltiples marcadores
    if (markers.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
      googleMapRef.current.fitBounds(bounds);
    }
  }, [markers, mapLoaded, draggableMarker, onMapClick]);

  // Dibujar ruta (polyline)
  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded || !showRoute || Platform.OS !== 'web') return;

    const google = (window as any).google;
    if (!google?.maps) return;

    // Limpiar polyline anterior
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    if (routeCoordinates.length > 0) {
      const path = routeCoordinates.map((coord) => ({
        lat: coord.latitude,
        lng: coord.longitude,
      }));

      polylineRef.current = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#F26B1D',
        strokeOpacity: 1.0,
        strokeWeight: 4,
      });

      polylineRef.current.setMap(googleMapRef.current);
    }
  }, [routeCoordinates, mapLoaded, showRoute]);

  if (Platform.OS !== 'web') {
    return (
      <View
        style={{
          height,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f4f4f4',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#ddd',
        }}
      >
        <Text style={{ color: '#666' }}>🌐 Usar en dispositivo móvil</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          height,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fee',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#fcc',
        }}
      >
        <Text style={{ color: '#c33' }}>⚠️ {error}</Text>
      </View>
    );
  }

  if (!mapLoaded) {
    return (
      <View
        style={{
          height,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f4f4f4',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#ddd',
        }}
      >
        <Text style={{ color: '#666' }}>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: height,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    />
  );
};
