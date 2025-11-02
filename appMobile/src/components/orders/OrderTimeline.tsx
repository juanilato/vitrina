/**
 * Order Timeline Component
 * Timeline que muestra el progreso del pedido
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrderStatus, TipoEntrega } from '../../types/order';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { textStyles as typography } from '../../theme/typography';

interface TimelineStep {
  status: OrderStatus;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const getTimelineSteps = (tipoEntrega: TipoEntrega): TimelineStep[] => {
  const deliverySteps: TimelineStep[] = [
    { status: 'pendiente_confirmacion', label: 'Pedido realizado', icon: 'receipt' },
    { status: 'confirmado', label: 'Confirmado', icon: 'checkmark-circle' },
    { status: 'en_proceso', label: 'En preparación', icon: 'restaurant' },
    { status: 'esperando_delivery', label: 'Esperando delivery', icon: 'person' },
    { status: 'en_camino', label: 'En camino', icon: 'bicycle' },
    { status: 'entregado', label: 'Entregado', icon: 'checkmark-done-circle' },
  ];

  const pickupSteps: TimelineStep[] = [
    { status: 'pendiente_confirmacion', label: 'Pedido realizado', icon: 'receipt' },
    { status: 'confirmado', label: 'Confirmado', icon: 'checkmark-circle' },
    { status: 'en_proceso', label: 'En preparación', icon: 'restaurant' },
    { status: 'esperando_retiro', label: 'Listo para retiro', icon: 'bag-check' },
    { status: 'entregado', label: 'Retirado', icon: 'checkmark-done-circle' },
  ];

  return tipoEntrega === 'delivery' ? deliverySteps : pickupSteps;
};

interface OrderTimelineProps {
  currentStatus: OrderStatus;
  tipoEntrega: TipoEntrega;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  currentStatus,
  tipoEntrega,
  createdAt,
  updatedAt,
}) => {
  // Si el pedido está cancelado o no confirmado, mostramos un timeline diferente
  if (currentStatus === 'cancelado' || currentStatus === 'no_confirmado') {
    const isCancelled = currentStatus === 'cancelado';
    return (
      <View style={styles.container}>
        <View style={styles.cancelledContainer}>
          <View style={styles.cancelledIconContainer}>
            <Ionicons name="close-circle" size={48} color={colors.error} />
          </View>
          <Text style={styles.cancelledTitle}>
            {isCancelled ? 'Pedido cancelado' : 'Pedido no confirmado'}
          </Text>
          <Text style={styles.cancelledSubtitle}>
            {isCancelled
              ? 'Este pedido fue cancelado'
              : 'El pedido no fue confirmado por el negocio'}
          </Text>
        </View>
      </View>
    );
  }

  const timelineSteps = getTimelineSteps(tipoEntrega);
  const currentStepIndex = timelineSteps.findIndex((step) => step.status === currentStatus);

  return (
    <View style={styles.container}>
      {timelineSteps.map((step, index) => {
        const isCompleted = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;

        return (
          <View key={step.status} style={styles.stepContainer}>
            {/* Icon */}
            <View style={styles.iconSection}>
              <View
                style={[
                  styles.iconContainer,
                  isCompleted && styles.iconContainerCompleted,
                  isCurrent && styles.iconContainerCurrent,
                ]}
              >
                <Ionicons
                  name={step.icon}
                  size={20}
                  color={isCompleted ? colors.white : colors.gray400}
                />
              </View>

              {/* Line connector */}
              {index < timelineSteps.length - 1 && (
                <View
                  style={[
                    styles.lineConnector,
                    isCompleted && styles.lineConnectorCompleted,
                  ]}
                />
              )}
            </View>

            {/* Content */}
            <View style={styles.contentSection}>
              <Text
                style={[
                  styles.stepLabel,
                  isCompleted && styles.stepLabelCompleted,
                  isCurrent && styles.stepLabelCurrent,
                ]}
              >
                {step.label}
              </Text>

              {isCurrent && updatedAt && (
                <Text style={styles.stepTime}>
                  {formatDate(updatedAt)}
                </Text>
              )}

              {index === 0 && (
                <Text style={styles.stepTime}>
                  {formatDate(createdAt)}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },

  stepContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },

  iconSection: {
    alignItems: 'center',
    marginRight: spacing.md,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.gray200,
  },

  iconContainerCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  iconContainerCurrent: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },

  lineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: colors.gray200,
    marginTop: spacing.xs,
  },

  lineConnectorCompleted: {
    backgroundColor: colors.primary,
  },

  contentSection: {
    flex: 1,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },

  stepLabel: {
    ...typography.bodyMedium,
    color: colors.gray600,
    marginBottom: spacing.xs,
  },

  stepLabelCompleted: {
    color: colors.gray900,
    fontWeight: '600',
  },

  stepLabelCurrent: {
    color: colors.accent,
    fontWeight: '700',
  },

  stepTime: {
    ...typography.bodySmall,
    color: colors.gray500,
  },

  cancelledContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },

  cancelledIconContainer: {
    marginBottom: spacing.md,
  },

  cancelledTitle: {
    ...typography.h3,
    color: colors.error,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },

  cancelledSubtitle: {
    ...typography.bodyMedium,
    color: colors.gray600,
    textAlign: 'center',
  },
});
