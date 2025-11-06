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
import { normalize } from '../../utils/responsive';

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
            <Ionicons name="fast-food" size={normalize(24)} color={colors.textTertiary} />
          </View>
        )}

        {/* Status Badge */}
        {!product.activo && (
          <View style={styles.inactiveBadge}>
            <Ionicons name="close-circle" size={normalize(16)} color={colors.white} />
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
                <Ionicons name="options-outline" size={normalize(12)} color={colors.primary} />
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
            <Ionicons name="add" size={normalize(22)} color={colors.white} />
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
    borderRadius: normalize(12),
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
    width: normalize(80),
    height: normalize(80),
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
    top: normalize(6),
    right: normalize(6),
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
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
    fontSize: normalize(14),
    marginBottom: 2,
  },

  description: {
    ...textStyles.caption1,
    color: colors.gray600,
    marginBottom: normalize(6),
    lineHeight: normalize(16),
    fontSize: normalize(12),
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
    fontSize: normalize(15),
  },

  customizationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.primary}10`,
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(3),
    borderRadius: normalize(6),
    gap: normalize(3),
    borderWidth: 0.5,
    borderColor: `${colors.primary}25`,
  },

  customizationText: {
    ...textStyles.caption2,
    color: colors.primary,
    fontWeight: '600',
    fontSize: normalize(9),
  },

  addButton: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
});
