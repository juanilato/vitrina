/**
 * Componente de Mapa de Tracking de Delivery
 * Muestra el mapa con los marcadores de local, cliente y repartidor
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Animated,
  Image,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '../../services/order.service';
import { useWebSocket } from '../../hooks/useWebSocket';
import { colors } from '../../theme/colors';
import { spacing, shadows, borderRadius } from '../../theme/spacing';
import { textStyles as typography } from '../../theme/typography';

interface DeliveryTrackingMapProps {
  pedidoId: string;
  visible: boolean;
  onClose: () => void;
}

interface MapData {
  empresa: {
    latitud: number;
    longitud: number;
    name: string;
    logoUrl?: string;
  };
  cliente: {
    latitud: number;
    longitud: number;
  };
  repartidor?: {
    latitud: number;
    longitud: number;
    nombre?: string;
  };
}

export const DeliveryTrackingMap: React.FC<DeliveryTrackingMapProps> = ({
  pedidoId,
  visible,
  onClose,
}) => {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [nearbyNotified, setNearbyNotified] = useState(false);

  // Animaciones
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);

  const { on, off, isConnected } = useWebSocket({ autoConnect: true });

  // Animación de entrada para card ETA
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Cargar datos iniciales del mapa
  useEffect(() => {
    if (visible) {
      fetchMapData();
    }
  }, [visible, pedidoId]);

  // Configurar listener de WebSocket para actualizaciones en tiempo real
  useEffect(() => {
    if (!isConnected || !visible) return;

    const handleUbicacionActualizada = (data: any) => {
      if (data.pedidoId === pedidoId) {
        console.log('[Map] 📍 Ubicación del repartidor actualizada via WebSocket');
        console.log('[Map] 📍 Datos recibidos:', JSON.stringify(data, null, 2));
        console.log('[Map] 📍 Latitud:', data.latitud, 'Longitud:', data.longitud);

        // Validar que las coordenadas sean válidas
        const lat = parseFloat(data.latitud);
        const lng = parseFloat(data.longitud);

        if (isNaN(lat) || isNaN(lng)) {
          console.error('[Map] ❌ Coordenadas inválidas recibidas:', { lat, lng });
          return;
        }

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          console.error('[Map] ❌ Coordenadas fuera de rango:', { lat, lng });
          return;
        }

        setMapData((prev) => {
          if (!prev) return null;

          const newMapData = {
            ...prev,
            repartidor: {
              latitud: lat,
              longitud: lng,
              nombre: prev.repartidor?.nombre,
            },
          };

          console.log('[Map] 📍 MapData actualizado:', JSON.stringify(newMapData.repartidor, null, 2));

          // Actualizar ruta cuando cambie la posición del repartidor
          if (prev.cliente) {
            fetchRoute(
              { lat, lng },
              { lat: prev.cliente.latitud, lng: prev.cliente.longitud }
            );
          }

          return newMapData;
        });
      }
    };

    on('ubicacion_repartidor_actualizada', handleUbicacionActualizada);

    return () => {
      off('ubicacion_repartidor_actualizada', handleUbicacionActualizada);
    };
  }, [isConnected, visible, pedidoId]);

  // Calcular ETA (Tiempo estimado de llegada)
  useEffect(() => {
    if (!mapData?.repartidor || !mapData?.cliente) {
      setEta(null);
      return;
    }

    // Calcular distancia usando fórmula de Haversine
    const calculateDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ): number => {
      const R = 6371; // Radio de la Tierra en km
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const distance = calculateDistance(
      mapData.repartidor.latitud,
      mapData.repartidor.longitud,
      mapData.cliente.latitud,
      mapData.cliente.longitud
    );

    // Estimar tiempo asumiendo velocidad promedio de 20 km/h (delivery en bicicleta/moto)
    const avgSpeed = 20; // km/h
    const estimatedMinutes = Math.round((distance / avgSpeed) * 60);
    setEta(estimatedMinutes);

    // Notificar cuando el repartidor está cerca (menos de 5 minutos)
    if (estimatedMinutes <= 5 && estimatedMinutes > 0 && !nearbyNotified) {
      setNearbyNotified(true);
      // Aquí se podría agregar una notificación push
      console.log('🔔 Repartidor está cerca - ETA:', estimatedMinutes, 'minutos');
    }
  }, [mapData, nearbyNotified]);

  // Obtener ruta real usando Google Directions API
  const fetchRoute = async (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
    try {
      const apiKey = 'AIzaSyC38M7FX0xjywUeF8uRXvS8ZbZPEZ0k7LY'; // Tu API key de Google Maps
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const points = data.routes[0].overview_polyline.points;
        const coordinates = decodePolyline(points);
        setRouteCoordinates(coordinates);
      }
    } catch (error) {
      console.error('[Map] Error al obtener ruta:', error);
    }
  };

  // Decodificar polyline de Google
  const decodePolyline = (encoded: string): Array<{ latitude: number; longitude: number }> => {
    const poly = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      poly.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return poly;
  };

  const fetchMapData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getMapData(pedidoId);

      console.log('[Map] 📍 Datos iniciales del mapa recibidos:', JSON.stringify(data, null, 2));

      setMapData(data);

      // Obtener ruta real si hay repartidor y cliente
      if (data.repartidor && data.cliente) {
        await fetchRoute(
          { lat: data.repartidor.latitud, lng: data.repartidor.longitud },
          { lat: data.cliente.latitud, lng: data.cliente.longitud }
        );
      }

      // Calcular región inicial centrada entre los puntos
      if (data.cliente && data.empresa) {
        const latitudes = [data.cliente.latitud, data.empresa.latitud];
        const longitudes = [data.cliente.longitud, data.empresa.longitud];

        console.log('[Map] 📍 Coordenadas iniciales:');
        console.log('[Map] 📍 Cliente:', data.cliente.latitud, data.cliente.longitud);
        console.log('[Map] 📍 Empresa:', data.empresa.latitud, data.empresa.longitud);

        if (data.repartidor) {
          console.log('[Map] 📍 Repartidor:', data.repartidor.latitud, data.repartidor.longitud);
          latitudes.push(data.repartidor.latitud);
          longitudes.push(data.repartidor.longitud);
        }

        const centerLat = (Math.max(...latitudes) + Math.min(...latitudes)) / 2;
        const centerLng = (Math.max(...longitudes) + Math.min(...longitudes)) / 2;
        const latDelta = Math.max(...latitudes) - Math.min(...latitudes);
        const lngDelta = Math.max(...longitudes) - Math.min(...longitudes);

        console.log('[Map] 📍 Región calculada:', {
          centerLat,
          centerLng,
          latDelta: latDelta * 1.5 || 0.01,
          lngDelta: lngDelta * 1.5 || 0.01,
        });

        setRegion({
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: latDelta * 1.5 || 0.01,
          longitudeDelta: lngDelta * 1.5 || 0.01,
        });
      }
    } catch (err: any) {
      console.error('[Map] ❌ Error al cargar datos del mapa:', err);
      setError(err.response?.data?.message || 'Error al cargar el mapa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header simple solo con cruz */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.gray900} />
          </TouchableOpacity>
        </View>

        {/* ETA Card flotante */}
        {eta !== null && eta > 0 && (
          <Animated.View
            style={[
              styles.etaCard,
              eta <= 5 && styles.etaCardNearby,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.etaCardContent}>
              <View style={[styles.etaIconCircle, eta <= 5 && styles.etaIconCircleNearby]}>
                <Ionicons
                  name={eta <= 5 ? "checkmark-circle" : "bicycle"}
                  size={28}
                  color={eta <= 5 ? colors.success : colors.orange}
                />
              </View>
              <View style={styles.etaInfo}>
                {eta <= 5 && (
                  <Text style={styles.etaAlertText}>¡Muy cerca!</Text>
                )}
                <Text style={styles.etaText}>
                  Llega en {eta} {eta === 1 ? 'min' : 'mins'}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Cargando mapa...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchMapData} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Map con estilo personalizado */}
        {!loading && !error && mapData && region && (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={region}
            showsUserLocation
            showsMyLocationButton
            customMapStyle={mapStyle}
          >
            {/* Ruta real entre repartidor y cliente */}
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor={colors.orange}
                strokeWidth={4}
              />
            )}

            {/* Marcador del Local - Con logo */}
            {mapData.empresa && (
              <Marker
                coordinate={{
                  latitude: mapData.empresa.latitud,
                  longitude: mapData.empresa.longitud,
                }}
                title={mapData.empresa.name}
                description="Local"
              >
                <View style={styles.markerContainer}>
                  <View style={[styles.marker, styles.markerEmpresa]}>
                    {mapData.empresa.logoUrl ? (
                      <Image
                        source={{ uri: mapData.empresa.logoUrl }}
                        style={styles.markerLogo}
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons name="storefront" size={24} color={colors.white} />
                    )}
                  </View>
                </View>
              </Marker>
            )}

            {/* Marcador del Cliente - Simple */}
            {mapData.cliente && (
              <Marker
                coordinate={{
                  latitude: mapData.cliente.latitud,
                  longitude: mapData.cliente.longitud,
                }}
                title="Dirección de entrega"
                description="Tu ubicación"
              >
                <View style={styles.markerContainer}>
                  <View style={[styles.marker, styles.markerCliente]}>
                    <Ionicons name="home" size={24} color={colors.white} />
                  </View>
                </View>
              </Marker>
            )}

            {/* Marcador del Repartidor - Simple */}
            {mapData.repartidor && (
              <Marker
                coordinate={{
                  latitude: mapData.repartidor.latitud,
                  longitude: mapData.repartidor.longitud,
                }}
                title={mapData.repartidor.nombre || 'Repartidor'}
                description="En camino"
              >
                <View style={styles.markerContainer}>
                  <View style={[styles.marker, styles.markerRepartidor]}>
                    <Ionicons name="bicycle" size={24} color={colors.white} />
                  </View>
                </View>
              </Marker>
            )}
          </MapView>
        )}

        {/* Legend - Rediseñada */}
        {!loading && !error && mapData && (
          <View style={styles.legendContainer}>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={styles.legendIconContainer}>
                  <Ionicons name="storefront" size={16} color={colors.primary} />
                </View>
                <Text style={styles.legendText}>Local</Text>
              </View>
              <View style={styles.legendDivider} />
              <View style={styles.legendItem}>
                <View style={styles.legendIconContainer}>
                  <Ionicons name="bicycle" size={16} color={colors.orange} />
                </View>
                <Text style={styles.legendText}>Repartidor</Text>
              </View>
              <View style={styles.legendDivider} />
              <View style={styles.legendItem}>
                <View style={styles.legendIconContainer}>
                  <Ionicons name="home" size={16} color={colors.secondary} />
                </View>
                <Text style={styles.legendText}>Destino</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

// Estilo personalizado para el mapa
const mapStyle = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header simple
  header: {
    position: 'absolute',
    top: spacing['2xl'] + spacing.sm,
    left: spacing.md,
    zIndex: 10,
  },

  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },

  // ETA Card flotante
  etaCard: {
    position: 'absolute',
    top: spacing['2xl'] + spacing.sm,
    right: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.lg,
    zIndex: 10,
  },

  etaCardNearby: {
    backgroundColor: colors.green50,
  },

  etaCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  etaIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.orange + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },

  etaIconCircleNearby: {
    backgroundColor: colors.success + '15',
  },

  etaInfo: {
    justifyContent: 'center',
  },

  etaAlertText: {
    ...typography.bodySmall,
    color: colors.success,
    fontWeight: '700',
    fontSize: 11,
  },

  etaText: {
    ...typography.bodyMedium,
    color: colors.gray900,
    fontWeight: '700',
    fontSize: 15,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },

  loadingText: {
    ...typography.bodyMedium,
    color: colors.gray600,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },

  errorText: {
    ...typography.bodyMedium,
    color: colors.error,
    textAlign: 'center',
  },

  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginTop: spacing.md,
  },

  retryButtonText: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: '600',
  },

  map: {
    flex: 1,
  },

  // Marcadores simples
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  marker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    ...shadows.xl,
  },

  markerEmpresa: {
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },

  markerLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },

  markerCliente: {
    backgroundColor: colors.secondary,
  },

  markerRepartidor: {
    backgroundColor: colors.orange,
  },

  // Leyenda rediseñada
  legendContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.md,
    right: spacing.md,
  },

  legend: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    ...shadows.xl,
    borderWidth: 1,
    borderColor: colors.gray100,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  legendIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  legendDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.gray200,
  },

  legendText: {
    ...typography.bodySmall,
    color: colors.gray700,
    fontWeight: '600',
    fontSize: 11,
  },
});
