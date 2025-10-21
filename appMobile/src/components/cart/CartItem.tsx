/**
 * Cart Item Component
 * Muestra un producto en el carrito con opciones para editar cantidad y notas
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem as CartItemType } from '../../types/cart';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { textStyles as typography } from '../../theme/typography';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  onUpdateNotes: (notes: string) => void;
  onRemove: () => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onUpdateNotes,
  onRemove,
}) => {
  const [showNotes, setShowNotes] = useState(!!item.notes);
  const [notes, setNotes] = useState(item.notes || '');

  const handleDecrease = () => {
    if (item.quantity === 1) {
      Alert.alert(
        'Eliminar producto',
        `¿Deseas eliminar ${item.product.name} del carrito?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: onRemove },
        ]
      );
    } else {
      onUpdateQuantity(item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    onUpdateQuantity(item.quantity + 1);
  };

  const handleNotesBlur = () => {
    if (notes.trim() !== item.notes) {
      onUpdateNotes(notes.trim());
    }
  };

  const price = item.product.precio || item.product.price || 0;
  const itemTotal = price * item.quantity;
  const productName = item.product.nombre || item.product.name || 'Producto';
  const productDescription = item.product.descripcion || item.product.description;
  const productImage = item.product.fotoUrl || (item.product.images && item.product.images[0]);

  return (
    <View style={styles.container}>
      {/* Product Info */}
      <View style={styles.content}>
        {productImage && (
          <Image
            source={{ uri: productImage }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <View style={styles.details}>
          <Text style={styles.productName} numberOfLines={2}>
            {productName}
          </Text>

          {productDescription && (
            <Text style={styles.productDescription} numberOfLines={1}>
              {productDescription}
            </Text>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              ${price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </Text>
            {item.quantity > 1 && (
              <Text style={styles.itemTotal}>
                Total: ${itemTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Quantity Controls */}
      <View style={styles.controls}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={handleDecrease}
            style={styles.quantityButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.quantity === 1 ? 'trash-outline' : 'remove'}
              size={20}
              color={item.quantity === 1 ? colors.error : colors.secondary}
            />
          </TouchableOpacity>

          <Text style={styles.quantity}>{item.quantity}</Text>

          <TouchableOpacity
            onPress={handleIncrease}
            style={styles.quantityButton}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={20} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        {/* Notes Toggle */}
        <TouchableOpacity
          onPress={() => setShowNotes(!showNotes)}
          style={styles.notesToggle}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showNotes ? 'create' : 'create-outline'}
            size={20}
            color={showNotes ? colors.accent : colors.gray400}
          />
          <Text style={[styles.notesToggleText, showNotes && styles.notesToggleTextActive]}>
            Notas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notes Input */}
      {showNotes && (
        <View style={styles.notesContainer}>
          <TextInput
            style={styles.notesInput}
            placeholder="Ej: Sin cebolla, agregar mayonesa..."
            value={notes}
            onChangeText={setNotes}
            onBlur={handleNotesBlur}
            multiline
            maxLength={200}
            placeholderTextColor={colors.gray400}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },

  content: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },

  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.gray100,
    marginRight: spacing.md,
  },

  details: {
    flex: 1,
  },

  productName: {
    ...typography.bodyLarge,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.xs,
  },

  productDescription: {
    ...typography.bodySmall,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  price: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.orange,
  },

  itemTotal: {
    ...typography.bodySmall,
    color: colors.gray600,
  },

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary + '15',
    borderRadius: 8,
    padding: spacing.xs,
  },

  quantityButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 6,
  },

  quantity: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.gray900,
    minWidth: 40,
    textAlign: 'center',
  },

  notesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  notesToggleText: {
    ...typography.bodySmall,
    color: colors.gray600,
  },

  notesToggleTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },

  notesContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },

  notesInput: {
    ...typography.bodyMedium,
    backgroundColor: colors.gray50,
    borderRadius: 8,
    padding: spacing.md,
    minHeight: 60,
    maxHeight: 100,
    color: colors.gray900,
    textAlignVertical: 'top',
  },
});
