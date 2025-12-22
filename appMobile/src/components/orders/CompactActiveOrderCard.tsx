/**
 * Compact Active Order Card Component
 * Diseño minimalista y limpio
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PedidoWithDetails } from '../../types/order';
import { statusColors } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { normalize } from '../../utils/responsive';

interface CompactActiveOrderCardProps {
  order: PedidoWithDetails;
}

export const CompactActiveOrderCard: React.FC<CompactActiveOrderCardProps> = ({ order }) => {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const config = statusColors.order[order.estado] || statusColors.order.pendiente_confirmacion;
  const totalItems = order.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0;

  const handlePress = () => {
    router.push(`/order/${order.id}`);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Sin fondo, solo contenido directo sobre el header */}
      <View style={styles.content}>
        {/* Status badge inline con icono */}
        <View style={styles.statusRow}>
          <Ionicons
            name={config.icon as any}
            size={normalize(16)}
            color="#FFFFFF"
          />
          <Text style={styles.statusLabel}>{config.label}</Text>
        </View>

        {/* Info principal */}
        <View style={styles.mainInfo}>
          {order.empresa?.logo && (
            <Image
              source={{ uri: order.empresa.logo }}
              style={styles.logo}
            />
          )}

          <View style={styles.infoColumn}>
            <Text style={styles.companyName} numberOfLines={1}>
              {order.empresa?.name || 'Pedido'}
            </Text>
            <Text style={styles.items}>
              {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'} • ${(order.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={normalize(18)}
            color="rgba(255, 255, 255, 0.8)"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    // Sin estilos extras, completamente transparente
  },

  content: {
    gap: normalize(10),
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(6),
  },

  statusLabel: {
    color: '#FFFFFF',
    fontSize: normalize(12),
    fontWeight: '600',
    opacity: 0.9,
  },

  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(12),
  },

  logo: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(8),

  },

  infoColumn: {
    flex: 1,
  },

  companyName: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: normalize(2),
  },

  items: {
    fontSize: normalize(13),
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
});
