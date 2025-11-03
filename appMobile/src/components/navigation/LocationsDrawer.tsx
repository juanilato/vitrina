/**
 * LocationsDrawer Component
 * Drawer lateral izquierdo para gestionar ubicaciones
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, textStyles, spacing } from '../../theme';
import { useLocation } from '../../contexts/LocationContext';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(width * 0.7, 320);

interface LocationsDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export const LocationsDrawer: React.FC<LocationsDrawerProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const {
    locations,
    selectedLocation,
    setSelectedLocation,
    deleteLocation,
    setMainLocation,
  } = useLocation();

  const [expandedLocationId, setExpandedLocationId] = useState<number | null>(null);

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
              await deleteLocation(locationId);
              if (expandedLocationId === locationId) {
                setExpandedLocationId(null);
              }
            } catch (error) {
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
    } catch (error) {
      Alert.alert('Error', 'No se pudo establecer como principal');
    }
  };

  const handleAddLocation = () => {
    onClose();
    router.push('/locations');
  };

  const toggleExpanded = (locationId: number) => {
    setExpandedLocationId(expandedLocationId === locationId ? null : locationId);
  };

  return (
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
    marginBottom:"25%",
  },
  addButtonText: {
    ...textStyles.subheadline,
    color: colors.white,
    fontWeight: '600',
  },
});
