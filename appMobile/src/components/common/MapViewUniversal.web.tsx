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

// Iconicons to SVG mapping for custom markers
const ioniconsToSVG: Record<string, string> = {
  'storefront': `<path d="M448 448V320h64v128c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V320h64v128h384zM112 224c0-8.8-7.2-16-16-16s-16 7.2-16 16v64c0 8.8 7.2 16 16 16s16-7.2 16-16V224zm48 0c0-8.8-7.2-16-16-16s-16 7.2-16 16v64c0 8.8 7.2 16 16 16s16-7.2 16-16V224zm112-16c-8.8 0-16 7.2-16 16v64c0 8.8 7.2 16 16 16s16-7.2 16-16V224c0-8.8-7.2-16-16-16zm48 16c0-8.8-7.2-16-16-16s-16 7.2-16 16v64c0 8.8 7.2 16 16 16s16-7.2 16-16V224zm112-16c-8.8 0-16 7.2-16 16v64c0 8.8 7.2 16 16 16s16-7.2 16-16V224c0-8.8-7.2-16-16-16zM456.8 111.7l27.8 40.1c4.1 5.9 .5 13.9-6.5 14.1h-1.1c-5.6 0-10.9-2.6-14.3-7.2L432 118.4V192h-48V118.4l-30.7 40.3c-3.4 4.5-8.7 7.2-14.3 7.2h-1.1c-7 .2-10.6-8.2-6.5-14.1l27.8-40.1L331 71.6c-3.4-4.9-3.4-11.3 0-16.2s9.6-7.8 16-7.8h.2l42.5 .6c6.4 .1 12.3 3.2 15.8 8.4l28.6 42.5z"/>`,
  'home': `<path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/>`,
  'bicycle': `<path d="M400 96a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm-4 121.2l-32.9 81.2c-5.9 14.5-1.5 31.4 10.9 41.5l96.9 78.5c10.9 8.8 26.7 7.1 35.4-3.8s7.1-26.7-3.8-35.4L420.6 320l30.8-75.8L468 266.7V360c0 13.3 10.7 24 24 24s24-10.7 24-24V258.5c0-8.9-3.9-17.3-10.7-23.1l-62.6-53.9c-10.6-9.2-26.5-10.3-38.1-2.6L305.3 242.1c-23.9 15.9-38.7 43.3-38.7 72.5V400c0 13.3 10.7 24 24 24s24-10.7 24-24V314.6c0-12.2 6.2-23.6 16.4-30.3l41.8-27.9-25 61.9L301.5 353c-9.5 9.5-9.3 25 .4 34.3s25 9.9 34.3 .4l55.1-54.6c6.1-6 9.6-14.1 9.6-22.6c0-7.3-2.5-14.4-7.1-20.1l-31.6-39.5zM128 416a96 96 0 1 0 0-192 96 96 0 1 0 0 192zM96 320a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm288 96a96 96 0 1 0 0-192 96 96 0 1 0 0 192zm-32-96a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/>`,
  'location': `<path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/>`,
};

// Función para detectar el tipo de marker basado en el icono principal
const detectMarkerType = (children: any): { icon: string; color: string } => {
  let iconName = 'home';
  let maxSize = 0;

  const searchIcon = (node: any): void => {
    if (!node) return;

    if (Array.isArray(node)) {
      node.forEach(searchIcon);
      return;
    }

    const props = node?.props;
    if (!props) return;

    // Buscar Ionicons con nombre de icono válido
    if (props.name && typeof props.name === 'string') {
      const validIcons = ['storefront', 'home', 'bicycle', 'location'];
      if (validIcons.includes(props.name)) {
        const size = props.size || 0;
        // Tomar el icono más grande (el principal, no el del label)
        if (size > maxSize) {
          iconName = props.name;
          maxSize = size;
        }
      }
    }

    // Recursivo
    if (props.children) {
      searchIcon(props.children);
    }
  };

  searchIcon(children);

  // Mapear icono a color
  let iconColor = colors.primary;
  if (iconName === 'storefront') {
    iconColor = colors.primary; // Azul para local/empresa
  } else if (iconName === 'home') {
    iconColor = colors.secondary; // Verde para cliente
  } else if (iconName === 'bicycle') {
    iconColor = colors.orange; // Naranja para repartidor
  } else if (iconName === 'location') {
    iconColor = colors.primary; // Azul por defecto
  }

  return { icon: iconName, color: iconColor };
};

