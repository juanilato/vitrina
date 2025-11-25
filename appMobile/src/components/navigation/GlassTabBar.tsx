/**
 * Glass Tab Bar Component
 * Bottom navigation with glass effect and hide/show functionality
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, fontSizes } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { normalize } from '../../utils/responsive';

const { width } = Dimensions.get('window');
const TAB_BAR_HEIGHT = normalize(85); // Total height including padding (reducido para 4 tabs)

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors, isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef(
    state.routes.map(() => new Animated.Value(0))
  ).current;

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  // Animation for hiding/showing the tab bar
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isVisible ? 10 : TAB_BAR_HEIGHT + 20, // Include bottom padding
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [isVisible]);

  // Animation for tab transitions
  useEffect(() => {
    scaleAnims.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: state.index === index ? 1 : 0,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }).start();
    });
  }, [state.index]);

  // Obtener la ruta actual
  const currentRoute = state.routes[state.index];
  const currentRouteName = currentRoute?.name;

  // Ocultar el tab bar en la pantalla del carrito
  if (currentRouteName === 'cart') {
    return null;
  }

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <>
      {/* Toggle Button - Moves with the tab bar */}
      <Animated.View
        style={[
          styles.toggleContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={toggleVisibility}
          activeOpacity={0.7}
          style={styles.toggleButton}
        >
          <LinearGradient
            colors={isDark
              ? ['rgba(30, 30, 30, 0.95)', 'rgba(30, 30, 30, 0.85)']
              : ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']
            }
            style={styles.toggleGradient}
          >
            <Ionicons
              name={isVisible ? 'chevron-down' : 'chevron-up'}
              size={normalize(20)}
              color={colors.primary}
            />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Tab Bar with Glass Effect */}
      <Animated.View
        style={[
          styles.tabBarContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={isDark
            ? ['rgba(30, 30, 30, 0.95)', 'rgba(30, 30, 30, 0.85)']
            : ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']
          }
          style={styles.tabBarGradient}
        >
          <View style={styles.tabBar}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const label =
                options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                  ? options.title
                  : route.name;

              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: 'tabLongPress',
                  target: route.key,
                });
              };

              // Get the icon component from options
              const iconComponent = options.tabBarIcon
                ? options.tabBarIcon({
                    focused: isFocused,
                    color: isFocused ? colors.primary : colors.gray500,
                    size: normalize(24),
                  })
                : null;

              const scale = scaleAnims[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0.92, 1],
              });

              const opacity = scaleAnims[index].interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1],
              });

              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.tabItem}
                  activeOpacity={0.7}
                >
                  <Animated.View
                    style={[
                      styles.tabContent,
                      isFocused && styles.tabContentActive,
                      {
                        transform: [{ scale }],
                        opacity,
                      },
                    ]}
                  >
                    <View style={styles.iconContainer}>{iconComponent}</View>
                    <Text
                      style={[
                        styles.tabLabel,
                        { color: isFocused ? colors.primary : colors.gray500 },
                      ]}
                    >
                      {typeof label === 'string' ? label : ''}
                    </Text>
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>
      </Animated.View>
    </>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  // Toggle Button
  toggleContainer: {
    position: 'absolute',
    bottom: TAB_BAR_HEIGHT + normalize(20), // Position just above the tab bar
    left: width / 2 - normalize(24),
    zIndex: 1000,
  },
  toggleButton: {
    elevation: 5,
  },
  toggleGradient: {
    width: normalize(48),
    height: normalize(32),
    borderRadius: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(58, 58, 58, 0.8)' : 'rgba(255, 255, 255, 0.8)',
  },

  // Tab Bar Container
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
  },
  tabBarGradient: {
    borderRadius: normalize(24),
    borderWidth: 1,
    borderColor: isDark ? 'rgba(58, 58, 58, 0.5)' : 'rgba(255, 255, 255, 0.5)',
    shadowColor: isDark ? colors.black : '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: isDark ? 0.3 : 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  tabBar: {
    flexDirection: 'row',
    paddingVertical: normalize(8),
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    gap: spacing.xs,
  },

  // Tab Item
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(2),
    maxWidth: normalize(90), // Limitar ancho máximo para mejor distribución
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(6),
    paddingHorizontal: normalize(12),
    borderRadius: normalize(16),
    minWidth: normalize(60),
    minHeight: normalize(52),
    width: '100%',
  },
  tabContentActive: {
    backgroundColor: isDark ? 'rgba(58, 58, 58, 0.6)' : 'rgba(255, 255, 255, 0.6)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  iconContainer: {
    marginBottom: normalize(3),
  },
  tabLabel: {
    fontSize: normalize(10),
    fontWeight: '700',
    marginTop: normalize(2),
    textAlign: 'center',
  },
});
