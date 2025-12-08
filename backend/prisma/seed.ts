import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// Seed de mi prisma (categorías y subcategorías)

const categoriesData = [
  {
    nombre: 'Alimentos y Bebidas',
    icono: 'utensils',
    orden: 1,
    subcategorias: [
      { nombre: 'Pizza', icono: 'circle', orden: 1 },
      { nombre: 'Sushi', icono: 'package', orden: 2 },
      { nombre: 'Hamburguesas', icono: 'target', orden: 3 },
      { nombre: 'Empanadas', icono: 'box', orden: 4 },
      { nombre: 'Panadería y Repostería', icono: 'cake', orden: 5 },
      { nombre: 'Bebidas y Licores', icono: 'droplet', orden: 6 },
      { nombre: 'Productos Orgánicos', icono: 'leaf', orden: 7 },
      { nombre: 'Catering', icono: 'users', orden: 8 },
    ],
  },
  {
    nombre: 'Moda y Accesorios',
    icono: 'layers',
    orden: 2,
    subcategorias: [
      { nombre: 'Ropa', icono: 'layers', orden: 1 },
      { nombre: 'Calzado', icono: 'edit', orden: 2 },
      { nombre: 'Bolsos y Carteras', icono: 'briefcase', orden: 3 },
      { nombre: 'Joyería', icono: 'star', orden: 4 },
      { nombre: 'Ropa Deportiva', icono: 'zap', orden: 5 },
      { nombre: 'Lencería', icono: 'heart', orden: 6 },
    ],
  },
  {
    nombre: 'Tecnología',
    icono: 'cpu',
    orden: 3,
    subcategorias: [
      { nombre: 'Celulares y Tablets', icono: 'smartphone', orden: 1 },
      { nombre: 'Computadoras', icono: 'cpu', orden: 2 },
      { nombre: 'Accesorios Electrónicos', icono: 'headphones', orden: 3 },
      { nombre: 'Gaming', icono: 'joystick', orden: 4 },
      { nombre: 'Audio y Video', icono: 'tv', orden: 5 },
      { nombre: 'Software y Servicios', icono: 'code', orden: 6 },
    ],
  },
  {
    nombre: 'Hogar y Decoración',
    icono: 'home',
    orden: 4,
    subcategorias: [
      { nombre: 'Muebles', icono: 'square', orden: 1 },
      { nombre: 'Decoración', icono: 'palette', orden: 2 },
      { nombre: 'Electrodomésticos', icono: 'zap', orden: 3 },
      { nombre: 'Jardín y Exterior', icono: 'leaf', orden: 4 },
      { nombre: 'Iluminación', icono: 'sun', orden: 5 },
      { nombre: 'Textiles del Hogar', icono: 'layers', orden: 6 },
    ],
  },
  {
    nombre: 'Salud y Belleza',
    icono: 'star',
    orden: 5,
    subcategorias: [
      { nombre: 'Cosméticos', icono: 'star', orden: 1 },
      { nombre: 'Cuidado de la Piel', icono: 'droplet', orden: 2 },
      { nombre: 'Perfumería', icono: 'wind', orden: 3 },
      { nombre: 'Peluquería y Barbería', icono: 'scissors', orden: 4 },
      { nombre: 'Spa y Masajes', icono: 'relax', orden: 5 },
      { nombre: 'Suplementos', icono: 'pill', orden: 6 },
    ],
  },
  {
    nombre: 'Automotriz',
    icono: 'truck',
    orden: 6,
    subcategorias: [
      { nombre: 'Repuestos', icono: 'tool', orden: 1 },
      { nombre: 'Accesorios para Vehículos', icono: 'truck', orden: 2 },
      { nombre: 'Talleres Mecánicos', icono: 'tool', orden: 3 },
      { nombre: 'Lavado y Detailing', icono: 'droplet', orden: 4 },
      { nombre: 'Neumáticos', icono: 'circle', orden: 5 },
      { nombre: 'Lubricantes', icono: 'droplet', orden: 6 },
    ],
  },
  {
    nombre: 'Deportes y Fitness',
    icono: 'activity',
    orden: 7,
    subcategorias: [
      { nombre: 'Ropa Deportiva', icono: 'layers', orden: 1 },
      { nombre: 'Equipamiento', icono: 'target', orden: 2 },
      { nombre: 'Gimnasios', icono: 'activity', orden: 3 },
      { nombre: 'Suplementos Deportivos', icono: 'droplet', orden: 4 },
      { nombre: 'Bicicletas', icono: 'activity', orden: 5 },
      { nombre: 'Deportes Acuáticos', icono: 'droplet', orden: 6 },
    ],
  },
  {
    nombre: 'Servicios Profesionales',
    icono: 'briefcase',
    orden: 8,
    subcategorias: [
      { nombre: 'Consultoría', icono: 'bar-chart-2', orden: 1 },
      { nombre: 'Legal', icono: 'award', orden: 2 },
      { nombre: 'Contabilidad', icono: 'calculator', orden: 3 },
      { nombre: 'Marketing', icono: 'trending-up', orden: 4 },
      { nombre: 'Diseño Gráfico', icono: 'edit', orden: 5 },
      { nombre: 'Fotografía', icono: 'camera', orden: 6 },
    ],
  },
  {
    nombre: 'Mascotas',
    icono: 'heart',
    orden: 9,
    subcategorias: [
      { nombre: 'Alimentos', icono: 'package', orden: 1 },
      { nombre: 'Veterinaria', icono: 'plus-circle', orden: 2 },
      { nombre: 'Accesorios', icono: 'box', orden: 3 },
      { nombre: 'Peluquería Canina', icono: 'scissors', orden: 4 },
      { nombre: 'Juguetes', icono: 'play-circle', orden: 5 },
      { nombre: 'Cuidado y Salud', icono: 'heart', orden: 6 },
    ],
  },
  {
    nombre: 'Educación y Cursos',
    icono: 'book',
    orden: 10,
    subcategorias: [
      { nombre: 'Idiomas', icono: 'book', orden: 1 },
      { nombre: 'Capacitación Técnica', icono: 'cpu', orden: 2 },
      { nombre: 'Clases Particulares', icono: 'users', orden: 3 },
      { nombre: 'Cursos Online', icono: 'monitor', orden: 4 },
      { nombre: 'Material Educativo', icono: 'file-text', orden: 5 },
      { nombre: 'Talleres', icono: 'tool', orden: 6 },
    ],
  },
  {
    nombre: 'Arte y Manualidades',
    icono: 'palette',
    orden: 11,
    subcategorias: [
      { nombre: 'Pinturas y Lienzos', icono: 'edit', orden: 1 },
      { nombre: 'Materiales de Arte', icono: 'pencil', orden: 2 },
      { nombre: 'Artesanías', icono: 'package', orden: 3 },
      { nombre: 'Scrapbooking', icono: 'book', orden: 4 },
      { nombre: 'Manualidades DIY', icono: 'tool', orden: 5 },
      { nombre: 'Talleres Creativos', icono: 'play-circle', orden: 6 },
    ],
  },
  {
    nombre: 'Agricultura e Industria',
    icono: 'truck',
    orden: 12,
    subcategorias: [
      { nombre: 'Maquinaria Agrícola', icono: 'truck', orden: 1 },
      { nombre: 'Insumos Agrícolas', icono: 'leaf', orden: 2 },
      { nombre: 'Herramientas Industriales', icono: 'tool', orden: 3 },
      { nombre: 'Equipamiento Industrial', icono: 'cpu', orden: 4 },
      { nombre: 'Productos Químicos', icono: 'flask', orden: 5 },
      { nombre: 'Semillas y Plantas', icono: 'leaf', orden: 6 },
    ],
  },
];

