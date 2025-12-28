/**
 * CategoryLoader Component - Premium Subtle Loading
 * Loading minimalista y elegante estilo apps premium
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { normalize } from '../../utils/responsive';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CategoryLoaderProps {
  categoryName: string;
  categoryIcon?: string;
  isVisible: boolean;
}

// Loader minimalista y premium
const PremiumLoader: React.FC<{ categoryName: string; categoryIcon?: string }> = ({
  categoryName,
  categoryIcon = 'tag'
}) => {
  // Animaciones suaves
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulso suave del ícono
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );

    // Rotación muy sutil
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    );

    // Animación de los dots
    const dots = Animated.loop(
      Animated.timing(dotsAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );

    // Shimmer sutil
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      })
    );

    pulse.start();
    rotate.start();
    dots.start();
    shimmer.start();

    return () => {
      pulse.stop();
      rotate.stop();
      dots.stop();
      shimmer.stop();
    };
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View style={styles.loaderContent}>
      {/* Círculos decorativos sutiles en el fondo */}
      <View style={styles.backgroundCircles}>
        <Animated.View
          style={[
            styles.circle,
            styles.circle1,
            { transform: [{ rotate: rotateInterpolate }] }
          ]}
        />
        <Animated.View
          style={[
            styles.circle,
            styles.circle2,
            { transform: [{ rotate: rotateInterpolate }] }
          ]}
        />
      </View>

      {/* Contenedor del ícono principal */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        {/* Aro exterior girando */}
        <Animated.View
          style={[
            styles.spinnerRing,
            {
              transform: [{ rotate: rotateInterpolate }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.02)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ringGradient}
          />
        </Animated.View>

        {/* Círculo interior con el ícono */}
        <View style={styles.iconCircle}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.06)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Feather name={categoryIcon as any} size={normalize(32)} color="rgba(255, 255, 255, 0.9)" />
          </LinearGradient>
        </View>
      </Animated.View>

      {/* Texto minimalista */}
      <Text style={styles.loadingText}>{categoryName}</Text>

      {/* Dots animados */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                opacity: dotsAnim.interpolate({
                  inputRange: [0, 0.33, 0.66, 1],
                  outputRange: index === 0
                    ? [0.3, 1, 0.3, 0.3]
                    : index === 1
                    ? [0.3, 0.3, 1, 0.3]
                    : [0.3, 0.3, 0.3, 1],
                }),
                transform: [{
                  scale: dotsAnim.interpolate({
                    inputRange: [0, 0.33, 0.66, 1],
                    outputRange: index === 0
                      ? [0.8, 1.2, 0.8, 0.8]
                      : index === 1
                      ? [0.8, 0.8, 1.2, 0.8]
                      : [0.8, 0.8, 0.8, 1.2],
                  })
                }]
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

// Componente principal
export const CategoryLoader: React.FC<CategoryLoaderProps> = ({
  categoryName,
  categoryIcon,
  isVisible,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
        },
      ]}
      pointerEvents="box-none"
    >
      <LinearGradient
        colors={[
          'rgba(10, 42, 67, 0.98)',
          'rgba(13, 51, 84, 0.98)',
        ]}
        style={styles.gradient}
      >
        <PremiumLoader categoryName={categoryName} categoryIcon={categoryIcon} />
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9998,
    elevation: 9998,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Círculos decorativos de fondo
  backgroundCircles: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  circle1: {
    width: normalize(280),
    height: normalize(280),
  },
  circle2: {
    width: normalize(380),
    height: normalize(380),
  },

  // Contenedor del ícono
  iconContainer: {
    width: normalize(110),
    height: normalize(110),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },

  // Aro giratorio
  spinnerRing: {
    position: 'absolute',
    width: normalize(110),
    height: normalize(110),
    borderRadius: normalize(55),
    overflow: 'hidden',
  },
  ringGradient: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: normalize(55),
  },

  // Círculo interior con ícono
  iconCircle: {
    width: normalize(80),
    height: normalize(80),
    borderRadius: normalize(40),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  iconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Texto
  loadingText: {
    fontSize: normalize(15),
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 20,
    letterSpacing: 0.3,
  },

  // Dots
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});
