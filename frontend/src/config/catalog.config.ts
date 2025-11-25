/**
 * Catalog Configuration for Frontend
 * URLs for catalog QR generation
 */

// En desarrollo
const DEV_CATALOG_URL = 'http://localhost:8081';

// En producción - Cambiar estas URLs cuando despliegues la app
const PROD_CATALOG_URL = 'https://tu-app.com'; // TODO: Cambiar por la URL real de producción

const isDevelopment = process.env.NODE_ENV === 'development';

export const getCatalogUrl = (companyName: string): string => {
  if (isDevelopment) {
    return `${DEV_CATALOG_URL}/catalog/${encodeURIComponent(companyName)}`;
  }

  return `${PROD_CATALOG_URL}/catalog/${encodeURIComponent(companyName)}`;
};
