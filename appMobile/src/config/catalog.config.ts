/**
 * Catalog Configuration
 * URLs for catalog deep linking
 */

// En desarrollo
const DEV_CATALOG_URL = 'http://localhost:8081';

// En producción - Cambiar estas URLs cuando despliegues la app
const PROD_CATALOG_URL = 'https://tu-app.com'; // TODO: Cambiar por la URL real de producción
const PROD_DEEP_LINK_SCHEME = 'vitrina://'; // TODO: Configurar el scheme de deep linking

export const getCatalogUrl = (companyName: string): string => {
  const isDevelopment = __DEV__;

  if (isDevelopment) {
    return `${DEV_CATALOG_URL}/catalog/${encodeURIComponent(companyName)}`;
  }

  // En producción, usar deep link scheme
  return `${PROD_DEEP_LINK_SCHEME}catalog/${encodeURIComponent(companyName)}`;
};

export const getCatalogWebUrl = (companyName: string): string => {
  // URL web que puede ser compartida
  const isDevelopment = __DEV__;

  if (isDevelopment) {
    return `${DEV_CATALOG_URL}/catalog/${encodeURIComponent(companyName)}`;
  }

  return `${PROD_CATALOG_URL}/catalog/${encodeURIComponent(companyName)}`;
};
