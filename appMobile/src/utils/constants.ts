/**
 * App Constants
 */

import Constants from 'expo-constants';



// ✅ Lee la URL desde el .env
const ENV_API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;

// ✅ Fallback a local solo en modo desarrollo
export const API_URL = __DEV__
  ? (process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:3001')
  : (ENV_API_URL || 'https://api.vitrina.com.ar');

// ✅ Google Maps
export const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY'

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
    STORE: '/company/[companyName]',
  },
} as const;

// Valoraciones - Tiempo en milisegundos para solicitar valoración después de entrega
export const RATING_REQUEST_DELAY = 10 * 60 * 1000; // 10 minutos

// Etiquetas legibles para aspectos de empresa
export const ASPECTOS_EMPRESA_LABELS = {
  EXCELENTE_CALIDAD: 'Excelente calidad',
  BUENA_PRESENTACION: 'Buena presentación',
  PORCIONES_GENEROSAS: 'Porciones generosas',
  RAPIDO: 'Rápido',
  BUENA_ATENCION: 'Buena atención',
  BUENA_RELACION_PRECIO_CALIDAD: 'Buena relación precio-calidad',
  MUY_RICO: 'Muy rico',
  FRESCO: 'Fresco',
  BIEN_EMPAQUETADO: 'Bien empaquetado',
} as const;

// Etiquetas legibles para aspectos de repartidor
export const ASPECTOS_REPARTIDOR_LABELS = {
  PUNTUAL: 'Puntual',
  AMABLE: 'Amable',
  CUIDADOSO: 'Cuidadoso',
  BUENA_COMUNICACION: 'Buena comunicación',
  PROFESIONAL: 'Profesional',
} as const;
