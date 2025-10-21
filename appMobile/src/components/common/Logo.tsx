/**
 * Vitrina Logo Component
 * Logo de la marca según brandbook
 */

import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';

interface LogoProps {
  variant?: 'full' | 'icon';  // full = logo + text, icon = solo icono
  size?: number;
  style?: ViewStyle;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 120,
  style,
}) => {
  const logoSource = variant === 'full'
    ? require('../../../assets/logo.png')
    : require('../../../assets/vitrina-logo.png');

  return (
    <View style={[styles.container, style]}>
      <Image
        source={logoSource}
        style={[
          styles.logo,
          {
            width: size,
            height: size,
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    // Image will be sized by props
  },
});
