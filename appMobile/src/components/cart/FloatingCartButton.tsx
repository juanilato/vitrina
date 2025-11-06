/**
 * Floating Cart Button
 * Botón flotante que muestra la cantidad de items en el carrito
 */

import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '../../contexts/CartContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { textStyles as typography } from '../../theme/typography';
import { formatPrice } from '../../utils/formatPrice';

interface FloatingCartButtonProps {
  buttonColor?: string;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ buttonColor = colors.primary }) => {
  const router = useRouter();
  const { cart } = useCart();

  // No mostrar el botón si el carrito está vacío
  if (cart.totalItems === 0) {
    return null;
  }

  const handlePress = () => {
    router.push('/(tabs)/cart');
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: buttonColor }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.button}>
        <Ionicons name="cart" size={24} color={colors.white} />
        {cart.totalItems > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {cart.totalItems > 99 ? '99+' : cart.totalItems}
            </Text>
          </View>
        )}
      </View>

      {/* Total amount */}
      <View style={styles.amountContainer}>
        <Text style={styles.amountValue}>
          ${formatPrice(cart.total)}
        </Text>
        <Text style={styles.amountLabel}>(sin envío)</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    fontSize: 11,
  },
  amountContainer: {
    marginLeft: spacing.sm,
    alignItems: 'flex-start',
  },
  amountLabel: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 9,
    marginTop: 1,
  },
  amountValue: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
});
