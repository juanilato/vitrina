/**
 * CategoryCard Component
 * Displays a category card with icon, name, and company logos inline
 * Friendly design with companies visible directly in the card
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { textStyles, spacing, COLORS } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { normalize } from '../../utils/responsive';
import { CompanyPreview } from '../../types/company';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_MARGIN = spacing.md;
const CARD_WIDTH = width - (CARD_MARGIN * 2);

interface CategoryCardProps {
  id: string;
  nombre: string;
  icono?: string;
  variant?: 'normal' | 'wide' | 'tall';
  companyCount?: number;
  companies?: CompanyPreview[];
}

// Gradientes modernos y naturales
const categoryGradients = [
  ['#667eea', '#764ba2'], // Púrpura-Violeta
  ['#f093fb', '#f5576c'], // Rosa-Rojo
  ['#4facfe', '#00f2fe'], // Azul-Cyan
  ['#43e97b', '#38f9d7'], // Verde-Mint
  ['#fa709a', '#fee140'], // Rosa-Amarillo
  ['#30cfd0', '#330867'], // Cyan-Púrpura
  ['#a8edea', '#fed6e3'], // Menta-Rosado
  ['#ff9a56', '#ff6a88'], // Naranja-Rojo
  ['#2e2e78', '#662d91'], // Azul oscuro-Púrpura
  ['#08aeea', '#2af598'], // Cyan-Verde
];

// Mapeo de iconos Feather según categoría
const categoryIconMap: Record<string, string> = {
  'comida': 'utensils',
  'bebida': 'coffee',
  'postre': 'cake',
  'café': 'coffee',
  'hamburguesa': 'target',
  'pizza': 'circle',
  'sushi': 'package',
  'pollo': 'zap',
  'ensalada': 'leaf',
  'fruta': 'apple',
  'bebidas': 'droplet',
  'ropa': 'layers',
  'electrónica': 'cpu',
  'belleza': 'star',
  'hogar': 'home',
  'deportes': 'activity',
  'libros': 'book',
  'juguetes': 'award',
  'mascotas': 'heart',
};

const getIconForCategory = (categoryName: string, defaultIcon: string): string => {
  if (defaultIcon && defaultIcon !== '') {
    return defaultIcon;
  }
  const normalized = categoryName.toLowerCase().trim();
  return categoryIconMap[normalized] || 'tag';
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  id,
  nombre,
  icono,
  variant = 'normal',
  companyCount = 0,
  companies = [],
}) => {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const gradientIndex = (id || '0').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % categoryGradients.length;
  const gradient = categoryGradients[gradientIndex];
  const iconName = getIconForCategory(nombre, icono);

  const cardStyle = [
    styles.card,
    variant === 'wide' && styles.cardWide,
    variant === 'tall' && styles.cardTall,
    isDark && styles.cardDark,
  ];

  const handleCompanyPress = (companyId: string) => {
    router.push(`/company/${companyId}`);
  };

  const handleCategoryPress = () => {
    // Si hay una sola empresa, navegar a ella
    if (companies && companies.length === 1) {
      handleCompanyPress(companies[0].id);
    }
    // Si hay múltiples, podrías agregar lógica adicional
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={cardStyle}
      onPress={handleCategoryPress}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Feather
            name={iconName as any}
            size={normalize(32)}
            color="#FFFFFF"
            style={styles.featherIcon}
          />
          <Text style={styles.name} numberOfLines={2}>
            {nombre}
          </Text>
        </View>

        {/* Companies Grid - Mostrar solo iconos/logos */}
        {companies && companies.length > 0 && (
          <View style={styles.companiesGrid}>
            {companies.map((company, index) => (
              <TouchableOpacity
                key={company.id || index}
                style={styles.companyIconWrapper}
                onPress={() => handleCompanyPress(company.id)}
                activeOpacity={0.7}
              >
                {company.logo ? (
                  <Image
                    source={{ uri: company.logo }}
                    style={styles.companyIcon}
                  />
                ) : (
                  <View style={[styles.companyIcon, styles.companyIconPlaceholder]}>
                    <Text style={styles.companyInitial}>
                      {company.name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    minHeight: normalize(140),
    marginBottom: spacing.lg,
    borderTopLeftRadius: normalize(18),
    borderTopRightRadius: normalize(18),
    borderBottomLeftRadius: normalize(18),
    borderBottomRightRadius: 0, // Una esquina puntiaguda
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardDark: {
    elevation: 6,
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardWide: {
    width: width - (CARD_MARGIN * 2),
    minHeight: normalize(130),
  },
  cardTall: {
    minHeight: normalize(160),
  },

  gradient: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
    gap: spacing.md,
  },

  // Header Section
  headerSection: {
    gap: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },

  featherIcon: {
    marginRight: normalize(4),
  },

  name: {
    ...textStyles.subheadline,
    fontSize: normalize(16),
    color: '#FFFFFF',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    flex: 1,
  },

  // Companies Grid
  companiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'flex-start',
    marginTop: spacing.sm,
  },

  companyIconWrapper: {
    width: '20%',
    aspectRatio: 1,
    borderRadius: normalize(14),
    overflow: 'hidden',
  },

  companyIcon: {
    width: '100%',
    height: '100%',
    borderRadius: normalize(14),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  companyIconPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },

  companyInitial: {
    fontSize: normalize(14),
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
