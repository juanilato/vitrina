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
  const scaleAnims = useRef(
    state.routes.map(() => new Animated.Value(0))
  ).current;

  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

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

  return (
    <View style={styles.tabBarContainer}>
      <View
        style={[
          styles.tabBarBackground,
          { backgroundColor: isDark ? colors.gray100 : '#FFFFFF' }
        ]}
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
                      {
                        transform: [{ scale }],
                        opacity,
                      },
                    ]}
                  >
                    {/* Icono con fondo translúcido cuando está activo */}
                    <View style={[
                      styles.iconContainer,
                      isFocused && styles.iconContainerActive
                    ]}>
                      {iconComponent}
                    </View>
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
      </View>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  // Tab Bar Container - Simple y limpio
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarBackground: {
    borderTopWidth: 1,
    borderTopColor: isDark ? colors.gray300 : colors.gray200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBar: {
    flexDirection: 'row',
    paddingVertical: normalize(6),
    paddingBottom: normalize(8),
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  // Tab Item - Simple y compacto
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(2),
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(4),
    paddingHorizontal: normalize(8),
  },
  iconContainer: {
    width: normalize(36),
    height: normalize(36),
    borderRadius: normalize(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(2),
  },
  iconContainerActive: {
    backgroundColor: isDark ? 'rgba(10, 132, 255, 0.15)' : 'rgba(10, 42, 67, 0.08)',
  },
  tabLabel: {
    fontSize: normalize(9),
    fontWeight: '600',
    marginTop: normalize(1),
    textAlign: 'center',
  },
});
