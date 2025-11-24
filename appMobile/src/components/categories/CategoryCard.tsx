/**
 * CategoryCard Component
 * Displays a category card with icon and name
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { textStyles, spacing } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { normalize, wp } from '../../utils/responsive';

const { width } = Dimensions.get('window');
const CARD_MARGIN = spacing.md;
const CARD_WIDTH = (width - (CARD_MARGIN * 3)) / 2;

interface CategoryCardProps {
  id: string;
  nombre: string;
  icono?: string;
  onPress: () => void;
  variant?: 'normal' | 'wide' | 'tall';
}

// Gradientes para modo claro (vibrantes y coloridos)
const lightGradients = [
  ['#FF6B6B', '#FF8E53'],
  ['#4ECDC4', '#44A08D'],
  ['#A8E6CF', '#56CCF2'],
  ['#FFD93D', '#F6C23E'],
  ['#B4A7D6', '#8E7CC3'],
  ['#FF9A8B', '#FF6A88'],
  ['#43C6AC', '#191654'],
  ['#FA709A', '#FEE140'],
  ['#30CFD0', '#330867'],
  ['#A8EDEA', '#FED6E3'],
  ['#FFE985', '#FA742B'],
  ['#89F7FE', '#66A6FF'],
];

// Gradientes para modo oscuro (colores vibrantes adaptados para fondo negro)
const darkGradients = [
  ['#E84545', '#D63031'],   // Rojo vibrante
  ['#00B894', '#00A085'],   // Verde esmeralda
  ['#0984E3', '#0770C7'],   // Azul brillante
  ['#FDCB6E', '#E6B95C'],   // Amarillo dorado
  ['#A66CFF', '#8B5CF6'],   // Púrpura vibrante
  ['#FF7675', '#E66767'],   // Coral
  ['#00CEC9', '#00B5B0'],   // Turquesa
  ['#FF9F43', '#E8893A'],   // Naranja
  ['#6C5CE7', '#5B4DD6'],   // Índigo
  ['#55EFC4', '#4CD9B3'],   // Menta
  ['#FD79A8', '#E66B95'],   // Rosa
  ['#74B9FF', '#5FA8F0'],   // Azul cielo
];

export const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  nombre,
  icono,
  onPress,
  variant = 'normal',
}) => {
  const { colors, isDark } = useTheme();

  // Seleccionar gradientes según el tema
  const gradients = isDark ? darkGradients : lightGradients;

  // Generar un color basado en el ID
  const colorIndex = (id || '0').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
  const gradient = gradients[colorIndex];

  const cardStyle = [
    styles.card,
    variant === 'wide' && styles.cardWide,
    variant === 'tall' && styles.cardTall,
    isDark && styles.cardDark,
  ];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={cardStyle}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {icono && <Text style={styles.icon}>{icono}</Text>}
          <Text style={[styles.name, isDark && styles.nameDark]} numberOfLines={2}>
            {nombre}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    minHeight: normalize(110),
    marginBottom: spacing.sm,
    borderRadius: normalize(12),
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardDark: {
    elevation: 4,
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  cardWide: {
    width: width - (CARD_MARGIN * 2),
    minHeight: normalize(100),
  },
  cardTall: {
    minHeight: normalize(130),
  },
  gradient: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'flex-end',
  },
  content: {
    gap: spacing.xs,
  },
  icon: {
    fontSize: normalize(32),
    marginBottom: 2,
  },
  name: {
    ...textStyles.subheadline,
    fontSize: normalize(14),
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  nameDark: {
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowRadius: 3,
  },
});
