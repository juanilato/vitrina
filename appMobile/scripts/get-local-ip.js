/**
 * Script para detectar automáticamente la IP local de la máquina
 * y generar el archivo .env.local con la configuración correcta
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIP() {
  const interfaces = os.networkInterfaces();

  // Buscar la primera dirección IPv4 no interna (no localhost)
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (localhost) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }

  // Fallback a localhost si no encuentra ninguna IP
  return '192.168.1.100';
}

function generateEnvLocal() {
  const localIP = getLocalIP();
  const backendPort = process.env.BACKEND_PORT || '3001';

  const envContent = `# 🌍 API Backend LOCAL (desarrollo) - Auto-generado
EXPO_PUBLIC_API_URL=http://${localIP}:${backendPort}

# 🗺️ Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyANk5MpfxAkPg0krpULl3xUR3e4wDigkOs

# 🔑 Google OAuth Clients
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=594374983119-9v4m67ml05lkeafou7hmasb20m1oj7c6.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=594374983119-XXXXandroid.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=594374983119-fim5bq8eo4o2nn919cgl9d7cml4qvohn.apps.googleusercontent.com
`;

  const envPath = path.join(__dirname, '..', '.env.local');
  fs.writeFileSync(envPath, envContent);

  console.log('✅ .env.local generado exitosamente');
  console.log(`📱 IP Local detectada: ${localIP}`);
  console.log(`🔗 API URL: http://${localIP}:${backendPort}`);

  return localIP;
}

// Ejecutar si se corre directamente
if (require.main === module) {
  generateEnvLocal();
}

module.exports = { getLocalIP, generateEnvLocal };
