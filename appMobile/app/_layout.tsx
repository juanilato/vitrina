/**
 * Root Layout
 * Main app entry point with providers
 */

import { Stack } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';
import { CartProvider } from '../src/contexts/CartContext';
import { NotificationsProvider, useNotifications } from '../src/contexts/NotificationsContext';
import { LocationProvider } from '../src/contexts/LocationContext';
import { NotificationPopup } from '../src/components/notifications';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

function AppContent() {
  const { showPopup, currentPopupNotification, dismissPopup } = useNotifications();

  return (
    <>
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

      {/* Global Notification Popup */}
      {currentPopupNotification && (
        <NotificationPopup
          notification={currentPopupNotification}
          visible={showPopup}
          onDismiss={dismissPopup}
        />
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <LocationProvider>
          <NotificationsProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </NotificationsProvider>
        </LocationProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
