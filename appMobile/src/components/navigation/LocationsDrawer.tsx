/**
 * LocationsDrawer Component
 * Drawer lateral izquierdo para gestionar ubicaciones
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import { Alert } from '../../utils/alert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { MapView, Marker, MapFallback } from '../common/MapViewUniversal';
import { colors, textStyles, spacing } from '../../theme';
import { useLocation } from '../../contexts/LocationContext';
import { locationService } from '../../services/location.service';
import { useAuth } from '../../contexts/AuthContext';
import { MapViewPickerWeb } from '../common/MapViewPicker.web';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(width * 0.7, 320);

interface LocationsDrawerProps {
  visible: boolean;
  onClose: () => void;
}

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

export const LocationsDrawer: React.FC<LocationsDrawerProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const { user } = useAuth();
  const {
    locations,
    selectedLocation,
    setSelectedLocation,
    deleteLocation,
    setMainLocation,
    refreshLocations,
    loading,
  } = useLocation();

  const [expandedLocationId, setExpandedLocationId] = useState<number | null>(null);

  // Estados para el modal de agregar ubicación
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [newCoords, setNewCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [form, setForm] = useState({ nombre: '', referencia: '', direccion: '' });
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const mapRef = useRef<any>(null);

  const handleSelectLocation = (location: any) => {
    setSelectedLocation(location);
    onClose();
  };

  const handleEditLocation = (locationId: number) => {
    onClose();
    router.push({
      pathname: '/locations/edit/[id]',
      params: { id: locationId },
    } as any);
  };

  const handleDeleteLocation = (locationId: number, locationName: string) => {
    Alert.alert(
      'Eliminar ubicación',
      `¿Estás seguro de eliminar "${locationName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Colapsar el menú expandido primero
              if (expandedLocationId === locationId) {
                setExpandedLocationId(null);
              }

              // Eliminar y esperar a que termine todo el proceso
              await deleteLocation(locationId);

              // Mostrar confirmación después de que todo termine
              Alert.alert('¡Eliminado!', `La ubicación "${locationName}" fue eliminada correctamente`);
            } catch (error) {
              console.error('Error al eliminar ubicación:', error);
              Alert.alert('Error', 'No se pudo eliminar la ubicación');
            }
          },
        },
      ]
    );
  };

  const handleSetMain = async (locationId: number) => {
    try {
      await setMainLocation(locationId);
      setExpandedLocationId(null);
      Alert.alert('¡Listo!', 'Ubicación establecida como principal');
    } catch (error) {
      console.error('Error al establecer ubicación principal:', error);
      Alert.alert('Error', 'No se pudo establecer como principal');
    }
  };

  // Función para obtener ubicación actual
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

  const handleAddLocation = () => {
    // En lugar de navegar a /locations, abrimos el modal del mapa
    setMapModalVisible(true);
    getCurrentLocation();
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
      setSavingLocation(true);
      await locationService.create({
        clienteId: user?.id,
        nombre: form.nombre,
        direccion: finalAddress,
        lat: newCoords.lat,
        lng: newCoords.lng,
        referencia: form.referencia,
      });

      // Refrescar ubicaciones
      await refreshLocations();

      // Mostrar confirmación y LUEGO cerrar todo
      Alert.alert(
        '¡Éxito!',
        'Ubicación guardada correctamente',
        [
          {
            text: 'OK',
            onPress: () => {
              // Cerrar modal y limpiar formulario
              setMapModalVisible(false);
              setForm({ nombre: '', referencia: '', direccion: '' });
              setNewCoords(null);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error al guardar ubicación:', error);
      Alert.alert('Error', 'No se pudo guardar la ubicación');
    } finally {
      setSavingLocation(false);
    }
  };

  const closeMapModal = () => {
    setMapModalVisible(false);
    setForm({ nombre: '', referencia: '', direccion: '' });
    setNewCoords(null);
  };

  const toggleExpanded = (locationId: number) => {
    setExpandedLocationId(expandedLocationId === locationId ? null : locationId);
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          {/* Drawer Content */}
          <View style={styles.drawer}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'bottom']}>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.headerTitle}>Mis Ubicaciones</Text>
                  <Text style={styles.headerSubtitle}>
                    {locations.length} {locations.length === 1 ? 'ubicación' : 'ubicaciones'}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Loading State */}
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Cargando ubicaciones...</Text>
                </View>
              ) : (
                <>
                  {/* Locations List */}
                  <ScrollView
                    style={styles.locationsContainer}
                    showsVerticalScrollIndicator={false}
                  >
                    {locations.length === 0 ? (
                      <View style={styles.emptyContainer}>
                        <Ionicons name="location-outline" size={64} color={colors.textQuaternary} />
                        <Text style={styles.emptyTitle}>No tienes ubicaciones</Text>
                        <Text style={styles.emptySubtitle}>
                          Agrega una ubicación para comenzar a recibir pedidos
                        </Text>
                      </View>
                    ) : (
                      locations.map((location) => {
                        const isSelected = selectedLocation?.id === location.id;
                        const isExpanded = expandedLocationId === location.id;

                        return (
                          <View key={location.id} style={styles.locationCard}>
                            {/* Main Card */}
                            <TouchableOpacity
                              style={[
                                styles.locationItem,
                                isSelected && styles.locationItemSelected,
                              ]}
                              onPress={() => handleSelectLocation(location)}
                              onLongPress={() => toggleExpanded(location.id)}
                              activeOpacity={0.7}
                            >
                              <View style={styles.locationItemLeft}>
                                <Ionicons
                                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                                  size={24}
                                  color={isSelected ? colors.primary : colors.textTertiary}
                                />
                                <View style={styles.locationInfo}>
                                  <View style={styles.locationHeader}>
                                    <Text style={styles.locationName}>{location.nombre}</Text>
                                    {location.esPrincipal && (
                                      <View style={styles.mainBadge}>
                                        <Ionicons name="star" size={12} color={colors.white} />
                                        <Text style={styles.mainBadgeText}>Principal</Text>
                                      </View>
                                    )}
                                  </View>
                                  <Text style={styles.locationAddress} numberOfLines={2}>
                                    {location.direccion}
                                  </Text>
                                  {location.referencia && (
                                    <Text style={styles.locationReference}>
                                      {location.referencia}
                                    </Text>
                                  )}
                                </View>
                              </View>

                              <TouchableOpacity
                                onPress={() => toggleExpanded(location.id)}
                                style={styles.expandButton}
                              >
                                <Ionicons
                                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                  size={20}
                                  color={colors.textTertiary}
                                />
                              </TouchableOpacity>
                            </TouchableOpacity>

                            {/* Expanded Actions */}
                            {isExpanded && (
                              <View style={styles.actionsContainer}>
                                {!location.esPrincipal && (
                                  <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => handleSetMain(location.id)}
                                    activeOpacity={0.7}
                                  >
                                    <Ionicons name="star-outline" size={20} color={colors.primary} />
                                    <Text style={styles.actionButtonText}>
                                      Establecer como principal
                                    </Text>
                                  </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                  style={styles.actionButton}
                                  onPress={() => handleEditLocation(location.id)}
                                  activeOpacity={0.7}
                                >
                                  <Ionicons name="create-outline" size={20} color={colors.secondary} />
                                  <Text style={styles.actionButtonText}>Editar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={[styles.actionButton, styles.actionButtonDanger]}
                                  onPress={() => handleDeleteLocation(location.id, location.nombre)}
                                  activeOpacity={0.7}
                                >
                                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                                  <Text style={[styles.actionButtonText, styles.actionButtonDangerText]}>
                                    Eliminar
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        );
                      })
                    )}
                  </ScrollView>

                  {/* Add Location Button */}
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddLocation}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add-circle" size={24} color={colors.white} />
                    <Text style={styles.addButtonText}>Agregar nueva ubicación</Text>
                  </TouchableOpacity>
                </>
              )}
            </SafeAreaView>
          </View>

          {/* Backdrop */}
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={onClose}
          />
        </View>
      </Modal>

      {/* Map Modal para agregar nueva ubicación */}
      {mapModalVisible && newCoords && (
        <Modal visible={mapModalVisible} animationType="slide">
          <SafeAreaView style={styles.modalContainer}>
            {/* Header con botón de volver */}
            <View style={styles.mapHeader}>
              <TouchableOpacity onPress={closeMapModal} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
                <Text style={styles.backButtonText}>Volver</Text>
              </TouchableOpacity>
              <Text style={styles.mapHeaderTitle}>Seleccionar ubicación</Text>
              <View style={{ width: 80 }} />
            </View>

            {/* Map Container con altura fija */}
            <View style={styles.mapModalContainer}>
              {Platform.OS === 'web' ? (
                // Mapa para WEB con Google Maps
                <MapViewPickerWeb
                  height={300}
                  lat={newCoords.lat}
                  lng={newCoords.lng}
                  onChange={async (lat, lng) => {
                    setNewCoords({ lat, lng });
                    await updateAddressFromCoords(lat, lng);
                  }}
                  onUseMyLocation={async (lat, lng) => {
                    setNewCoords({ lat, lng });
                    await updateAddressFromCoords(lat, lng);
                  }}
                />
              ) : (
                // Mapa para MOBILE con react-native-maps
                <>
                  <MapView
                    ref={mapRef}
                    style={styles.mapModal}
                    initialRegion={{
                      latitude: newCoords.lat,
                      longitude: newCoords.lng,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    onPress={async (e: any) => {
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
                      onDragEnd={async (e: any) => {
                        const { latitude, longitude } = e.nativeEvent.coordinate;
                        setNewCoords({ lat: latitude, lng: longitude });
                        await updateAddressFromCoords(latitude, longitude);
                      }}
                    />
                  </MapView>

                  {/* Botón de ubicación actual sobre el mapa */}
                  <View style={styles.overlayButtonContainer}>
                    <TouchableOpacity
                      style={styles.overlayButton}
                      onPress={getCurrentLocation}
                    >
                      <Ionicons name="locate" size={22} color={colors.white} />
                      <Text style={styles.overlayButtonText}>Usar ubicación actual</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>

            {/* Form ScrollView */}
            <ScrollView
              style={styles.formScrollView}
              contentContainerStyle={styles.formScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
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
                  multiline
                  numberOfLines={2}
                />

                <TouchableOpacity
                  style={[styles.saveButton, savingLocation && styles.saveButtonDisabled]}
                  onPress={saveNewLocation}
                  disabled={savingLocation}
                  activeOpacity={0.7}
                >
                  {savingLocation ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.saveText}>Guardar ubicación</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeMapModal}
                  disabled={savingLocation}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawer: {
    top: "8%",
    width: "100%",
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.gray50,
  },
  headerTitle: {
    ...textStyles.title3,
    color: colors.text,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...textStyles.caption1,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.white,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  loadingText: {
    ...textStyles.subheadline,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },

  // Locations
  locationsContainer: {
    flex: 1,
    paddingTop: spacing.xs,
  },
  locationCard: {
    marginHorizontal: spacing.sm,
    marginVertical: 4,
    borderRadius: 10,
    backgroundColor: colors.white,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  locationItemSelected: {
    backgroundColor: colors.primary + '08',
  },
  locationItemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: spacing.md,
  },
  locationInfo: {
    flex: 1,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  locationName: {
    ...textStyles.subheadline,
    color: colors.text,
    fontWeight: '600',
  },
  mainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  mainBadgeText: {
    ...textStyles.caption2,
    color: colors.white,
    fontWeight: '600',
  },
  locationAddress: {
    ...textStyles.caption1,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  locationReference: {
    ...textStyles.caption2,
    color: colors.textTertiary,
  },
  expandButton: {
    padding: spacing.xs,
  },

  // Actions
  actionsContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs,
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    backgroundColor: colors.gray50,
    gap: spacing.xs,
  },
  actionButtonDanger: {
    backgroundColor: colors.error + '15',
  },
  actionButtonText: {
    ...textStyles.caption1,
    color: colors.text,
    fontWeight: '500',
  },
  actionButtonDangerText: {
    color: colors.error,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    ...textStyles.headline,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...textStyles.subheadline,
    color: colors.textTertiary,
    textAlign: 'center',
  },

  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: "25%",
  },
  addButtonText: {
    ...textStyles.subheadline,
    color: colors.white,
    fontWeight: '600',
  },

  // Map Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  mapModalContainer: {
    height: 300,
    position: 'relative',
  },
  mapModal: {
    flex: 1,
  },
  mapHeader: {
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backButtonText: {
    ...textStyles.subheadline,
    color: colors.text,
    fontWeight: '600',
  },
  mapHeaderTitle: {
    ...textStyles.headline,
    color: colors.text,
    fontWeight: '700',
  },
  overlayButtonContainer: {
    position: 'absolute',
    bottom: spacing.md,
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
  formScrollView: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  formScrollContent: {
    flexGrow: 1,
  },
  form: {
    padding: spacing.lg,
    backgroundColor: colors.white
  },
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
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: colors.white,
    fontWeight: '600'
  },
  cancelButton: {
    backgroundColor: colors.gray200,
    padding: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.gray700,
    fontWeight: '600'
  },
});
