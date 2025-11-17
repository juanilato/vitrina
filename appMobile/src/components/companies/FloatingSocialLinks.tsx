/**
 * FloatingSocialLinks Component
 * Botón flotante que despliega redes sociales con animación y scroll horizontal
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Linking,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, shadows } from '../../theme';

interface SocialLink {
  key: string;
  value: string;
}

interface FloatingSocialLinksProps {
  socialLinks: SocialLink[];
  isExpanded: boolean;
  onToggle: () => void;
  buttonColor?: string;
}

const getSocialIcon = (key: string) => {
  const iconMap: Record<string, any> = {
    instagram: 'logo-instagram',
    facebook: 'logo-facebook',
    twitter: 'logo-twitter',
    whatsapp: 'logo-whatsapp',
    tiktok: 'logo-tiktok',
    web: 'globe-outline',
  };
  return iconMap[key.toLowerCase()] || 'link-outline';
};

const getSocialUrl = (key: string, value: string) => {
  const urlMap: Record<string, (v: string) => string> = {
    instagram: (v) => `https://instagram.com/${v.replace('@', '')}`,
    facebook: (v) => `https://facebook.com/${v}`,
    twitter: (v) => `https://twitter.com/${v.replace('@', '')}`,
    whatsapp: (v) => `https://wa.me/${v}`,
    tiktok: (v) => `https://tiktok.com/@${v.replace('@', '')}`,
  };
  return urlMap[key.toLowerCase()]?.(value) || value;
};

export const FloatingSocialLinks: React.FC<FloatingSocialLinksProps> = ({
  socialLinks,
  isExpanded,
  onToggle,
  buttonColor = colors.primary,
}) => {
  const animations = useRef(
    socialLinks.map(() => new Animated.Value(0))
  ).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isExpanded) {
      // Rotar el botón principal
      Animated.spring(rotateAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }).start();

      // Animar cada botón social con delay
      animations.forEach((anim, index) => {
        Animated.spring(anim, {
          toValue: 1,
          delay: index * 50,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Contraer
      Animated.spring(rotateAnim, {
        toValue: 0,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }).start();

      animations.forEach((anim, index) => {
        Animated.spring(anim, {
          toValue: 0,
          delay: (animations.length - index - 1) * 30,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [isExpanded]);

  const handleSocialPress = async (social: SocialLink) => {
    const url = getSocialUrl(social.key, social.value);
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'No se pudo abrir el enlace');
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '135deg'],
  });

  return (
    <View style={styles.container}>
      {/* Scroll horizontal de redes sociales */}
      {isExpanded && (
        <Animated.View
          style={[
            styles.socialScrollContainer,
            {
              opacity: rotateAnim,
              transform: [
                {
                  translateX: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.socialScrollContent}
          >
            {socialLinks.map((social, index) => (
              <TouchableOpacity
                key={social.key}
                style={styles.socialButtonNew}
                onPress={() => handleSocialPress(social)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={getSocialIcon(social.key)}
                  size={22}
                  color={colors.text}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Botón principal */}
      <TouchableOpacity
        style={styles.mainButton}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.text} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    zIndex: 100,
  },
  socialScrollContainer: {
    maxWidth: 250,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  socialScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  socialButtonNew: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mainButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
});
