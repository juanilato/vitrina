/**
 * Category Selector Component
 * Horizontal scrollable/draggable category cards selector
 * Positioned near search bar for quick filtering
 */

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { textStyles, spacing, COLORS } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { normalize } from '../../utils/responsive';

interface Category {
  id: string;
  nombre: string;
  icono?: string;
}

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId?: string;
  onSelectCategory: (categoryId: string) => void;
}

// Map de categorías comunes a iconos lindos de MaterialCommunityIcons
const categoryIconMap: Record<string, string> = {
  'comida': 'food',
  'bebida': 'glass-mug',
  'postre': 'cupcake',
  'café': 'coffee',
  'hamburguesa': 'hamburger',
  'pizza': 'pizza',
  'sushi': 'rice',
  'pollo': 'chicken',
  'ensalada': 'leaf',
  'fruta': 'fruit-watermelon',
  'bebidas': 'glass-mug',
  'almohada': 'pillow',
  'ropa': 'hanger',
  'electrónica': 'phone',
  'belleza': 'palette',
  'hogar': 'home',
  'deportes': 'basketball',
  'libros': 'book',
  'juguetes': 'puzzle',
  'mascotas': 'paw',
};

// Colores modernos para el selector
const selectorColors = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA15E',
  '#BC6C25',
  '#E8B4F1',
  '#70C1B3',
  '#FF6B9D',
];

const getIconForCategory = (categoryName: string, defaultIcon: string): string => {
  if (defaultIcon && defaultIcon !== '') {
    return defaultIcon;
  }
  const normalized = categoryName.toLowerCase().trim();
  return categoryIconMap[normalized] || 'tag-multiple';
};

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const { colors, isDark } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Categorías</Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
      >
        {categories.map((category, index) => {
          const isSelected = selectedCategoryId === category.id;
          const colorIndex = index % selectorColors.length;
          const cardColor = selectorColors[colorIndex];
          const iconName = getIconForCategory(category.nombre, category.icono);

          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                {
                  backgroundColor: isSelected ? cardColor : isDark ? '#2a2a2a' : '#f5f5f5',
                  borderColor: cardColor,
                  borderWidth: isSelected ? 0 : 2,
                },
              ]}
              onPress={() => onSelectCategory(category.id)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={iconName as any}
                size={normalize(24)}
                color={isSelected ? '#FFFFFF' : cardColor}
                style={styles.icon}
              />
              <Text
                style={[
                  styles.categoryName,
                  {
                    color: isSelected ? '#FFFFFF' : colors.text,
                  },
                ]}
                numberOfLines={1}
              >
                {category.nombre}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },

  label: {
    ...textStyles.caption1,
    fontSize: normalize(11),
    fontWeight: '600',
    paddingHorizontal: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },

  categoryCard: {
    minWidth: normalize(100),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: normalize(12),
    alignItems: 'center',
    gap: spacing.xs,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  icon: {
    marginRight: normalize(2),
  },

  categoryName: {
    ...textStyles.caption1,
    fontSize: normalize(12),
    fontWeight: '600',
  },
});
