/**
 * CategoryTransitionCurtain Component
 * Loading animado tipo "Puerta de Vitrina" que se abre revelando el contenido
 * Concepto: Dos puertas de vidrio que se separan mostrando los productos
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

  // Animaciones de las puertas
  const leftDoorAnim = useRef(new Animated.Value(0)).current;
  const rightDoorAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Animación del contenido
  const contentScale = useRef(new Animated.Value(0.9)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  // Animación de la manija/handle
  const handlePulse = useRef(new Animated.Value(1)).current;

  // Animación de los dots
  const dotsAnim = useRef(new Animated.Value(0)).current;

  console.log('[CategoryTransitionCurtain] Render:', { categoryName, isLoading, isVisible });

  // Animación de los dots de carga
  useEffect(() => {
    if (isVisible && isLoading) {
      const dotsAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(dotsAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(dotsAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      dotsAnimation.start();
      return () => dotsAnimation.stop();
    }
  }, [isVisible, isLoading]);

  // Animación de la manija
  useEffect(() => {
    if (isVisible && isLoading) {
      const pulseAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(handlePulse, {
            toValue: 1.15,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(handlePulse, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnim.start();
      return () => pulseAnim.stop();
    }
  }, [isVisible, isLoading]);

  // Animación principal de las puertas
  useEffect(() => {
    if (!isVisible) {
      leftDoorAnim.setValue(0);
      rightDoorAnim.setValue(0);
      opacityAnim.setValue(0);
      contentScale.setValue(0.9);
      contentOpacity.setValue(0);
      return;
    }

    if (isLoading) {
      // Las puertas se cierran (aparecen desde los lados)
      console.log('[CategoryTransitionCurtain] Cerrando puertas');

      Animated.parallel([
        Animated.spring(leftDoorAnim, {
          toValue: 1,
          tension: 40,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.spring(rightDoorAnim, {
          toValue: 1,
          tension: 40,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(contentScale, {
          toValue: 1,
          tension: 50,
          friction: 8,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Las puertas se abren revelando el contenido
      console.log('[CategoryTransitionCurtain] Abriendo puertas');

      Animated.sequence([
        Animated.delay(150),
        Animated.parallel([
          Animated.spring(leftDoorAnim, {
            toValue: 0,
            tension: 35,
            friction: 9,
            useNativeDriver: true,
          }),
          Animated.spring(rightDoorAnim, {
            toValue: 0,
            tension: 35,
            friction: 9,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 500,
            delay: 200,
            useNativeDriver: true,
          }),
          Animated.timing(contentOpacity, {
            toValue: 0,
            duration: 300,
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

  const leftDoorTranslateX = leftDoorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH / 2, 0],
  });

  const rightDoorTranslateX = rightDoorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_WIDTH / 2, 0],
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
      {/* Puerta Izquierda */}
      <Animated.View
        style={[
          styles.door,
          styles.doorLeft,
          {
            transform: [{ translateX: leftDoorTranslateX }],
          },
        ]}
      >
        <BlurView intensity={10} style={StyleSheet.absoluteFill} tint="light">
          {/* Gradiente de la puerta */}
          <LinearGradient
            colors={[
              'rgba(10, 42, 67, 0.95)',
              'rgba(13, 51, 84, 0.92)',
              'rgba(10, 42, 67, 0.95)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Marco decorativo */}
          <View style={styles.doorFrame}>
            <View style={styles.doorFrameInner} />
          </View>

          {/* Manija izquierda */}
          <Animated.View
            style={[
              styles.handle,
              styles.handleLeft,
              {
                transform: [{ scale: handlePulse }],
              },
            ]}
          >
            <LinearGradient
              colors={['#0D3354', '#0A2A43']}
              style={styles.handleGradient}
            >
              <View style={styles.handleShine} />
            </LinearGradient>
          </Animated.View>
        </BlurView>
      </Animated.View>

      {/* Puerta Derecha */}
      <Animated.View
        style={[
          styles.door,
          styles.doorRight,
          {
            transform: [{ translateX: rightDoorTranslateX }],
          },
        ]}
      >
        <BlurView intensity={10} style={StyleSheet.absoluteFill} tint="light">
          {/* Gradiente de la puerta */}
          <LinearGradient
            colors={[
              'rgba(10, 42, 67, 0.95)',
              'rgba(13, 51, 84, 0.92)',
              'rgba(10, 42, 67, 0.95)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Marco decorativo */}
          <View style={styles.doorFrame}>
            <View style={styles.doorFrameInner} />
          </View>

          {/* Manija derecha */}
          <Animated.View
            style={[
              styles.handle,
              styles.handleRight,
              {
                transform: [{ scale: handlePulse }],
              },
            ]}
          >
            <LinearGradient
              colors={['#0D3354', '#0A2A43']}
              style={styles.handleGradient}
            >
              <View style={styles.handleShine} />
            </LinearGradient>
          </Animated.View>
        </BlurView>
      </Animated.View>

      {/* Contenido Central */}
      <Animated.View
        style={[
          styles.centerContent,
          {
            transform: [{ scale: contentScale }],
            opacity: contentOpacity,
          },
        ]}
      >
        {/* Logo/Icono de categoría */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']}
            style={styles.logoGradient}
          >
            <Feather name={categoryIcon as any} size={normalize(40)} color="#0A2A43" />
          </LinearGradient>
        </View>

        {/* Nombre de categoría */}
        <Text style={styles.categoryName}>{categoryName}</Text>

        {/* Animación de puntos */}
        {isLoading && (
          <View style={styles.dotsContainer}>
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dotsAnim.interpolate({
                    inputRange: [0, 0.33, 0.66, 1],
                    outputRange: [0.3, 1, 0.3, 0.3],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dotsAnim.interpolate({
                    inputRange: [0, 0.33, 0.66, 1],
                    outputRange: [0.3, 0.3, 1, 0.3],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  opacity: dotsAnim.interpolate({
                    inputRange: [0, 0.33, 0.66, 1],
                    outputRange: [0.3, 0.3, 0.3, 1],
                  }),
                },
              ]}
            />
          </View>
        )}
      </Animated.View>

      {/* Separador central (línea entre las puertas) */}
      <View style={styles.divider} />
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

  // Puertas
  door: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  doorLeft: {
    left: 0,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  doorRight: {
    right: 0,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Marco decorativo de las puertas
  doorFrame: {
    position: 'absolute',
    top: 40,
    bottom: 40,
    left: 20,
    right: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  doorFrameInner: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    left: 8,
    right: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
  },

  // Manijas
  handle: {
    position: 'absolute',
    top: '50%',
    width: 40,
    height: 80,
    marginTop: -40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  handleLeft: {
    right: 15,
  },
  handleRight: {
    left: 15,
  },
  handleGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handleShine: {
    position: 'absolute',
    top: 8,
    left: 6,
    width: 8,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },

  // Contenido central
  centerContent: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  logoContainer: {
    width: normalize(100),
    height: normalize(100),
    borderRadius: normalize(50),
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#0A2A43',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  logoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: normalize(24),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 16,
    textShadowColor: 'rgba(10, 42, 67, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },

  // Dots de carga
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },

  // Divisor central
  divider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: SCREEN_WIDTH / 2 - 0.5,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 2,
  },
});
