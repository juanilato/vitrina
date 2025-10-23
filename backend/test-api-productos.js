// Script para probar el endpoint que usa la app móvil
const axios = require('axios');

async function testProductosEndpoint() {
  try {
    console.log('🔍 Probando endpoint /productos/empresa/:empresaId\n');

    // Primero obtener una empresa
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const empresa = await prisma.empresa.findFirst({
      where: {
        isVerified: true
      }
    });

    if (!empresa) {
      console.log('❌ No hay empresas verificadas en la BD');
      return;
    }

    console.log(`✅ Empresa encontrada: ${empresa.name} (ID: ${empresa.id})\n`);

    // Hacer petición al endpoint
    const url = `http://localhost:3001/productos/empresa/${empresa.id}`;
    console.log(`📡 Haciendo petición a: ${url}\n`);

    const response = await axios.get(url);

    console.log(`📦 Productos recibidos: ${response.data.length}\n`);

    // Analizar cada producto
    response.data.forEach((producto, index) => {
      console.log(`${index + 1}. ${producto.nombre}`);
      console.log(`   Precio: $${producto.precio}`);
      console.log(`   Activo: ${producto.activo}`);

      if (producto.ingredientes) {
        console.log(`   ✅ Tiene campo 'ingredientes': ${producto.ingredientes.length} items`);

        producto.ingredientes.forEach((ing) => {
          console.log(`   - ${ing.ingrediente?.nombre || 'Sin nombre'}`);
          console.log(`     • esExtraPermitido: ${ing.esExtraPermitido}`);
          console.log(`     • precioExtra: ${ing.precioExtra || 'No definido'}`);
          console.log(`     • minimoExtra: ${ing.minimoExtra || 'No definido'}`);
          console.log(`     • maximoExtra: ${ing.maximoExtra || 'No definido'}`);
        });
      } else {
        console.log(`   ❌ NO tiene campo 'ingredientes'`);
      }
      console.log('');
    });

    await prisma.$disconnect();

    // Verificar si algún producto tiene ingredientes extras
    const productosConExtras = response.data.filter(p =>
      p.ingredientes && p.ingredientes.some(i => i.esExtraPermitido)
    );

    if (productosConExtras.length > 0) {
      console.log(`\n✅ ¡ÉXITO! ${productosConExtras.length} producto(s) tienen ingredientes extras`);
      console.log('   La app móvil debería poder mostrarlos.');
    } else {
      console.log('\n⚠️  PROBLEMA: Ningún producto tiene ingredientes extras permitidos');
      console.log('   Verifica que hayas marcado "Permitir como extra" en el admin panel.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testProductosEndpoint();
