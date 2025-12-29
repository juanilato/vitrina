/**
 * CategoryCard3D - Friendly & Playful Design
 * Cards con rotaciones aleatorias, colores vibrantes y movimiento
 * Diseño desestructurado y familiar para el dashboard
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { textStyles, spacing } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { useCategoryTransition } from '../../contexts/CategoryTransitionContext';
import { normalize } from '../../utils/responsive';
import { CompanyPreview } from '../../types/company';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - normalize(56)) / 2; // 2 columnas con padding
const CARD_HEIGHT = normalize(140); // Más altas para el diseño playful

interface CategoryCard3DProps {
  id: string;
  nombre: string;
  icono?: string;
  companies?: CompanyPreview[];
  onPress?: () => void;
}

// Gradientes vibrantes y amigables
const playfulGradients = [
  ['#FF6B9D', '#FFA06B'], // Rosa coral
  ['#667eea', '#764ba2'], // Púrpura violeta
  ['#4facfe', '#00f2fe'], // Azul cyan brillante
  ['#43e97b', '#38f9d7'], // Verde menta
  ['#fa709a', '#fee140'], // Rosa amarillo sunset
  ['#30cfd0', '#330867'], // Cyan púrpura profundo
  ['#FF9A56', '#FF6B9D'], // Naranja rosa
  ['#A8EDEA', '#FED6E3'], // Menta pastel rosado
  ['#FFDEE9', '#B5FFFC'], // Rosa suave cyan
  ['#08AEEA', '#2AF598'], // Cyan verde eléctrico
];

// Rotaciones aleatorias sutiles para cada card (-3° a +3°)
const getRandomRotation = (id: string): string => {
  const hash = (id || '0').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const angle = ((hash % 7) - 3); // Entre -3 y +3 grados
  return `${angle}deg`;
};

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
  'tag': 'tag',
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
  const { startTransition } = useCategoryTransition();

  // Animaciones
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const gradientIndex = (id || '0').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % playfulGradients.length;
  const gradient = playfulGradients[gradientIndex];
  const rotation = getRandomRotation(id);
  const iconName = getIconForCategory(nombre, icono);

  // Animación de flotación sutil
  useEffect(() => {
    const delay = ((id || '0').charCodeAt(0) % 10) * 100; // Delay escalonado

    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -4,
            duration: 2000 + (delay * 2),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2000 + (delay * 2),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, delay);
  }, [id]);

  const handlePress = () => {
    // Animación de presión
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) {
      onPress();
    } else {
      console.log('[CategoryCard3D] Iniciando transición:', { nombre, iconName });
      startTransition(nombre, iconName);
      setTimeout(() => {
        console.log('[CategoryCard3D] Navegando a categoría');
        router.push(`/category/${id}?name=${nombre}`);
      }, 600);
    }
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [
            { translateY: floatAnim },
            { scale: scaleAnim },
            { rotate: rotation },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePress}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Decorative circle blob top-right */}
          <View style={[styles.decorativeBlob, styles.blobTopRight]} />

          {/* Decorative circle blob bottom-left */}
          <View style={[styles.decorativeBlob, styles.blobBottomLeft]} />

          {/* Icon grande y amigable */}
          <View style={styles.iconWrapper}>
            <Feather
              name={iconName as any}
              size={normalize(32)}
              color="#FFFFFF"
            />
          </View>

          {/* Category Name con tipografía amigable */}
          <View style={styles.nameContainer}>
            <Text style={styles.categoryName} numberOfLines={2}>
              {nombre}
            </Text>
          </View>

          {/* Company badges - pequeños círculos con logos */}
          {companies && companies.length > 0 && (
            <View style={styles.companiesRow}>
              {companies.slice(0, 3).map((company, index) => (
                <View
                  key={company.id || index}
                  style={[styles.companyBadge, { marginLeft: index > 0 ? -8 : 0 }]}
                >
                  {company.logo ? (
                    <Image
                      source={{ uri: company.logo }}
                      style={styles.companyBadgeImage}
                    />
                  ) : (
                    <View style={styles.companyBadgePlaceholder}>
                      <Text style={styles.companyBadgeText}>
                        {company.name?.charAt(0).toUpperCase() || '?'}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
              {companies.length > 3 && (
                <View style={[styles.companyBadge, styles.moreBadge, { marginLeft: -8 }]}>
                  <Text style={styles.moreBadgeText}>+{companies.length - 3}</Text>
                </View>
              )}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: spacing.lg,
  },

  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: normalize(20),
    padding: spacing.md,
    justifyContent: 'space-between',
    overflow: 'hidden',
    // Sombra más pronunciada y dinámica
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },

  // Decorative blobs para darle más dinamismo
  decorativeBlob: {
    position: 'absolute',
    width: normalize(60),
    height: normalize(60),
    borderRadius: normalize(30),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  blobTopRight: {
    top: -normalize(20),
    right: -normalize(15),
  },
  blobBottomLeft: {
    bottom: -normalize(15),
    left: -normalize(20),
    width: normalize(50),
    height: normalize(50),
    borderRadius: normalize(25),
  },

  iconWrapper: {
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(28),
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    // Sombra interna
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  nameContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: spacing.sm,
  },

  categoryName: {
    ...textStyles.headline,
    fontSize: normalize(14),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'left',
    lineHeight: normalize(18),
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Company badges - estilo playful con overlap
  companiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },

  companyBadge: {
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  companyBadgeImage: {
    width: '100%',
    height: '100%',
  },

  companyBadgePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  companyBadgeText: {
    fontSize: normalize(8),
    fontWeight: '700',
    color: '#666',
  },

  moreBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  moreBadgeText: {
    fontSize: normalize(8),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
