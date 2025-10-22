/**
 * Order Status Badge Component
 * Badge que muestra el estado del pedido con color correspondiente
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { textStyles as typography } from '../../theme/typography';

export type OrderStatus =
  | 'pendiente'
  | 'pendiente_confirmacion'
  | 'confirmado'
  | 'preparando'
  | 'en_camino'
  | 'entregado'
  | 'cancelado';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  showIcon?: boolean;
}

const statusConfig: Record<OrderStatus, {
  label: string;
  color: string;
  backgroundColor: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = {
  pendiente: {
    label: 'Pendiente',
    color: colors.gray700,
    backgroundColor: colors.gray200,
    icon: 'time-outline',
  },
  pendiente_confirmacion: {
    label: 'Pendiente confirmación',
    color: colors.warning,
    backgroundColor: '#FFF0E6',
    icon: 'hourglass-outline',
  },
  confirmado: {
    label: 'Confirmado',
    color: colors.accent,  // Azul brillante
    backgroundColor: '#E5F4FF',
    icon: 'checkmark-circle-outline',
  },
  preparando: {
    label: 'Preparando',
    color: colors.orange,  // Naranja
    backgroundColor: '#FFF0E6',
    icon: 'restaurant-outline',
  },
  en_camino: {
    label: 'En camino',
    color: colors.primary,  // Azul oscuro
    backgroundColor: '#E8EEF3',
    icon: 'bicycle-outline',
  },
  entregado: {
    label: 'Entregado',
    color: colors.success,  // Verde
    backgroundColor: '#E8F5EE',
    icon: 'checkmark-done-circle-outline',
  },
  cancelado: {
    label: 'Cancelado',
    color: colors.error,
    backgroundColor: '#FFE5E5',
    icon: 'close-circle-outline',
  },
};

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  showIcon = true,
}) => {
  const config = statusConfig[status] || {
    label: status || 'Desconocido',
    color: colors.gray700,
    backgroundColor: colors.gray200,
    icon: 'help-circle-outline' as keyof typeof Ionicons.glyphMap,
  };

  if (!config) {
    console.warn(`Unknown order status: ${status}`);
  }

  return (
    <View style={[styles.container, { backgroundColor: config.backgroundColor }]}>
      {showIcon && (
        <Ionicons name={config.icon} size={16} color={config.color} />
      )}
      <Text style={[styles.text, { color: config.color }]}>
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
    paddingVertical: spacing.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption1,
    fontWeight: '600',
    fontSize: 12,
  },
});
