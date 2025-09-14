// Google Maps Configuration
export const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  libraries: ['places'] as ('places')[],
  defaultCenter: {
    lat: -34.6037, // Buenos Aires
    lng: -58.3816
  },
  defaultZoom: 15,
  mapOptions: {
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    zoomControl: true,
  }
};

// Función para verificar si la API key está configurada
export const isGoogleMapsConfigured = (): boolean => {
  return !!process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
};

// Función para obtener la URL de la API de Google Maps
export const getGoogleMapsScriptUrl = (): string => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }
  
  return `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
};
