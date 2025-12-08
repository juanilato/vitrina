/**
 * CategoryCard Component
 * Displays a category card with icon, name, and expandable company list
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { textStyles, spacing, COLORS } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { normalize } from '../../utils/responsive';
import { CompanyPreview } from '../../types/company';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_MARGIN = spacing.md;
const CARD_WIDTH = (width - (CARD_MARGIN * 3)) / 2;

interface CategoryCardProps {
  id: string;
  nombre: string;
  icono?: string;
  variant?: 'normal' | 'wide' | 'tall';
  companyCount?: number;
  companies?: CompanyPreview[];
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
  variant = 'normal',
  companyCount = 0,
  companies = [],
}) => {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  // Nuevos colores para las category cards
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

  const colorIndex = (id || '0').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % categoryColors.length;
  const cardColor = categoryColors[colorIndex];

  const cardStyle = [
    styles.card,
    variant === 'wide' && styles.cardWide,
    variant === 'tall' && styles.cardTall,
    isDark && styles.cardDark,
    isExpanded && styles.cardExpanded,
    { backgroundColor: cardColor },
  ];

  const handleCompanyPress = (companyId: string) => {
    router.push(`/company/${companyId}`);
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
        style={cardStyle}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleSection}>
            {icono && <Text style={styles.icon}>{icono}</Text>}
            <Text style={styles.name} numberOfLines={1}>
              {nombre}
            </Text>
          </View>
          <View style={styles.expandIcon}>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#FFFFFF"
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* Expanded Companies List */}
      {isExpanded && companies && companies.length > 0 && (
        <View style={[styles.expandedContainer, { borderTopColor: cardColor }]}>
          {companies.map((company) => (
            <TouchableOpacity
              key={company.id}
              style={styles.companyItem}
              onPress={() => handleCompanyPress(company.id)}
              activeOpacity={0.7}
            >
              {/* Company Logo/Image */}
              {company.logo ? (
                <Image
                  source={{ uri: company.logo }}
                  style={styles.companyLogo}
                />
              ) : (
                <View style={[styles.companyLogo, styles.companyLogoPlaceholder]}>
                  <Text style={styles.companyLogoText}>
                    {company.name?.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
              )}

              {/* Company Name */}
              <Text style={styles.companyName} numberOfLines={2}>
                {company.name}
              </Text>

              {/* Arrow */}
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    minHeight: normalize(100),
    marginBottom: spacing.md,
    borderRadius: 0, // Un solo borde puntiagudo
    overflow: 'visible',
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
    minHeight: normalize(90),
  },
  cardTall: {
    minHeight: normalize(120),
  },
  cardExpanded: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  icon: {
    fontSize: normalize(32),
  },
  name: {
    ...textStyles.subheadline,
    fontSize: normalize(16),
    color: '#FFFFFF',
    fontWeight: '700',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  expandIcon: {
    padding: spacing.sm,
  },

  // Expanded Container Styles
  expandedContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 4,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingVertical: spacing.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: spacing.md,
  },

  // Company Item Styles
  companyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  companyLogo: {
    width: normalize(60),
    height: normalize(60),
    borderRadius: normalize(12),
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  companyLogoPlaceholder: {
    backgroundColor: '#E8E8E8',
  },

  companyLogoText: {
    fontSize: normalize(24),
    fontWeight: '700',
    color: COLORS.primary,
  },

  companyName: {
    flex: 1,
    fontSize: normalize(15),
    fontWeight: '600',
    color: '#333333',
  },
});
