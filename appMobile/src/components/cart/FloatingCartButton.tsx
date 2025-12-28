/**
 * Floating Basket Button — Adaptive Formal Black & Grey Variant
 * Contraste automático basado en buttonColor
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../auth/AuthModal';
import { CartPreviewModal } from './CartPreviewModal';
import { spacing } from '../../theme/spacing';
import { textStyles as typography } from '../../theme/typography';
import { formatPrice } from '../../utils/formatPrice';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

/** Utilidad simple para detectar si un color es oscuro o claro */
function isColorDark(hexColor: string): boolean {
  const c = hexColor.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 140;
}

interface HorarioAtencion {
  id: number;
  day: string;
  abreMin: number;
  cierraMin: number;
  cerrado: boolean;
  slotIndex: number;
}

interface FloatingCartButtonProps {
  buttonColor?: string;
  from?: 'store' | 'dashboard' | 'company';
  storeId?: string;
  companyName?: string;
  companyId?: string;
  horarios?: HorarioAtencion[];
  envioDomicilio?: boolean;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
  buttonColor = '#1a1a1a',
  from,
  storeId,
  companyName,
  companyId,
  horarios,
  envioDomicilio = false,
}) => {
  const router = useRouter();
  const { cart } = useCart();
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  // Función para verificar si está abierto ahora
  const isOpenNow = React.useMemo(() => {
    if (!horarios || horarios.length === 0) return true; // Si no hay horarios, asumimos abierto

    const now = new Date();
    const currentDayIndex = now.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
    const dayMap = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
    const currentDay = dayMap[currentDayIndex];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Filtrar horarios del día actual
    const todaySchedules = horarios.filter(h => h.day === currentDay && !h.cerrado);

    // Verificar si está dentro de algún horario
    for (const schedule of todaySchedules) {
      if (schedule.cierraMin > 1440) {
        // Cruza medianoche
        if (currentMinutes >= schedule.abreMin || currentMinutes <= (schedule.cierraMin - 1440)) {
          return true;
        }
      } else {
        // Horario normal
        if (currentMinutes >= schedule.abreMin && currentMinutes <= schedule.cierraMin) {
          return true;
        }
      }
    }

    // También verificar si es continuación del día anterior
    const prevDayIndex = (currentDayIndex - 1 + 7) % 7;
    const prevDay = dayMap[prevDayIndex];
    const yesterdaySchedules = horarios.filter(h => h.day === prevDay && !h.cerrado);

    for (const schedule of yesterdaySchedules) {
      if (schedule.cierraMin > 1440) {
        const remainingMinutes = schedule.cierraMin - 1440;
        if (currentMinutes <= remainingMinutes) {
          return true;
        }
      }
    }

    return false;
  }, [horarios]);

  // Calcular items y total relevantes (globales o por empresa)
  const { totalItems, total, subtotal } = React.useMemo(() => {
    // Si no hay companyId, usar valores globales del carrito
    if (!companyId) {
      return {
        totalItems: cart.totalItems,
        total: cart.total,
        subtotal: cart.subtotal
      };
    }

    // Si hay companyId, filtrar items de esa empresa
    const companyItems = cart.items.filter(item => item.companyId === companyId);

    // Si no hay items de esta empresa, devolver 0
    if (companyItems.length === 0) {
      return { totalItems: 0, total: 0, subtotal: 0 };
    }

    // Calcular total de items
    const itemsCount = companyItems.reduce((sum, item) => sum + item.quantity, 0);

    // Calcular subtotal (precio original) y total (precio con descuento)
    const { subtotal, total } = companyItems.reduce((acc, item) => {
      // Precio base del producto
      const priceRaw = item.product.precio || item.product.price || 0;
      const price = typeof priceRaw === 'string' ? parseFloat(priceRaw) : priceRaw;

      // Precio de agregados
      const agregadosPrice = item.agregados?.reduce(
        (sum, agregado) => {
          const agregadoPrecio = typeof agregado.precio === 'string'
            ? parseFloat(agregado.precio)
            : agregado.precio;
          return sum + agregadoPrecio;
        },
        0
      ) || 0;

      // Precio de ingredientes extras
      const ingredientesExtrasPrice = item.ingredientesExtras?.reduce(
        (sum, ingredienteExtra) => {
          const precioExtra = ingredienteExtra.productoIngrediente.precioExtra;
          const p = typeof precioExtra === 'string'
            ? parseFloat(precioExtra)
            : (precioExtra || 0);
          return sum + (p * ingredienteExtra.cantidad);
        },
        0
      ) || 0;

      const itemUnitPrice = price + agregadosPrice + ingredientesExtrasPrice;
      const itemSubtotal = itemUnitPrice * item.quantity;

      // El descuento ya viene calculado en item.discount desde el CartContext
      const itemDiscount = item.discount || 0;
      const itemTotal = itemSubtotal - itemDiscount;

      return {
        subtotal: acc.subtotal + itemSubtotal,
        total: acc.total + itemTotal
      };
    }, { subtotal: 0, total: 0 });

    return {
      totalItems: itemsCount,
      subtotal,
      total: Math.max(0, total)
    };
  }, [cart.items, cart.totalItems, cart.total, companyId]);

  // Entrance animation
  useEffect(() => {
    if (totalItems > 0) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [totalItems]);

  if (totalItems === 0) return null;

  const handlePress = () => {
    // Animate press
    Animated.sequence([
      Animated.timing(pressAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pressAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (from === 'company' && companyId) {
      setShowPreviewModal(true);
      return;
    }

    const params: any = {};
    if (from) params.from = from;
    if (storeId && from === 'store') params.storeId = storeId;
    if (companyName && from === 'company') params.companyName = companyName;

    router.push({
      pathname: '/(tabs)/cart',
      params
    });
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);

    if (from === 'company' && companyId) {
      setShowPreviewModal(true);
      return;
    }

    const params: any = {};
    if (from) params.from = from;
    if (storeId && from === 'store') params.storeId = storeId;
    if (companyName && from === 'company') params.companyName = companyName;

    router.push({
      pathname: '/(tabs)/cart',
      params
    });
  };

  const dark = isColorDark(buttonColor);
  const isDark = dark; // Alias para consistencia
  const textColor = dark ? '#f5f5f5' : '#1a1a1a';
  const subTextColor = dark
    ? 'rgba(255,255,255,0.7)'
    : 'rgba(0,0,0,0.6)';
  const counterBg = dark
    ? 'rgba(255,255,255,0.2)'
    : 'rgba(0,0,0,0.1)';

  // Calcular color más claro para el gradiente
  const lighterColor = React.useMemo(() => {
    const hex = buttonColor.replace('#', '');
    const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + 30);
    const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + 30);
    const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + 30);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }, [buttonColor]);

  return (
    <>
      <Animated.View
        style={[
          styles.wrapper,
          {
            transform: [{ scale: scaleAnim }, { scale: pressAnim }],
          },
        ]}
      >
        {/* Botón estilo Duolingo/PedidosYa - Colorido y con personalidad */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePress}
          style={styles.mainButton}
        >
          <LinearGradient
            colors={[lighterColor, buttonColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <View style={styles.buttonContent}>
              {/* Sección izquierda - Icono circular con animación */}
              <View style={styles.iconCircle}>
                <View style={styles.iconInnerCircle}>
                  <Ionicons name="bag-handle" size={26} color={buttonColor} />
                </View>
                <View style={[styles.badge, { borderColor: lighterColor }]}>
                  <Text style={styles.badgeText}>{totalItems}</Text>
                </View>
              </View>

              {/* Sección central - Info con emojis y personalidad */}
              <View style={styles.centerInfo}>
                <Text style={styles.funLabel}>¡Tu pedido te espera! 🛍️</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.bigPrice}>${formatPrice(total)}</Text>
                  {subtotal > total && (
                    <View style={styles.discountPill}>
                      <Text style={[styles.discountText, { color: buttonColor }]}>
                        ¡-${formatPrice(subtotal - total)}!
                      </Text>
                    </View>
                  )}
                </View>
              </View>


            </View>

            {/* Efecto de brillo animado en la parte superior */}
            <View style={styles.topShine} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Auth Modal */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Cart Preview Modal */}
      {companyId && (
        <CartPreviewModal
          visible={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          companyId={companyId}
          companyName={companyName || ''}
          buttonColor={buttonColor}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: spacing.lg + 12,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
  },

  // Botón principal - Estilo Duolingo/PedidosYa
  mainButton: {
    borderRadius: 28,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  buttonGradient: {
    borderRadius: 28,
    position: 'relative',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 16,
  },

  // Icono circular con fondo blanco
  iconCircle: {
    position: 'relative',
  },
  iconInnerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B9D',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderWidth: 3,
    borderColor: '#00D9A5',
    ...Platform.select({
      ios: {
        shadowColor: '#FF6B9D',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },

  // Sección central con personalidad
  centerInfo: {
    flex: 1,
    gap: 6,
  },
  funLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bigPrice: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  discountPill: {
    backgroundColor: '#FFD93D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#00B388',
    letterSpacing: 0.2,
  },

  // Mini indicadores
  miniIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },
  miniIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  miniText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.9,
    letterSpacing: 0.2,
  },

  // Flecha circular
  arrowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  // Brillo superior
  topShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
});
