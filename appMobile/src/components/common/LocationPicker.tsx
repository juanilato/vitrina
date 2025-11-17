/**
 * Location Picker Component
 * Componente para seleccionar ubicación con Google Maps
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { MapView, Marker, PROVIDER_GOOGLE } from './MapViewUniversal';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { textStyles as typography } from '../../theme/typography';
import { Button } from './Button';

interface LocationPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: {
    lat: number;
    lng: number;
    address: string;
  }) => void;
  initialLocation?: {
    lat: number;
    lng: number;
  };
}

const { width, height } = Dimensions.get('window');

export function LocationPicker({
  visible,
  onClose,
  onSelectLocation,
  initialLocation,
}: LocationPickerProps) {
  // Si MapView no está disponible (Expo Go), mostrar mensaje
  if (!MapView) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="map-outline" size={64} color={colors.gray400} />
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.gray900, marginTop: 16, textAlign: 'center' }}>
            Mapa no disponible en Expo Go
          </Text>
          <Text style={{ fontSize: 14, color: colors.gray600, marginTop: 8, textAlign: 'center' }}>
            Para seleccionar ubicación con mapa, necesitas crear un Development Build.
          </Text>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 24, backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8 }}>
            <Text style={{ color: colors.white, fontWeight: '600' }}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  const [region, setRegion] = useState({
    latitude: initialLocation?.lat || -31.522816, // San Juan, Argentina por defecto
    longitude: initialLocation?.lng || -68.5637632,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [markerPosition, setMarkerPosition] = useState({
    latitude: initialLocation?.lat || -31.522816,
    longitude: initialLocation?.lng || -68.5637632,
  });

  const [mapKey, setMapKey] = useState(0); // Key para forzar re-render del mapa

  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('Ubicación seleccionada');

  useEffect(() => {
    if (visible) {
      requestLocationPermission();
    }
  }, [visible]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Necesitamos permiso para acceder a tu ubicación'
        );
        return;
      }

      await getCurrentLocation();
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(newRegion);
      setMarkerPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Forzar re-render del mapa para centrar en nueva ubicación
      setMapKey(prev => prev + 1);

      await getAddressFromCoordinates(
        location.coords.latitude,
        location.coords.longitude
      );
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'No se pudo obtener tu ubicación actual');
    } finally {
      setLoading(false);
    }
  };

  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (results && results.length > 0) {
        const result = results[0];

        // Construir dirección con más detalle
        const addressParts = [];

        // Agregar calle y número
        if (result.street) {
          if (result.streetNumber) {
            addressParts.push(`${result.street} ${result.streetNumber}`);
          } else {
            addressParts.push(result.street);
          }
        } else if (result.name && result.name !== result.city) {
          addressParts.push(result.name);
        }

        // Agregar barrio o distrito si existe
        if (result.district && result.district !== result.city) {
          addressParts.push(result.district);
        } else if (result.subregion && result.subregion !== result.city) {
          addressParts.push(result.subregion);
        }

        // Agregar ciudad
        if (result.city) {
          addressParts.push(result.city);
        }

        // Agregar región/provincia si es diferente de la ciudad
        if (result.region && result.region !== result.city) {
          addressParts.push(result.region);
        }

        // Si no se encontró ninguna parte, intentar con postalCode o país
        if (addressParts.length === 0) {
          if (result.postalCode) {
            addressParts.push(`Código Postal ${result.postalCode}`);
          }
          if (result.country) {
            addressParts.push(result.country);
          }
        }

        const fullAddress = addressParts.join(', ');
        setAddress(fullAddress || `Ubicación: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      } else {
        // Si no hay resultados, mostrar coordenadas
        setAddress(`Ubicación: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Error getting address:', error);
      // En caso de error, mostrar coordenadas en lugar de "desconocida"
      setAddress(`Ubicación: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    console.log('[LocationPicker] 📍 Nueva ubicación seleccionada:', { latitude, longitude });
    setMarkerPosition({ latitude, longitude });
    await getAddressFromCoordinates(latitude, longitude);
  };

  const handleConfirm = () => {
    onSelectLocation({
      lat: markerPosition.latitude,
      lng: markerPosition.longitude,
      address,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.gray900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Seleccionar ubicación</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView

            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={region}
            onPress={handleMapPress}
            showsUserLocation
            showsMyLocationButton={false}
            showsTraffic={false}
            showsBuildings={true}
            showsIndoors={false}
          >
            <Marker
              coordinate={markerPosition}
              draggable
              onDragEnd={handleMapPress}
              title="Ubicación seleccionada"
            />
          </MapView>

          {/* Current Location Button - Único botón de movilidad */}
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={getCurrentLocation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Ionicons name="navigate" size={24} color={colors.primary} />
                <Text style={styles.currentLocationButtonText}>Mi ubicación</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Address Display */}
        <View style={styles.addressContainer}>
          <View style={styles.addressCard}>
            <Ionicons name="location-outline" size={24} color={colors.primary} />
            <View style={styles.addressTextContainer}>
              <Text style={styles.addressLabel}>Dirección seleccionada</Text>
              <Text style={styles.addressText}>{address}</Text>
            </View>
          </View>
        </View>

        {/* Confirm Button */}
        <View style={styles.footer}>
          <Button
            title="Confirmar ubicación"
            onPress={handleConfirm}
            icon="checkmark-circle"
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
}

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
    paddingTop: Platform.OS === 'ios' ? spacing.xl + 20 : spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },

  closeButton: {
    padding: spacing.xs,
  },

  headerTitle: {
    ...typography.h2,
    color: colors.gray900,
    fontWeight: '700',
  },

  mapContainer: {
    flex: 1,
    position: 'relative',
  },

  map: {
    width: '100%',
    height: '100%',
  },

  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  customMarker: {
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 8,
  },

  currentLocationButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 2,
    borderColor: colors.primary + '30',
  },

  currentLocationButtonText: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },

  addressContainer: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },

  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.gray50,
    padding: spacing.md,
    borderRadius: 12,
  },

  addressTextContainer: {
    flex: 1,
  },

  addressLabel: {
    ...typography.bodySmall,
    color: colors.gray600,
    marginBottom: 2,
  },

  addressText: {
    ...typography.bodyMedium,
    color: colors.gray900,
    fontWeight: '600',
  },

  footer: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
});
