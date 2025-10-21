/**
 * ProductCard Component
 * iOS Modern Design with subtle animations
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

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  onAddToCart?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
}) => {
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!product.activo}
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
            <Ionicons name="fast-food" size={32} color={colors.textTertiary} />
          </View>
        )}

        {/* Status Badge */}
        {!product.activo && (
          <View style={styles.inactiveBadge}>
            <Text style={styles.inactiveBadgeText}>No disponible</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.nombre}
        </Text>

        {product.descripcion && (
          <Text style={styles.description} numberOfLines={2}>
            {product.descripcion}
          </Text>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.price}>{formatPrice(product.precio)}</Text>

          {product.activo && onAddToCart && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color={colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.sm,
  },

  imageContainer: {
    width: '100%',
    height: 160,
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
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },

  inactiveBadgeText: {
    ...textStyles.caption1,
    color: colors.white,
    fontWeight: '600',
  },

  content: {
    padding: spacing.md,
  },

  name: {
    ...textStyles.headline,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  description: {
    ...textStyles.subheadline,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  price: {
    ...textStyles.title3,
    color: colors.primary,
    fontWeight: '700',
  },

  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
});
