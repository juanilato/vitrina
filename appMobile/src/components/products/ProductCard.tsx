/**
 * ProductCard Component
 * iOS Modern Design - Compact horizontal layout
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types/company';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../theme';
import { formatPrice } from '../../utils/formatPrice';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  onAddToCart?: () => void;
  buttonColor?: string;
  showExtrasIndicator?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  buttonColor = colors.primary,
  showExtrasIndicator = true,
}) => {
  const hasExtras = product.agregados && product.agregados.length > 0;
  const hasIngredients = product.ingredientes && product.ingredientes.length > 0;
  const hasCustomizations = hasExtras || hasIngredients;

  return (
    <TouchableOpacity
      style={[styles.container, !product.activo && styles.inactiveContainer]}
      onPress={onPress}
      activeOpacity={0.7}
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
            <Ionicons name="fast-food" size={24} color={colors.textTertiary} />
          </View>
        )}

        {/* Status Badge */}
        {!product.activo && (
          <View style={styles.inactiveBadge}>
            <Ionicons name="close-circle" size={16} color={colors.white} />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {product.nombre}
          </Text>

          {product.descripcion && (
            <Text style={styles.description} numberOfLines={2}>
              {product.descripcion}
            </Text>
          )}

          <View style={styles.bottomRow}>
            <Text style={styles.price}>${formatPrice(product.precio)}</Text>

            {/* Customization Indicator */}
            {showExtrasIndicator && hasCustomizations && (
              <View style={styles.customizationBadge}>
                <Ionicons name="options-outline" size={12} color={colors.primary} />
                <Text style={styles.customizationText}>Personalizable</Text>
              </View>
            )}
          </View>
        </View>

        {/* Add Button */}
        {product.activo && onAddToCart && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: buttonColor }]}
            onPress={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={22} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: `${colors.gray100}80`,
  },

  inactiveContainer: {
    opacity: 0.5,
  },

  imageContainer: {
    width: 80,
    height: 80,
    position: 'relative',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: `${colors.primary}08`,
    justifyContent: 'center',
    alignItems: 'center',
  },

  inactiveBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    gap: spacing.xs,
  },

  textContainer: {
    flex: 1,
  },

  name: {
    ...textStyles.body,
    color: colors.gray900,
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
  },

  description: {
    ...textStyles.caption1,
    color: colors.gray600,
    marginBottom: 6,
    lineHeight: 16,
    fontSize: 12,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },

  price: {
    ...textStyles.callout,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },

  customizationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
    borderWidth: 0.5,
    borderColor: `${colors.primary}25`,
  },

  customizationText: {
    ...textStyles.caption2,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 9,
  },

  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
});
