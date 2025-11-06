/**
 * MapViewUniversal - Native (iOS/Android)
 * Exporta los componentes de react-native-maps
 */

import React from 'react';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';

export { MapView, Marker, Polyline, PROVIDER_GOOGLE, Region };

// MapFallback no se usa en native, pero exportamos un placeholder por compatibilidad
export const MapFallback = () => null;
