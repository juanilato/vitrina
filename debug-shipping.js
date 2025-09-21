// Script temporal para debug de precios de envío
const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function debugShippingPrices(empresaId) {
  try {
    console.log('🔍 Verificando precios de envío para empresa:', empresaId);
    
    const response = await axios.get(`${API_BASE}/empresas/${empresaId}/debug-precios-envio`);
    
    console.log('📊 Resultado:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.ubicaciones.length === 0) {
      console.log('❌ No hay ubicaciones configuradas');
    } else {
      response.data.ubicaciones.forEach((ubicacion, index) => {
        console.log(`\n📍 Ubicación ${index + 1}:`);
        console.log(`   ID: ${ubicacion.ubicacionId}`);
        console.log(`   Dirección: ${ubicacion.direccion}`);
        console.log(`   Coordenadas: ${ubicacion.lat}, ${ubicacion.lng}`);
        console.log(`   Precios configurados: ${ubicacion.preciosEnvio.length}`);
        
        if (ubicacion.preciosEnvio.length === 0) {
          console.log('   ❌ No hay precios de envío configurados para esta ubicación');
        } else {
          ubicacion.preciosEnvio.forEach((precio, precioIndex) => {
            console.log(`   💰 Precio ${precioIndex + 1}: $${precio.precio} para ${precio.distancia} km`);
          });
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Ejecutar el script
const empresaId = process.argv[2];
if (!empresaId) {
  console.log('Uso: node debug-shipping.js <empresaId>');
  process.exit(1);
}

debugShippingPrices(empresaId);
