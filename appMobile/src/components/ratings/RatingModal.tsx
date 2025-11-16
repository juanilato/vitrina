/**
 * RatingModal Component
 * Modal para solicitar valoración de un pedido entregado
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSizes, fontWeights, shadows } from '../../theme';
import { RatingStars } from '../common/RatingStars';
import { Button } from '../common/Button';
import {
  AspectosEmpresa,
  AspectosRepartidor,
  CreateValoracionData,
  ValoracionProducto,
} from '../../types/rating';
import { ASPECTOS_EMPRESA_LABELS, ASPECTOS_REPARTIDOR_LABELS } from '../../utils/constants';
import ratingService from '../../services/rating.service';

const { width } = Dimensions.get('window');

interface OrderItem {
  id: string;
  producto: {
    id: string;
    nombre: string;
  };
}

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  pedidoId: string;
  empresaNombre: string;
  tipoEntrega: 'delivery' | 'retiro';
  productos: OrderItem[];
  onSuccess?: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
  pedidoId,
  empresaNombre,
  tipoEntrega,
  productos,
  onSuccess,
}) => {
  // Estados para valoración de empresa
  const [calificacionEmpresa, setCalificacionEmpresa] = useState(0);
  const [comentarioEmpresa, setComentarioEmpresa] = useState('');
  const [aspectosEmpresaSeleccionados, setAspectosEmpresaSeleccionados] = useState<
    AspectosEmpresa[]
  >([]);

  // Estados para valoración de productos
  const [valoracionProductos, setValoracionProductos] = useState<ValoracionProducto[]>([]);

  // Estados para valoración de repartidor
  const [calificacionRepartidor, setCalificacionRepartidor] = useState(0);
  const [comentarioRepartidor, setComentarioRepartidor] = useState('');
  const [aspectosRepartidorSeleccionados, setAspectosRepartidorSeleccionados] = useState<
    AspectosRepartidor[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Empresa, 2: Productos, 3: Repartidor

  useEffect(() => {
    if (visible) {
      // Resetear estados cuando se abre el modal
      resetStates();
    }
  }, [visible]);

  const resetStates = () => {
    setCalificacionEmpresa(0);
    setComentarioEmpresa('');
    setAspectosEmpresaSeleccionados([]);
    setValoracionProductos([]);
    setCalificacionRepartidor(0);
    setComentarioRepartidor('');
    setAspectosRepartidorSeleccionados([]);
    setCurrentStep(1);
  };

  const toggleAspectoEmpresa = (aspecto: AspectosEmpresa) => {
    setAspectosEmpresaSeleccionados((prev) =>
      prev.includes(aspecto) ? prev.filter((a) => a !== aspecto) : [...prev, aspecto]
    );
  };

  const toggleAspectoRepartidor = (aspecto: AspectosRepartidor) => {
    setAspectosRepartidorSeleccionados((prev) =>
      prev.includes(aspecto) ? prev.filter((a) => a !== aspecto) : [...prev, aspecto]
    );
  };

  const handleProductRating = (productoId: string, nombreProducto: string, rating: number) => {
    setValoracionProductos((prev) => {
      const existing = prev.find((v) => v.productoId === productoId);
      if (existing) {
        return prev.map((v) =>
          v.productoId === productoId ? { ...v, calificacion: rating } : v
        );
      }
      return [...prev, { productoId, nombreProducto, calificacion: rating }];
    });
  };

  const handleProductComment = (productoId: string, comment: string) => {
    setValoracionProductos((prev) =>
      prev.map((v) => (v.productoId === productoId ? { ...v, comentario: comment } : v))
    );
  };

  const canProceedToNextStep = () => {
    if (currentStep === 1) return calificacionEmpresa > 0;
    if (currentStep === 2) return true; // Productos es opcional
    if (currentStep === 3 && tipoEntrega === 'delivery') return calificacionRepartidor > 0;
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (tipoEntrega === 'delivery') {
        setCurrentStep(3);
      } else {
        handleSubmit();
      }
    } else if (currentStep === 3) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data: CreateValoracionData = {
        pedidoId,
        calificacionEmpresa,
        comentarioEmpresa: comentarioEmpresa.trim() || undefined,
        aspectosEmpresa:
          aspectosEmpresaSeleccionados.length > 0 ? aspectosEmpresaSeleccionados : undefined,
        valoracionProductos: valoracionProductos.length > 0 ? valoracionProductos : undefined,
      };

      // Agregar valoración de repartidor si es delivery
      if (tipoEntrega === 'delivery') {
        data.calificacionRepartidor = calificacionRepartidor;
        data.comentarioRepartidor = comentarioRepartidor.trim() || undefined;
        data.aspectosRepartidor =
          aspectosRepartidorSeleccionados.length > 0 ? aspectosRepartidorSeleccionados : undefined;
      }

      await ratingService.createRating(data);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error al enviar valoración:', error);
      alert('Error al enviar la valoración. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const totalSteps = tipoEntrega === 'delivery' ? 3 : 2;
    return (
      <View style={styles.stepIndicator}>
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <View key={step} style={styles.stepDot}>
            <View
              style={[
                styles.dot,
                step === currentStep && styles.activeDot,
                step < currentStep && styles.completedDot,
              ]}
            />
          </View>
        ))}
      </View>
    );
  };

  const renderEmpresaStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>¿Cómo fue tu experiencia con {empresaNombre}?</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Calificación general *</Text>
        <RatingStars
          rating={calificacionEmpresa}
          onRatingChange={setCalificacionEmpresa}
          size="lg"
          showLabel
        />
      </View>

      {calificacionEmpresa > 0 && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>¿Qué destacarías?</Text>
            <View style={styles.aspectosContainer}>
              {Object.entries(ASPECTOS_EMPRESA_LABELS).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.aspectoChip,
                    aspectosEmpresaSeleccionados.includes(key as AspectosEmpresa) &&
                      styles.aspectoChipSelected,
                  ]}
                  onPress={() => toggleAspectoEmpresa(key as AspectosEmpresa)}
                >
                  <Text
                    style={[
                      styles.aspectoChipText,
                      aspectosEmpresaSeleccionados.includes(key as AspectosEmpresa) &&
                        styles.aspectoChipTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Comentario (opcional)</Text>
            <TextInput
              style={styles.textArea}
              value={comentarioEmpresa}
              onChangeText={setComentarioEmpresa}
              placeholder="Cuéntanos más sobre tu experiencia..."
              placeholderTextColor={colors.gray400}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </>
      )}
    </View>
  );

  const renderProductosStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>¿Cómo calificarías los productos?</Text>
      <Text style={styles.stepSubtitle}>Opcional - Puedes saltar este paso</Text>

      {productos.map((item) => {
        const valoracion = valoracionProductos.find((v) => v.productoId === item.producto.id);
        return (
          <View key={item.id} style={styles.productoItem}>
            <Text style={styles.productoNombre}>{item.producto.nombre}</Text>
            <RatingStars
              rating={valoracion?.calificacion || 0}
              onRatingChange={(rating) =>
                handleProductRating(item.producto.id, item.producto.nombre, rating)
              }
              size="md"
            />
            {valoracion && valoracion.calificacion > 0 && (
              <TextInput
                style={styles.productoComentario}
                value={valoracion.comentario || ''}
                onChangeText={(text) => handleProductComment(item.producto.id, text)}
                placeholder="Comentario opcional..."
                placeholderTextColor={colors.gray400}
              />
            )}
          </View>
        );
      })}
    </View>
  );

  const renderRepartidorStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>¿Cómo fue el servicio del repartidor?</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Calificación del repartidor *</Text>
        <RatingStars
          rating={calificacionRepartidor}
          onRatingChange={setCalificacionRepartidor}
          size="lg"
          showLabel
        />
      </View>

      {calificacionRepartidor > 0 && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>¿Qué destacarías?</Text>
            <View style={styles.aspectosContainer}>
              {Object.entries(ASPECTOS_REPARTIDOR_LABELS).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.aspectoChip,
                    aspectosRepartidorSeleccionados.includes(key as AspectosRepartidor) &&
                      styles.aspectoChipSelected,
                  ]}
                  onPress={() => toggleAspectoRepartidor(key as AspectosRepartidor)}
                >
                  <Text
                    style={[
                      styles.aspectoChipText,
                      aspectosRepartidorSeleccionados.includes(key as AspectosRepartidor) &&
                        styles.aspectoChipTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Comentario (opcional)</Text>
            <TextInput
              style={styles.textArea}
              value={comentarioRepartidor}
              onChangeText={setComentarioRepartidor}
              placeholder="Cuéntanos sobre el servicio del repartidor..."
              placeholderTextColor={colors.gray400}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </>
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Valorar pedido</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {currentStep === 1 && renderEmpresaStep()}
            {currentStep === 2 && renderProductosStep()}
            {currentStep === 3 && renderRepartidorStep()}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            {currentStep > 1 && (
              <Button
                title="Atrás"
                variant="outline"
                onPress={() => setCurrentStep((prev) => prev - 1)}
                style={styles.backButton}
              />
            )}
            <Button
              title={
                currentStep === 1
                  ? 'Continuar'
                  : currentStep === 2 && tipoEntrega === 'delivery'
                    ? 'Continuar'
                    : 'Enviar valoración'
              }
              onPress={handleNext}
              disabled={!canProceedToNextStep()}
              loading={loading}
              style={styles.nextButton}
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
    ...shadows.large,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.text,
  },
  headerPlaceholder: {
    width: 44,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  stepDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray200,
    overflow: 'hidden',
  },
  dot: {
    height: '100%',
    backgroundColor: colors.gray300,
  },
  activeDot: {
    backgroundColor: colors.orange,
  },
  completedDot: {
    backgroundColor: colors.secondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  stepContainer: {
    paddingTop: spacing.md,
  },
  stepTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionLabel: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  aspectosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  aspectoChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aspectoChipSelected: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  aspectoChipText: {
    fontSize: fontSizes.sm,
    color: colors.text,
    fontWeight: fontWeights.medium,
  },
  aspectoChipTextSelected: {
    color: colors.white,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSizes.md,
    color: colors.text,
    minHeight: 100,
  },
  productoItem: {
    padding: spacing.md,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  productoNombre: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  productoComentario: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: fontSizes.sm,
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});
