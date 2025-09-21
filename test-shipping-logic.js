// Script para probar la lógica de cálculo de precios de envío
const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testShippingLogic(empresaId, ubicacionId) {
  try {
    console.log('🧪 Probando lógica de cálculo de precios de envío');
    console.log('Empresa ID:', empresaId);
    console.log('Ubicación ID:', ubicacionId);
    console.log('');

    // Casos de prueba con diferentes distancias
    const testCases = [
      { name: 'Dentro del primer rango (0.5 km)', lat: -31.5097088, lng: -68.5703168 },
      { name: 'Entre rangos (1.5 km)', lat: -31.5107088, lng: -68.5713168 },
      { name: 'Excede rango máximo (3 km)', lat: -31.5127088, lng: -68.5733168 },
      { name: 'Muy lejos (10 km)', lat: -31.5197088, lng: -68.5803168 }
    ];

    for (const testCase of testCases) {
      console.log(`\n📍 ${testCase.name}`);
      console.log(`   Coordenadas: ${testCase.lat}, ${testCase.lng}`);
      
      try {
        const response = await axios.post(`${API_BASE}/empresas/${empresaId}/calcular-precio-envio`, {
          clienteLat: testCase.lat,
          clienteLng: testCase.lng,
          ubicacionId: ubicacionId
        });

        console.log(`   ✅ Resultado:`);
        console.log(`      Precio: ${response.data.price ? `$${response.data.price}` : 'No disponible'}`);
        console.log(`      Estimado: ${response.data.isEstimated ? 'Sí' : 'No'}`);
        console.log(`      Mensaje: ${response.data.message}`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.response?.data?.message || error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar el script
const empresaId = process.argv[2];
const ubicacionId = process.argv[3];

if (!empresaId || !ubicacionId) {
  console.log('Uso: node test-shipping-logic.js <empresaId> <ubicacionId>');
  console.log('Ejemplo: node test-shipping-logic.js cmew8ctm800017kcs16yvqlte 4');
  process.exit(1);
}

testShippingLogic(empresaId, ubicacionId);
