/**
 * Floating Basket Button — Adaptive Formal Black & Grey Variant
 * Contraste automático basado en buttonColor
 */

import React, { useState } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
import { AuthModal } from '../auth/AuthModal';
import { spacing } from '../../theme/spacing';
import { textStyles as typography } from '../../theme/typography';
import { formatPrice } from '../../utils/formatPrice';

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

  // Calcular items y total relevantes (globales o por empresa)
  const { totalItems, total } = React.useMemo(() => {
    // Si no hay companyId, usar valores globales del carrito
    if (!companyId) {
      return {
        totalItems: cart.totalItems,
        total: cart.total
      };
    }

    // Si hay companyId, filtrar items de esa empresa
    const companyItems = cart.items.filter(item => item.companyId === companyId);

    // Si no hay items de esta empresa, devolver 0
    if (companyItems.length === 0) {
      return { totalItems: 0, total: 0 };
    }

    // Calcular total de items
    const itemsCount = companyItems.reduce((sum, item) => sum + item.quantity, 0);

    // Calcular precio total (copiado de CartContext logic)
    const totalPrice = companyItems.reduce((sum, item) => {
      // Convertir precio a número
      const priceRaw = item.product.precio || item.product.price || 0;
      const price = typeof priceRaw === 'string' ? parseFloat(priceRaw) : priceRaw;

      // Calcular precio con agregados
      const agregadosPrice = item.agregados?.reduce(
        (acc, agregado) => {
          const agregadoPrecio = typeof agregado.precio === 'string'
            ? parseFloat(agregado.precio)
            : agregado.precio;
          return acc + agregadoPrecio;
        },
        0
      ) || 0;

      // Calcular precio con ingredientes extras
      const ingredientesExtrasPrice = item.ingredientesExtras?.reduce(
        (acc, ingredienteExtra) => {
          const precioExtra = ingredienteExtra.productoIngrediente.precioExtra;
          const precio = typeof precioExtra === 'string'
            ? parseFloat(precioExtra)
            : (precioExtra || 0);
          return acc + (precio * ingredienteExtra.cantidad);
        },
        0
      ) || 0;

      return sum + (price + agregadosPrice + ingredientesExtrasPrice) * item.quantity;
    }, 0);

    return {
      totalItems: itemsCount,
      total: totalPrice
    };
  }, [cart.items, cart.totalItems, cart.total, companyId]);

  if (totalItems === 0) return null;

  const buildCartRoute = () => {
    let route = '/(tabs)/cart';
    const params: string[] = [];

    if (from) {
      params.push(`from=${from}`);
    }

    if (storeId && from === 'store') {
      params.push(`storeId=${storeId}`);
    }

    if (companyName && from === 'company') {
      params.push(`companyName=${companyName}`);
    }

    if (params.length > 0) {
      route += '?' + params.join('&');
    }

    return route;
  };

  const handlePress = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    router.push(buildCartRoute() as any);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    router.push(buildCartRoute() as any);
  };

  const dark = isColorDark(buttonColor);
  const textColor = dark ? '#f5f5f5' : '#1a1a1a';
  const subTextColor = dark
    ? 'rgba(255,255,255,0.6)'
    : 'rgba(0,0,0,0.55)';
  const borderColor = dark
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(0,0,0,0.08)';
  const counterBg = dark
    ? 'rgba(255,255,255,0.18)'
    : 'rgba(0,0,0,0.08)';

  return (
    <>
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: buttonColor,
            borderColor,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {/* Ícono */}
        <View style={styles.iconContainer}>
          <Ionicons name="basket-outline" size={22} color={textColor} />
          {totalItems > 0 && (
            <View style={[styles.counter, { backgroundColor: counterBg }]}>
              <Text style={[styles.counterText, { color: textColor }]}>
                {totalItems > 99 ? '99+' : totalItems}
              </Text>
            </View>
          )}
        </View>

        {/* Texto */}
        <View style={styles.textContainer}>
          <Text style={[styles.totalText, { color: textColor }]}>
            ${formatPrice(total)}
          </Text>
          <Text style={[styles.subText, { color: subTextColor }]}>
            Sin envío
          </Text>
        </View>
      </TouchableOpacity>

      {/* Auth Modal */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    borderWidth: 1,

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 6,
      },
    }),
  },
  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36,
  },
  counter: {
    position: 'absolute',
    top: -3,
    right: -3,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 0.5,
  },
  counterText: {
    ...typography.caption,
    fontSize: 9.5,
    fontWeight: '600',
  },
  textContainer: {
    marginLeft: 10,
  },
  totalText: {
    ...typography.bodyMedium,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  subText: {
    ...typography.caption,
    fontSize: 10,
    marginTop: 1,
  },
});
