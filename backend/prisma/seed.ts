import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// Seed de mi prisma (categorías y subcategorías)

const categoriesData = [
  {
    nombre: 'Alimentos y Bebidas',
    icono: '🍔',
    orden: 1,
    subcategorias: [
      { nombre: 'Pizza', icono: '🍕', orden: 1 },
      { nombre: 'Sushi', icono: '🍣', orden: 2 },
      { nombre: 'Hamburguesas', icono: '🍔', orden: 3 },
      { nombre: 'Empanadas', icono: '🥟', orden: 4 },
      { nombre: 'Panadería y Repostería', icono: '🥖', orden: 5 },
      { nombre: 'Bebidas y Licores', icono: '🍹', orden: 6 },
      { nombre: 'Productos Orgánicos', icono: '🥗', orden: 7 },
      { nombre: 'Catering', icono: '🍽️', orden: 8 },
    ],
  },
  {
    nombre: 'Moda y Accesorios',
    icono: '👗',
    orden: 2,
    subcategorias: [
      { nombre: 'Ropa', icono: '👕', orden: 1 },
      { nombre: 'Calzado', icono: '👟', orden: 2 },
      { nombre: 'Bolsos y Carteras', icono: '👜', orden: 3 },
      { nombre: 'Joyería', icono: '💍', orden: 4 },
      { nombre: 'Ropa Deportiva', icono: '🏃', orden: 5 },
      { nombre: 'Lencería', icono: '👙', orden: 6 },
    ],
  },
  {
    nombre: 'Tecnología',
    icono: '💻',
    orden: 3,
    subcategorias: [
      { nombre: 'Celulares y Tablets', icono: '📱', orden: 1 },
      { nombre: 'Computadoras', icono: '💻', orden: 2 },
      { nombre: 'Accesorios Electrónicos', icono: '🎧', orden: 3 },
      { nombre: 'Gaming', icono: '🎮', orden: 4 },
      { nombre: 'Audio y Video', icono: '📺', orden: 5 },
      { nombre: 'Software y Servicios', icono: '💿', orden: 6 },
    ],
  },
  {
    nombre: 'Hogar y Decoración',
    icono: '🏠',
    orden: 4,
    subcategorias: [
      { nombre: 'Muebles', icono: '🛋️', orden: 1 },
      { nombre: 'Decoración', icono: '🖼️', orden: 2 },
      { nombre: 'Electrodomésticos', icono: '🔌', orden: 3 },
      { nombre: 'Jardín y Exterior', icono: '🌱', orden: 4 },
      { nombre: 'Iluminación', icono: '💡', orden: 5 },
      { nombre: 'Textiles del Hogar', icono: '🛏️', orden: 6 },
    ],
  },
  {
    nombre: 'Salud y Belleza',
    icono: '💄',
    orden: 5,
    subcategorias: [
      { nombre: 'Cosméticos', icono: '💄', orden: 1 },
      { nombre: 'Cuidado de la Piel', icono: '🧴', orden: 2 },
      { nombre: 'Perfumería', icono: '🌸', orden: 3 },
      { nombre: 'Peluquería y Barbería', icono: '💇', orden: 4 },
      { nombre: 'Spa y Masajes', icono: '💆', orden: 5 },
      { nombre: 'Suplementos', icono: '💊', orden: 6 },
    ],
  },
  {
    nombre: 'Automotriz',
    icono: '🚗',
    orden: 6,
    subcategorias: [
      { nombre: 'Repuestos', icono: '🔧', orden: 1 },
      { nombre: 'Accesorios para Vehículos', icono: '🚙', orden: 2 },
      { nombre: 'Talleres Mecánicos', icono: '🔨', orden: 3 },
      { nombre: 'Lavado y Detailing', icono: '🧽', orden: 4 },
      { nombre: 'Neumáticos', icono: '🛞', orden: 5 },
      { nombre: 'Lubricantes', icono: '🛢️', orden: 6 },
    ],
  },
  {
    nombre: 'Deportes y Fitness',
    icono: '⚽',
    orden: 7,
    subcategorias: [
      { nombre: 'Ropa Deportiva', icono: '👕', orden: 1 },
      { nombre: 'Equipamiento', icono: '🏋️', orden: 2 },
      { nombre: 'Gimnasios', icono: '💪', orden: 3 },
      { nombre: 'Suplementos Deportivos', icono: '🥤', orden: 4 },
      { nombre: 'Bicicletas', icono: '🚴', orden: 5 },
      { nombre: 'Deportes Acuáticos', icono: '🏊', orden: 6 },
    ],
  },
  {
    nombre: 'Servicios Profesionales',
    icono: '💼',
    orden: 8,
    subcategorias: [
      { nombre: 'Consultoría', icono: '📊', orden: 1 },
      { nombre: 'Legal', icono: '⚖️', orden: 2 },
      { nombre: 'Contabilidad', icono: '🧮', orden: 3 },
      { nombre: 'Marketing', icono: '📢', orden: 4 },
      { nombre: 'Diseño Gráfico', icono: '🎨', orden: 5 },
      { nombre: 'Fotografía', icono: '📷', orden: 6 },
    ],
  },
  {
    nombre: 'Mascotas',
    icono: '🐾',
    orden: 9,
    subcategorias: [
      { nombre: 'Alimentos', icono: '🍖', orden: 1 },
      { nombre: 'Veterinaria', icono: '🏥', orden: 2 },
      { nombre: 'Accesorios', icono: '🦴', orden: 3 },
      { nombre: 'Peluquería Canina', icono: '✂️', orden: 4 },
      { nombre: 'Juguetes', icono: '🎾', orden: 5 },
      { nombre: 'Cuidado y Salud', icono: '💊', orden: 6 },
    ],
  },
  {
    nombre: 'Educación y Cursos',
    icono: '📚',
    orden: 10,
    subcategorias: [
      { nombre: 'Idiomas', icono: '🗣️', orden: 1 },
      { nombre: 'Capacitación Técnica', icono: '⚙️', orden: 2 },
      { nombre: 'Clases Particulares', icono: '👨‍🏫', orden: 3 },
      { nombre: 'Cursos Online', icono: '💻', orden: 4 },
      { nombre: 'Material Educativo', icono: '📝', orden: 5 },
      { nombre: 'Talleres', icono: '🛠️', orden: 6 },
    ],
  },
  {
    nombre: 'Arte y Manualidades',
    icono: '🎨',
    orden: 11,
    subcategorias: [
      { nombre: 'Pinturas y Lienzos', icono: '🖌️', orden: 1 },
      { nombre: 'Materiales de Arte', icono: '✏️', orden: 2 },
      { nombre: 'Artesanías', icono: '🧶', orden: 3 },
      { nombre: 'Scrapbooking', icono: '📔', orden: 4 },
      { nombre: 'Manualidades DIY', icono: '✂️', orden: 5 },
      { nombre: 'Talleres Creativos', icono: '🎭', orden: 6 },
    ],
  },
  {
    nombre: 'Agricultura e Industria',
    icono: '🚜',
    orden: 12,
    subcategorias: [
      { nombre: 'Maquinaria Agrícola', icono: '🚜', orden: 1 },
      { nombre: 'Insumos Agrícolas', icono: '🌾', orden: 2 },
      { nombre: 'Herramientas Industriales', icono: '🔨', orden: 3 },
      { nombre: 'Equipamiento Industrial', icono: '⚙️', orden: 4 },
      { nombre: 'Productos Químicos', icono: '🧪', orden: 5 },
      { nombre: 'Semillas y Plantas', icono: '🌱', orden: 6 },
    ],
  },
];

async function main() {
  console.log('🌱 Iniciando seed de categorías y subcategorías...');

  for (const categoryData of categoriesData) {
    const { subcategorias, ...categoriaInfo } = categoryData;

    console.log(`\n📦 Creando categoría: ${categoriaInfo.nombre}`);

    const categoria = await prisma.categoria.upsert({
      where: { nombre: categoriaInfo.nombre },
      update: {},
      create: categoriaInfo,
    });

    console.log(`✅ Categoría creada: ${categoria.nombre} (ID: ${categoria.id})`);

    // Crear subcategorías
    for (const subcat of subcategorias) {
      await prisma.subcategoria.upsert({
        where: {
          categoriaId_nombre: {
            categoriaId: categoria.id,
            nombre: subcat.nombre,
          },
        },
        update: {},
        create: {
          ...subcat,
          categoriaId: categoria.id,
        },
      });
      console.log(`  ➡️ Subcategoría creada: ${subcat.nombre}`);
    }
  }

  console.log('\n✨ Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
