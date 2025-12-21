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
const CARD_WIDTH = (width - normalize(56)) / 2; // 2 columnas con padding
const CARD_HEIGHT = normalize(90); // Mucho más compactas

interface CategoryCard3DProps {
  id: string;
  nombre: string;
  icono?: string;
  companies?: CompanyPreview[];
  onPress?: () => void;
}

// Colores suaves para iconos
const iconColors = [
  '#0A2A43', // Azul oscuro principal
  '#1565C0', // Azul medio
  '#0277BD', // Azul cyan
  '#00838F', // Cyan oscuro
  '#00695C', // Verde azulado
  '#2E7D32', // Verde
  '#558B2F', // Verde lima
  '#F57C00', // Naranja
  '#E64A19', // Naranja rojizo
  '#D32F2F', // Rojo
  '#C2185B', // Rosa
  '#7B1FA2', // Púrpura
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

  const colorIndex = (id || '0').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % iconColors.length;
  const iconColor = iconColors[colorIndex];
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
      <View style={[styles.card, { backgroundColor: isDark ? colors.gray100 : '#F8F9FA' }]}>
        {/* Icon con fondo translúcido */}
        <View style={styles.iconWrapper}>
          <Feather
            name={iconName as any}
            size={normalize(22)}
            color={iconColor}
          />
        </View>

        {/* Category Name simple y limpio */}
        <View style={styles.nameContainer}>
          <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={2}>
            {nombre}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: spacing.md,
  },

  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: normalize(12),
    padding: normalize(10),
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra muy sutil
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },

  iconWrapper: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(18),
    backgroundColor: 'rgba(10, 42, 67, 0.08)', // Fondo translúcido azul
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(6),
  },

  nameContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },

  categoryName: {
    ...textStyles.callout,
    fontSize: normalize(10),
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
});
