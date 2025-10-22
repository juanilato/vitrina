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
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  buttonColor = colors.primary,
}) => {
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
            <Text style={styles.description} numberOfLines={1}>
              {product.descripcion}
            </Text>
          )}

          <Text style={styles.price}>${formatPrice(product.precio)}</Text>
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
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    ...shadows.sm,
  },

  inactiveContainer: {
    opacity: 0.6,
  },

  imageContainer: {
    width: 90,
    height: 90,
    position: 'relative',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
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
    gap: spacing.sm,
  },

  textContainer: {
    flex: 1,
  },

  name: {
    ...textStyles.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },

  description: {
    ...textStyles.caption1,
    color: colors.textSecondary,
    marginBottom: 4,
  },

  price: {
    ...textStyles.callout,
    color: colors.primary,
    fontWeight: '700',
  },

  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
});
