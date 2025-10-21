/**
 * CompanyCard Component
 * iOS Modern Design
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
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

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {company.logo || company.preferenciasWeb?.logo ? (
          <Image
            source={{ uri: company.logo || company.preferenciasWeb?.logo }}
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
          {company.isVerified && (
            <Ionicons name="checkmark-circle" size={18} color={colors.info} />
          )}
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
    ...shadows.sm,
  },

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
    color: colors.text,
    flex: 1,
    marginRight: spacing.xs,
  },

  description: {
    ...textStyles.subheadline,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },

  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },

  categoryText: {
    ...textStyles.caption1,
    color: colors.textSecondary,
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
});
