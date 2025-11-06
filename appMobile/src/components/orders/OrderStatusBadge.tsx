/**
 * Order Status Badge Component
 * Badge que muestra el estado del pedido con color correspondiente
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrderStatus } from '../../types/order';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { textStyles as typography } from '../../theme/typography';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  showIcon?: boolean;
  size?: 'small' | 'medium';
}

const statusConfig: Record<OrderStatus, {
  label: string;
  color: string;
  backgroundColor: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = {
  pendiente_confirmacion: {
    label: 'Pendiente confirmación',
    color: colors.warning,
    backgroundColor: '#FFF0E6',
    icon: 'hourglass-outline',
  },
  confirmado: {
    label: 'Confirmado',
    color: colors.accent,
    backgroundColor: '#E5F4FF',
    icon: 'checkmark-circle-outline',
  },
  en_proceso: {
    label: 'En Proceso',
    color: colors.primary,
    backgroundColor: '#E8EEF3',
    icon: 'restaurant-outline',
  },
  esperando_delivery: {
    label: 'Esperando Delivery',
    color: '#8B5CF6',
    backgroundColor: '#EDE9FE',
    icon: 'person-outline',
  },
  en_camino: {
    label: 'En camino',
    color: '#06B6D4',
    backgroundColor: '#CFFAFE',
    icon: 'bicycle-outline',
  },
  entregado: {
    label: 'Entregado',
    color: colors.success,
    backgroundColor: '#E8F5EE',
    icon: 'checkmark-done-circle-outline',
  },
  esperando_retiro: {
    label: 'Listo para Retiro',
    color: '#7C3AED',
    backgroundColor: '#EDE9FE',
    icon: 'bag-check-outline',
  },
  no_confirmado: {
    label: 'No Confirmado',
    color: colors.error,
    backgroundColor: '#FFE5E5',
    icon: 'close-circle-outline',
  },
  cancelado: {
    label: 'Cancelado',
    color: colors.gray700,
    backgroundColor: colors.gray200,
    icon: 'close-circle-outline',
  },
};

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  showIcon = true,
  size = 'medium',
}) => {
  const config = statusConfig[status] || {
    label: status || 'Desconocido',
    color: colors.gray700,
    backgroundColor: colors.gray200,
    icon: 'help-circle-outline' as keyof typeof Ionicons.glyphMap,
  };

  if (!statusConfig[status]) {
    console.warn(`Unknown order status: ${status}`);
  }

  const isSmall = size === 'small';

  return (
    <View style={[
      styles.container,
      { backgroundColor: config.backgroundColor },
      isSmall && styles.containerSmall,
    ]}>
      {showIcon && (
        <Ionicons
          name={config.icon}
          size={isSmall ? 14 : 16}
          color={config.color}
        />
      )}
      <Text style={[
        styles.text,
        { color: config.color },
        isSmall && styles.textSmall,
      ]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  containerSmall: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    gap: 4,
    borderRadius: 8,
  },
  text: {
    ...typography.caption1,
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  textSmall: {
    fontSize: 10,
  },
});
