/**
 * App Constants
 */

import Constants from 'expo-constants';

// API URL - Change this to your backend URL
// IMPORTANTE:
// - Android Emulator: usa 10.0.2.2
// - iOS Simulator: usa localhost
// - Dispositivo físico/Expo Go: usa la IP de tu PC (ej: 192.168.1.100)
export const API_URL = __DEV__
  ? 'http://192.168.101.38:3001'  // Tu IP para dispositivo físico/Expo Go (iPhone)
  // ? 'http://10.0.2.2:3001'  // Android Emulator
  // ? 'http://localhost:3001'  // iOS Simulator
  : 'https://your-production-api.com';

export const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

// AsyncStorage keys
export const STORAGE_KEYS = {
  TOKEN: '@vitrina_token',
  USER: '@vitrina_user',
  FCM_TOKEN: '@vitrina_fcm_token',
  CART: '@vitrina_cart',
} as const;

// Routes
export const ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  TABS: {
    HOME: '/(tabs)',
    ORDERS: '/(tabs)/orders',
    PROFILE: '/(tabs)/profile',
  },
  COMPANY: {
    STORE: '/company/[id]',
  },
} as const;
