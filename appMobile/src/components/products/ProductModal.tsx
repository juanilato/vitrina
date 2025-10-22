/**
 * ProductModal Component
 * Modal detallado del producto con agregados
 * Estilo iOS moderno
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Product, Agregado } from '../../types/company';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../theme';
import { formatPrice } from '../../utils/formatPrice';

interface ProductModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onAddToCart: (quantity: number, selectedAgregados: Agregado[], notes: string) => void;
  buttonColor?: string;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  visible,
  product,
  onClose,
  onAddToCart,
  buttonColor = colors.primary,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedAgregados, setSelectedAgregados] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');

  if (!product) return null;

  const toggleAgregado = (agregadoId: string) => {
    const newSet = new Set(selectedAgregados);
    if (newSet.has(agregadoId)) {
      newSet.delete(agregadoId);
    } else {
      newSet.add(agregadoId);
    }
    setSelectedAgregados(newSet);
  };

  const calculateTotal = () => {
    let total = product.precio * quantity;

    if (product.agregados) {
      product.agregados.forEach((agregado) => {
        if (selectedAgregados.has(agregado.id)) {
          total += agregado.precio * quantity;
        }
      });
    }

    return total;
  };

  const handleAddToCart = () => {
    const agregadosArray = product.agregados?.filter((a) => selectedAgregados.has(a.id)) || [];
    onAddToCart(quantity, agregadosArray, notes);

    // Reset state
    setQuantity(1);
    setSelectedAgregados(new Set());
    setNotes('');
    onClose();
  };

  const handleClose = () => {
    // Reset state
    setQuantity(1);
    setSelectedAgregados(new Set());
    setNotes('');
    onClose();
  };

  const activeAgregados = product.agregados?.filter((a) => a.activo) || [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark">
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
        </BlurView>

        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.dragHandle} />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Image */}
            <View style={styles.imageContainer}>
              {product.fotoUrl ? (
                <Image
                  source={{ uri: product.fotoUrl }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholder}>
                  <Ionicons name="fast-food" size={64} color={colors.textTertiary} />
                </View>
              )}
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Name & Price */}
              <View style={styles.titleSection}>
                <Text style={styles.name}>{product.nombre}</Text>
                <Text style={styles.basePrice}>${formatPrice(product.precio)}</Text>
              </View>

              {/* Description */}
              {product.descripcion && (
                <Text style={styles.description}>{product.descripcion}</Text>
              )}

              {/* Agregados */}
              {activeAgregados.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Agregados opcionales</Text>
                  <View style={styles.agregadosList}>
                    {activeAgregados.map((agregado) => (
                      <TouchableOpacity
                        key={agregado.id}
                        style={[
                          styles.agregadoItem,
                          selectedAgregados.has(agregado.id) && styles.agregadoItemSelected,
                        ]}
                        onPress={() => toggleAgregado(agregado.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.agregadoContent}>
                          <View
                            style={[
                              styles.checkbox,
                              selectedAgregados.has(agregado.id) && styles.checkboxSelected,
                            ]}
                          >
                            {selectedAgregados.has(agregado.id) && (
                              <Ionicons name="checkmark" size={16} color={colors.white} />
                            )}
                          </View>
                          <Text style={styles.agregadoName}>{agregado.nombre}</Text>
                        </View>
                        <Text style={styles.agregadoPrice}>
                          +${formatPrice(agregado.precio)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Notes */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notas especiales</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Ej: Sin cebolla, extra salsa..."
                  placeholderTextColor={colors.textTertiary}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Quantity */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cantidad</Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                    onPress={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="remove"
                      size={20}
                      color={quantity <= 1 ? colors.textTertiary : colors.text}
                    />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => setQuantity(quantity + 1)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={20} color={colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.addToCartButton, { backgroundColor: buttonColor }]}
              onPress={handleAddToCart}
              activeOpacity={0.8}
            >
              <Ionicons name="cart" size={22} color={colors.white} />
              <Text style={styles.addToCartText}>
                Agregar ${formatPrice(calculateTotal())}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    ...shadows.lg,
  },

  header: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },

  dragHandle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },

  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: spacing.xl,
  },

  imageContainer: {
    width: '100%',
    height: 280,
    backgroundColor: colors.backgroundSecondary,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    padding: spacing.lg,
  },

  titleSection: {
    marginBottom: spacing.md,
  },

  name: {
    ...textStyles.largeTitle,
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },

  basePrice: {
    ...textStyles.title2,
    color: colors.primary,
    fontWeight: '700',
  },

  description: {
    ...textStyles.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },

  section: {
    marginBottom: spacing.lg,
  },

  sectionTitle: {
    ...textStyles.headline,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },

  agregadosList: {
    gap: spacing.xs,
  },

  agregadoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },

  agregadoItemSelected: {
    backgroundColor: `${colors.primary}15`,
    borderColor: colors.primary,
  },

  agregadoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  agregadoName: {
    ...textStyles.body,
    color: colors.text,
    fontWeight: '500',
  },

  agregadoPrice: {
    ...textStyles.callout,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  notesInput: {
    ...textStyles.body,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 80,
    color: colors.text,
  },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },

  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityButtonDisabled: {
    opacity: 0.4,
  },

  quantityText: {
    ...textStyles.title1,
    color: colors.text,
    fontWeight: '700',
    minWidth: 50,
    textAlign: 'center',
  },

  footer: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },

  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
    ...shadows.md,
  },

  addToCartText: {
    ...textStyles.headline,
    color: colors.white,
    fontWeight: '700',
  },
});
