/**
 * Company Card Component
 * Tarjeta para mostrar información de una empresa/compañía
 * Estilo amigable y moderno
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../theme';
import { normalize } from '../../utils/responsive';

interface CompanyCardProps {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  isOpen?: boolean;
  onPress?: () => void;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  id,
  name,
  logo,
  description,
  rating,
  reviewCount,
  address,
  isOpen = true,
  onPress,
}) => {
  const displayRating = rating || 0;
  const displayReviews = reviewCount || 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Logo/Header */}
      {logo ? (
        <ImageBackground
          source={{ uri: logo }}
          style={styles.logoContainer}
          imageStyle={styles.logoImage}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.6)']}
            style={styles.logoOverlay}
          >
            <View style={styles.statusBadge}>
              <Ionicons
                name={isOpen ? 'checkmark-circle' : 'close-circle'}
                size={SIZES.iconSm}
                color={isOpen ? COLORS.success : COLORS.error}
              />
              <Text style={styles.statusText}>
                {isOpen ? 'Abierto' : 'Cerrado'}
              </Text>
            </View>
          </LinearGradient>
        </ImageBackground>
      ) : (
        <View style={[styles.logoContainer, styles.logoPlaceholder]}>
          <Ionicons
            name="storefront"
            size={SIZES.icon2xl}
            color={COLORS.primary}
          />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Name */}
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>

        {/* Description */}
        {description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}

        {/* Rating */}
        {displayRating > 0 && (
          <View style={styles.ratingContainer}>
            <View style={styles.ratingStars}>
              <Ionicons
                name="star"
                size={SIZES.iconSm}
                color={COLORS.quaternary}
              />
              <Text style={styles.ratingValue}>
                {displayRating.toFixed(1)}
              </Text>
              <Text style={styles.reviewCount}>({displayReviews})</Text>
            </View>
          </View>
        )}

        {/* Address */}
        {address && (
          <View style={styles.addressContainer}>
            <Ionicons
              name="location"
              size={SIZES.iconSm}
              color={COLORS.textSecondary}
            />
            <Text style={styles.address} numberOfLines={1}>
              {address}
            </Text>
          </View>
        )}
      </View>

      {/* Arrow */}
      <View style={styles.arrowContainer}>
        <Ionicons
          name="chevron-forward"
          size={SIZES.iconMd}
          color={COLORS.primary}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    marginHorizontal: SIZES.screenPadding,
    marginBottom: SIZES.md,
    ...SHADOWS.md,
  },

  logoContainer: {
    width: normalize(100),
    height: normalize(120),
    backgroundColor: COLORS.gray100,
    justifyContent: 'flex-end',
  },

  logoImage: {
    borderRadius: SIZES.radiusMd,
  },

  logoOverlay: {
    padding: SIZES.md,
    justifyContent: 'flex-end',
  },

  logoPlaceholder: {
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusSm,
    alignSelf: 'flex-start',
  },

  statusText: {
    fontSize: SIZES.fontXs,
    fontWeight: SIZES.fontWeightSemibold,
    color: COLORS.textPrimary,
  },

  content: {
    flex: 1,
    padding: SIZES.lg,
    justifyContent: 'space-between',
  },

  name: {
    fontSize: SIZES.fontLg,
    fontWeight: SIZES.fontWeightBold,
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
    letterSpacing: -0.3,
  },

  description: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
    lineHeight: 18,
  },

  ratingContainer: {
    marginBottom: SIZES.md,
  },

  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },

  ratingValue: {
    fontSize: SIZES.fontBase,
    fontWeight: SIZES.fontWeightBold,
    color: COLORS.textPrimary,
  },

  reviewCount: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },

  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },

  address: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    flex: 1,
  },

  arrowContainer: {
    justifyContent: 'center',
    paddingRight: SIZES.lg,
  },
});
