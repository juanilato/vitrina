/**
 * Root Layout
 * Main app entry point with providers
 */

import { Stack } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
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
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
