/**
 * Root Layout
 * Main app entry point with providers
 */

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider } from '../src/contexts/AuthContext';
import { CartProvider } from '../src/contexts/CartContext';
import { NotificationsProvider, useNotifications } from '../src/contexts/NotificationsContext';
import { LocationProvider } from '../src/contexts/LocationContext';
import { AppDataProvider } from '../src/contexts/AppDataContext';
import { OrdersProvider } from '../src/contexts/OrdersContext';
import { PreferencesProvider } from '../src/contexts/PreferencesContext';
import { ThemeProvider, useTheme } from '../src/contexts/ThemeContext';
import { CategoryTransitionProvider, useCategoryTransition } from '../src/contexts/CategoryTransitionContext';
import { NotificationPopup } from '../src/components/notifications';
import { CategoryTransitionCurtain } from '../src/components/categories/CategoryTransitionCurtain';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Platform } from 'react-native';
import * as Location from 'expo-location';
import { GOOGLE_MAPS_API_KEY } from '../src/config/keys';
function AppContent() {
  const { showPopup, currentPopupNotification, dismissPopup } = useNotifications();
  const { colors, isDark } = useTheme();
  const { transitionState, hideTransition } = useCategoryTransition();

  useEffect(() => {
    if (Platform.OS === 'web') {
      const loadGoogleMaps = () => {
        if (typeof window === 'undefined') return;
        if ((window as any).google?.maps) return;

        const existingScript = document.getElementById('google-maps-script');
        if (existingScript) return;

        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      };

      loadGoogleMaps();
    }
  }, []);

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

      {/* Category Transition Curtain - Always mounted */}
      <CategoryTransitionCurtain
        categoryName={transitionState.categoryName}
        categoryIcon={transitionState.categoryIcon}
        isLoading={transitionState.isLoading}
        isVisible={transitionState.isVisible}
        onAnimationComplete={hideTransition}
      />
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
              <CategoryTransitionProvider>
                <OrdersProvider>
                  <NotificationsProvider>
                    <LocationProvider>
                      <CartProvider>
                        <AppContent />
                      </CartProvider>
                    </LocationProvider>
                  </NotificationsProvider>
                </OrdersProvider>
              </CategoryTransitionProvider>
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
