/**
 * ProductModal Component
 * Modal detallado del producto con ingredientes extras
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
import { Product, Agregado, ProductoIngrediente } from '../../types/company';
import { CartIngredienteExtra } from '../../types/cart';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../theme';
import { formatPrice } from '../../utils/formatPrice';

interface ProductModalProps {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onAddToCart: (
    quantity: number,
    selectedAgregados: Agregado[],
    notes: string,
    ingredientesExtras?: CartIngredienteExtra[]
  ) => void;
  buttonColor?: string;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  visible,
  product,
  onClose,
  onAddToCart,
  buttonColor = colors.primary,
}) => {
  console.log(product, "PRODUCTO");
  const [quantity, setQuantity] = useState(1);
  const [selectedAgregados, setSelectedAgregados] = useState<Set<string>>(new Set());
  const [ingredienteQuantities, setIngredienteQuantities] = useState<Map<number, number>>(new Map());
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

  const updateIngredienteQuantity = (ingredienteId: number, delta: number, max?: number) => {
    const newMap = new Map(ingredienteQuantities);
    const currentQty = newMap.get(ingredienteId) || 0;
    const newQty = Math.max(0, currentQty + delta);

    // Aplicar máximo si existe
    const finalQty = max !== undefined && max > 0 ? Math.min(newQty, max) : newQty;

    if (finalQty === 0) {
      newMap.delete(ingredienteId);
    } else {
      newMap.set(ingredienteId, finalQty);
    }
    setIngredienteQuantities(newMap);
  };

  const calculateTotal = () => {
    let total = product.precio * quantity;

    // Precio de agregados (sistema antiguo - mantener compatibilidad)
    if (product.agregados) {
      product.agregados.forEach((agregado) => {
        if (selectedAgregados.has(agregado.id)) {
          total += agregado.precio * quantity;
        }
      });
    }

    // Precio de ingredientes extras (sistema nuevo)
    if (product.ingredientes) {
      product.ingredientes.forEach((prodIngrediente) => {
        const qty = ingredienteQuantities.get(prodIngrediente.id) || 0;
        if (qty > 0 && prodIngrediente.precioExtra) {
          const precioExtra = typeof prodIngrediente.precioExtra === 'string'
            ? parseFloat(prodIngrediente.precioExtra)
            : prodIngrediente.precioExtra;
          total += precioExtra * qty * quantity;
        }
      });
    }

    return total;
  };

  const handleAddToCart = () => {
    const agregadosArray = product.agregados?.filter((a) => selectedAgregados.has(a.id)) || [];

    // Construir array de ingredientes extras
    const ingredientesExtras: CartIngredienteExtra[] = [];
    if (product.ingredientes) {
      product.ingredientes.forEach((prodIngrediente) => {
        const qty = ingredienteQuantities.get(prodIngrediente.id) || 0;
        if (qty > 0) {
          ingredientesExtras.push({
            productoIngrediente: prodIngrediente,
            cantidad: qty,
          });
        }
      });
    }

    onAddToCart(quantity, agregadosArray, notes, ingredientesExtras);

    // Reset state
    setQuantity(1);
    setSelectedAgregados(new Set());
    setIngredienteQuantities(new Map());
    setNotes('');
    onClose();
  };

  const handleClose = () => {
    // Reset state
    setQuantity(1);
    setSelectedAgregados(new Set());
    setIngredienteQuantities(new Map());
    setNotes('');
    onClose();
  };

  const activeAgregados = product.agregados?.filter((a) => a.activo) || [];
  const ingredientesExtrasPermitidos = product.ingredientes?.filter((pi) => pi.esExtraPermitido) || [];

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

              {/* Ingredientes Extras */}
              {ingredientesExtrasPermitidos.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="restaurant" size={20} color={buttonColor} />
                    <Text style={[styles.sectionTitle, { color: buttonColor }]}>
                      Ingredientes extras
                    </Text>
                  </View>
                  <View style={styles.ingredientesList}>
                    {ingredientesExtrasPermitidos.map((prodIngrediente) => {
                      const qty = ingredienteQuantities.get(prodIngrediente.id) || 0;
                      const precioExtra = prodIngrediente.precioExtra
                        ? typeof prodIngrediente.precioExtra === 'string'
                          ? parseFloat(prodIngrediente.precioExtra)
                          : prodIngrediente.precioExtra
                        : 0;

                      return (
                        <View
                          key={prodIngrediente.id}
                          style={[
                            styles.ingredienteItem,
                            qty > 0 && {
                              backgroundColor: `${buttonColor}15`,
                              borderColor: buttonColor
                            }
                          ]}
                        >
                          <View style={styles.ingredienteInfo}>
                            {prodIngrediente.ingrediente.icono && (
                              <Text style={styles.ingredienteIcon}>
                                {prodIngrediente.ingrediente.icono}
                              </Text>
                            )}
                            <View style={styles.ingredienteTextContainer}>
                              <Text style={styles.ingredienteName}>
                                {prodIngrediente.ingrediente.nombre}
                              </Text>
                              <Text style={[styles.ingredientePrice, { color: buttonColor }]}>
                                +${formatPrice(precioExtra)}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.ingredienteControls}>
                            <TouchableOpacity
                              style={[
                                styles.ingredienteButton,
                               
                              ]}
                              onPress={() => updateIngredienteQuantity(prodIngrediente.id, -1, prodIngrediente.maximoExtra || undefined)}
                              disabled={qty === 0}
                              activeOpacity={0.7}
                            >
                              <Ionicons
                                name="remove"
                                size={18}
                                color={qty === 0 ? colors.textTertiary : buttonColor}
                              />
                            </TouchableOpacity>

                            <Text style={styles.ingredienteQuantity}>{qty}</Text>

                            <TouchableOpacity
                    
                              onPress={() => updateIngredienteQuantity(prodIngrediente.id, 1, prodIngrediente.maximoExtra || undefined)}
                              disabled={prodIngrediente.maximoExtra !== undefined && prodIngrediente.maximoExtra > 0 && qty >= prodIngrediente.maximoExtra}
                              activeOpacity={0.7}
                            >
                              <Ionicons
                                name="add"
                                size={18}
                                color={prodIngrediente.maximoExtra && qty >= prodIngrediente.maximoExtra ? colors.textTertiary : buttonColor}
                              />
                            </TouchableOpacity>
                          </View>

                          {prodIngrediente.maximoExtra && prodIngrediente.maximoExtra > 0 && (
                            <Text style={styles.ingredienteMaxText}>
                              Máx: {prodIngrediente.maximoExtra}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Agregados (sistema antiguo - mantener compatibilidad) */}
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
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  modalContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    height: '88%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },

  header: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    position: 'relative',
  },

  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    opacity: 0.4,
    marginBottom: spacing.xs,
  },

  closeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: spacing.lg,
  },

  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },

  titleSection: {
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  name: {
    ...textStyles.largeTitle,
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },

  basePrice: {
    ...textStyles.title2,
    color: colors.primary,
    fontWeight: '700',
  },

  description: {
    ...textStyles.body,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },

  section: {
    marginBottom: spacing.lg,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },

  sectionTitle: {
    ...textStyles.headline,
    color: colors.text,
    fontWeight: '600',
  },

  /** 🔸 Ingredientes extras compactos y modernos */
  ingredientesList: {
    gap: spacing.xs,
  },

  ingredienteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },

  ingredienteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },

  ingredienteIcon: {
    fontSize: 22,
  },

  ingredienteTextContainer: {
    flex: 1,
  },

  ingredienteName: {
    ...textStyles.callout,
    color: colors.text,
    fontWeight: '500',
  },

  ingredientePrice: {
    ...textStyles.footnote,
    color: colors.primary,
    fontWeight: '600',
  },

  ingredienteControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  ingredienteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  ingredienteQuantity: {
    ...textStyles.callout,
    color: colors.text,
    minWidth: 24,
    textAlign: 'center',
  },

  ingredienteMaxText: {
    ...textStyles.caption1,
    color: colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },

  /** 🔸 Agregados minimalistas */
  agregadosList: {
    gap: spacing.xs,
  },

  agregadoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  agregadoItemSelected: {
    backgroundColor: `${colors.primary}10`,
    borderColor: colors.primary,
  },

  agregadoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
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
  },

  agregadoPrice: {
    ...textStyles.footnote,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  /** 🔸 Notas */
  notesInput: {
    ...textStyles.body,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 70,
    color: colors.text,
  },

  /** 🔸 Cantidad */
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },

  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityButtonDisabled: {
    opacity: 0.4,
  },

  quantityText: {
    ...textStyles.title2,
    color: colors.text,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },

  /** 🔸 Footer */
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },

  addToCartText: {
    ...textStyles.headline,
    color: colors.white,
    fontWeight: '700',
  },
});
