/**
 * RatingStars Component
 * Componente para mostrar y seleccionar calificación con estrellas
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, fontWeights } from '../../theme';

interface RatingStarsProps {
  rating: number; // Calificación actual (1-5)
  onRatingChange?: (rating: number) => void; // Callback cuando cambia la calificación
  size?: 'sm' | 'md' | 'lg'; // Tamaño de las estrellas
  readonly?: boolean; // Si es solo lectura (no interactivo)
  showLabel?: boolean; // Mostrar texto con la calificación
  color?: string; // Color de las estrellas activas
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  onRatingChange,
  size = 'md',
  readonly = false,
  showLabel = false,
  color = colors.orange,
}) => {
  const starSize = size === 'sm' ? 16 : size === 'lg' ? 32 : 24;
  const maxStars = 5;

  const handleStarPress = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const renderStar = (index: number) => {
    const starRating = index + 1;
    const isFilled = starRating <= rating;
    const isInteractive = !readonly && onRatingChange;

    const StarComponent = isInteractive ? TouchableOpacity : View;

    return (
      <StarComponent
        key={index}
        onPress={isInteractive ? () => handleStarPress(starRating) : undefined}
        activeOpacity={0.7}
        style={styles.starContainer}
      >
        <Ionicons
          name={isFilled ? 'star' : 'star-outline'}
          size={starSize}
          color={isFilled ? color : colors.gray300}
        />
      </StarComponent>
    );
  };

  const getRatingText = () => {
    if (rating === 0) return 'Sin calificación';
    if (rating === 1) return 'Muy malo';
    if (rating === 2) return 'Malo';
    if (rating === 3) return 'Regular';
    if (rating === 4) return 'Bueno';
    return 'Excelente';
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {Array.from({ length: maxStars }, (_, index) => renderStar(index))}
      </View>
      {showLabel && (
        <Text style={[styles.label, styles[`${size}Label`]]}>
          {getRatingText()} {rating > 0 && `(${rating}/5)`}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    marginHorizontal: spacing.xs / 2,
  },
  label: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },
  smLabel: {
    fontSize: fontSizes.xs,
  },
  mdLabel: {
    fontSize: fontSizes.sm,
  },
  lgLabel: {
    fontSize: fontSizes.md,
  },
});