// Crear icono SVG personalizado
const createCustomMarkerIcon = (iconName: string, color: string, google: any): any => {
  const svgPath = ioniconsToSVG[iconName] || ioniconsToSVG['home'];

  // SVG con viewBox correcto para los paths de Ionicons (512x512)
  const svg = `<svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
  <!-- Sombra -->
  <ellipse cx="20" cy="48" rx="12" ry="3" fill="#000000" opacity="0.2"/>

  <!-- Círculo principal con borde -->
  <circle cx="20" cy="20" r="16" fill="${color}" stroke="${colors.white}" stroke-width="2"/>

  <!-- Icono centrado -->
  <g transform="translate(20, 20)">
    <svg x="-8" y="-8" width="16" height="16" viewBox="0 0 512 512">
      <path d="${svgPath}" fill="${colors.white}"/>
    </svg>
  </g>

  <!-- Punta del marcador -->
  <path d="M 20 36 L 16 44 L 24 44 Z" fill="${color}" stroke="${colors.white}" stroke-width="1"/>
</svg>`;

  const encodedSvg = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);

  console.log('[Map] 🎨 SVG generado para', iconName, ':', encodedSvg.substring(0, 200) + '...');

  return {
    url: encodedSvg,
    scaledSize: new google.maps.Size(40, 50),
    anchor: new google.maps.Point(20, 44),
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
  region?: Region;
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  customMapStyle?: any[];
  children?: React.ReactNode;
  onPress?: (event: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => void;
  showsTraffic?: boolean;
  showsBuildings?: boolean;
  showsIndoors?: boolean;
}

interface MarkerProps {
  coordinate: { latitude: number; longitude: number };
  title?: string;
  description?: string;
  children?: React.ReactNode;
  draggable?: boolean;
  onDragEnd?: (event: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => void;
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
  region,
  showsUserLocation = false,
  showsMyLocationButton = false,
  customMapStyle = [],
  children,
  onPress,
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

      // Agregar listener de click si está definido
      if (onPress) {
        googleMapRef.current.addListener('click', (e: any) => {
          onPress({
            nativeEvent: {
              coordinate: {
                latitude: e.latLng.lat(),
                longitude: e.latLng.lng(),
              }
            }
          });
        });
      }

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
  }, [mapLoaded, initialRegion, showsUserLocation, showsMyLocationButton, customMapStyle, onPress]);

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

      // Función auxiliar para detectar el tipo de componente
      const isMarker = (child: any): boolean => {
        const typeName = child.type?.displayName || child.type?.name || '';
        const hasCoordinate = child.props?.coordinate &&
                             typeof child.props.coordinate.latitude === 'number' &&
                             typeof child.props.coordinate.longitude === 'number';
        return (typeName === 'Marker' || child.type === Marker) || hasCoordinate;
      };

      const isPolyline = (child: any): boolean => {
        const typeName = child.type?.displayName || child.type?.name || '';
        const hasCoordinates = Array.isArray(child.props?.coordinates) &&
                               child.props.coordinates.length > 0 &&
                               child.props.coordinates[0]?.latitude !== undefined;
        return (typeName === 'Polyline' || child.type === Polyline) || hasCoordinates;
      };

      // Procesar Marker
      if (isMarker(child)) {
        const { coordinate, title, description, children: markerChildren, draggable, onDragEnd } = child.props;

        let markerIcon: any = undefined;

        // Si tiene children personalizados, usar marcadores simples de colores
        if (markerChildren) {
          const { icon, color } = detectMarkerType(markerChildren);

          // Usar marcadores simples de Google Maps con colores
          markerIcon = {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: colors.white,
            strokeWeight: 3,
          };
        } else if (!markerChildren && draggable) {
          // Si es draggable y no tiene children, usar marcador de pin estándar de Google
          // (para LocationPicker)
          markerIcon = null; // Usa el marcador predeterminado de Google Maps
        }

        const marker = new google.maps.Marker({
          position: { lat: coordinate.latitude, lng: coordinate.longitude },
          map: googleMapRef.current,
          title: title || '',
          icon: markerIcon,
          draggable: draggable || false,
        });

        if (title || description) {
          const infoWindow = new google.maps.InfoWindow({
            content: `<div><strong>${title || ''}</strong><br/>${description || ''}</div>`,
          });
          marker.addListener('click', () => {
            infoWindow.open(googleMapRef.current, marker);
          });
        }

        // Agregar listener de drag end
        if (draggable && onDragEnd) {
          marker.addListener('dragend', (e: any) => {
            onDragEnd({
              nativeEvent: {
                coordinate: {
                  latitude: e.latLng.lat(),
                  longitude: e.latLng.lng(),
                }
              }
            });
          });
        }

        markersRef.current.push(marker);
      }

      // Procesar Polyline
      if (isPolyline(child)) {
        const { coordinates, strokeColor, strokeWidth } = child.props;

        console.log('[Map] ✅ Procesando Polyline con', coordinates?.length, 'coordenadas');

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
          console.log('[Map] ✅ Polyline creada con', path.length, 'puntos');
        }
      }
    });

    console.log('[Map] 📊 Total markers creados:', markersRef.current.length);
    console.log('[Map] 📊 Total polylines creadas:', polylinesRef.current.length);
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
export const Marker: React.FC<MarkerProps> = ({
  coordinate,
  draggable = false,
  onDragEnd,
}) => {
  const markerRef = useRef<any>(null);
  const map = (window as any).__GOOGLE_MAP_REF__;
  const google = (window as any).google;

  // Crear marker al montar
  useEffect(() => {
    if (!google || !google.maps || !map) return;

    const pos = new google.maps.LatLng(
      coordinate.latitude,
      coordinate.longitude
    );

    markerRef.current = new google.maps.Marker({
      position: pos,
      map,
      draggable,
    });

    if (draggable && onDragEnd) {
      markerRef.current.addListener("dragend", (e: any) => {
        onDragEnd({
          nativeEvent: {
            coordinate: {
              latitude: e.latLng.lat(),
              longitude: e.latLng.lng(),
            },
          },
        });
      });
    }

    return () => {
      markerRef.current?.setMap(null);
    };
  }, []);

  // Actualizar marker cuando cambian las coordenadas
  useEffect(() => {
    if (!markerRef.current || !google) return;

    markerRef.current.setPosition(
      new google.maps.LatLng(
        coordinate.latitude,
        coordinate.longitude
      )
    );
  }, [coordinate.latitude, coordinate.longitude]);

  return null;
};

