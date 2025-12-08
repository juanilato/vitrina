/**
 * Compact Active Order Card Component
 * Versión compacta y friendly del ActiveOrderCard
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PedidoWithDetails } from '../../types/order';
import { COLORS, SIZES, SHADOWS } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { normalize } from '../../utils/responsive';

interface CompactActiveOrderCardProps {
  order: PedidoWithDetails;
}

export const CompactActiveOrderCard: React.FC<CompactActiveOrderCardProps> = ({ order }) => {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const statusConfig: Record<string, { label: string; icon: string; color: string }> = {
    pendiente_confirmacion: { label: 'Por confirmar', icon: 'time-outline', color: '#F26B1D' },
    confirmado: { label: 'Confirmado', icon: 'checkmark-circle', color: '#2E9D66' },
    en_proceso: { label: 'Preparando', icon: 'flame-outline', color: '#007ACC' },
    esperando_delivery: { label: 'Esperando', icon: 'bicycle-outline', color: '#F26B1D' },
    en_camino: { label: 'En camino', icon: 'bicycle', color: '#0A2A43' },
    entregado: { label: 'Entregado', icon: 'checkmark-done', color: '#2E9D66' },
    esperando_retiro: { label: 'Listo', icon: 'storefront', color: '#2E9D66' },
    cancelado: { label: 'Cancelado', icon: 'close-circle', color: '#DC2626' },
  };

  const config = statusConfig[order.estado] || statusConfig.pendiente_confirmacion;
  const totalItems = order.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0;

  const handlePress = () => {
    router.push(`/order/${order.id}`);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: isDark ? '#2a2a2a' : '#ffffff' },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={[config.color, `${config.color}dd`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statusBar}
      >
        <Ionicons
          name={config.icon as any}
          size={SIZES.iconMd}
          color={COLORS.white}
        />
        <Text style={styles.statusLabel}>{config.label}</Text>
      </LinearGradient>

      <View style={styles.content}>
        {order.empresa?.logo && (
          <View style={styles.logoWrapper}>
            <Image
              source={{ uri: order.empresa.logo }}
              style={styles.logo}
            />
          </View>
        )}

        <View style={styles.infoColumn}>
          <Text style={[styles.companyName, { color: colors.text }]} numberOfLines={1}>
            {order.empresa?.name || 'Pedido'}
          </Text>
          <Text style={[styles.items, { color: colors.textSecondary }]}>
            {totalItems} artículo{totalItems !== 1 ? 's' : ''}
          </Text>
          <Text style={[styles.total, { color: colors.primary }]} numberOfLines={1}>
            ${(order.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={SIZES.iconMd}
          color={colors.primary}
          style={styles.chevron}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SIZES.screenPadding,
    marginBottom: SIZES.lg,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    ...SHADOWS.md,
  },

  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
  },

  statusLabel: {
    color: COLORS.white,
    fontSize: SIZES.fontSm,
    fontWeight: SIZES.fontWeightSemibold,
    flex: 1,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.lg,
    gap: SIZES.md,
  },

  logoWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  logo: {
    width: normalize(70),
    height: normalize(70),
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.gray100,
    resizeMode: 'cover',
  },

  logoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.primary}15`,
  },

  logoText: {
    fontSize: SIZES.fontXl,
    fontWeight: SIZES.fontWeightBold,
    color: COLORS.primary,
  },

  infoColumn: {
    flex: 1,
  },

  companyName: {
    fontSize: SIZES.fontBase,
    fontWeight: SIZES.fontWeightSemibold,
    marginBottom: SIZES.xs,
  },

  items: {
    fontSize: SIZES.fontSm,
    marginBottom: SIZES.xs,
  },

  total: {
    fontSize: SIZES.fontLg,
    fontWeight: SIZES.fontWeightBold,
  },

  chevron: {
    marginLeft: SIZES.sm,
  },
});
