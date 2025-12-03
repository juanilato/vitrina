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

/** Utilidad simple para detectar si un color es oscuro o claro */
function isColorDark(hexColor: string): boolean {
  const c = hexColor.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 140;
}

interface FloatingCartButtonProps {
  buttonColor?: string;
  from?: 'store' | 'dashboard' | 'company';
  storeId?: string;
  companyName?: string;
  companyId?: string;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
  buttonColor = '#1a1a1a',
  from,
  storeId,
  companyName,
  companyId,
}) => {
  const router = useRouter();
  const { cart } = useCart();
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Animation refs
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

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
  const textColor = dark ? '#f5f5f5' : '#1a1a1a';
  const subTextColor = dark
    ? 'rgba(255,255,255,0.7)'
    : 'rgba(0,0,0,0.6)';
  const counterBg = dark
    ? 'rgba(255,255,255,0.2)'
    : 'rgba(0,0,0,0.1)';

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
        <TouchableOpacity
          activeOpacity={1}
          onPress={handlePress}
          style={styles.touchable}
        >
          {/* Main Container with Gradient or Solid Color */}
          <View style={[styles.container, { backgroundColor: buttonColor }]}>
            {/* Optional: Add a subtle gradient overlay for depth if desired, 
                 but keeping it clean with solid color as per "Formal Black & Grey" theme 
                 unless user specifically asked for gradients. 
                 The user asked for "more attractive", so let's add a subtle shine/gloss effect 
                 using a very transparent white gradient if it's a dark button.
             */}
            {dark && (
              <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            )}

            {/* Content Row */}
            <View style={styles.contentRow}>
              {/* Left: Icon & Counter */}
              <View style={styles.leftSection}>
                <View style={[styles.iconCircle, { backgroundColor: counterBg }]}>
                  <Ionicons name="cart" size={20} color={textColor} />
                </View>
                <View style={styles.counterBadge}>
                  <Text style={[styles.counterText, { color: buttonColor }]}>
                    {totalItems}
                  </Text>
                </View>
              </View>

              {/* Middle: Text Info */}
              <View style={styles.textSection}>
                <Text style={[styles.viewCartText, { color: subTextColor }]}>
                  Ver pedido
                </Text>
                <View style={styles.priceRow}>
                  <Text style={[styles.totalText, { color: textColor }]}>
                    ${formatPrice(total)}
                  </Text>
                  {subtotal > total && (
                    <Text style={[styles.strikethroughText, { color: subTextColor }]}>
                      ${formatPrice(subtotal)}
                    </Text>
                  )}
                </View>
              </View>

              {/* Right: Arrow */}
              <View style={styles.rightSection}>
                <Ionicons name="chevron-forward" size={20} color={textColor} style={{ opacity: 0.8 }} />
              </View>
            </View>
          </View>
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
    bottom: spacing.lg + 10, // Lifted up a bit
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  touchable: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    minHeight: 64,
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    position: 'relative',
    marginRight: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: 'transparent', // Or match button color if needed
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  counterText: {
    fontSize: 10,
    fontWeight: '800',
  },
  textSection: {
    flex: 1,
    justifyContent: 'center',
  },
  viewCartText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  totalText: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  strikethroughText: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  rightSection: {
    marginLeft: 8,
  },
});
