/**
 * ProductCard Component
 * iOS Modern Design - Compact horizontal layout
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types/company';
import { colors as themeColors, spacing, borderRadius, shadows, textStyles } from '../../theme';
import { formatPrice } from '../../utils/formatPrice';
import { normalize } from '../../utils/responsive';
import { useTheme } from '../../contexts/ThemeContext';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  onAddToCart?: () => void;
  buttonColor?: string;
  showExtrasIndicator?: boolean;
  discountedPrice?: number;
  promotions?: any[]; // Using any[] for now to avoid circular dependency or import issues, but ideally Promocion[]
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  buttonColor,
  showExtrasIndicator = true,
  discountedPrice,
  promotions,
}) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const finalButtonColor = buttonColor || colors.primary;

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
            <Ionicons name="fast-food" size={normalize(24)} color={themeColors.textTertiary} />
          </View>
        )}

        {/* Status Badge */}
        {!product.activo && (
          <View style={styles.inactiveBadge}>
            <Ionicons name="close-circle" size={normalize(16)} color={themeColors.white} />
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
            {discountedPrice ? (
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                <Text style={styles.originalPrice}>${formatPrice(product.precio)}</Text>
                <Text style={styles.discountedPrice}>${formatPrice(discountedPrice)}</Text>
              </View>
            ) : (
              <Text style={styles.price}>${formatPrice(product.precio)}</Text>
            )}

            {/* Customization Indicator */}
            {showExtrasIndicator && hasCustomizations && (
              <View style={styles.customizationBadge}>
                <Ionicons name="options-outline" size={normalize(12)} color={colors.primary} />
                <Text style={styles.customizationText}>Personalizable</Text>
              </View>
            )}
          </View>

          {/* Promotions Badges */}
          {promotions && promotions.length > 0 && (
            <View style={styles.promotionsContainer}>
              {promotions.map((promo, index) => (
                <View key={index} style={styles.promoBadge}>
                  <Text style={styles.promoText}>
                    {promo.nombre}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Add Button */}
        {product.activo && onAddToCart && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: finalButtonColor }]}
            onPress={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={normalize(22)} color={themeColors.white} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: isDark ? colors.gray100 : '#F8F9FA',
    borderRadius: normalize(12),
    overflow: 'hidden',
    marginBottom: spacing.sm,
    // Sombra muy sutil como CategoryCard
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    minHeight: normalize(85),
  },

  inactiveContainer: {
    opacity: 0.5,
  },

  imageContainer: {
    width: normalize(75),
    minHeight: normalize(85),
    position: 'relative',
  },

  image: {
    width: '100%',
    minHeight: normalize(85),
    height: '100%',
  },

  placeholder: {
    width: '100%',
    minHeight: normalize(85),
    height: '100%',
    backgroundColor: 'rgba(10, 42, 67, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  inactiveBadge: {
    position: 'absolute',
    top: normalize(6),
    right: normalize(6),
    width: normalize(22),
    height: normalize(22),
    borderRadius: normalize(11),
    backgroundColor: 'rgba(211, 47, 47, 0.9)', // Color rojo suave del tema
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(10),
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },

  textContainer: {
    flex: 1,
  },

  name: {
    ...textStyles.body,
    color: colors.text,
    fontWeight: '600',
    fontSize: normalize(13),
    marginBottom: 2,
    letterSpacing: -0.1,
  },

  description: {
    ...textStyles.caption1,
    color: colors.textSecondary,
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
    color: '#0A2A43', // Azul oscuro profesional
    fontWeight: '700',
    fontSize: normalize(14),
  },

  originalPrice: {
    ...textStyles.caption1,
    color: colors.gray500,
    textDecorationLine: 'line-through',
    marginRight: 4,
    fontSize: normalize(11),
  },

  discountedPrice: {
    ...textStyles.callout,
    color: '#2E7D32', // Verde profesional para descuento
    fontWeight: '700',
    fontSize: normalize(14),
  },

  customizationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 42, 67, 0.08)',
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(3),
    borderRadius: normalize(6),
    gap: normalize(3),
  },

  customizationText: {
    ...textStyles.caption2,
    color: '#0A2A43',
    fontWeight: '600',
    fontSize: normalize(9),
  },

  addButton: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra más sutil
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },

  promotionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },

  promoBadge: {
    backgroundColor: '#2E7D32', // Verde profesional
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  promoText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
