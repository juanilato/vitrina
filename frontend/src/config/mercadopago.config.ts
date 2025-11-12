/**
 * Configuración de MercadoPago
 *
 * Para obtener tus credenciales:
 * 1. Ir a https://www.mercadopago.com.ar/developers/panel
 * 2. Seleccionar "Credenciales" en el menú lateral
 * 3. Copiar la "Public Key" correspondiente al entorno (TEST o PROD)
 *
 * IMPORTANTE:
 * - Nunca subir las claves PROD a repositorios públicos
 * - Usar variables de entorno en producción
 * - La Public Key es segura para usar en el frontend
 */

export const MERCADOPAGO_CONFIG = {
  // Public Key de TEST (reemplazar con la tuya)
  // Obtener en: https://www.mercadopago.com.ar/developers/panel/credentials
  publicKey: process.env.REACT_APP_MERCADOPAGO_PUBLIC_KEY || 'TEST-XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX',

  // Configuración del entorno
  environment: process.env.NODE_ENV || 'development',

  // Locale para Argentina
  locale: 'es-AR' as const,

  // Moneda por defecto (Pesos argentinos)
  currency: 'ARS',

  // URLs de callback (ajustar según tu dominio)
  callbacks: {
    success: '/dashboard/subscription/success',
    failure: '/dashboard/subscription/failure',
    pending: '/dashboard/subscription/pending',
  },

  // Configuración de suscripciones
  subscription: {
    // Tipos de intervalo disponibles
    intervals: {
      monthly: 'months',
      yearly: 'years',
    } as const,

    // Opciones por defecto
    defaults: {
      autoRecurring: true,
      frequency: 1, // cada 1 mes/año según intervalo
      frequencyType: 'months' as const,
    },
  },
};

// Tipo para validación
export type MercadoPagoConfig = typeof MERCADOPAGO_CONFIG;

// Helper para validar si está configurado correctamente
export const isMercadoPagoConfigured = (): boolean => {
  const { publicKey } = MERCADOPAGO_CONFIG;
  return publicKey !== '' && !publicKey.includes('XXXXXXXX');
};

// Helper para obtener la URL de callback completa
export const getCallbackUrl = (type: 'success' | 'failure' | 'pending'): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}${MERCADOPAGO_CONFIG.callbacks[type]}`;
};

export default MERCADOPAGO_CONFIG;
