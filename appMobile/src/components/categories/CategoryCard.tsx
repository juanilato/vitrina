/**
 * CategoryCard Component
 * Displays a category card with icon and name
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, textStyles, spacing } from '../../theme';

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

const gradients = [
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

export const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  nombre,
  icono,
  onPress,
  variant = 'normal',
}) => {
  // Generar un color basado en el ID
  const colorIndex = (id || '0').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
  const gradient = gradients[colorIndex];

  const cardStyle = [
    styles.card,
    variant === 'wide' && styles.cardWide,
    variant === 'tall' && styles.cardTall,
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
          <Text style={styles.name} numberOfLines={2}>
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
    height: 110,
    marginBottom: spacing.sm,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardWide: {
    width: width - (CARD_MARGIN * 2),
    height: 100,
  },
  cardTall: {
    height: 130,
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
    fontSize: 32,
    marginBottom: 2,
  },
  name: {
    ...textStyles.subheadline,
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
