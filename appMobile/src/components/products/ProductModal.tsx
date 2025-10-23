/**
 * ProductModal - Versión moderna y estética
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Product, Agregado } from '../../types/company';
import { CartIngredienteExtra } from '../../types/cart';
import { colors, spacing, borderRadius, textStyles } from '../../theme';
import { formatPrice } from '../../utils/formatPrice';
import { RenderIngredientIcon } from '../../utils/ingredientIcons';

const { width } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

/**
 * Hook de animación numérica fluida
 */
const useAnimatedNumber = (value: number, duration = 300) => {
  const animated = useRef(new Animated.Value(value)).current;
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    Animated.timing(animated, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();

    const listener = animated.addListener(({ value }) => setDisplay(value));
    return () => animated.removeListener(listener);
  }, [value]);

  return display;
};

export const ProductModal: React.FC<ProductModalProps> = ({
  visible,
  product,
  onClose,
  onAddToCart,
  buttonColor = colors.primary,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [ingredienteQuantities, setIngredienteQuantities] = useState<Map<number, number>>(new Map());
  const [notes, setNotes] = useState('');
  const [extrasVisible, setExtrasVisible] = useState(true);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const calculateTotal = () => {
    if (!product) return 0;
    let total = product.precio * quantity;
    if (product.ingredientes) {
      product.ingredientes.forEach((pi) => {
        const qty = ingredienteQuantities.get(pi.id) || 0;
        if (qty > 0 && pi.precioExtra) {
          const precio =
            typeof pi.precioExtra === 'string' ? parseFloat(pi.precioExtra) : pi.precioExtra;
          total += precio * qty * quantity;
        }
      });
    }
    return total;
  };

  const total = calculateTotal();
  const animatedPrice = useAnimatedNumber(total, 350);

  // Animación de rebote al cambiar el precio
  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.1, useNativeDriver: true, tension: 100 }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  }, [total]);

  if (!product) return null;

  const toggleExtras = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExtrasVisible((prev) => !prev);
  };

  const ingredientesExtras = product.ingredientes?.filter((pi) => pi.esExtraPermitido) || [];

  const updateIngredienteQuantity = (ingredienteId: number, delta: number, max?: number) => {
    const newMap = new Map(ingredienteQuantities);
    const currentQty = newMap.get(ingredienteId) || 0;
    const newQty = Math.max(0, currentQty + delta);
    const finalQty = max ? Math.min(newQty, max) : newQty;
    if (finalQty === 0) newMap.delete(ingredienteId);
    else newMap.set(ingredienteId, finalQty);
    setIngredienteQuantities(newMap);
  };

  const handleAdd = () => {
    const extras: CartIngredienteExtra[] = [];
    if (product.ingredientes) {
      product.ingredientes.forEach((pi) => {
        const qty = ingredienteQuantities.get(pi.id) || 0;
        if (qty > 0) extras.push({ productoIngrediente: pi, cantidad: qty });
      });
    }
    onAddToCart(quantity, [], notes, extras);
    setQuantity(1);
    setIngredienteQuantities(new Map());
    setNotes('');
    onClose();
  };

  const updateQuantity = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.modalContainer}>
          {/* Header con botón cerrar */}
          <View style={styles.header}>
            <View style={styles.dragHandle} />
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: 'rgba(0,0,0,0.1)' }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Imagen del producto */}
            <View style={styles.imageContainer}>
              {product.fotoUrl ? (
                <Image source={{ uri: product.fotoUrl }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={styles.placeholder}>
                  <Ionicons name="fast-food" size={80} color={colors.textTertiary} />
                </View>
              )}
              {/* Gradiente en la parte inferior de la imagen */}
              <View style={styles.imageGradient} />
            </View>

            {/* Contenido */}
            <View style={styles.content}>
              {/* Título y Precio */}
              <View style={styles.titleSection}>
                <View style={styles.titleRow}>
                  <Text style={styles.productName}>{product.nombre}</Text>
                  <View style={[styles.priceTag, { backgroundColor: `${buttonColor}15` }]}>
                    <Text style={[styles.priceTagText, { color: buttonColor }]}>
                      ${formatPrice(product.precio)}
                    </Text>
                  </View>
                </View>
                {product.descripcion && (
                  <Text style={styles.description}>{product.descripcion}</Text>
                )}
              </View>

              {/* Cantidad */}
              <View style={styles.quantitySection}>
                <Text style={styles.sectionLabel}>Cantidad</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={[styles.quantityButton, { borderColor: buttonColor }]}
                    onPress={() => updateQuantity(-1)}
                    disabled={quantity === 1}
                  >
                    <Ionicons
                      name="remove"
                      size={20}
                      color={quantity === 1 ? colors.textTertiary : buttonColor}
                    />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{quantity}</Text>
                  <TouchableOpacity
                    style={[styles.quantityButton, { borderColor: buttonColor }]}
                    onPress={() => updateQuantity(1)}
                  >
                    <Ionicons name="add" size={20} color={buttonColor} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Extras */}
              {ingredientesExtras.length > 0 && (
                <View style={styles.extrasSection}>
                  <TouchableOpacity onPress={toggleExtras} style={styles.extrasHeader}>
                    <View style={styles.extrasHeaderLeft}>
                      <Ionicons name="add-circle" size={20} color={buttonColor} />
                      <Text style={styles.sectionLabel}>Agregar extras</Text>
                    </View>
                    <Ionicons
                      name={extrasVisible ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>

                  {extrasVisible && (
                    <View style={styles.extrasList}>
                      {ingredientesExtras.map((pi) => {
                        const qty = ingredienteQuantities.get(pi.id) || 0;
                        const precioExtra =
                          typeof pi.precioExtra === 'string'
                            ? parseFloat(pi.precioExtra)
                            : pi.precioExtra || 0;
                        return (
                          <View key={pi.id} style={styles.extraItem}>
                            <View style={styles.extraLeft}>
                              <View style={[styles.iconContainer, { backgroundColor: `${buttonColor}10` }]}>
                                <RenderIngredientIcon name={pi.ingrediente.icono} size={24} />
                              </View>
                              <View style={styles.extraInfo}>
                                <Text style={styles.extraName}>{pi.ingrediente.nombre}</Text>
                                <Text style={[styles.extraPrice, { color: buttonColor }]}>
                                  +${formatPrice(precioExtra)}
                                </Text>
                              </View>
                            </View>

                            <View style={styles.extraControls}>
                              <TouchableOpacity
                                onPress={() => updateIngredienteQuantity(pi.id, -1)}
                                disabled={qty === 0}
                                style={styles.extraButton}
                              >
                                <Ionicons
                                  name="remove-circle"
                                  size={28}
                                  color={qty === 0 ? colors.textTertiary : buttonColor}
                                />
                              </TouchableOpacity>
                              <Text style={styles.extraQty}>{qty}</Text>
                              <TouchableOpacity
                                onPress={() =>
                                  updateIngredienteQuantity(pi.id, 1, pi.maximoExtra || undefined)
                                }
                                disabled={pi.maximoExtra !== undefined && qty >= (pi.maximoExtra || 0)}
                                style={styles.extraButton}
                              >
                                <Ionicons
                                  name="add-circle"
                                  size={28}
                                  color={
                                    pi.maximoExtra && qty >= pi.maximoExtra
                                      ? colors.textTertiary
                                      : buttonColor
                                  }
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}

              {/* Notas */}
              <View style={styles.notesSection}>
                <Text style={styles.sectionLabel}>Notas adicionales</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Ej: Sin cebolla, sin picante..."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  value={notes}
                  onChangeText={setNotes}
                  maxLength={200}
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer - Botón agregar */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 1 }}>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: buttonColor }]}
                onPress={handleAdd}
                activeOpacity={0.85}
              >
                <View style={styles.addButtonContent}>
                  <Ionicons name="cart" size={22} color="#fff" />
                  <Text style={styles.addText}>Agregar al carrito</Text>
                  <View style={styles.totalBadge}>
                    <Text style={styles.totalText}>${formatPrice(animatedPrice)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '92%',
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    position: 'relative',
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    opacity: 0.3,
  },
  closeButton: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContent: {
    paddingBottom: 140,
  },

  // Imagen
  imageContainer: {
    width: '100%',
    height: 280,
    position: 'relative',
    backgroundColor: colors.backgroundSecondary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.3))',
  },

  // Contenido
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },

  // Título y precio
  titleSection: {
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  productName: {
    flex: 1,
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  priceTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    marginLeft: spacing.sm,
  },
  priceTagText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Cantidad
  quantitySection: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  quantityText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    minWidth: 40,
    textAlign: 'center',
  },

  // Extras
  extrasSection: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  extrasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  extrasHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  extrasList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  extraItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  extraLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  extraInfo: {
    flex: 1,
  },
  extraName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  extraPrice: {
    fontSize: 13,
    fontWeight: '600',
  },
  extraControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  extraButton: {
    padding: 4,
  },
  extraQty: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    minWidth: 24,
    textAlign: 'center',
  },

  // Notas
  notesSection: {
    marginBottom: spacing.sm,
  },
  notesInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 15,
    minHeight: 80,
    maxHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  addButton: {
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md + 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
  },
  totalBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
});
