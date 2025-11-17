/**
 * MapViewUniversal - Web
 * Implementación de mapas para web usando Google Maps JavaScript API
 */

import React, { useEffect, useRef, useState, Children } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GOOGLE_MAPS_API_KEY = 'AIzaSyANk5MpfxAkPg0krpULl3xUR3e4wDigkOs';

// Color palette (matching mobile theme)
const colors = {
  primary: '#2563EB',
  secondary: '#10B981',
  orange: '#F26B1D',
  white: '#FFFFFF',
};

// Ionicons to SVG mapping
const ioniconsToSVG: Record<string, string> = {
  'storefront': `<path d="M448 448V320h64v128c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V320h64v128h384zM112 224c0-8.8-7.2-16-16-16s-16 7.2-16 16v64c0 8.8 7.2 16 16 16s16-7.2 16-16V224zm48 0c0-8.8-7.2-16-16-16s-16 7.2-16 16v64c0 8.8 7.2 16 16 16s16-7.2 16-16V224zm112-16c-8.8 0-16 7.2-16 16v64c0 8.8 7.2 16 16 16s16-7.2 16-16V224c0-8.8-7.2-16-16-16zm48 16c0-8.8-7.2-16-16-16s-16 7.2-16 16v64c0 8.8 7.2 16 16 16s16-7.2 16-16V224zm112-16c-8.8 0-16 7.2-16 16v64c0 8.8 7.2 16 16 16s16-7.2 16-16V224c0-8.8-7.2-16-16-16zM456.8 111.7l27.8 40.1c4.1 5.9 .5 13.9-6.5 14.1h-1.1c-5.6 0-10.9-2.6-14.3-7.2L432 118.4V192h-48V118.4l-30.7 40.3c-3.4 4.5-8.7 7.2-14.3 7.2h-1.1c-7 .2-10.6-8.2-6.5-14.1l27.8-40.1L331 71.6c-3.4-4.9-3.4-11.3 0-16.2s9.6-7.8 16-7.8h.2l42.5 .6c6.4 .1 12.3 3.2 15.8 8.4l28.6 42.5z"/>`,
  'home': `<path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/>`,
  'bicycle': `<path d="M400 96a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm-4 121.2l-32.9 81.2c-5.9 14.5-1.5 31.4 10.9 41.5l96.9 78.5c10.9 8.8 26.7 7.1 35.4-3.8s7.1-26.7-3.8-35.4L420.6 320l30.8-75.8L468 266.7V360c0 13.3 10.7 24 24 24s24-10.7 24-24V258.5c0-8.9-3.9-17.3-10.7-23.1l-62.6-53.9c-10.6-9.2-26.5-10.3-38.1-2.6L305.3 242.1c-23.9 15.9-38.7 43.3-38.7 72.5V400c0 13.3 10.7 24 24 24s24-10.7 24-24V314.6c0-12.2 6.2-23.6 16.4-30.3l41.8-27.9-25 61.9L301.5 353c-9.5 9.5-9.3 25 .4 34.3s25 9.9 34.3 .4l55.1-54.6c6.1-6 9.6-14.1 9.6-22.6c0-7.3-2.5-14.4-7.1-20.1l-31.6-39.5zM128 416a96 96 0 1 0 0-192 96 96 0 1 0 0 192zM96 320a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm288 96a96 96 0 1 0 0-192 96 96 0 1 0 0 192zm-32-96a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/>`,
};

// Extract marker configuration from React children
const extractMarkerConfig = (children: any): { icon: string; color: string; label?: string } => {
  let iconName = 'home';
  let iconColor = colors.primary;
  let label = '';
  let foundIcon = false;

  // Recursively search for marker info in children
  const findMarkerInfo = (node: any): void => {
    if (!node) return;

    if (Array.isArray(node)) {
      node.forEach(findMarkerInfo);
      return;
    }

    const props = node.props || {};
    const nodeString = JSON.stringify(node);

    // Check for marker styles to determine type by searching in the serialized node
    if (nodeString.includes('markerEmpresa') || nodeString.includes(colors.primary)) {
      iconColor = colors.primary;
    } else if (nodeString.includes('markerCliente') || nodeString.includes(colors.secondary)) {
      iconColor = colors.secondary;
    } else if (nodeString.includes('markerRepartidor') || nodeString.includes(colors.orange)) {
      iconColor = colors.orange;
    }

    // Check for marker styles to determine type
    if (props.style) {
      const styles = Array.isArray(props.style) ? props.style : [props.style];
      const flatStyle = Object.assign({}, ...styles.map((s: any) => s || {}));

      // Detect marker type by background color
      if (flatStyle.backgroundColor === colors.primary) {
        iconColor = colors.primary;
      } else if (flatStyle.backgroundColor === colors.secondary) {
        iconColor = colors.secondary;
      } else if (flatStyle.backgroundColor === colors.orange) {
        iconColor = colors.orange;
      }
    }

    // Look for Ionicons to get icon name
    if (props.name && typeof props.name === 'string' && !foundIcon) {
      // Only take the first icon found (the main marker icon, not label icons)
      const potentialIcons = ['storefront', 'home', 'bicycle'];
      if (potentialIcons.includes(props.name)) {
        iconName = props.name;
        foundIcon = true;
        if (props.color) iconColor = props.color;
      }
    }

    // Recurse into children
    if (props.children) {
      findMarkerInfo(props.children);
    }
  };

  findMarkerInfo(children);

  // Mapear icono a color por defecto si no se encontró color específico
  if (iconColor === colors.primary && iconName !== 'storefront') {
    // Si el color sigue siendo primary pero el icono no es storefront, asignar color según icono
    if (iconName === 'home') {
      iconColor = colors.secondary; // Verde para casa/cliente
    } else if (iconName === 'bicycle') {
      iconColor = colors.orange; // Naranja para repartidor
    }
  }

  console.log('[extractMarkerConfig] Resultado final:', { iconName, iconColor });

  return { icon: iconName, color: iconColor, label };
};

