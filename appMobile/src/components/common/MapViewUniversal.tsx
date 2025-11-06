import React from 'react';
import { Platform, View, Text } from 'react-native';

let MapView: any = null;
let Marker: any = null;
let Region: any = null;
let Polyline: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  const RNMaps = require('react-native-maps');
  MapView = RNMaps.default;
  Marker = RNMaps.Marker;
  Region = RNMaps.Region;
  Polyline = RNMaps.Polyline;
  PROVIDER_GOOGLE = RNMaps.PROVIDER_GOOGLE;
}

export { MapView, Marker, Polyline, PROVIDER_GOOGLE, Region };

/**
 * Fallback visual en web
 */
export const MapFallback = ({ height = 250 }: { height?: number }) => (
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
    <Text style={{ color: '#666' }}>🌐 Mapa no disponible en versión web</Text>
  </View>
);
