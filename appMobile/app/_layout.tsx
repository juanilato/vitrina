/**
 * Root Layout
 * Main app entry point with providers
 */

import { Stack } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';
import { CartProvider } from '../src/contexts/CartContext';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <CartProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#FFFFFF' },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="company/[id]" />
            <Stack.Screen name="order/[id]" />
            <Stack.Screen name="checkout" />
          </Stack>
        </CartProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
