/**
 * Root Layout
 * Main app entry point with providers
 */

import { Stack } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';
import { CartProvider } from '../src/contexts/CartContext';
import { NotificationsProvider, useNotifications } from '../src/contexts/NotificationsContext';
import { LocationProvider } from '../src/contexts/LocationContext';
import { AppDataProvider } from '../src/contexts/AppDataContext';
import { OrdersProvider } from '../src/contexts/OrdersContext';
import { PreferencesProvider } from '../src/contexts/PreferencesContext';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { NotificationPopup } from '../src/components/notifications';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

function AppContent() {
  const { showPopup, currentPopupNotification, dismissPopup } = useNotifications();
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" />
        <Stack.Screen name="company/[companyName]" />
        <Stack.Screen name="catalog/[companyName]" />
        <Stack.Screen name="category/[id]" />
        <Stack.Screen name="subcategory/[id]" />
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
      <AppDataProvider>
        <AuthProvider>
          <PreferencesProvider>
            <ThemeProvider>
              <OrdersProvider>
                <NotificationsProvider>
                  <LocationProvider>
                    <CartProvider>
                      <AppContent />
                    </CartProvider>
                  </LocationProvider>
                </NotificationsProvider>
              </OrdersProvider>
            </ThemeProvider>
          </PreferencesProvider>
        </AuthProvider>
      </AppDataProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
