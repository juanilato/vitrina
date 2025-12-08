/**
 * CategoryCard for Horizontal Carousel
 * Simple, clean design for horizontal scrolling
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { textStyles, spacing } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { normalize } from '../../utils/responsive';
import { CompanyPreview } from '../../types/company';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = normalize(140); // Ancho fijo para carrusel
const CARD_HEIGHT = normalize(160);

interface CategoryCard3DProps {
  id: string;
  nombre: string;
  icono?: string;
  companies?: CompanyPreview[];
  onPress?: () => void;
}

// Colores simples y limpios
const categoryColors = [
  '#FF6B6B', // Rojo
  '#4ECDC4', // Turquesa
  '#45B7D1', // Azul
  '#FFA07A', // Salmón
  '#98D8C8', // Menta
  '#F7DC6F', // Amarillo
  '#BB8FCE', // Púrpura
  '#85C1E2', // Azul claro
  '#F8B88B', // Naranja
  '#A8E6CF', // Verde menta
];

// Mapeo de iconos
const categoryIconMap: Record<string, string> = {
  'coffee': 'coffee',
  'shopping-bag': 'shopping-bag',
  'edit-3': 'edit-3',
  'utensils': 'utensils',
  'cpu': 'cpu',
  'home': 'home',
  'star': 'star',
  'truck': 'truck',
  'activity': 'activity',
  'briefcase': 'briefcase',
  'heart': 'heart',
  'book': 'book',
  'palette': 'palette',
};

const getIconForCategory = (categoryName: string, defaultIcon?: string): string => {
  if (defaultIcon && categoryIconMap[defaultIcon]) {
    return defaultIcon;
  }
  const normalized = categoryName.toLowerCase().trim();
  if (categoryIconMap[normalized]) {
    return categoryIconMap[normalized];
  }
  return 'tag';
};

export const CategoryCard3D: React.FC<CategoryCard3DProps> = ({
  id,
  nombre,
  icono,
  companies = [],
  onPress,
}) => {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const colorIndex = (id || '0').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % categoryColors.length;
  const backgroundColor = categoryColors[colorIndex];
  const iconName = getIconForCategory(nombre, icono);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/category/${id}?name=${nombre}`);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.cardContainer}
      onPress={handlePress}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: backgroundColor,
          },
        ]}
      >
        {/* Static Icon */}
        <View style={styles.iconWrapper}>
          <Feather
            name={iconName as any}
            size={normalize(48)}
            color="#FFFFFF"
          />
        </View>

        {/* Category Name */}
        <Text style={styles.categoryName} numberOfLines={2}>
          {nombre}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    marginRight: spacing.md,
    marginVertical: spacing.md,
  },

  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: normalize(16),
    padding: spacing.md,
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },

  iconWrapper: {
    width: normalize(80),
    height: normalize(80),
    borderRadius: normalize(40),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  categoryName: {
    ...textStyles.callout,
    fontSize: normalize(14),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
