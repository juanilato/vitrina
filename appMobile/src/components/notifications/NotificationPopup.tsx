/**
 * Notification Popup Component
 * Modern toast-style popup with gradient design
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
import { LinearGradient } from 'expo-linear-gradient';
// import { BlurView } from 'expo-blur'; // Removed for better online compatibility
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
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
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

  const getNotificationStyle = (tipo: string) => {
    switch (tipo) {
      case 'pedido_creado':
      case 'order_created':
        return {
          icon: 'checkmark-circle' as const,
          gradientColors: ['#10b981', '#059669'],
          shadowColor: '#10b981',
        };
      case 'pedido_actualizado':
      case 'order_updated':
        return {
          icon: 'reload-circle' as const,
          gradientColors: ['#3b82f6', '#2563eb'],
          shadowColor: '#3b82f6',
        };
      case 'pedido_rechazado':
      case 'order_cancelled':
        return {
          icon: 'close-circle' as const,
          gradientColors: ['#ef4444', '#dc2626'],
          shadowColor: '#ef4444',
        };
      case 'order_delivered':
        return {
          icon: 'checkmark-done-circle' as const,
          gradientColors: ['#8b5cf6', '#7c3aed'],
          shadowColor: '#8b5cf6',
        };
      default:
        return {
          icon: 'notifications' as const,
          gradientColors: [colors.primary, colors.secondary],
          shadowColor: colors.primary,
        };
    }
  };

  const style = getNotificationStyle(notification.tipo);

  // Format time ago
  const formatTimeAgo = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    return 'Hace un momento';
  };

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
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={handlePress}
        style={styles.touchable}
      >
        {/* Glass effect - simplified for compatibility */}
        {Platform.OS === 'ios' ? (
          <View style={[styles.blurContainer, styles.iosBackground]}>
            <View style={styles.content}>
              {/* Icon con gradiente */}
              <LinearGradient
                colors={style.gradientColors as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.iconContainer, { shadowColor: style.shadowColor }]}
              >
                {notification.metadata?.icono ? (
                  <Text style={styles.iconEmoji}>{notification.metadata.icono}</Text>
                ) : (
                  <Ionicons name={style.icon} size={28} color="#fff" />
                )}
              </LinearGradient>

              {/* Texto */}
              <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.title} numberOfLines={1}>
                    {notification.titulo}
                  </Text>
                  <View style={styles.unreadDot} />
                </View>
                <Text style={styles.message} numberOfLines={2}>
                  {notification.mensaje}
                </Text>
                {notification.metadata?.totalAmount && (
                  <Text style={styles.amount}>
                    ${notification.metadata.totalAmount.toLocaleString('es-AR')}
                  </Text>
                )}
                <Text style={styles.time}>{formatTimeAgo(notification.createdAt)}</Text>
              </View>

              {/* Botón cerrar */}
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
          </View>
        ) : (
          <View style={[styles.blurContainer, styles.androidBackground]}>
            <View style={styles.content}>
              {/* Icon con gradiente */}
              <LinearGradient
                colors={style.gradientColors as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.iconContainer, { shadowColor: style.shadowColor }]}
              >
                {notification.metadata?.icono ? (
                  <Text style={styles.iconEmoji}>{notification.metadata.icono}</Text>
                ) : (
                  <Ionicons name={style.icon} size={28} color="#fff" />
                )}
              </LinearGradient>

              {/* Texto */}
              <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                  <Text style={styles.title} numberOfLines={1}>
                    {notification.titulo}
                  </Text>
                  <View style={styles.unreadDot} />
                </View>
                <Text style={styles.message} numberOfLines={2}>
                  {notification.mensaje}
                </Text>
                {notification.metadata?.totalAmount && (
                  <Text style={styles.amount}>
                    ${notification.metadata.totalAmount.toLocaleString('es-AR')}
                  </Text>
                )}
                <Text style={styles.time}>{formatTimeAgo(notification.createdAt)}</Text>
              </View>

              {/* Botón cerrar */}
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
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
  },

  touchable: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },

  blurContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },

  androidBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
  },

  iosBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },

  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    gap: spacing.sm,
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  iconEmoji: {
    fontSize: 32,
  },

  textContainer: {
    flex: 1,
    paddingTop: 2,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },

  title: {
    ...typography.bodyMedium,
    fontSize: 15,
    fontWeight: '700',
    color: colors.gray900,
    flex: 1,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },

  message: {
    ...typography.bodySmall,
    fontSize: 13,
    color: colors.gray700,
    lineHeight: 18,
    marginBottom: 4,
  },

  amount: {
    ...typography.bodySmall,
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 4,
  },

  time: {
    ...typography.caption1,
    fontSize: 11,
    color: colors.gray500,
    fontWeight: '500',
  },

  closeButton: {
    padding: 4,
    marginTop: -2,
  },
});
