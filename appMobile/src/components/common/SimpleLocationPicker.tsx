/**
 * Simple Location Picker Component (Sin mapa visual)
 * Componente para seleccionar ubicación sin react-native-maps
 * Compatible con Expo Go
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { textStyles as typography } from '../../theme/typography';
import { Button } from './Button';

interface SimpleLocationPickerProps {
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

export function SimpleLocationPicker({
  visible,
  onClose,
  onSelectLocation,
  initialLocation,
}: SimpleLocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(
    initialLocation
      ? {
          lat: initialLocation.lat,
          lng: initialLocation.lng,
          address: 'Ubicación guardada',
        }
      : null
  );
  const [manualAddress, setManualAddress] = useState('');

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Necesitamos permiso para acceder a tu ubicación. Puedes ingresar la dirección manualmente.'
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLoading(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = position.coords;

      // Obtener dirección usando geocodificación inversa
      let address = 'Ubicación actual';
      try {
        const results = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (results && results.length > 0) {
          const result = results[0];
          const addressParts = [
            result.street,
            result.streetNumber,
            result.city,
            result.region,
          ].filter(Boolean);

          address = addressParts.join(', ') || 'Ubicación actual';
        }
      } catch (error) {
        console.error('Error getting address:', error);
      }

      setLocation({
        lat: latitude,
        lng: longitude,
        address,
      });
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert(
        'Error',
        'No se pudo obtener tu ubicación. Intenta ingresar la dirección manualmente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManualAddress = async () => {
    if (!manualAddress.trim()) {
      Alert.alert('Error', 'Por favor ingresa una dirección');
      return;
    }

    setLoading(true);
    try {
      // Intentar geocodificar la dirección ingresada
      const results = await Location.geocodeAsync(manualAddress);

      if (results && results.length > 0) {
        const { latitude, longitude } = results[0];
        setLocation({
          lat: latitude,
          lng: longitude,
          address: manualAddress,
        });
        Alert.alert('Éxito', 'Dirección encontrada correctamente');
      } else {
        // Si no se puede geocodificar, usar coordenadas por defecto (Córdoba, Argentina)
        Alert.alert(
          'Aviso',
          'No se pudo encontrar las coordenadas exactas. Se usará la dirección ingresada.'
        );
        setLocation({
          lat: -31.4201,
          lng: -64.1888,
          address: manualAddress,
        });
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      // Usar ubicación por defecto si falla
      setLocation({
        lat: -31.4201,
        lng: -64.1888,
        address: manualAddress,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!location) {
      Alert.alert('Error', 'Por favor selecciona o ingresa una ubicación');
      return;
    }

    onSelectLocation(location);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
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

        <View style={styles.content}>
          {/* Ubicación Actual */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Usar ubicación actual</Text>
            <Text style={styles.sectionDescription}>
              Obtén tu ubicación automáticamente usando el GPS de tu dispositivo
            </Text>
            <TouchableOpacity
              style={[styles.locationButton, loading && styles.locationButtonDisabled]}
              onPress={getCurrentLocation}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="locate" size={24} color={colors.white} />
                  <Text style={styles.locationButtonText}>Obtener ubicación actual</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o ingresa tu dirección</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Dirección Manual */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingresar dirección manualmente</Text>
            <Text style={styles.sectionDescription}>
              Escribe tu dirección completa (calle, número, ciudad)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Av. Colón 123, Córdoba"
              value={manualAddress}
              onChangeText={setManualAddress}
              placeholderTextColor={colors.gray400}
              editable={!loading}
              multiline
              numberOfLines={2}
            />
            <TouchableOpacity
              style={[styles.searchButton, loading && styles.searchButtonDisabled]}
              onPress={handleManualAddress}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Ionicons name="search" size={20} color={colors.primary} />
                  <Text style={styles.searchButtonText}>Buscar dirección</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Ubicación seleccionada */}
          {location && (
            <View style={styles.selectedLocation}>
              <View style={styles.selectedLocationHeader}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                <Text style={styles.selectedLocationTitle}>Ubicación seleccionada</Text>
              </View>
              <View style={styles.selectedLocationCard}>
                <Ionicons name="location" size={20} color={colors.primary} />
                <View style={styles.selectedLocationText}>
                  <Text style={styles.selectedAddress}>{location.address}</Text>
                  <Text style={styles.selectedCoordinates}>
                    Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title="Confirmar ubicación"
            onPress={handleConfirm}
            icon="checkmark-circle"
            fullWidth
            disabled={!location || loading}
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
    paddingTop: Platform.OS === 'ios' ? spacing.xl : spacing.md,
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

  content: {
    flex: 1,
    padding: spacing.lg,
  },

  section: {
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    ...typography.h3,
    color: colors.gray900,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },

  sectionDescription: {
    ...typography.bodySmall,
    color: colors.gray600,
    marginBottom: spacing.md,
    lineHeight: 20,
  },

  locationButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },

  locationButtonDisabled: {
    opacity: 0.6,
  },

  locationButtonText: {
    ...typography.bodyLarge,
    color: colors.white,
    fontWeight: '600',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray300,
  },

  dividerText: {
    ...typography.bodySmall,
    color: colors.gray500,
    marginHorizontal: spacing.md,
  },

  input: {
    ...typography.bodyMedium,
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray300,
    color: colors.gray900,
    minHeight: 60,
    textAlignVertical: 'top',
  },

  searchButton: {
    backgroundColor: colors.primary + '15',
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },

  searchButtonDisabled: {
    opacity: 0.6,
  },

  searchButtonText: {
    ...typography.bodyLarge,
    color: colors.primary,
    fontWeight: '600',
  },

  selectedLocation: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.success + '10',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.success + '30',
  },

  selectedLocationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  selectedLocationTitle: {
    ...typography.bodyLarge,
    color: colors.success,
    fontWeight: '700',
  },

  selectedLocationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 8,
  },

  selectedLocationText: {
    flex: 1,
  },

  selectedAddress: {
    ...typography.bodyMedium,
    color: colors.gray900,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },

  selectedCoordinates: {
    ...typography.bodySmall,
    color: colors.gray600,
  },

  footer: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
});
