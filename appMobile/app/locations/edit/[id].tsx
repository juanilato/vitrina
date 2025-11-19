import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { Alert } from '../../../src/utils/alert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { MapView, Marker, MapFallback } from '../../../src/components/common/MapViewUniversal';
import { MapViewPickerWeb } from '../../../src/components/common/MapViewPicker.web';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, textStyles } from '../../../src/theme';
import { locationService, SavedLocation } from '../../../src/services/location.service';
import { useLocation } from '../../../src/contexts/LocationContext';

// Helper para obtener dirección desde coordenadas
const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
  try {
    console.log('🔍 Geocodificando coordenadas:', { lat, lng });
    const result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });

    console.log('📍 Resultado de geocodificación:', JSON.stringify(result, null, 2));

    if (result && result.length > 0) {
      const address = result[0];
      const parts = [];

      // Construir dirección en orden correcto: número + calle, colonia/barrio, ciudad
      if (address.streetNumber && address.street) {
        parts.push(`${address.streetNumber} ${address.street}`);
      } else if (address.street) {
        parts.push(address.street);
      } else if (address.name && address.name !== address.city) {
        // Si no hay calle pero hay un nombre de lugar
        parts.push(address.name);
      }

      // Agregar distrito/colonia si existe y es diferente de la calle
      if (address.district && !parts.some(p => p.includes(address.district || ''))) {
        parts.push(address.district);
      } else if (address.subregion && !parts.some(p => p.includes(address.subregion || ''))) {
        parts.push(address.subregion);
      }

      // Agregar ciudad
      if (address.city) {
        parts.push(address.city);
      }

      // Agregar región/estado si está disponible
      if (address.region && address.region !== address.city) {
        parts.push(address.region);
      }

      const fullAddress = parts.length > 0 ? parts.join(', ') : 'Dirección desconocida';
      console.log('✅ Dirección formateada:', fullAddress);
      return fullAddress;
    }

    console.warn('⚠️ No se encontraron resultados de geocodificación');
    return 'Dirección desconocida';
  } catch (error) {
    console.error('❌ Error getting address:', error, 'Coordenadas:', { lat, lng });
    return 'Dirección desconocida';
  }
};

