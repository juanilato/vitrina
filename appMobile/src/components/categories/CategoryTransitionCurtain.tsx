/**
 * CategoryTransitionCurtain Component - Premium Subtle
 * Loading minimalista para transiciones entre categorías
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { normalize } from '../../utils/responsive';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface CategoryTransitionCurtainProps {
  categoryName: string;
  categoryIcon?: string;
  isLoading: boolean;
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

export const CategoryTransitionCurtain: React.FC<CategoryTransitionCurtainProps> = ({
  categoryName,
  categoryIcon = 'tag',
  isLoading,
  isVisible,
  onAnimationComplete,
}) => {
  // Animaciones principales
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Animaciones del contenido
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;

  // Animación de fade in/out
  useEffect(() => {
    if (!isVisible) {
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.95);
      return;
    }

    if (isLoading) {
      // Aparecer
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Desaparecer
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      });
    }
  }, [isLoading, isVisible]);

  // Animaciones continuas
  useEffect(() => {
    if (isVisible && isLoading) {
      // Pulso suave
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
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

      // Rotación lenta
      const rotate = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      );

      // Dots
      const dots = Animated.loop(
        Animated.timing(dotsAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      );

      pulse.start();
      rotate.start();
      dots.start();

      return () => {
        pulse.stop();
        rotate.stop();
        dots.stop();
      };
    }
  }, [isVisible, isLoading]);

  if (!isVisible) {
    return null;
  }

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
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
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Círculos decorativos sutiles */}
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

          {/* Ícono central */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            {/* Aro giratorio */}
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

            {/* Círculo interior */}
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

          {/* Nombre de categoría */}
          <Text style={styles.categoryName}>{categoryName}</Text>

          {/* Dots animados */}
          {isLoading && (
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
          )}
        </Animated.View>
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
    zIndex: 9999,
    elevation: 9999,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Círculos decorativos
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

  // Ícono
  iconContainer: {
    width: normalize(110),
    height: normalize(110),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
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
  categoryName: {
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
