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
import { useCategoryTransition } from '../../contexts/CategoryTransitionContext';

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
  'alimentos y bebidas': 'coffee',
  'moda y accesorios': 'shopping-bag',
  'arte y manualidades': 'edit-3',
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
  const { startTransition } = useCategoryTransition();

  const gradientIndex = (id || '0').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % categoryGradients.length;
  const gradient = categoryGradients[gradientIndex];
  const iconName = getIconForCategory(nombre, icono || '');

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
    console.log('[CategoryCard] Iniciando transición:', { nombre, iconName });

    // Iniciar la animación de cortina
    startTransition(nombre, iconName);

    // Navegar a la pantalla de categoría después de que la cortina baje
    setTimeout(() => {
      console.log('[CategoryCard] Navegando a categoría');
      router.push(`/category/${id}?name=${nombre}`);
    }, 600); // Esperar a que la cortina termine de bajar con animación spring
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
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
          <View style={styles.featherIcon}>
            <Feather
              name={iconName as any}
              size={normalize(26)}
              color="#FFFFFF"
            />
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {nombre}
          </Text>
        </View>

        {/* Companies Grid - Mostrar solo iconos/logos */}
        {companies && companies.length > 0 && (
          <View style={styles.companiesGrid}>
            {companies.slice(0, 4).map((company, index) => (
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
            {companies.length > 4 && (
              <View style={[styles.companyIconWrapper, styles.moreIndicator]}>
                <Text style={styles.moreText}>+{companies.length - 4}</Text>
              </View>
            )}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    minHeight: normalize(120),
    marginBottom: spacing.lg,
    borderRadius: normalize(16),
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardDark: {
    elevation: 5,
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardWide: {
    width: width - (CARD_MARGIN * 2),
    minHeight: normalize(120),
  },
  cardTall: {
    minHeight: normalize(140),
  },

  gradient: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },

  // Header Section - Desestructurado
  headerSection: {
    gap: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  featherIcon: {
    width: normalize(52),
    height: normalize(52),
    borderRadius: normalize(14),
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  name: {
    ...textStyles.subheadline,
    fontSize: normalize(16),
    color: '#FFFFFF',
    fontWeight: '700',
    flex: 1,
    marginLeft: spacing.xs,
    marginTop: spacing.xs,
  },

  // Companies Grid - Iconos chiquitos
  companiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'flex-start',
    marginTop: spacing.xs,
    alignItems: 'center',
  },

  companyIconWrapper: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(8),
    overflow: 'hidden',
  },

  companyIcon: {
    width: '100%',
    height: '100%',
    borderRadius: normalize(8),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },

  companyIconPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },

  companyInitial: {
    fontSize: normalize(10),
    fontWeight: '700',
    color: '#FFFFFF',
  },

  moreIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },

  moreText: {
    fontSize: normalize(10),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
