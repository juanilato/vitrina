import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import {MapView, Marker, MapFallback } from  '../src/components/common/MapViewUniversal';
import { colors, spacing, textStyles } from '../src/theme';
import { locationService, SavedLocation } from '../src/services/location.service';
import { useLocation } from '../src/contexts/LocationContext';
import { useAuth } from '../src/contexts/AuthContext';

import { Platform } from 'react-native';

// Helper para obtener dirección desde coordenadas
const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
  try {
    const result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (result && result.length > 0) {
      const address = result[0];
      const parts = [];

      if (address.street) parts.push(address.street);
      if (address.streetNumber) parts.push(address.streetNumber);
      if (address.district) parts.push(address.district);
      if (address.city) parts.push(address.city);

      return parts.length > 0 ? parts.join(', ') : 'Dirección desconocida';
    }
    return 'Dirección desconocida';
  } catch (error) {
    console.error('Error getting address:', error);
    return 'Dirección desconocida';
  }
};

export default function LocationsScreen() {
    if (Platform.OS === 'web') return <MapFallback />;
  const { refreshLocations: refreshContextLocations } = useLocation();
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCoords, setNewCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [form, setForm] = useState({ nombre: '', referencia: '', direccion: '' });
  const [loadingAddress, setLoadingAddress] = useState(false);
  const mapRef = useRef<MapView>(null);
  const { user, logout } = useAuth();
  // 📦 cargar ubicaciones del backend
  const loadLocations = async () => {
    try {
      const res = await locationService.getAll();
      setLocations(res);
      // Refresh context locations as well
      await refreshContextLocations();
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las ubicaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  // 🧭 obtener ubicación actual
  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Activa la ubicación para continuar');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
    setNewCoords(coords);

    // Obtener dirección automáticamente
    setLoadingAddress(true);
    const address = await getAddressFromCoords(coords.lat, coords.lng);
    setForm({ ...form, direccion: address });
    setLoadingAddress(false);
  };

  // Función para actualizar dirección cuando cambian las coordenadas
  const updateAddressFromCoords = async (lat: number, lng: number) => {
    setLoadingAddress(true);
    const address = await getAddressFromCoords(lat, lng);
    setForm(prev => ({ ...prev, direccion: address }));
    setLoadingAddress(false);
  };

  const saveNewLocation = async () => {
    if (!newCoords || !form.nombre) {
      Alert.alert('Campos incompletos', 'Ingresa un nombre y selecciona una ubicación');
      return;
    }

    // Si no hay dirección, obtenerla antes de guardar
    let finalAddress = form.direccion;
    if (!finalAddress || finalAddress === '') {
      finalAddress = await getAddressFromCoords(newCoords.lat, newCoords.lng);
    }

    try {
      await locationService.create({
        clienteId: user?.id,
        nombre: form.nombre,
        direccion: finalAddress,
        lat: newCoords.lat,
        lng: newCoords.lng,
        referencia: form.referencia,
      });
      setModalVisible(false);
      setForm({ nombre: '', referencia: '', direccion: '' });
      loadLocations();
    } catch {
      Alert.alert('Error', 'No se pudo guardar la ubicación');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Eliminar ubicación',
      '¿Estás seguro de que deseas eliminar esta ubicación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await locationService.delete(id);
              loadLocations();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar la ubicación');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Direcciones</Text>
        <TouchableOpacity
          onPress={() => {
            setModalVisible(true);
            getCurrentLocation();
          }}
        >
          <Ionicons name="add-circle-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {locations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={64} color={colors.gray400} />
            <Text style={styles.emptyText}>No tienes direcciones guardadas</Text>
            <Text style={styles.emptySubtext}>
              Agrega una dirección para hacer tus pedidos más rápido
            </Text>
          </View>
        ) : (
          locations.map((loc) => (
            <View key={loc.id} style={styles.locationCard}>
              <View style={styles.locationIcon}>
                <Ionicons name="location" size={24} color={colors.primary} />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{loc.nombre}</Text>
                <Text style={styles.locationAddress}>{loc.direccion}</Text>
                {loc.referencia && (
                  <Text style={styles.locationReference}>{loc.referencia}</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(loc.id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {modalVisible && newCoords ? (
        <Modal visible={modalVisible} animationType="slide">
          <SafeAreaView style={{ flex: 1 }}>
            <MapView
              ref={mapRef}
              style={{ flex: 1 }}
              initialRegion={{
                latitude: newCoords.lat,
                longitude: newCoords.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onPress={async (e) => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                setNewCoords({ lat: latitude, lng: longitude });
                await updateAddressFromCoords(latitude, longitude);
              }}
            >
              <Marker
                coordinate={{
                  latitude: newCoords.lat,
                  longitude: newCoords.lng,
                }}
                title="Ubicación seleccionada"
                draggable
                onDragEnd={async (e) => {
                  const { latitude, longitude } = e.nativeEvent.coordinate;
                  setNewCoords({ lat: latitude, lng: longitude });
                  await updateAddressFromCoords(latitude, longitude);
                }}
              />
            </MapView>

            <View style={styles.overlayButtonContainer}>
              <TouchableOpacity
                style={styles.overlayButton}
                onPress={getCurrentLocation}
              >
                <Ionicons name="locate" size={22} color={colors.white} />
                <Text style={styles.overlayButtonText}>Usar ubicación actual</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Nombre (Casa, Trabajo, etc.)"
                value={form.nombre}
                onChangeText={(t) => setForm({ ...form, nombre: t })}
              />

              <View style={styles.addressContainer}>
                <Text style={styles.addressLabel}>Dirección detectada:</Text>
                {loadingAddress ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={styles.addressText}>{form.direccion || 'Selecciona una ubicación'}</Text>
                )}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Referencia (opcional, ej: Depto 3B, timbre azul)"
                value={form.referencia}
                onChangeText={(t) => setForm({ ...form, referencia: t })}
              />

              <TouchableOpacity style={styles.saveButton} onPress={saveNewLocation}>
                <Text style={styles.saveText}>Guardar ubicación</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlayButtonContainer: {
    position: 'absolute',
    bottom: 280,
    alignSelf: 'center',
  },
  overlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  overlayButtonText: {
    color: colors.white,
    fontWeight: '600',
  },

  container: { flex: 1, backgroundColor: colors.gray50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  title: { ...textStyles.h2, fontWeight: '700', color: colors.gray900 },

  scrollView: {
    flex: 1,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    ...textStyles.h3,
    color: colors.gray700,
    fontWeight: '600',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptySubtext: {
    ...textStyles.bodyMedium,
    color: colors.gray500,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  locationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    ...textStyles.bodyLarge,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  locationAddress: {
    ...textStyles.bodyMedium,
    color: colors.gray600,
  },
  locationReference: {
    ...textStyles.bodySmall,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
  deleteButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },

  form: { padding: spacing.lg, backgroundColor: colors.white },
  input: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
    color: colors.gray900,
  },
  addressContainer: {
    backgroundColor: colors.gray50,
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  addressLabel: {
    ...textStyles.bodySmall,
    color: colors.gray600,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  addressText: {
    ...textStyles.bodyMedium,
    color: colors.gray900,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  saveText: { color: colors.white, fontWeight: '600' },
  cancelButton: {
    backgroundColor: colors.gray200,
    padding: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelText: { color: colors.gray700, fontWeight: '600' },
});
