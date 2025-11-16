/**
 * MapViewUniversal - Web
 * Implementación de mapas para web usando Google Maps JavaScript API
 */

import React, { useEffect, useRef, useState, Children } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GOOGLE_MAPS_API_KEY = 'AIzaSyANk5MpfxAkPg0krpULl3xUR3e4wDigkOs';

// Types
export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export const PROVIDER_GOOGLE = 'google';

interface MapViewProps {
  provider?: string;
  style?: any;
  initialRegion?: Region;
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  customMapStyle?: any[];
  children?: React.ReactNode;
}

interface MarkerProps {
  coordinate: { latitude: number; longitude: number };
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

interface PolylineProps {
  coordinates: Array<{ latitude: number; longitude: number }>;
  strokeColor?: string;
  strokeWidth?: number;
}

/**
 * MapView component for web - uses Google Maps JavaScript API
 */
export const MapView: React.FC<MapViewProps> = ({
  style,
  initialRegion,
  showsUserLocation = false,
  showsMyLocationButton = false,
  customMapStyle = [],
  children,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extraer altura del estilo
  const height = StyleSheet.flatten(style)?.height || 400;

  // Cargar script de Google Maps
  useEffect(() => {
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
    if (!mapLoaded || !mapRef.current) return;

    try {
      const google = (window as any).google;
      if (!google?.maps) return;

      const center = initialRegion
        ? { lat: initialRegion.latitude, lng: initialRegion.longitude }
        : { lat: -31.4201, lng: -64.1888 }; // Córdoba por defecto

      const zoom = initialRegion
        ? Math.round(Math.log(360 / initialRegion.latitudeDelta) / Math.LN2)
        : 13;

      // Crear mapa
      const mapOptions = {
        center: center,
        zoom: zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: showsMyLocationButton,
        styles: customMapStyle,
      };

      googleMapRef.current = new google.maps.Map(mapRef.current, mapOptions);

      // Mostrar ubicación del usuario si está habilitado
      if (showsUserLocation && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          new google.maps.Marker({
            position: userLocation,
            map: googleMapRef.current,
            title: 'Tu ubicación',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });
        });
      }
    } catch (err) {
      console.error('Error inicializando mapa:', err);
      setError('Error al inicializar el mapa');
    }
  }, [mapLoaded, initialRegion, showsUserLocation, showsMyLocationButton, customMapStyle]);

  // Procesar children (Markers y Polylines)
  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded) return;

    const google = (window as any).google;
    if (!google?.maps) return;

    // Limpiar marcadores anteriores
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Limpiar polylines anteriores
    polylinesRef.current.forEach((polyline) => polyline.setMap(null));
    polylinesRef.current = [];

    // Procesar children
    Children.forEach(children, (child: any) => {
      if (!child) return;

      // Procesar Marker
      if (child.type === Marker) {
        const { coordinate, title, description, children: markerChildren } = child.props;

        const marker = new google.maps.Marker({
          position: { lat: coordinate.latitude, lng: coordinate.longitude },
          map: googleMapRef.current,
          title: title || '',
        });

        if (title || description) {
          const infoWindow = new google.maps.InfoWindow({
            content: `<div><strong>${title || ''}</strong><br/>${description || ''}</div>`,
          });
          marker.addListener('click', () => {
            infoWindow.open(googleMapRef.current, marker);
          });
        }

        markersRef.current.push(marker);
      }

      // Procesar Polyline
      if (child.type === Polyline) {
        const { coordinates, strokeColor, strokeWidth } = child.props;

        if (coordinates && coordinates.length > 0) {
          const path = coordinates.map((coord: any) => ({
            lat: coord.latitude,
            lng: coord.longitude,
          }));

          const polyline = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: strokeColor || '#F26B1D',
            strokeOpacity: 1.0,
            strokeWeight: strokeWidth || 4,
          });

          polyline.setMap(googleMapRef.current);
          polylinesRef.current.push(polyline);
        }
      }
    });
  }, [children, mapLoaded]);

  if (error) {
    return (
      <View
        style={{
          height: typeof height === 'number' ? height : 400,
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
          height: typeof height === 'number' ? height : 400,
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
        height: typeof height === 'number' ? height : 400,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    />
  );
};

/**
 * Marker component for web
 */
export const Marker: React.FC<MarkerProps> = () => {
  return null;
};

/**
 * Polyline component for web
 */
export const Polyline: React.FC<PolylineProps> = () => {
  return null;
};

/**
 * MapFallback - Componente específico para web con funcionalidades adicionales
 * Soporta clicks en el mapa, marcadores arrastrables, etc.
 */
interface MapFallbackProps {
  height?: number;
  markers?: Array<{
    lat: number;
    lng: number;
    title?: string;
    color?: string;
  }>;
  center?: { lat: number; lng: number };
  zoom?: number;
  onMapClick?: (lat: number, lng: number) => void;
  draggableMarker?: boolean;
}

export const MapFallback: React.FC<MapFallbackProps> = ({
  height = 400,
  markers = [],
  center,
  zoom = 13,
  onMapClick,
  draggableMarker = false,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar script de Google Maps
  useEffect(() => {
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

  // Inicializar mapa
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    try {
      const google = (window as any).google;
      if (!google?.maps) return;

      const mapCenter = center || { lat: -31.4201, lng: -64.1888 };

      const mapOptions = {
        center: mapCenter,
        zoom: zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      };

      googleMapRef.current = new google.maps.Map(mapRef.current, mapOptions);

      // Agregar listener de click si está habilitado
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
    if (!googleMapRef.current || !mapLoaded) return;

    const google = (window as any).google;
    if (!google?.maps) return;

    // Limpiar marcadores anteriores
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Agregar nuevos marcadores
    markers.forEach((markerData) => {
      const marker = new google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map: googleMapRef.current,
        title: markerData.title || '',
        draggable: draggableMarker,
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

      // Si el marcador es arrastrable, agregar evento de drag
      if (draggableMarker && onMapClick) {
        marker.addListener('dragend', (e: any) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          onMapClick(lat, lng);
        });
      }

      // Agregar info window si hay título
      if (markerData.title) {
        const infoWindow = new google.maps.InfoWindow({
          content: `<div style="font-weight: 600; color: #333;">${markerData.title}</div>`,
        });
        marker.addListener('click', () => {
          infoWindow.open(googleMapRef.current, marker);
        });
      }

      markersRef.current.push(marker);
    });

    // Centrar el mapa en el primer marcador si existe
    if (markers.length > 0 && center) {
      googleMapRef.current.setCenter({ lat: center.lat, lng: center.lng });
    }
  }, [markers, mapLoaded, draggableMarker, onMapClick, center]);

  if (error) {
    return (
      <View
        style={{
          height: height,
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
          height: height,
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
