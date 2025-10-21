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
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
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
  const [region, setRegion] = useState({
    latitude: initialLocation?.lat || -31.4201, // Córdoba, Argentina por defecto
    longitude: initialLocation?.lng || -64.1888,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [markerPosition, setMarkerPosition] = useState({
    latitude: initialLocation?.lat || -31.4201,
    longitude: initialLocation?.lng || -64.1888,
  });

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
        const addressParts = [
          result.street,
          result.streetNumber,
          result.city,
          result.region,
        ].filter(Boolean);

        setAddress(addressParts.join(', ') || 'Ubicación seleccionada');
      }
    } catch (error) {
      console.error('Error getting address:', error);
      setAddress('Ubicación seleccionada');
    }
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
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
          >
            <Marker coordinate={markerPosition} draggable onDragEnd={handleMapPress}>
              <View style={styles.markerContainer}>
                <Ionicons name="location" size={40} color={colors.primary} />
              </View>
            </Marker>
          </MapView>

          {/* Current Location Button */}
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={getCurrentLocation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Ionicons name="locate" size={24} color={colors.primary} />
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

  currentLocationButton: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    backgroundColor: colors.white,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
