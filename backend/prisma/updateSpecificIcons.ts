import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Actualizando iconos específicos...');

  await prisma.categoria.update({
    where: { nombre: 'Alimentos y Bebidas' },
    data: { icono: 'coffee' }
  });
  console.log('✅ Alimentos y Bebidas → coffee');

  await prisma.categoria.update({
    where: { nombre: 'Arte y Manualidades' },
    data: { icono: 'edit-3' }
  });
  console.log('✅ Arte y Manualidades → edit-3');

  await prisma.categoria.update({
    where: { nombre: 'Moda y Accesorios' },
    data: { icono: 'shopping-bag' }
  });
  console.log('✅ Moda y Accesorios → shopping-bag');

  console.log('\n✨ Actualización completada!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
