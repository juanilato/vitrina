// Script de prueba para verificar ingredientes
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando productos con ingredientes...\n');

  // Obtener todos los productos con ingredientes
  const productos = await prisma.productos.findMany({
    include: {
      ingredientes: {
        include: {
          ingrediente: true
        }
      }
    },
    take: 5
  });

  console.log(`📦 Total productos encontrados: ${productos.length}\n`);

  productos.forEach((producto, index) => {
    console.log(`${index + 1}. ${producto.nombre} (ID: ${producto.id})`);
    console.log(`   Precio: $${producto.precio}`);
    console.log(`   Ingredientes: ${producto.ingredientes.length}`);

    if (producto.ingredientes.length > 0) {
      producto.ingredientes.forEach((pi) => {
        console.log(`   - ${pi.ingrediente.nombre}:`);
        console.log(`     • Cantidad requerida: ${pi.cantidadRequerida}`);
        console.log(`     • Es extra permitido: ${pi.esExtraPermitido}`);
        console.log(`     • Precio extra: ${pi.precioExtra || 'No definido'}`);
        console.log(`     • Mínimo extra: ${pi.minimoExtra || 'No definido'}`);
        console.log(`     • Máximo extra: ${pi.maximoExtra || 'No definido'}`);
      });
    } else {
      console.log(`   ⚠️  Sin ingredientes configurados`);
    }
    console.log('');
  });

  // Contar productos con ingredientes extras permitidos
  const productosConExtras = productos.filter(p =>
    p.ingredientes.some(i => i.esExtraPermitido)
  );

  console.log(`\n✅ Productos con ingredientes extras: ${productosConExtras.length}`);

  if (productosConExtras.length > 0) {
    console.log('\n📋 Detalles de productos con extras:');
    productosConExtras.forEach(p => {
      const extrasPermitidos = p.ingredientes.filter(i => i.esExtraPermitido);
      console.log(`\n${p.nombre}:`);
      extrasPermitidos.forEach(i => {
        console.log(`  - ${i.ingrediente.nombre}: $${i.precioExtra || '??'} (${i.minimoExtra || 1}-${i.maximoExtra || '∞'})`);
      });
    });
  } else {
    console.log('\n⚠️  PROBLEMA: No hay productos con ingredientes extras configurados!');
    console.log('   Necesitas:');
    console.log('   1. Entrar al admin panel');
    console.log('   2. Editar un producto');
    console.log('   3. Agregar ingredientes');
    console.log('   4. Marcar "Permitir como extra"');
    console.log('   5. Configurar precio, mínimo y máximo');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
