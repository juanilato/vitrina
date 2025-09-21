// Script para verificar directamente en la base de datos
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkShippingPrices(empresaId) {
  try {
    console.log('🔍 Verificando precios de envío para empresa:', empresaId);
    
    // Obtener todas las ubicaciones de la empresa
    const ubicaciones = await prisma.ubicacion.findMany({
      where: { empresaId },
      include: {
        preciosEnvio: true
      }
    });

    console.log('📊 Resultado:');
    console.log(`Total ubicaciones: ${ubicaciones.length}`);
    
    if (ubicaciones.length === 0) {
      console.log('❌ No hay ubicaciones configuradas para esta empresa');
      return;
    }

    ubicaciones.forEach((ubicacion, index) => {
      console.log(`\n📍 Ubicación ${index + 1}:`);
      console.log(`   ID: ${ubicacion.id}`);
      console.log(`   Dirección: ${ubicacion.direccion}`);
      console.log(`   Coordenadas: ${ubicacion.lat}, ${ubicacion.lng}`);
      console.log(`   Precios configurados: ${ubicacion.preciosEnvio.length}`);
      
      if (ubicacion.preciosEnvio.length === 0) {
        console.log('   ❌ No hay precios de envío configurados para esta ubicación');
        console.log('   💡 Necesitas agregar precios usando el dashboard de la empresa');
      } else {
        ubicacion.preciosEnvio.forEach((precio, precioIndex) => {
          console.log(`   💰 Precio ${precioIndex + 1}: $${precio.precio} para ${precio.distancia} km`);
        });
      }
    });

    // Mostrar todas las empresas para referencia
    console.log('\n🏢 Todas las empresas en la base de datos:');
    const empresas = await prisma.empresa.findMany({
      select: { id: true, name: true, email: true }
    });
    empresas.forEach(empresa => {
      console.log(`   - ${empresa.name} (${empresa.id})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
const empresaId = process.argv[2];
if (!empresaId) {
  console.log('Uso: node check-db.js <empresaId>');
  process.exit(1);
}

checkShippingPrices(empresaId);