Marker.displayName = 'Marker';


/**
 * Polyline component for web
 */
export const Polyline: React.FC<PolylineProps> = () => {
  return null;
};

// Agregar displayName para mejor detección
Polyline.displayName = 'Polyline';

/**
 * MapFallback - Simple map component for web
 * Compatible con la API de MapFallback de react-native-maps
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

      if ((window as any).google?.maps) {
        setMapLoaded(true);
        return;
      }

      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        existingScript.addEventListener('load', () => setMapLoaded(true));
        return;
      }

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

      if (onMapClick) {
        googleMapRef.current.addListener('click', (e: any) => {
          onMapClick(e.latLng.lat(), e.latLng.lng());
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

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    markers.forEach((markerData) => {
      let customIcon: any = undefined;

      if (markerData.color) {
        let iconName = 'home';
        if (markerData.title?.toLowerCase().includes('empresa') || markerData.title?.toLowerCase().includes('local')) {
          iconName = 'storefront';
        } else if (markerData.title?.toLowerCase().includes('repartidor') || markerData.title?.toLowerCase().includes('delivery')) {
          iconName = 'bicycle';
        } else if (markerData.title?.toLowerCase().includes('cliente') || markerData.title?.toLowerCase().includes('destino')) {
          iconName = 'home';
        }

        customIcon = createCustomMarkerIcon(iconName, markerData.color, google);
      }

      const marker = new google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map: googleMapRef.current,
        title: markerData.title || '',
        draggable: draggableMarker,
        icon: customIcon,
      });

      if (draggableMarker && onMapClick) {
        marker.addListener('dragend', (e: any) => {
          onMapClick(e.latLng.lat(), e.latLng.lng());
        });
      }

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