const planesData = [
  {
    nombre: 'Vitrina Tu Mundo',
    descripcion: 'Plan gratuito para empezar',
    precio: 0,
    moneda: 'ARS',
    intervalo: 'mensual',
    limites: {
      maxProductos: 30,
      maxPedidosMes: 500,
      maxFotos: 30,
      soportePrioritario: true,
      estadisticasAvanzadas: true,
    },
    caracteristicas: [
      'Hasta 10 productos',
      'Hasta 50 pedidos por mes',
      'Catálogo web básico',
      'Soporte por email',
    ],
    activo: true,
    esPopular: false,
    orden: 1,
  },

];

async function main() {
  console.log('🌱 Iniciando seed...');

  // Seed de categorías y subcategorías
  console.log('\n📦 Seeding categorías y subcategorías...');
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

  // Seed de planes de suscripción
  console.log('\n💳 Seeding planes de suscripción...');
  for (const planData of planesData) {
    const plan = await prisma.planSuscripcion.upsert({
      where: { nombre: planData.nombre },
      update: {
        descripcion: planData.descripcion,
        precio: planData.precio,
        limites: planData.limites,
        caracteristicas: planData.caracteristicas,
        esPopular: planData.esPopular,
        orden: planData.orden,
      },
      create: planData,
    });
    console.log(`✅ Plan creado: ${plan.nombre} - $${plan.precio}/${plan.intervalo}`);
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