export default function EditLocationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { refreshLocations } = useLocation();

  const [location, setLocation] = useState<SavedLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [form, setForm] = useState({ nombre: '', referencia: '', direccion: '' });
  const [loadingAddress, setLoadingAddress] = useState(false);
  const mapRef = useRef<MapView>(null);

  // Cargar ubicación existente
  useEffect(() => {
    loadLocation();
  }, [id]);

  const loadLocation = async () => {
    try {
      setLoading(true);
      const locationId = parseInt(id);
      const loc = await locationService.getById(locationId);
      setLocation(loc);
      setCoords({ lat: loc.lat, lng: loc.lng });
      setForm({
        nombre: loc.nombre,
        referencia: loc.referencia || '',
        direccion: loc.direccion,
      });
    } catch (error) {
      console.error('Error loading location:', error);
      Alert.alert('Error', 'No se pudo cargar la ubicación');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // Obtener ubicación actual
  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Activa la ubicación para continuar');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    const newCoords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
    setCoords(newCoords);

    // Obtener dirección automáticamente
    setLoadingAddress(true);
    const address = await getAddressFromCoords(newCoords.lat, newCoords.lng);
    setForm({ ...form, direccion: address });
    setLoadingAddress(false);

    // Centrar mapa
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: newCoords.lat,
        longitude: newCoords.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  // Función para actualizar dirección cuando cambian las coordenadas
  const updateAddressFromCoords = async (lat: number, lng: number) => {
    setLoadingAddress(true);
    const address = await getAddressFromCoords(lat, lng);
    setForm(prev => ({ ...prev, direccion: address }));
    setLoadingAddress(false);
  };

  const saveLocation = async () => {
    if (!coords || !form.nombre) {
      Alert.alert('Campos incompletos', 'Ingresa un nombre y selecciona una ubicación');
      return;
    }

    // Si no hay dirección, intentar obtenerla automáticamente
    let finalAddress = form.direccion?.trim();
    if (!finalAddress || finalAddress === '' || finalAddress === 'Dirección desconocida') {
      setLoadingAddress(true);
      finalAddress = await getAddressFromCoords(coords.lat, coords.lng);
      setLoadingAddress(false);

      // Si aún no hay dirección válida, pedir al usuario que la ingrese manualmente
      if (!finalAddress || finalAddress === 'Dirección desconocida') {
        Alert.alert(
          'Dirección no detectada',
          'No se pudo detectar la dirección automáticamente. Por favor, ingrésala manualmente.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    try {
      setSaving(true);
      await locationService.update(parseInt(id), {
        nombre: form.nombre,
        direccion: finalAddress,
        lat: coords.lat,
        lng: coords.lng,
        referencia: form.referencia,
      });

      // Recargar ubicaciones
      await refreshLocations();

      Alert.alert('Éxito', 'Ubicación actualizada correctamente', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating location:', error);
      Alert.alert('Error', 'No se pudo actualizar la ubicación');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!location || !coords) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text>No se encontró la ubicación</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Ubicación</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          // Mapa para WEB con Google Maps
          <MapViewPickerWeb
            height={300}
            lat={coords.lat}
            lng={coords.lng}
            onChange={async (lat, lng) => {
              setCoords({ lat, lng });
              await updateAddressFromCoords(lat, lng);
            }}
            onUseMyLocation={async (lat, lng) => {
              setCoords({ lat, lng });
              await updateAddressFromCoords(lat, lng);
            }}
          />
        ) : (
          // Mapa para MOBILE con react-native-maps
          <>
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: coords.lat,
                longitude: coords.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onPress={async (e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                setCoords({ lat: latitude, lng: longitude });
                await updateAddressFromCoords(latitude, longitude);
              }}
            >
              <Marker
                coordinate={{
                  latitude: coords.lat,
                  longitude: coords.lng,
                }}
                title="Ubicación seleccionada"
                draggable
                onDragEnd={async (e) => {
                  const { latitude, longitude } = e.nativeEvent.coordinate;
                  setCoords({ lat: latitude, lng: longitude });
                  await updateAddressFromCoords(latitude, longitude);
                }}
              />
            </MapView>

            {/* Botón de ubicación actual */}
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={getCurrentLocation}
            >
              <Ionicons name="locate" size={24} color={colors.primary} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Form */}
      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        <View style={styles.formContent}>
          <Text style={styles.label}>Nombre de la ubicación</Text>
          <TextInput
            style={styles.input}
            placeholder="Casa, Trabajo, etc."
            value={form.nombre}
            onChangeText={(t) => setForm({ ...form, nombre: t })}
          />

          <Text style={styles.label}>
            Dirección {loadingAddress && '(detectando...)'}
          </Text>
          <View style={styles.addressInputWrapper}>
            <TextInput
              style={[styles.input, styles.addressInput]}
              placeholder="Dirección (puedes editarla manualmente)"
              value={form.direccion}
              onChangeText={(t) => setForm({ ...form, direccion: t })}
              multiline
              numberOfLines={3}
              editable={!loadingAddress}
            />
            {loadingAddress && (
              <View style={styles.loadingIndicatorInline}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
          </View>
          <Text style={styles.addressHint}>
            💡 La dirección se detecta automáticamente, pero puedes editarla si es necesaria
          </Text>

          <Text style={styles.label}>Referencia (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Depto 3B, timbre azul, portón verde..."
            value={form.referencia}
            onChangeText={(t) => setForm({ ...form, referencia: t })}
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={saveLocation}
            disabled={saving}
            activeOpacity={0.7}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                <Text style={styles.saveText}>Guardar cambios</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={saving}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...textStyles.title3,
    fontWeight: '700',
    color: colors.text
  },

  mapContainer: {
    height: 300,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  form: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  formContent: {
    padding: spacing.lg,
  },
  label: {
    ...textStyles.subheadline,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
    color: colors.text,
    backgroundColor: colors.white,
    ...textStyles.body,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  addressContainer: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 50,
    justifyContent: 'center',
  },
  addressInputWrapper: {
    position: 'relative',
    marginBottom: spacing.xs,
  },
  addressText: {
    ...textStyles.body,
    color: colors.text,
  },
  addressInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addressHint: {
    ...textStyles.caption2,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  loadingIndicatorInline: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    ...textStyles.subheadline,
    color: colors.white,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: colors.gray200,
    padding: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelText: {
    ...textStyles.subheadline,
    color: colors.text,
    fontWeight: '600',
  },
});
