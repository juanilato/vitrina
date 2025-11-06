/**
 * MapViewUniversal - Native (iOS/Android)
 * Compatible con Expo Go - usa react-native-maps si está disponible
 */

import React from 'react';

// Intentar cargar react-native-maps de forma segura
let RNMapView: any = null;
let RNMarker: any = null;
let RNPolyline: any = null;
let RN_PROVIDER_GOOGLE: any = null;
let RNRegion: any = null;

try {
  const RNMaps = require('react-native-maps');
  RNMapView = RNMaps.default;
  RNMarker = RNMaps.Marker;
  RNPolyline = RNMaps.Polyline;
  RN_PROVIDER_GOOGLE = RNMaps.PROVIDER_GOOGLE;
  RNRegion = RNMaps.Region;
} catch (error) {
  console.log('[MapViewUniversal.native] react-native-maps no disponible - se usará fallback');
}

// Exportar componentes como named exports
export const MapView = RNMapView;
export const Marker = RNMarker;
export const Polyline = RNPolyline;
export const PROVIDER_GOOGLE = RN_PROVIDER_GOOGLE;
export const Region = RNRegion;

// MapFallback no se usa en native, pero exportamos un placeholder por compatibilidad
export const MapFallback = () => null;
