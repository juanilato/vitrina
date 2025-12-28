/**
 * CategoryTransitionCurtain Component
 * Vitrina con marco elegante adaptado a la estética de la app
 * Marco azul profundo con vidrio sutil que permite ver el contenido
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();

  // Animaciones
  const showcaseAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const glassShimmer = useRef(new Animated.Value(0)).current;
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;
  const sparkle3 = useRef(new Animated.Value(0)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;

  console.log('[CategoryTransitionCurtain] Render:', { categoryName, isLoading, isVisible });

  // Shimmer sutil
  useEffect(() => {
    if (isLoading) {
      const shimmerAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glassShimmer, {
            toValue: 1,
            duration: 3500,
            useNativeDriver: true,
          }),
          Animated.timing(glassShimmer, {
            toValue: 0,
            duration: 3500,
            useNativeDriver: true,
          }),
        ])
      );
      shimmerAnimation.start();
      return () => shimmerAnimation.stop();
    }
  }, [isLoading]);

  // Partículas
  useEffect(() => {
    if (isLoading) {
      const createSparkleAnim = (sparkle: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(sparkle, {
              toValue: 1,
              duration: 4000,
              useNativeDriver: true,
            }),
            Animated.timing(sparkle, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        );

      const anim1 = createSparkleAnim(sparkle1, 0);
      const anim2 = createSparkleAnim(sparkle2, 1200);
      const anim3 = createSparkleAnim(sparkle3, 2400);

      anim1.start();
      anim2.start();
      anim3.start();

      return () => {
        anim1.stop();
        anim2.stop();
        anim3.stop();
      };
    }
  }, [isLoading]);

  // Pulso del icono
  useEffect(() => {
    if (isLoading) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(iconPulse, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(iconPulse, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [isLoading]);

  // Animación principal
  useEffect(() => {
    if (!isVisible) {
      showcaseAnim.setValue(0);
      opacityAnim.setValue(1);
      return;
    }

    if (isLoading) {
      console.log('[CategoryTransitionCurtain] Bajando vitrina');
      opacityAnim.setValue(1);

      Animated.spring(showcaseAnim, {
        toValue: 1,
        tension: 30,
        friction: 9,
        useNativeDriver: true,
      }).start();
    } else {
      console.log('[CategoryTransitionCurtain] Subiendo vitrina');

      Animated.sequence([
        Animated.delay(200),
        Animated.parallel([
          Animated.spring(showcaseAnim, {
            toValue: 2,
            tension: 35,
            friction: 10,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        console.log('[CategoryTransitionCurtain] Completado');
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      });
    }
  }, [isLoading, isVisible]);

  if (!isVisible) {
    return null;
  }

  const translateY = showcaseAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [-SCREEN_HEIGHT, 0, -SCREEN_HEIGHT],
  });

  const shimmerTranslateX = glassShimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH * 0.5, SCREEN_WIDTH * 1.5],
  });

  return (
    <Animated.View
      style={[
        styles.showcaseContainer,
        {
          transform: [{ translateY }],
          opacity: opacityAnim,
        },
      ]}
      pointerEvents="box-none"
    >
      {/* Marco superior */}
      <View style={[styles.frameTop, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#071D2F', '#0A2A43', '#0D3354', '#0A2A43', '#071D2F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.frameGradient}
        >
          <View style={styles.frameHighlight} />
          <View style={styles.frameShadowInner} />
        </LinearGradient>
      </View>

      {/* Panel de vidrio */}
      <View style={styles.glassPanel}>
        <BlurView intensity={6} style={StyleSheet.absoluteFill} tint="light">
          {/* Fondo sutil */}
          <LinearGradient
            colors={[
              'rgba(10, 42, 67, 0.04)',
              'rgba(10, 42, 67, 0.02)',
              'rgba(10, 42, 67, 0.04)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.glassGradient}
          />

          {/* Shimmer */}
          <Animated.View
            style={[
              styles.shimmer,
              {
                opacity: 0.08,
                transform: [{ translateX: shimmerTranslateX }],
              },
            ]}
          >
            <LinearGradient
              colors={[
                'rgba(13, 51, 84, 0)',
                'rgba(13, 51, 84, 0.15)',
                'rgba(13, 51, 84, 0)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>

          {/* Contenido */}
          <View style={styles.content}>
            {/* Icono */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: iconPulse }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(13, 51, 84, 0.15)', 'rgba(10, 42, 67, 0.1)']}
                style={StyleSheet.absoluteFill}
              />
              <Feather
                name={categoryIcon as any}
                size={normalize(42)}
                color="#0A2A43"
              />
            </Animated.View>

            {/* Nombre */}
            <Text style={styles.categoryText}>{categoryName}</Text>

            {/* Partículas */}
            {isLoading && (
              <View style={styles.sparklesContainer}>
                <Animated.View
                  style={[
                    styles.sparkle,
                    {
                      left: '28%',
                      top: '32%',
                      opacity: sparkle1.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 0.3, 0],
                      }),
                      transform: [
                        {
                          translateY: sparkle1.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -60],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.sparkleCircle} />
                </Animated.View>

                <Animated.View
                  style={[
                    styles.sparkle,
                    {
                      left: '62%',
                      top: '42%',
                      opacity: sparkle2.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 0.25, 0],
                      }),
                      transform: [
                        {
                          translateY: sparkle2.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -60],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={[styles.sparkleCircle, { width: 3, height: 3 }]} />
                </Animated.View>

                <Animated.View
                  style={[
                    styles.sparkle,
                    {
                      left: '45%',
                      top: '52%',
                      opacity: sparkle3.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0, 0.28, 0],
                      }),
                      transform: [
                        {
                          translateY: sparkle3.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -60],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={[styles.sparkleCircle, { width: 4, height: 4 }]} />
                </Animated.View>
              </View>
            )}

            {/* Dots */}
            {isLoading && (
              <View style={styles.loadingTextContainer}>
                <View style={styles.dotsContainer}>
                  <Animated.View
                    style={[
                      styles.dot,
                      {
                        opacity: glassShimmer.interpolate({
                          inputRange: [0, 0.33, 0.66, 1],
                          outputRange: [0.2, 0.7, 0.2, 0.2],
                        }),
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.dot,
                      {
                        opacity: glassShimmer.interpolate({
                          inputRange: [0, 0.33, 0.66, 1],
                          outputRange: [0.2, 0.2, 0.7, 0.2],
                        }),
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.dot,
                      {
                        opacity: glassShimmer.interpolate({
                          inputRange: [0, 0.33, 0.66, 1],
                          outputRange: [0.2, 0.2, 0.2, 0.7],
                        }),
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Reflejos */}
          <View style={styles.glassReflections}>
            <View style={[styles.reflection, styles.reflection1]} />
            <View style={[styles.reflection, styles.reflection2]} />
            <View style={[styles.reflection, styles.reflection3]} />
          </View>
        </BlurView>
      </View>

      {/* Marco inferior */}
      <View style={styles.frameBottom}>
        <LinearGradient
          colors={['#071D2F', '#0A2A43', '#0D3354', '#0A2A43', '#071D2F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.frameGradient}
        >
          <View style={styles.frameHighlight} />
          <View style={styles.frameShadowInner} />
        </LinearGradient>
      </View>

      {/* Marco izquierdo */}
      <View style={styles.frameSide}>
        <LinearGradient
          colors={['#071D2F', '#0A2A43', '#0D3354', '#0A2A43', '#071D2F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        >
          <View style={styles.frameEdge} />
        </LinearGradient>
      </View>

      {/* Marco derecho */}
      <View style={[styles.frameSide, styles.frameSideRight]}>
        <LinearGradient
          colors={['#071D2F', '#0A2A43', '#0D3354', '#0A2A43', '#071D2F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        >
          <View style={[styles.frameEdge, styles.frameEdgeRight]} />
        </LinearGradient>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  showcaseContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    zIndex: 9999,
    elevation: 9999,
  },

  // Marcos
  frameTop: {
    height: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  frameBottom: {
    position: 'absolute',
    bottom: 0,
    height: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  frameSide: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  frameSideRight: {
    left: undefined,
    right: 0,
    shadowOffset: { width: -2, height: 0 },
  },
  frameGradient: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  frameHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '35%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  frameShadowInner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '25%',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  frameEdge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  frameEdgeRight: {
    left: undefined,
    right: 0,
  },

  // Panel de vidrio
  glassPanel: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(10, 42, 67, 0.03)',
  },
  glassGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  // Shimmer
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.4,
    zIndex: 1,
  },
  shimmerGradient: {
    flex: 1,
    width: '100%',
  },

  // Reflejos
  glassReflections: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  reflection: {
    position: 'absolute',
    backgroundColor: 'rgba(13, 51, 84, 0.03)',
  },
  reflection1: {
    top: '18%',
    left: '12%',
    width: '28%',
    height: 1.5,
    transform: [{ rotate: '-42deg' }],
  },
  reflection2: {
    top: '28%',
    right: '18%',
    width: '22%',
    height: 1,
    transform: [{ rotate: '38deg' }],
  },
  reflection3: {
    top: '65%',
    left: '40%',
    width: '15%',
    height: 0.8,
    transform: [{ rotate: '-15deg' }],
  },

  // Contenido
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    zIndex: 2,
  },
  iconContainer: {
    width: normalize(90),
    height: normalize(90),
    borderRadius: normalize(45),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 2,
    borderColor: 'rgba(10, 42, 67, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    overflow: 'hidden',
    shadowColor: '#0A2A43',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryText: {
    fontSize: normalize(26),
    fontWeight: '700',
    color: '#0A2A43',
    textAlign: 'center',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Partículas
  sparklesContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleCircle: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#0D3354',
  },

  // Dots
  loadingTextContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0A2A43',
  },
});
