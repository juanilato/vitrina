/**
 * CompanyCard Component
 * iOS Modern Design con Dashboard Background
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
import { useRouter } from 'expo-router';
import { Company } from '../../types/company';
import { colors, spacing, borderRadius, shadows, textStyles } from '../../theme';

interface CompanyCardProps {
  company: Company;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/company/${company.id}`);
  };

  const dashboardFoto = company.preferenciasWeb?.dashboardFoto;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {dashboardFoto ? (
        // Versión con dashboard foto
        <ImageBackground
          source={{ uri: dashboardFoto }}
          style={styles.backgroundImage}
          resizeMode="cover"
          imageStyle={styles.backgroundImageStyle}
        >
          <View style={styles.gradientOverlay}>
            {/* Logo con borde blanco */}
            <View style={styles.logoWrapper}>
              {company.logo ? (
                <Image
                  source={{ uri: company.logo }}
                  style={styles.logoSmall}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Ionicons name="business" size={24} color={colors.textTertiary} />
                </View>
              )}
            </View>

            {/* Content */}
            <View style={styles.contentWithBackground}>
              {/* Nombre en estilo chip */}
              <View style={styles.nameChip}>
                <Text style={styles.nameChipText} numberOfLines={1}>
                  {company.name}
                </Text>
              </View>
              {company.alias && (
                <Text style={styles.aliasText} numberOfLines={1}>
                  @{company.alias}
                </Text>
              )}
            </View>

            {/* Arrow */}
            <View style={styles.arrowWhite}>
              <Ionicons name="chevron-forward" size={20} color={colors.white} />
            </View>
          </View>
        </ImageBackground>
      ) : (
        // Versión SIN dashboard foto - diseño horizontal normal
        <>
          {/* Image */}
          <View style={styles.imageContainer}>
            {company.logo ? (
              <Image
                source={{ uri: company.logo }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="business" size={32} color={colors.textTertiary} />
              </View>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.name} numberOfLines={1}>
                {company.name}
              </Text>
            </View>

            {company.description && (
              <Text style={styles.description} numberOfLines={2}>
                {company.description}
              </Text>
            )}

            {company.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{company.category}</Text>
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              {company.rating !== undefined && company.rating > 0 && (
                <View style={styles.rating}>
                  <Ionicons name="star" size={14} color={colors.warning} />
                  <Text style={styles.ratingText}>
                    {company.rating.toFixed(1)}
                  </Text>
                  {company.reviewCount !== undefined && company.reviewCount > 0 && (
                    <Text style={styles.reviewCount}>
                      ({company.reviewCount})
                    </Text>
                  )}
                </View>
              )}

              {company.ubicaciones && company.ubicaciones.length > 0 && (
                <View style={styles.location}>
                  <Ionicons name="location-outline" size={14} color={colors.textTertiary} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {company.ubicaciones[0].ciudad}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Arrow */}
          <View style={styles.arrow}>
            <Ionicons name="chevron-forward" size={20} color={colors.textQuaternary} />
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
  },

  // Estilos para versión SIN dashboard foto (horizontal normal)
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginRight: spacing.md,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    flex: 1,
    justifyContent: 'space-between',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },

  name: {
    ...textStyles.headline,
    color: colors.primary,
    flex: 1,
    marginRight: spacing.xs,
    fontWeight: '600',
  },

  description: {
    ...textStyles.subheadline,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },

  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },

  categoryText: {
    ...textStyles.caption1,
    color: colors.white,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },

  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  ratingText: {
    ...textStyles.footnote,
    color: colors.text,
    fontWeight: '600',
    marginLeft: 4,
  },

  reviewCount: {
    ...textStyles.caption1,
    color: colors.textTertiary,
    marginLeft: 2,
  },

  location: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  locationText: {
    ...textStyles.caption1,
    color: colors.textTertiary,
    marginLeft: 4,
  },

  arrow: {
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },

  // Estilos para versión CON dashboard foto
  backgroundImage: {
    width: '100%',
    height: 100,
    marginLeft: -spacing.md,
    marginRight: -spacing.md,
    marginTop: -spacing.md,
    marginBottom: -spacing.md,
  },

  backgroundImageStyle: {
    transform: [{ scale: 1.2 }],
  },

  gradientOverlay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },

  logoWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
    padding: 3,
    marginRight: spacing.md,
    borderWidth: 3,
    borderColor: colors.white,
    ...shadows.lg,
  },

  logoSmall: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },

  logoPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  contentWithBackground: {
    flex: 1,
    justifyContent: 'center',
  },

  nameChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs / 1.5,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },

  nameChipText: {
    ...textStyles.callout,
    color: colors.white,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  aliasText: {
    ...textStyles.footnote,
    color: colors.white,
    fontWeight: '500',
    opacity: 0.85,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  arrowWhite: {
    justifyContent: 'center',
    marginLeft: spacing.xs,
    opacity: 0.7,
  },
});
