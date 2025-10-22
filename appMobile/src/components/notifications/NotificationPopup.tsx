/**
 * Notification Popup Component
 * Displays a floating notification popup at the top of the screen
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Notification } from '../../types/notification';
import { colors, spacing } from '../../theme';
import { textStyles as typography } from '../../theme/typography';

interface NotificationPopupProps {
  notification: Notification;
  visible: boolean;
  onDismiss: () => void;
}

export const NotificationPopup: React.FC<NotificationPopupProps> = ({
  notification,
  visible,
  onDismiss,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const translateY = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in from top
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out to top
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -200,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, opacity]);

  const handlePress = () => {
    onDismiss();

    // Navigate based on notification type
    if (notification.tipo === 'pedido_creado' || notification.tipo === 'pedido_actualizado') {
      if (notification.metadata?.pedidoId) {
        router.push(`/order/${notification.metadata.pedidoId}` as any);
      } else {
        router.push('/(tabs)/orders' as any);
      }
    }
  };

  const getIcon = () => {
    switch (notification.tipo) {
      case 'pedido_creado':
        return { name: 'receipt' as const, color: colors.success };
      case 'pedido_actualizado':
        return { name: 'refresh-circle' as const, color: colors.accent };
      case 'pedido_rechazado':
        return { name: 'close-circle' as const, color: colors.error };
      default:
        return { name: 'notifications' as const, color: colors.primary };
    }
  };

  const icon = getIcon();

  // Format total amount if available
  const totalAmount = notification.metadata?.totalAmount
    ? `$${notification.metadata.totalAmount.toLocaleString('es-AR')}`
    : null;

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 10,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.popup}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.content}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
            <Ionicons name={icon.name} size={24} color={icon.color} />
          </View>

          {/* Text */}
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              {notification.metadata?.icono && (
                <Text style={styles.emoji}>{notification.metadata.icono}</Text>
              )}
              <Text style={styles.title} numberOfLines={1}>
                {notification.titulo}
              </Text>
            </View>
            <Text style={styles.message} numberOfLines={2}>
              {notification.mensaje}
            </Text>
            {totalAmount && (
              <Text style={styles.amount}>{totalAmount}</Text>
            )}
          </View>

          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={20} color={colors.gray600} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  popup: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },

  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textContainer: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs / 2,
  },

  emoji: {
    fontSize: 16,
  },

  title: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.gray900,
    flex: 1,
  },

  message: {
    ...typography.bodySmall,
    color: colors.gray600,
    lineHeight: 18,
    marginBottom: spacing.xs / 2,
  },

  amount: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.secondary,
  },

  closeButton: {
    padding: spacing.xs,
  },
});
