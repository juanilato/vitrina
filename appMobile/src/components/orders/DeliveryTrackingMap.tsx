/**
 * Componente de Mapa de Tracking de Delivery
 * Muestra el mapa con los marcadores de local, cliente y repartidor
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '../../services/order.service';
import { useWebSocket } from '../../hooks/useWebSocket';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
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

  const { on, off, isConnected } = useWebSocket({ autoConnect: true });

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
        console.log('[Map] Ubicación del repartidor actualizada:', data);
        setMapData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            repartidor: {
              latitud: data.latitud,
              longitud: data.longitud,
              nombre: prev.repartidor?.nombre,
            },
          };
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

  const fetchMapData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getMapData(pedidoId);
      setMapData(data);

      // Calcular región inicial centrada entre los puntos
      if (data.cliente && data.empresa) {
        const latitudes = [data.cliente.latitud, data.empresa.latitud];
        const longitudes = [data.cliente.longitud, data.empresa.longitud];

        if (data.repartidor) {
          latitudes.push(data.repartidor.latitud);
          longitudes.push(data.repartidor.longitud);
        }

        const centerLat = (Math.max(...latitudes) + Math.min(...latitudes)) / 2;
        const centerLng = (Math.max(...longitudes) + Math.min(...longitudes)) / 2;
        const latDelta = Math.max(...latitudes) - Math.min(...latitudes);
        const lngDelta = Math.max(...longitudes) - Math.min(...longitudes);

        setRegion({
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: latDelta * 1.5 || 0.01,
          longitudeDelta: lngDelta * 1.5 || 0.01,
        });
      }
    } catch (err: any) {
      console.error('[Map] Error al cargar datos del mapa:', err);
      setError(err.response?.data?.message || 'Error al cargar el mapa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.gray900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Seguimiento en tiempo real</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Connection Status */}
        {isConnected && (
          <View style={styles.statusBanner}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Conectado - Actualizaciones en vivo</Text>
          </View>
        )}

        {/* ETA Banner */}
        {eta !== null && eta > 0 && (
          <View style={[styles.etaBanner, eta <= 5 && styles.etaBannerNearby]}>
            <Ionicons name="time-outline" size={20} color={colors.white} />
            <Text style={styles.etaText}>
              {eta <= 5 ? '¡Tu pedido está por llegar! ' : ''}
              Llegada estimada en {eta} {eta === 1 ? 'minuto' : 'minutos'}
            </Text>
          </View>
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

        {/* Map */}
        {!loading && !error && mapData && region && (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={region}
            showsUserLocation
            showsMyLocationButton
          >
            {/* Marcador del Local */}
            {mapData.empresa && (
              <Marker
                coordinate={{
                  latitude: mapData.empresa.latitud,
                  longitude: mapData.empresa.longitud,
                }}
                title={mapData.empresa.name}
                description="Local"
                pinColor={colors.primary}
              >
                <View style={styles.markerContainer}>
                  <View style={[styles.marker, styles.markerEmpresa]}>
                    <Ionicons name="storefront" size={20} color={colors.white} />
                  </View>
                </View>
              </Marker>
            )}

            {/* Marcador del Cliente */}
            {mapData.cliente && (
              <Marker
                coordinate={{
                  latitude: mapData.cliente.latitud,
                  longitude: mapData.cliente.longitud,
                }}
                title="Dirección de entrega"
                description="Tu ubicación"
                pinColor={colors.secondary}
              >
                <View style={styles.markerContainer}>
                  <View style={[styles.marker, styles.markerCliente]}>
                    <Ionicons name="home" size={20} color={colors.white} />
                  </View>
                </View>
              </Marker>
            )}

            {/* Marcador del Repartidor */}
            {mapData.repartidor && (
              <Marker
                coordinate={{
                  latitude: mapData.repartidor.latitud,
                  longitude: mapData.repartidor.longitud,
                }}
                title={mapData.repartidor.nombre || 'Repartidor'}
                description="En camino"
                pinColor={colors.orange}
              >
                <View style={styles.markerContainer}>
                  <View style={[styles.marker, styles.markerRepartidor]}>
                    <Ionicons name="bicycle" size={20} color={colors.white} />
                  </View>
                </View>
              </Marker>
            )}
          </MapView>
        )}

        {/* Legend */}
        {!loading && !error && mapData && (
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>Local</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.orange }]} />
              <Text style={styles.legendText}>Repartidor</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
              <Text style={styles.legendText}>Tu dirección</Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    paddingTop: spacing['2xl'],
  },

  closeButton: {
    padding: spacing.xs,
  },

  headerTitle: {
    ...typography.h3,
    color: colors.gray900,
    fontWeight: '700',
  },

  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.green50,
    gap: spacing.sm,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },

  statusText: {
    ...typography.bodySmall,
    color: colors.success,
    fontWeight: '600',
  },

  etaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.orange,
    gap: spacing.sm,
  },

  etaBannerNearby: {
    backgroundColor: colors.success,
  },

  etaText: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: '700',
    flexWrap: 'wrap',
    flex: 1,
    textAlign: 'center',
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

  markerContainer: {
    alignItems: 'center',
  },

  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  markerEmpresa: {
    backgroundColor: colors.primary,
  },

  markerCliente: {
    backgroundColor: colors.secondary,
  },

  markerRepartidor: {
    backgroundColor: colors.orange,
  },

  legend: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  legendText: {
    ...typography.bodySmall,
    color: colors.gray700,
    fontWeight: '500',
  },
});