// Create custom marker icon for Google Maps
const createCustomMarkerIcon = (config: { icon: string; color: string; label?: string }): any => {
  const svgPath = ioniconsToSVG[config.icon] || ioniconsToSVG['home'];

  // Create SVG marker with icon - simplified for better compatibility
  const svg = `<svg width="56" height="70" viewBox="0 0 56 70" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow-${config.icon}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
      <feOffset dx="0" dy="1" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.3"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <circle cx="28" cy="28" r="26" fill="${config.color}" opacity="0.2"/>
  <circle cx="28" cy="28" r="28" fill="none" stroke="${colors.white}" stroke-width="4"/>
  <circle cx="28" cy="28" r="24" fill="${config.color}"/>
  <g transform="translate(10, 10) scale(0.055)">
    <path d="${svgPath}" fill="${colors.white}"/>
  </g>
  <path d="M 28 56 L 20 68 L 36 68 Z" fill="${config.color}"/>
</svg>`;

  const encodedSvg = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg.trim());

  console.log('[MapView Web] Creating icon for:', config.icon, 'color:', config.color);

  const google = (window as any).google;
  if (google?.maps) {
    return {
      url: encodedSvg,
      scaledSize: new google.maps.Size(56, 70),
      anchor: new google.maps.Point(28, 70),
    };
  }

  // Fallback si Google Maps aún no está cargado
  return {
    url: encodedSvg,
    scaledSize: { width: 56, height: 70 },
    anchor: { x: 28, y: 70 },
  };
};

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

    console.log('[MapView Web] Processing children, count:', Children.count(children));

    // Limpiar marcadores anteriores
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Limpiar polylines anteriores
    polylinesRef.current.forEach((polyline) => polyline.setMap(null));
    polylinesRef.current = [];

    // Procesar children
    Children.forEach(children, (child: any) => {
      if (!child) return;

      console.log('[MapView Web] Child type:', child.type?.name || child.type, 'props:', Object.keys(child.props || {}));

      // Procesar Marker - verificar tanto por referencia como por nombre
      const isMarker = child.type === Marker || child.type?.name === 'Marker' || child.type?.displayName === 'Marker';

      if (isMarker) {
        const { coordinate, title, description, children: markerChildren } = child.props;

        console.log('[MapView Web] Processing marker:', {
          coordinate,
          title,
          hasChildren: !!markerChildren
        });

        // Si hay children personalizados (iconos custom), crear marker HTML
        if (markerChildren) {
          const markerConfig = extractMarkerConfig(markerChildren);
          console.log('[MapView Web] Marker config extracted:', markerConfig);

          const customIcon = createCustomMarkerIcon(markerConfig);

          const marker = new google.maps.Marker({
            position: { lat: coordinate.latitude, lng: coordinate.longitude },
            map: googleMapRef.current,
            title: title || '',
            icon: customIcon,
          });

          console.log('[MapView Web] Custom marker created at:', coordinate);

          if (title || description) {
            const infoWindow = new google.maps.InfoWindow({
              content: `<div><strong>${title || ''}</strong><br/>${description || ''}</div>`,
            });
            marker.addListener('click', () => {
              infoWindow.open(googleMapRef.current, marker);
            });
          }

          markersRef.current.push(marker);
        } else {
          // Marker estándar sin children
          const marker = new google.maps.Marker({
            position: { lat: coordinate.latitude, lng: coordinate.longitude },
            map: googleMapRef.current,
            title: title || '',
          });

          console.log('[MapView Web] Standard marker created at:', coordinate);

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
      }

      // Procesar Polyline - verificar tanto por referencia como por nombre
      const isPolyline = child.type === Polyline || child.type?.name === 'Polyline' || child.type?.displayName === 'Polyline';

      if (isPolyline) {
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
      // Determinar icono basado en el título o color
      let customIcon: any = undefined;

      if (markerData.color) {
        // Mapear color a icono y tipo
        let iconName = 'home';
        if (markerData.title?.toLowerCase().includes('empresa') || markerData.title?.toLowerCase().includes('local')) {
          iconName = 'storefront';
        } else if (markerData.title?.toLowerCase().includes('repartidor') || markerData.title?.toLowerCase().includes('delivery')) {
          iconName = 'bicycle';
        } else if (markerData.title?.toLowerCase().includes('cliente') || markerData.title?.toLowerCase().includes('destino')) {
          iconName = 'home';
        }

        // Crear icono personalizado
        customIcon = createCustomMarkerIcon({
          icon: iconName,
          color: markerData.color,
        });
      }

      const marker = new google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map: googleMapRef.current,
        title: markerData.title || '',
        draggable: draggableMarker,
        icon: customIcon,
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
