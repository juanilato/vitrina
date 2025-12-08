import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const iconsMap: Record<string, string> = {
  'Alimentos y Bebidas': 'utensils',
  'Moda y Accesorios': 'layers',
  'Tecnología': 'cpu',
  'Hogar y Decoración': 'home',
  'Salud y Belleza': 'star',
  'Automotriz': 'truck',
  'Deportes y Fitness': 'activity',
  'Servicios Profesionales': 'briefcase',
  'Mascotas': 'heart',
  'Educación y Cursos': 'book',
  'Arte y Manualidades': 'palette',
  'Agricultura e Industria': 'truck',
};

const subcategoryIconsMap: Record<string, Record<string, string>> = {
  'Alimentos y Bebidas': {
    'Pizza': 'circle',
    'Sushi': 'package',
    'Hamburguesas': 'target',
    'Empanadas': 'box',
    'Panadería y Repostería': 'cake',
    'Bebidas y Licores': 'droplet',
    'Productos Orgánicos': 'leaf',
    'Catering': 'users',
  },
  'Moda y Accesorios': {
    'Ropa': 'layers',
    'Calzado': 'edit',
    'Bolsos y Carteras': 'briefcase',
    'Joyería': 'star',
    'Ropa Deportiva': 'zap',
    'Lencería': 'heart',
  },
  'Tecnología': {
    'Celulares y Tablets': 'smartphone',
    'Computadoras': 'cpu',
    'Accesorios Electrónicos': 'headphones',
    'Gaming': 'joystick',
    'Audio y Video': 'tv',
    'Software y Servicios': 'code',
  },
  'Hogar y Decoración': {
    'Muebles': 'square',
    'Decoración': 'palette',
    'Electrodomésticos': 'zap',
    'Jardín y Exterior': 'leaf',
    'Iluminación': 'sun',
    'Textiles del Hogar': 'layers',
  },
  'Salud y Belleza': {
    'Cosméticos': 'star',
    'Cuidado de la Piel': 'droplet',
    'Perfumería': 'wind',
    'Peluquería y Barbería': 'scissors',
    'Spa y Masajes': 'relax',
    'Suplementos': 'pill',
  },
  'Automotriz': {
    'Repuestos': 'tool',
    'Accesorios para Vehículos': 'truck',
    'Talleres Mecánicos': 'tool',
    'Lavado y Detailing': 'droplet',
    'Neumáticos': 'circle',
    'Lubricantes': 'droplet',
  },
  'Deportes y Fitness': {
    'Ropa Deportiva': 'layers',
    'Equipamiento': 'target',
    'Gimnasios': 'activity',
    'Suplementos Deportivos': 'droplet',
    'Bicicletas': 'activity',
    'Deportes Acuáticos': 'droplet',
  },
  'Servicios Profesionales': {
    'Consultoría': 'bar-chart-2',
    'Legal': 'award',
    'Contabilidad': 'calculator',
    'Marketing': 'trending-up',
    'Diseño Gráfico': 'edit',
    'Fotografía': 'camera',
  },
  'Mascotas': {
    'Alimentos': 'package',
    'Veterinaria': 'plus-circle',
    'Accesorios': 'box',
    'Peluquería Canina': 'scissors',
    'Juguetes': 'play-circle',
    'Cuidado y Salud': 'heart',
  },
  'Educación y Cursos': {
    'Idiomas': 'book',
    'Capacitación Técnica': 'cpu',
    'Clases Particulares': 'users',
    'Cursos Online': 'monitor',
    'Material Educativo': 'file-text',
    'Talleres': 'tool',
  },
  'Arte y Manualidades': {
    'Pinturas y Lienzos': 'edit',
    'Materiales de Arte': 'pencil',
    'Artesanías': 'package',
    'Scrapbooking': 'book',
    'Manualidades DIY': 'tool',
    'Talleres Creativos': 'play-circle',
  },
  'Agricultura e Industria': {
    'Maquinaria Agrícola': 'truck',
    'Insumos Agrícolas': 'leaf',
    'Herramientas Industriales': 'tool',
    'Equipamiento Industrial': 'cpu',
    'Productos Químicos': 'flask',
    'Semillas y Plantas': 'leaf',
  },
};

async function main() {
  console.log('🔄 Actualizando iconos de categorías...');

  // Actualizar categorías
  for (const [nombre, icono] of Object.entries(iconsMap)) {
    const categoria = await prisma.categoria.update({
      where: { nombre },
      data: { icono },
    });
    console.log(`✅ Categoría actualizada: ${nombre} → ${icono}`);

    // Actualizar subcategorías
    const subcategoriesMap = subcategoryIconsMap[nombre];
    if (subcategoriesMap) {
      for (const [subNombre, subIcono] of Object.entries(subcategoriesMap)) {
        await prisma.subcategoria.updateMany({
          where: {
            nombre: subNombre,
            categoriaId: categoria.id,
          },
          data: { icono: subIcono },
        });
        console.log(`  ➡️ Subcategoría actualizada: ${subNombre} → ${subIcono}`);
      }
    }
  }

  console.log('\n✨ Actualización completada exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
