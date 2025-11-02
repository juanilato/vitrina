/**
 * CartSummary Component
 * iOS Modern Design - Resumen del carrito con totales
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../theme';
import { formatPrice } from '../../utils/formatPrice';

interface CartSummaryProps {
  subtotal: number;
  deliveryFee?: number;
  discount?: number;
  total: number;
  itemCount: number;
  onCheckout: () => void;
  buttonColor?: string;
  buttonText?: string;
  isLoading?: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  deliveryFee = 0,
  discount = 0,
  total,
  itemCount,
  onCheckout,
  buttonColor = colors.primary,
  buttonText = 'Continuar',
  isLoading = false,
}) => {
  return (
    <View style={styles.container}>
      {/* Summary Items */}
      <View style={styles.summarySection}>
        <View style={styles.row}>
          <Text style={styles.label}>Subtotal</Text>
          <Text style={styles.value}>${formatPrice(subtotal)}</Text>
        </View>

        {deliveryFee > 0 && (
          <View style={styles.row}>
            <View style={styles.labelWithIcon}>
              <Ionicons name="bicycle-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.label}>Envío</Text>
            </View>
            <Text style={styles.value}>${formatPrice(deliveryFee)}</Text>
          </View>
        )}

        {discount > 0 && (
          <View style={styles.row}>
            <View style={styles.labelWithIcon}>
              <Ionicons name="pricetag-outline" size={16} color={colors.success} />
              <Text style={[styles.label, styles.discountLabel]}>Descuento</Text>
            </View>
            <Text style={[styles.value, styles.discountValue]}>
              -${formatPrice(discount)}
            </Text>
          </View>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${formatPrice(total)}</Text>
        </View>
      </View>

      {/* Checkout Button */}
      <TouchableOpacity
        style={[
          styles.checkoutButton,
          { backgroundColor: buttonColor },
          isLoading && styles.checkoutButtonDisabled,
        ]}
        onPress={onCheckout}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          <View style={styles.buttonLeft}>
            <Ionicons name="bag-handle" size={20} color={colors.white} />
            <Text style={styles.itemCount}>{itemCount}</Text>
          </View>
          <Text style={styles.buttonText}>{buttonText}</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.white} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    ...shadows.lg,
  },

  summarySection: {
    marginBottom: spacing.lg,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  label: {
    ...textStyles.body,
    color: colors.textSecondary,
  },

  value: {
    ...textStyles.body,
    color: colors.text,
    fontWeight: '600',
  },

  discountLabel: {
    color: colors.success,
  },

  discountValue: {
    color: colors.success,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    ...textStyles.title3,
    color: colors.text,
    fontWeight: '700',
  },

  totalValue: {
    ...textStyles.title2,
    color: colors.primary,
    fontWeight: '800',
  },

  checkoutButton: {
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadows.md,
  },

  checkoutButtonDisabled: {
    opacity: 0.6,
  },

  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  buttonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  itemCount: {
    ...textStyles.body,
    color: colors.white,
    fontWeight: '700',
  },

  buttonText: {
    ...textStyles.headline,
    color: colors.white,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
});
