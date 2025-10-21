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

export const FloatingCartButton: React.FC = () => {
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
      style={styles.container}
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
        <Text style={styles.amountLabel}>Total</Text>
        <Text style={styles.amountValue}>
          ${cart.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </Text>
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
    backgroundColor: colors.orange,  // Naranja para CTAs
    borderRadius: 30,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,  // Verde para icono
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
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
    marginRight: spacing.xs,
  },
  amountLabel: {
    ...typography.caption,
    color: colors.gray300,
    fontSize: 11,
  },
  amountValue: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: '700',
  },
});
