/**
 * OrderStatusTimeline Component
 * Timeline animado para mostrar el progreso del pedido
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { OrderStatus, TipoEntrega } from '../../types/order';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { textStyles } from '../../theme/typography';

const { width } = Dimensions.get('window');

interface TimelineStep {
  status: OrderStatus;
  label: string;
  shortLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  tipoEntrega: TipoEntrega;
  compact?: boolean; // Para versión más pequeña en el dashboard
}

const DELIVERY_STEPS: TimelineStep[] = [
  {
    status: 'pendiente_confirmacion',
    label: 'Esperando confirmación',
    shortLabel: 'Pendiente',
    icon: 'time-outline',
  },
  {
    status: 'confirmado',
    label: 'Confirmado',
    shortLabel: 'Confirmado',
    icon: 'checkmark-circle',
  },
  {
    status: 'en_proceso',
    label: 'En preparación',
    shortLabel: 'Preparando',
    icon: 'restaurant',
  },
  {
    status: 'en_camino',
    label: 'En camino',
    shortLabel: 'En camino',
    icon: 'bicycle',
  },
  {
    status: 'entregado',
    label: 'Entregado',
    shortLabel: 'Entregado',
    icon: 'checkmark-done-circle',
  },
];

const RETIRO_STEPS: TimelineStep[] = [
  {
    status: 'pendiente_confirmacion',
    label: 'Esperando confirmación',
    shortLabel: 'Pendiente',
    icon: 'time-outline',
  },
  {
    status: 'confirmado',
    label: 'Confirmado',
    shortLabel: 'Confirmado',
    icon: 'checkmark-circle',
  },
  {
    status: 'en_proceso',
    label: 'En preparación',
    shortLabel: 'Preparando',
    icon: 'restaurant',
  },
  {
    status: 'esperando_retiro',
    label: 'Listo para retiro',
    shortLabel: 'Listo',
    icon: 'storefront',
  },
  {
    status: 'entregado',
    label: 'Retirado',
    shortLabel: 'Retirado',
    icon: 'checkmark-done-circle',
  },
];

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  currentStatus,
  tipoEntrega,
  compact = false,
}) => {
  const steps = tipoEntrega === 'delivery' ? DELIVERY_STEPS : RETIRO_STEPS;
  const currentIndex = steps.findIndex((step) => step.status === currentStatus);

  // Animaciones
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnims = useRef(steps.map(() => new Animated.Value(1))).current;
  const scaleAnims = useRef(steps.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Animar barra de progreso
    Animated.spring(progressAnim, {
      toValue: currentIndex >= 0 ? currentIndex : 0,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();

    // Animar aparición de círculos completados
    steps.forEach((_, index) => {
      if (index <= currentIndex) {
        Animated.spring(scaleAnims[index], {
          toValue: 1,
          friction: 6,
          tension: 40,
          delay: index * 100,
          useNativeDriver: true,
        }).start();
      }
    });

    // Pulso en el paso actual
    if (currentIndex >= 0 && currentIndex < steps.length - 1) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnims[currentIndex], {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnims[currentIndex], {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [currentIndex]);

  const getStepColor = (index: number) => {
    if (index < currentIndex) return colors.success; // Completado
    if (index === currentIndex) return colors.primary; // Actual
    return colors.gray300; // Pendiente
  };

  const getStepBackgroundColor = (index: number) => {
    if (index < currentIndex) return colors.success;
    if (index === currentIndex) return colors.primary;
    return colors.gray200;
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, steps.length - 1],
    outputRange: ['0%', '100%'],
  });

  if (compact) {
    // Versión compacta para el dashboard
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactBar}>
          <Animated.View
            style={[
              styles.compactProgress,
              {
                width: progressWidth,
                backgroundColor: currentIndex === steps.length - 1 ? colors.success : colors.primary,
              },
            ]}
          />
          {steps.map((step, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;
            const color = getStepColor(index);

            return (
              <Animated.View
                key={step.status}
                style={[
                  styles.compactDot,
                  {
                    left: `${(index / (steps.length - 1)) * 100}%`,
                    backgroundColor: getStepBackgroundColor(index),
                    transform: [
                      { scale: scaleAnims[index] },
                      ...(isActive ? [{ scale: pulseAnims[index] }] : []),
                    ],
                  },
                ]}
              >
                {(isCompleted || isActive) && (
                  <Ionicons
                    name={isCompleted ? 'checkmark' : step.icon}
                    size={compact ? 10 : 12}
                    color={colors.white}
                  />
                )}
              </Animated.View>
            );
          })}
        </View>
        <Text style={styles.compactLabel}>
          {steps[currentIndex]?.label || 'Procesando...'}
        </Text>
      </View>
    );
  }

  // Versión completa para la página de detalle
  return (
    <View style={styles.container}>
      {/* Pasos del timeline con líneas conectoras */}
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const isPending = index > currentIndex;
          const color = getStepColor(index);

          return (
            <View key={step.status} style={styles.stepRow}>
              {/* Línea conectora y círculo */}
              <View style={styles.stepIndicatorColumn}>
                {/* Línea superior (excepto para el primer paso) */}
                {index > 0 && (
                  <View
                    style={[
                      styles.connectorLine,
                      isCompleted && styles.connectorLineActive,
                    ]}
                  />
                )}

                {/* Círculo del paso */}
                <Animated.View
                  style={[
                    styles.stepCircleContainer,
                    {
                      transform: [
                        { scale: scaleAnims[index] },
                        ...(isActive ? [{ scale: pulseAnims[index] }] : []),
                      ],
                    },
                  ]}
                >
                  {/* Pulso de fondo para el paso actual */}
                  {isActive && (
                    <Animated.View
                      style={[
                        styles.pulseBg,
                        {
                          backgroundColor: color,
                          opacity: 0.2,
                          transform: [{ scale: pulseAnims[index] }],
                        },
                      ]}
                    />
                  )}

                  <View
                    style={[
                      styles.stepCircle,
                      {
                        backgroundColor: getStepBackgroundColor(index),
                        borderColor: color,
                        borderWidth: isActive ? 3 : 2,
                      },
                    ]}
                  >
                    <Ionicons
                      name={isCompleted ? 'checkmark' : step.icon}
                      size={isActive ? 20 : 16}
                      color={isCompleted || isActive ? colors.white : colors.gray400}
                    />
                  </View>
                </Animated.View>

                {/* Línea inferior (excepto para el último paso) */}
                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.connectorLine,
                      isCompleted && styles.connectorLineActive,
                    ]}
                  />
                )}
              </View>

              {/* Contenido del paso */}
              <View style={styles.stepContent}>
                <Text
                  style={[
                    styles.stepLabel,
                    (isActive || isCompleted) && styles.stepLabelActive,
                  ]}
                >
                  {step.label}
                </Text>

                {/* Badge para el paso actual */}
                {isActive && (
                  <View style={[styles.activeBadge, { backgroundColor: color }]}>
                    <Text style={styles.activeBadgeText}>En proceso</Text>
                  </View>
                )}

                {/* Checkmark para completados */}
                {isCompleted && (
                  <View style={styles.completedBadge}>
                    <Ionicons name="checkmark" size={10} color={colors.success} />
                    <Text style={styles.completedBadgeText}>Completado</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Versión completa
  container: {
    paddingVertical: spacing.sm,
  },
  stepsContainer: {
    gap: 0,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 64,
  },
  stepIndicatorColumn: {
    width: 48,
    alignItems: 'center',
  },
  connectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.gray200,
  },
  connectorLineActive: {
    backgroundColor: colors.success,
  },
  stepCircleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseBg: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  stepContent: {
    flex: 1,
    paddingLeft: spacing.md,
    paddingTop: 8,
    gap: 6,
  },
  stepLabel: {
    ...textStyles.bodyMedium,
    fontSize: 15,
    color: colors.gray600,
    fontWeight: '500',
  },
  stepLabelActive: {
    ...textStyles.bodyMedium,
    fontSize: 15,
    fontWeight: '700',
    color: colors.gray900,
  },
  activeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadgeText: {
    ...textStyles.caption2,
    fontSize: 10,
    color: colors.white,
    fontWeight: '700',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  completedBadgeText: {
    ...textStyles.caption2,
    fontSize: 10,
    color: colors.success,
    fontWeight: '600',
  },

  // Versión compacta
  compactContainer: {
    gap: spacing.sm,
  },
  compactBar: {
    height: 6,
    backgroundColor: colors.gray200,
    borderRadius: 3,
    overflow: 'visible',
    position: 'relative',
  },
  compactProgress: {
    position: 'absolute',
    height: '100%',
    borderRadius: 3,
  },
  compactDot: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    marginLeft: -9,
    marginTop: -6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  compactLabel: {
    ...textStyles.caption1,
    fontSize: 11,
    color: colors.white,
    fontWeight: '600',
    opacity: 0.95,
  },
});
