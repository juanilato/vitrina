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
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
  buttonColor = '#1a1a1a',
}) => {
  const router = useRouter();
  const { cart } = useCart();
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (cart.totalItems === 0) return null;

  const handlePress = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    router.push('/(tabs)/cart');
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    router.push('/(tabs)/cart');
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
          {cart.totalItems > 0 && (
            <View style={[styles.counter, { backgroundColor: counterBg }]}>
              <Text style={[styles.counterText, { color: textColor }]}>
                {cart.totalItems > 99 ? '99+' : cart.totalItems}
              </Text>
            </View>
          )}
        </View>

        {/* Texto */}
        <View style={styles.textContainer}>
          <Text style={[styles.totalText, { color: textColor }]}>
            ${formatPrice(cart.total)}
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
