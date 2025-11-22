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

// Gradientes para modo oscuro (elegantes y suaves)
const darkGradients = [
  ['#3D5A80', '#4A6FA5'],   // Azul acero
  ['#2D5A4A', '#3D7A6A'],   // Verde bosque
  ['#4A5568', '#5A6578'],   // Gris azulado
  ['#8B5A3C', '#A06A4C'],   // Marrón cálido
  ['#5D4E6D', '#6D5E7D'],   // Púrpura suave
  ['#6B4C5A', '#7B5C6A'],   // Rosa oscuro
  ['#3D6B6D', '#4D7B7D'],   // Verde azulado
  ['#7A5C4D', '#8A6C5D'],   // Terracota
  ['#4D5B6A', '#5D6B7A'],   // Azul grisáceo
  ['#5A6B5A', '#6A7B6A'],   // Verde oliva
  ['#6D5A4A', '#7D6A5A'],   // Bronce
  ['#4A6A7A', '#5A7A8A'],   // Azul océano
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
