/**
 * CategoryCard Component
 * Displays a category card with icon, name, and company logos inline
 * Friendly design with companies visible directly in the card
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

// Colores para las category cards - vibrantess y modernos
const categoryColors = [
  '#FF6B6B', // Rojo
  '#4ECDC4', // Turquesa
  '#FFD93D', // Amarillo
  '#6BCB77', // Verde
  '#4D96FF', // Azul
  '#FF9F43', // Naranja
  '#A29BFE', // Púrpura
  '#FD79A8', // Rosa
  '#00B894', // Verde oscuro
  '#0984E3', // Azul oscuro
];

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

  const colorIndex = (id || '0').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % categoryColors.length;
  const cardColor = categoryColors[colorIndex];

  const cardStyle = [
    styles.card,
    variant === 'wide' && styles.cardWide,
    variant === 'tall' && styles.cardTall,
    isDark && styles.cardDark,
    { backgroundColor: cardColor },
  ];

  const handleCompanyPress = (companyId: string) => {
    router.push(`/company/${companyId}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={cardStyle}
    >
      <LinearGradient
        colors={[cardColor, `${cardColor}dd`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          {icono && <Text style={styles.icon}>{icono}</Text>}
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
    gap: spacing.sm,
  },

  icon: {
    fontSize: normalize(40),
    marginBottom: normalize(4),
  },

  name: {
    ...textStyles.subheadline,
    fontSize: normalize(16),
    color: '#FFFFFF',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    borderRadius: normalize(12),
    overflow: 'hidden',
  },

  companyIcon: {
    width: '100%',
    height: '100%',
    borderRadius: normalize(12),
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },

  companyIconPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
